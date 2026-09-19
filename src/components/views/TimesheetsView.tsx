import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  DollarSign,
  ArrowRight,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { useStaffing } from '../../context/StaffingContext';
import { Timesheet, TimesheetStatus, DailyHourEntry } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import {
  formatCurrency,
  formatDate,
  calculateStaffingMargin
} from '../../utils/formatters';

export const TimesheetsView: React.FC = () => {
  const {
    timesheets,
    employees,
    clients,
    placements,
    addTimesheet,
    updateTimesheet,
    deleteTimesheet,
    approveTimesheet,
    rejectTimesheet
  } = useStaffing();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TimesheetStatus>('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(null);
  const [detailTimesheet, setDetailTimesheet] = useState<Timesheet | null>(null);

  // Approval & Rejection dialog states
  const [approvingTimesheet, setApprovingTimesheet] = useState<Timesheet | null>(null);
  const [approverName, setApproverName] = useState('Director of Client Services');
  const [rejectingTimesheet, setRejectingTimesheet] = useState<Timesheet | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Confirmation banner
  const [approvalResult, setApprovalResult] = useState<{
    incomeId: string;
    apBillId: string;
    totalRevenue: number;
    totalPayable: number;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    placementId: '',
    clientId: '',
    periodStartDate: '2026-09-08',
    periodEndDate: '2026-09-14',
    regularHours: 40,
    overtimeHours: 0,
    holidayHours: 0,
    status: 'Submitted' as TimesheetStatus,
    notes: '',
    dailyHours: [
      { date: '2026-09-08', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-09', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-10', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-11', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-12', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-13', regularHours: 0, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-14', regularHours: 0, overtimeHours: 0, holidayHours: 0 },
    ] as DailyHourEntry[]
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredTimesheets = useMemo(() => {
    return timesheets.filter(t => {
      const emp = employees.find(e => e.id === t.employeeId);
      const cli = clients.find(c => c.id === t.clientId);
      const searchStr = `${t.id} ${emp?.firstName || ''} ${emp?.lastName || ''} ${cli?.name || ''} ${t.placementId}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesClient = clientFilter === 'ALL' || t.clientId === clientFilter;
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [timesheets, employees, clients, searchQuery, statusFilter, clientFilter]);

  const totalPages = Math.ceil(filteredTimesheets.length / pageSize);
  const paginatedTimesheets = filteredTimesheets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    const defaultPlacement = placements[0];
    const defaultEmp = employees.find(e => e.id === defaultPlacement?.employeeId) || employees[0];
    const defaultClient = clients.find(c => c.id === defaultPlacement?.clientId) || clients[0];

    setEditingTimesheet(null);
    setFormData({
      employeeId: defaultEmp?.id || '',
      placementId: defaultPlacement?.id || '',
      clientId: defaultClient?.id || '',
      periodStartDate: '2026-09-08',
      periodEndDate: '2026-09-14',
      regularHours: 40,
      overtimeHours: 0,
      holidayHours: 0,
      status: 'Submitted',
      notes: 'Standard 40.0 hr week logged',
      dailyHours: [
        { date: '2026-09-08', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
        { date: '2026-09-09', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
        { date: '2026-09-10', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
        { date: '2026-09-11', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
        { date: '2026-09-12', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
        { date: '2026-09-13', regularHours: 0, overtimeHours: 0, holidayHours: 0 },
        { date: '2026-09-14', regularHours: 0, overtimeHours: 0, holidayHours: 0 },
      ]
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handlePlacementChange = (pId: string) => {
    const selectedPlacement = placements.find(p => p.id === pId);
    if (selectedPlacement) {
      setFormData(prev => ({
        ...prev,
        placementId: selectedPlacement.id,
        employeeId: selectedPlacement.employeeId,
        clientId: selectedPlacement.clientId
      }));
    }
  };

  const handleDailyHourChange = (index: number, field: 'regularHours' | 'overtimeHours' | 'holidayHours', value: number) => {
    const newDaily = [...formData.dailyHours];
    newDaily[index] = { ...newDaily[index], [field]: Math.max(0, value) };

    // Recalculate totals
    const totReg = newDaily.reduce((acc, d) => acc + (d.regularHours || 0), 0);
    const totOT = newDaily.reduce((acc, d) => acc + (d.overtimeHours || 0), 0);
    const totHol = newDaily.reduce((acc, d) => acc + (d.holidayHours || 0), 0);

    setFormData(prev => ({
      ...prev,
      dailyHours: newDaily,
      regularHours: totReg,
      overtimeHours: totOT,
      holidayHours: totHol
    }));
  };

  const handleSaveTimesheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placementId) {
      setFormErrors({ placementId: 'Please select a placement.' });
      return;
    }
    const totHours = formData.regularHours + formData.overtimeHours + formData.holidayHours;
    if (totHours <= 0) {
      setFormErrors({ hours: 'Total hours must be greater than zero.' });
      return;
    }

    const selectedPlc = placements.find(p => p.id === formData.placementId);
    const jobId = selectedPlc?.jobId || '';

    if (editingTimesheet) {
      updateTimesheet(editingTimesheet.id, {
        ...formData,
        jobId,
        dailyEntries: formData.dailyHours,
        totalHours: totHours
      });
    } else {
      addTimesheet({
        ...formData,
        jobId,
        dailyEntries: formData.dailyHours,
        totalHours: totHours
      });
    }
    setIsFormOpen(false);
  };

  const handleConfirmApproval = () => {
    if (!approvingTimesheet) return;
    const result = approveTimesheet(approvingTimesheet.id, approverName);
    setApprovingTimesheet(null);

    if (result) {
      setApprovalResult({
        incomeId: result.income.id,
        apBillId: result.apBill.id,
        totalRevenue: result.income.totalIncome,
        totalPayable: result.apBill.totalPayable
      });
    }
  };

  const handleConfirmRejection = () => {
    if (!rejectingTimesheet || !rejectionReason.trim()) return;
    rejectTimesheet(rejectingTimesheet.id, rejectionReason);
    setRejectingTimesheet(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-4">
      {/* Approval Success Banner */}
      {approvalResult && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-950">
                Timesheet Approved & Operational Financials Generated!
              </p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                • Revenue Income Record Created: <span className="font-mono font-bold">{approvalResult.incomeId}</span> ({formatCurrency(approvalResult.totalRevenue)})
                <br />
                • Accounts Payable Bill Created: <span className="font-mono font-bold">{approvalResult.apBillId}</span> ({formatCurrency(approvalResult.totalPayable)})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setApprovalResult(null)}
            className="text-stone-400 hover:text-stone-700 font-bold p-1 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              id="timesheet-search-input"
              type="text"
              placeholder="Search timesheets by ID, worker, client..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400 text-stone-900"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          <select
            id="timesheet-status-filter"
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted (Pending)</option>
            <option value="Approved">Approved</option>
            <option value="Draft">Draft</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            id="timesheet-client-filter"
            value={clientFilter}
            onChange={e => {
              setClientFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
          >
            <option value="ALL">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          id="add-timesheet-button"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Timesheet</span>
        </button>
      </div>

      {/* Timesheets Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="timesheets-table" className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timesheet ID</th>
                <th className="px-4 py-3">Worker & Placement</th>
                <th className="px-4 py-3">Client Account</th>
                <th className="px-4 py-3">Period (Week)</th>
                <th className="px-4 py-3 text-center">Reg / OT / Hol</th>
                <th className="px-4 py-3 text-right">Total Hours</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedTimesheets.map(t => {
                const emp = employees.find(e => e.id === t.employeeId);
                const cli = clients.find(c => c.id === t.clientId);
                const placement = placements.find(p => p.id === t.placementId);

                return (
                  <tr key={t.id} id={`timesheet-row-${t.id}`} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                      {t.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">
                        {emp ? `${emp.firstName} ${emp.lastName}` : t.employeeId}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {t.placementId} {placement ? `($${placement.payRate}/hr)` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-800">
                      {cli?.name || t.clientId}
                    </td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                      {formatDate(t.periodStartDate)} – {formatDate(t.periodEndDate)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-stone-600">
                      {t.regularHours}r / {t.overtimeHours}ot / {t.holidayHours}h
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900">
                      {t.totalHours} hrs
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          t.status === 'Approved'
                            ? 'success'
                            : t.status === 'Submitted'
                            ? 'warning'
                            : t.status === 'Rejected'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.status === 'Submitted' && (
                          <>
                            <button
                              id={`approve-timesheet-${t.id}`}
                              type="button"
                              onClick={() => setApprovingTimesheet(t)}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs flex items-center gap-1"
                              title="Approve Timesheet (Generates Income & AP)"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              id={`reject-timesheet-${t.id}`}
                              type="button"
                              onClick={() => setRejectingTimesheet(t)}
                              className="px-2 py-1 rounded-md bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 font-medium text-[11px] border border-stone-200"
                              title="Reject Timesheet"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          id={`view-timesheet-${t.id}`}
                          type="button"
                          onClick={() => setDetailTimesheet(t)}
                          className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                          title="View Hours Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {t.status !== 'Approved' && (
                          <button
                            id={`delete-timesheet-${t.id}`}
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this timesheet entry?')) deleteTimesheet(t.id);
                            }}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-stone-100"
                            title="Delete Timesheet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedTimesheets.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    No timesheets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTimesheets.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Timesheet Modal with 7-Day Matrix */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTimesheet ? `Edit Timesheet ${editingTimesheet.id}` : 'Log Weekly Timesheet'}
        subtitle="Operational timesheets drive revenue accrual and contractor payables upon approval"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveTimesheet} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-700 mb-1">Active Placement *</label>
            <select
              id="timesheet-form-placement"
              value={formData.placementId}
              onChange={e => handlePlacementChange(e.target.value)}
              className="w-full p-2 rounded-lg border border-stone-200 bg-white"
            >
              {placements.map(p => {
                const emp = employees.find(e => e.id === p.employeeId);
                const cli = clients.find(c => c.id === p.clientId);
                return (
                  <option key={p.id} value={p.id}>
                    {p.id}: {emp?.firstName} {emp?.lastName} @ {cli?.name} (Bill: ${p.billingRate}/hr | Pay: ${p.payRate}/hr)
                  </option>
                );
              })}
            </select>
            {formErrors.placementId && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.placementId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Period Start Date *</label>
              <input
                id="timesheet-form-start-date"
                type="date"
                value={formData.periodStartDate}
                onChange={e => setFormData({ ...formData, periodStartDate: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Period End Date *</label>
              <input
                id="timesheet-form-end-date"
                type="date"
                value={formData.periodEndDate}
                onChange={e => setFormData({ ...formData, periodEndDate: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>
          </div>

          {/* 7-Day Daily Hours Matrix */}
          <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <span className="font-semibold text-stone-900">Daily Hours Entry (Mon - Sun)</span>
              <span className="font-bold text-stone-900">
                Total Logged: {formData.regularHours + formData.overtimeHours + formData.holidayHours} hrs
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const entry = formData.dailyHours[idx] || { date: '', regularHours: 0, overtimeHours: 0, holidayHours: 0 };
                return (
                  <div key={day} className="p-2 bg-white rounded-lg border border-stone-200 space-y-1">
                    <span className="text-[11px] font-bold text-stone-600 block">{day}</span>
                    <div>
                      <label className="text-[9px] text-stone-400 block">Reg</label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={entry.regularHours}
                        onChange={e => handleDailyHourChange(idx, 'regularHours', parseFloat(e.target.value) || 0)}
                        className="w-full text-center p-1 rounded border border-stone-200 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-stone-400 block">OT</label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={entry.overtimeHours}
                        onChange={e => handleDailyHourChange(idx, 'overtimeHours', parseFloat(e.target.value) || 0)}
                        className="w-full text-center p-1 rounded border border-stone-200 text-xs text-amber-700 font-semibold"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Notes / Assignment Comments</label>
            <input
              id="timesheet-form-notes"
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Standard weekly shift completed"
              className="w-full p-2 rounded-lg border border-stone-200"
            />
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
              id="save-timesheet-submit"
              type="submit"
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold"
            >
              {editingTimesheet ? 'Save Changes' : 'Submit Timesheet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Timesheet Approval Confirmation Dialog */}
      {approvingTimesheet && (
        <Modal
          isOpen={!!approvingTimesheet}
          onClose={() => setApprovingTimesheet(null)}
          title={`Approve Timesheet ${approvingTimesheet.id}`}
          subtitle="This action will trigger operational Income (Revenue) and AP Bill generation"
          maxWidth="md"
        >
          {(() => {
            const placement = placements.find(p => p.id === approvingTimesheet.placementId);
            const billRate = placement?.billingRate || 0;
            const payRate = placement?.payRate || 0;
            const otMultiplier = placement?.overtimeMultiplier || 1.5;

            const estIncome =
              approvingTimesheet.regularHours * billRate +
              approvingTimesheet.overtimeHours * (billRate * otMultiplier);

            const estPay =
              approvingTimesheet.regularHours * payRate +
              approvingTimesheet.overtimeHours * (payRate * otMultiplier);

            const estMargin = estIncome - estPay;

            return (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Regular Hours:</span>
                    <span className="font-semibold text-stone-900">{approvingTimesheet.regularHours} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Overtime Hours:</span>
                    <span className="font-semibold text-stone-900">{approvingTimesheet.overtimeHours} hrs</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-stone-200">
                    <span className="text-stone-500">Accrued Revenue to Generate:</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(estIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">AP Worker Obligation:</span>
                    <span className="font-bold text-rose-700">{formatCurrency(estPay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Accrued Gross Margin:</span>
                    <span className="font-bold text-stone-900">{formatCurrency(estMargin)}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Authorized Approver Name *</label>
                  <input
                    id="timesheet-approver-name-input"
                    type="text"
                    value={approverName}
                    onChange={e => setApproverName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setApprovingTimesheet(null)}
                    className="px-3.5 py-2 rounded-lg border border-stone-200 text-stone-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-timesheet-approve-btn"
                    type="button"
                    onClick={handleConfirmApproval}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Approve
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Reject Timesheet Dialog */}
      {rejectingTimesheet && (
        <Modal
          isOpen={!!rejectingTimesheet}
          onClose={() => setRejectingTimesheet(null)}
          title={`Reject Timesheet ${rejectingTimesheet.id}`}
          subtitle="Provide reason for rejecting these logged hours"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Rejection Reason *</label>
              <textarea
                id="timesheet-reject-reason-input"
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Overtime hours exceeded pre-authorized client shift limit..."
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setRejectingTimesheet(null)}
                className="px-3.5 py-2 rounded-lg border border-stone-200 text-stone-700 font-medium"
              >
                Cancel
              </button>
              <button
                id="confirm-timesheet-reject-btn"
                type="button"
                onClick={handleConfirmRejection}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Reject Timesheet
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Timesheet Modal */}
      {detailTimesheet && (
        <Modal
          isOpen={!!detailTimesheet}
          onClose={() => setDetailTimesheet(null)}
          title={`Timesheet ${detailTimesheet.id}`}
          subtitle={`Cycle: ${formatDate(detailTimesheet.periodStartDate)} – ${formatDate(detailTimesheet.periodEndDate)}`}
          maxWidth="lg"
        >
          {(() => {
            const emp = employees.find(e => e.id === detailTimesheet.employeeId);
            const cli = clients.find(c => c.id === detailTimesheet.clientId);
            const placement = placements.find(p => p.id === detailTimesheet.placementId);

            return (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Worker</span>
                    <span className="font-semibold text-stone-900">{emp?.firstName} {emp?.lastName} ({emp?.id})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Client</span>
                    <span className="font-semibold text-stone-900">{cli?.name} ({cli?.id})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Placement & Rates</span>
                    <span className="text-stone-800">
                      {detailTimesheet.placementId} (Bill: ${placement?.billingRate}/hr, Pay: ${placement?.payRate}/hr)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Approval Status</span>
                    <Badge variant={detailTimesheet.status === 'Approved' ? 'success' : 'warning'}>
                      {detailTimesheet.status}
                    </Badge>
                  </div>
                </div>

                {detailTimesheet.approvedBy && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <p className="font-semibold">Approved by: {detailTimesheet.approvedBy}</p>
                    <p className="text-[11px] text-emerald-700">Timestamp: {formatDate(detailTimesheet.approvedAt || '')}</p>
                  </div>
                )}

                {detailTimesheet.rejectionReason && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                    <p className="font-semibold">Rejection Reason:</p>
                    <p className="text-[11px] text-rose-700">{detailTimesheet.rejectionReason}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold text-stone-900">Daily Hours Breakdown</h4>
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {(detailTimesheet.dailyHours || detailTimesheet.dailyEntries || []).map((d: any, i: number) => (
                      <div key={i} className="p-2 bg-stone-50 rounded border border-stone-200">
                        <span className="text-[10px] text-stone-500 font-mono block">{d.date.slice(5)}</span>
                        <span className="font-bold text-stone-900 block mt-1">{d.regularHours}r</span>
                        {d.overtimeHours > 0 && (
                          <span className="text-[10px] text-amber-700 font-bold block">+{d.overtimeHours}ot</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
