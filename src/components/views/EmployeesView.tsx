import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useStaffing } from '../../context/StaffingContext';
import { Employee, EmployeeType, EmployeeStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import {
  formatCurrency,
  formatDate,
  formatPercent,
  calculateStaffingMargin
} from '../../utils/formatters';

export const EmployeesView: React.FC = () => {
  const {
    employees,
    placements,
    timesheets,
    incomes,
    apBills,
    clients,
    addEmployee,
    updateEmployee,
    deleteEmployee
  } = useStaffing();

  // Filtering, Searching & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | EmployeeType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EmployeeStatus>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'hireDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'placements' | 'timesheets' | 'income' | 'ap' | 'profitability'>('info');

  // Form State
  const [formData, setFormData] = useState({
    employeeType: 'W2' as EmployeeType,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'Active' as EmployeeStatus,
    hireDate: new Date().toISOString().split('T')[0],
    department: 'Healthcare Staffing'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
          return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
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

  const handleOpenEdit = (emp: Employee) => {
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
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'A valid email address is required.';
    }
    if (!formData.hireDate) errors.hireDate = 'Hire date is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
    } else {
      addEmployee(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this worker?')) {
      deleteEmployee(id);
    }
  };

  // Helper for Detail Tab Calculations
  const getEmployeeMetrics = (empId: string) => {
    const empPlacements = placements.filter(p => p.employeeId === empId);
    const empTimesheets = timesheets.filter(t => t.employeeId === empId);
    const empIncomes = incomes.filter(i => i.employeeId === empId);
    const empBills = apBills.filter(b => b.employeeId === empId);

    const totalRev = empIncomes.reduce((acc, i) => acc + i.totalIncome, 0);
    const totalCost = empBills.reduce((acc, b) => acc + b.totalPayable, 0);
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
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
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
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
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
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee / 1099</span>
        </button>
      </div>

      {/* Employee List Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="employees-table" className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <tr>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-stone-900"
                  onClick={() => {
                    if (sortBy === 'id') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('id'); setSortOrder('asc'); }
                  }}
                >
                  Employee ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-stone-900"
                  onClick={() => {
                    if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('name'); setSortOrder('asc'); }
                  }}
                >
                  Name & Email {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-stone-900"
                  onClick={() => {
                    if (sortBy === 'hireDate') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('hireDate'); setSortOrder('asc'); }
                  }}
                >
                  Hire Date {sortBy === 'hireDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3">Current Placement</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedEmployees.map(emp => {
                const placement = placements.find(p => p.id === emp.currentPlacementId);
                const client = placement ? clients.find(c => c.id === placement.clientId) : null;

                return (
                  <tr key={emp.id} id={`employee-row-${emp.id}`} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                      {emp.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">{emp.firstName} {emp.lastName}</div>
                      <div className="text-[11px] text-stone-400">{emp.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={emp.employeeType === 'W2' ? 'purple' : 'info'}>
                        {emp.employeeType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          emp.status === 'Active'
                            ? 'success'
                            : emp.status === 'Inactive'
                            ? 'neutral'
                            : 'danger'
                        }
                      >
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                      {formatDate(emp.hireDate)}
                    </td>
                    <td className="px-4 py-3">
                      {placement ? (
                        <div className="text-xs">
                          <span className="font-medium text-stone-800">{client?.name || placement.clientId}</span>
                          <span className="block text-[10px] text-stone-400">
                            ${placement.payRate.toFixed(2)}/hr ({placement.id})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`view-employee-${emp.id}`}
                          type="button"
                          onClick={() => {
                            setDetailEmployee(emp);
                            setDetailTab('info');
                          }}
                          className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                          title="View Employee Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`edit-employee-${emp.id}`}
                          type="button"
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {emp.status === 'Active' && (
                          <button
                            id={`delete-employee-${emp.id}`}
                            type="button"
                            onClick={() => handleDelete(emp.id)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-stone-100"
                            title="Deactivate Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    <p className="text-sm">No employees found.</p>
                    <button
                      type="button"
                      onClick={handleOpenAdd}
                      className="mt-2 text-xs text-emerald-700 font-semibold hover:underline"
                    >
                      + Add New Employee
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
                onChange={e => setFormData({ ...formData, employeeType: e.target.value as EmployeeType })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white"
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
                onChange={e => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white"
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
              className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              id="save-employee-submit"
              type="submit"
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold"
            >
              {editingEmployee ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Employee Detail Page Modal with Sections matching Specification 30 */}
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
                    className={`px-3 py-2 font-medium border-b-2 transition-colors ${
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
                    className={`px-3 py-2 font-medium border-b-2 transition-colors ${
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
                    className={`px-3 py-2 font-medium border-b-2 transition-colors ${
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
                    className={`px-3 py-2 font-medium border-b-2 transition-colors ${
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
                    className={`px-3 py-2 font-medium border-b-2 transition-colors ${
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
                    className={`px-3 py-2 font-medium border-b-2 transition-colors ${
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
