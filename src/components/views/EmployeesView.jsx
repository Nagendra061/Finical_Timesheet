/**
 * EmployeesView
 *
 * Primary master data management view for W2 staff and 1099 contractors.
 * Features search, type filtering, status filtering, sorting, pagination,
 * Add/Edit Employee modal, and multi-tab employee detail drawer
 * (Information, Placements, Timesheets, Accrued Income, AP Obligations, and Profitability Margin).
 *
 * Data Source:
 * Redux store via useStaffing hook
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import { useStaffing } from '../../hooks/useStaffing';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { EmployeeTable } from '../employees/EmployeeTable';
import {
  formatCurrency,
  formatDate,
  formatPercent,
  calculateStaffingMargin,
  safeConfirm
} from '../../utils/formatters';

export const EmployeesView = () => {
  const {
    employees = [],
    placements = [],
    timesheets = [],
    incomes = [],
    apBills = [],
    clients = [],
    addEmployee,
    updateEmployee,
    deleteEmployee
  } = useStaffing();

  // Filtering, Searching & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [detailEmployee, setDetailEmployee] = useState(null);
  const [detailTab, setDetailTab] = useState('info');

  // Form State
  const [formData, setFormData] = useState({
    employeeType: 'W2',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'Active',
    hireDate: new Date().toISOString().split('T')[0],
    department: 'Healthcare Staffing'
  });
  const [formErrors, setFormErrors] = useState({});

  // Filtered and Sorted employees
  const filteredEmployees = useMemo(() => {
    return employees
      .filter(emp => {
        const matchesSearch =
          `${emp.firstName} ${emp.lastName} ${emp.id} ${emp.email}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'ALL' || emp.employeeType === typeFilter;
        const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          const nameA = `${a.lastName}, ${a.firstName}`;
          const nameB = `${b.lastName}, ${b.firstName}`;
          return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(a.lastName);
        }
        if (sortBy === 'id') {
          return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
        }
        if (sortBy === 'hireDate') {
          return sortOrder === 'asc'
            ? a.hireDate.localeCompare(b.hireDate)
            : b.hireDate.localeCompare(a.hireDate);
        }
        return 0;
      });
  }, [employees, searchQuery, typeFilter, statusFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      employeeType: 'W2',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'Active',
      hireDate: new Date().toISOString().split('T')[0],
      department: 'Healthcare Staffing'
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      employeeType: emp.employeeType,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || '',
      status: emp.status,
      hireDate: emp.hireDate,
      department: emp.department || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'A valid email address is required.';
    }
    if (!formData.hireDate) errors.hireDate = 'Hire date is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
    } else {
      addEmployee(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if (safeConfirm('Are you sure you want to deactivate this worker?')) {
      deleteEmployee(id);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Helper for Detail Tab Calculations
  const getEmployeeMetrics = (empId) => {
    const empPlacements = placements.filter(p => p.employeeId === empId);
    const empTimesheets = timesheets.filter(t => t.employeeId === empId);
    const empIncomes = incomes.filter(i => i.employeeId === empId);
    const empBills = apBills.filter(b => b.employeeId === empId);

    const totalRev = empIncomes.reduce((acc, i) => acc + (i.totalIncome || 0), 0);
    const totalCost = empBills.reduce((acc, b) => acc + (b.totalPayable || 0), 0);
    const { grossMargin, grossMarginPercent } = calculateStaffingMargin(totalRev, totalCost);

    return {
      placements: empPlacements,
      timesheets: empTimesheets,
      incomes: empIncomes,
      bills: empBills,
      totalRev,
      totalCost,
      grossMargin,
      grossMarginPercent
    };
  };

  return (
    <div className="space-y-4">
      {/* Action Header & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              id="employee-search-input"
              type="text"
              placeholder="Search by name, ID, email..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400 text-stone-900"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <select
            id="employee-type-filter"
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 cursor-pointer"
          >
            <option value="ALL">All Worker Types</option>
            <option value="W2">W2 Employees</option>
            <option value="1099">1099 Contractors</option>
          </select>

          {/* Status Filter */}
          <select
            id="employee-status-filter"
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        {/* Add Employee Button */}
        <button
          id="add-employee-button"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee / 1099</span>
        </button>
      </div>

      {/* Employee List Table Component */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <EmployeeTable
          employees={paginatedEmployees}
          placements={placements}
          clients={clients}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onView={(emp) => {
            setDetailEmployee(emp);
            setDetailTab('info');
          }}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onAdd={handleOpenAdd}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredEmployees.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingEmployee ? `Edit Employee ${editingEmployee.id}` : 'Add Employee / Contractor'}
        subtitle="Manage master staffing worker record for placements and payroll"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Employee Type *</label>
              <select
                id="form-employee-type"
                value={formData.employeeType}
                onChange={e => setFormData({ ...formData, employeeType: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white cursor-pointer"
              >
                <option value="W2">W2 Employee</option>
                <option value="1099">1099 Contractor</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Status *</label>
              <select
                id="form-employee-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">First Name *</label>
              <input
                id="form-employee-first-name"
                type="text"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. John"
                className="w-full p-2 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
              />
              {formErrors.firstName && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.firstName}</p>}
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Last Name *</label>
              <input
                id="form-employee-last-name"
                type="text"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Smith"
                className="w-full p-2 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
              />
              {formErrors.lastName && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Email *</label>
              <input
                id="form-employee-email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.smith@example.com"
                className="w-full p-2 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
              />
              {formErrors.email && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.email}</p>}
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Phone Number</label>
              <input
                id="form-employee-phone"
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(214) 555-0142"
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Hire Date *</label>
              <input
                id="form-employee-hire-date"
                type="date"
                value={formData.hireDate}
                onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200"
              />
              {formErrors.hireDate && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.hireDate}</p>}
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Department</label>
              <input
                id="form-employee-department"
                type="text"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Healthcare Staffing"
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-employee-submit"
              type="submit"
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold cursor-pointer"
            >
              {editingEmployee ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Employee Detail Page Modal */}
      {detailEmployee && (
        <Modal
          isOpen={!!detailEmployee}
          onClose={() => setDetailEmployee(null)}
          title={`${detailEmployee.firstName} ${detailEmployee.lastName} (${detailEmployee.id})`}
          subtitle={`${detailEmployee.employeeType} • ${detailEmployee.department || 'Staffing'} • Hired ${formatDate(detailEmployee.hireDate)}`}
          maxWidth="4xl"
        >
          {(() => {
            const metrics = getEmployeeMetrics(detailEmployee.id);

            return (
              <div className="space-y-4 text-xs">
                {/* Navigation Tabs */}
                <div className="flex border-b border-stone-200 gap-1">
                  <button
                    type="button"
                    onClick={() => setDetailTab('info')}
                    className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
                      detailTab === 'info'
                        ? 'border-stone-900 text-stone-900'
                        : 'border-transparent text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Information
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('placements')}
                    className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
                      detailTab === 'placements'
                        ? 'border-stone-900 text-stone-900'
                        : 'border-transparent text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Placements ({metrics.placements.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('timesheets')}
                    className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
                      detailTab === 'timesheets'
                        ? 'border-stone-900 text-stone-900'
                        : 'border-transparent text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Timesheets ({metrics.timesheets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('income')}
                    className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
                      detailTab === 'income'
                        ? 'border-stone-900 text-stone-900'
                        : 'border-transparent text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Income ({metrics.incomes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('ap')}
                    className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
                      detailTab === 'ap'
                        ? 'border-stone-900 text-stone-900'
                        : 'border-transparent text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    AP / Payroll ({metrics.bills.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('profitability')}
                    className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
                      detailTab === 'profitability'
                        ? 'border-stone-900 text-stone-900'
                        : 'border-transparent text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Profitability
                  </button>
                </div>

                {/* Tab 1: Info */}
                {detailTab === 'info' && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <div>
                      <span className="text-stone-400 block text-[11px]">Full Name</span>
                      <span className="font-semibold text-stone-900 text-sm">
                        {detailEmployee.firstName} {detailEmployee.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Employee Type</span>
                      <Badge variant={detailEmployee.employeeType === 'W2' ? 'purple' : 'info'}>
                        {detailEmployee.employeeType} Contractor / Staff
                      </Badge>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Email</span>
                      <span className="font-mono text-stone-800">{detailEmployee.email}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Phone</span>
                      <span className="text-stone-800">{detailEmployee.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Hire Date</span>
                      <span className="text-stone-800">{formatDate(detailEmployee.hireDate)}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Status</span>
                      <Badge variant={detailEmployee.status === 'Active' ? 'success' : 'neutral'}>
                        {detailEmployee.status}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Tab 2: Placements */}
                {detailTab === 'placements' && (
                  <div className="space-y-2">
                    {metrics.placements.map(p => {
                      const c = clients.find(cl => cl.id === p.clientId);
                      return (
                        <div key={p.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-stone-900">{p.id} • {c?.name || p.clientId}</div>
                            <div className="text-[11px] text-stone-500">
                              Start: {formatDate(p.startDate)} {p.endDate ? `to ${formatDate(p.endDate)}` : '(Active / Ongoing)'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-stone-900">Bill: ${p.billingRate}/hr | Pay: ${p.payRate}/hr</div>
                            <div className="text-emerald-700 text-[11px] font-semibold">
                              Margin: ${(p.billingRate - p.payRate).toFixed(2)}/hr ({(((p.billingRate - p.payRate) / p.billingRate) * 100).toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {metrics.placements.length === 0 && (
                      <p className="py-6 text-center text-stone-400 italic">No placements linked to this worker.</p>
                    )}
                  </div>
                )}

                {/* Tab 3: Timesheets */}
                {detailTab === 'timesheets' && (
                  <div className="space-y-2">
                    {metrics.timesheets.map(t => (
                      <div key={t.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-stone-900">{t.id} • Cycle: {t.periodStartDate} to {t.periodEndDate}</div>
                          <div className="text-[11px] text-stone-500">
                            Reg: {t.regularHours}h | OT: {t.overtimeHours}h | Hol: {t.holidayHours}h
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-stone-900 block">{t.totalHours} Total Hours</span>
                          <Badge variant={t.status === 'Approved' ? 'success' : t.status === 'Submitted' ? 'warning' : 'neutral'}>
                            {t.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {metrics.timesheets.length === 0 && (
                      <p className="py-6 text-center text-stone-400 italic">No timesheets logged for this employee.</p>
                    )}
                  </div>
                )}

                {/* Tab 4: Income */}
                {detailTab === 'income' && (
                  <div className="space-y-2">
                    {metrics.incomes.map(inc => (
                      <div key={inc.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-stone-900">{inc.id} (From TS: {inc.timesheetId})</div>
                          <div className="text-[11px] text-stone-500">
                            Hours: {inc.regularHours + inc.overtimeHours + inc.holidayHours} @ ${inc.billingRate}/hr
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-700">{formatCurrency(inc.totalIncome)}</div>
                          <Badge variant={inc.status === 'Billed' ? 'info' : 'warning'}>{inc.status}</Badge>
                        </div>
                      </div>
                    ))}
                    {metrics.incomes.length === 0 && (
                      <p className="py-6 text-center text-stone-400 italic">No income accrued yet.</p>
                    )}
                  </div>
                )}

                {/* Tab 5: AP / Payroll */}
                {detailTab === 'ap' && (
                  <div className="space-y-2">
                    {metrics.bills.map(b => (
                      <div key={b.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-stone-900">{b.id} • Due {formatDate(b.dueDate)}</div>
                          <div className="text-[11px] text-stone-500">
                            Total Payable: {formatCurrency(b.totalPayable)} | Paid: {formatCurrency(b.amountPaid)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-stone-900">Balance: {formatCurrency(b.balance)}</div>
                          <Badge variant={b.status === 'Paid' ? 'success' : 'danger'}>{b.status}</Badge>
                        </div>
                      </div>
                    ))}
                    {metrics.bills.length === 0 && (
                      <p className="py-6 text-center text-stone-400 italic">No AP bills recorded.</p>
                    )}
                  </div>
                )}

                {/* Tab 6: Profitability Breakdown */}
                {detailTab === 'profitability' && (
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                    <h4 className="font-semibold text-stone-900 text-sm">Worker Profitability Summary</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-white rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Total Revenue</span>
                        <span className="text-base font-bold text-stone-900 mt-1 block">
                          {formatCurrency(metrics.totalRev)}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Worker Direct Cost</span>
                        <span className="text-base font-bold text-rose-700 mt-1 block">
                          {formatCurrency(metrics.totalCost)}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Gross Margin ($)</span>
                        <span className="text-base font-bold text-emerald-700 mt-1 block">
                          {formatCurrency(metrics.grossMargin)}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Gross Margin (%)</span>
                        <span className="text-base font-bold text-emerald-700 mt-1 block">
                          {formatPercent(metrics.grossMarginPercent)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-500">
                      Calculated as: Revenue ({formatCurrency(metrics.totalRev)}) minus Worker Cost ({formatCurrency(metrics.totalCost)}) = Gross Margin ({formatCurrency(metrics.grossMargin)}).
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};

export default EmployeesView;
