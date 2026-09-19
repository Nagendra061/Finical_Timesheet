import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useStaffing } from '../../context/StaffingContext';
import { Placement, PlacementStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import {
  formatCurrency,
  formatDate,
  formatPercent,
  calculateStaffingMargin
} from '../../utils/formatters';

export const PlacementsView: React.FC = () => {
  const {
    placements,
    employees,
    clients,
    jobs,
    addPlacement,
    updatePlacement,
    deletePlacement
  } = useStaffing();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PlacementStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    clientId: '',
    jobId: '',
    billingRate: 85,
    payRate: 55,
    overtimeMultiplier: 1.5,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Active' as PlacementStatus
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredPlacements = useMemo(() => {
    return placements.filter(p => {
      const emp = employees.find(e => e.id === p.employeeId);
      const cli = clients.find(c => c.id === p.clientId);
      const job = jobs.find(j => j.id === p.jobId);
      const str = `${p.id} ${emp?.firstName || ''} ${emp?.lastName || ''} ${cli?.name || ''} ${job?.title || ''}`.toLowerCase();
      const matchesSearch = str.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [placements, employees, clients, jobs, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredPlacements.length / pageSize);
  const paginatedPlacements = filteredPlacements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setEditingPlacement(null);
    setFormData({
      employeeId: employees[0]?.id || '',
      clientId: clients[0]?.id || '',
      jobId: jobs[0]?.id || '',
      billingRate: 90,
      payRate: 60,
      overtimeMultiplier: 1.5,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: Placement) => {
    setEditingPlacement(p);
    setFormData({
      employeeId: p.employeeId,
      clientId: p.clientId,
      jobId: p.jobId,
      billingRate: p.billingRate,
      payRate: p.payRate,
      overtimeMultiplier: p.overtimeMultiplier || 1.5,
      startDate: p.startDate,
      endDate: p.endDate || '',
      status: p.status
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.employeeId) errs.employeeId = 'Select an employee.';
    if (!formData.clientId) errs.clientId = 'Select a client.';
    if (!formData.jobId) errs.jobId = 'Select a job.';
    if (formData.billingRate <= 0) errs.billingRate = 'Billing rate must be greater than zero.';
    if (formData.payRate <= 0) errs.payRate = 'Pay rate must be greater than zero.';
    if (formData.billingRate <= formData.payRate) {
      errs.billingRate = 'Billing rate should exceed pay rate to maintain positive staffing margin.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingPlacement) {
      updatePlacement(editingPlacement.id, { ...formData, billingUnit: 'Hour', payUnit: 'Hour' });
    } else {
      addPlacement({ ...formData, billingUnit: 'Hour', payUnit: 'Hour' });
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to terminate/deactivate this placement?')) {
      deletePlacement(id);
    }
  };

  // Live calculation for the form
  const liveMargin = formData.billingRate - formData.payRate;
  const liveMarginPct = formData.billingRate > 0 ? (liveMargin / formData.billingRate) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              id="placement-search-input"
              type="text"
              placeholder="Search placements by ID, worker, client, job..."
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
            id="placement-status-filter"
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        <button
          id="add-placement-button"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Placement</span>
        </button>
      </div>

      {/* Placements Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="placements-table" className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Placement ID</th>
                <th className="px-4 py-3">Employee / Contractor</th>
                <th className="px-4 py-3">Client & Job Role</th>
                <th className="px-4 py-3">Active Period</th>
                <th className="px-4 py-3 text-right">Bill Rate</th>
                <th className="px-4 py-3 text-right">Pay Rate</th>
                <th className="px-4 py-3 text-right">Gross Margin Spread</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedPlacements.map(p => {
                const emp = employees.find(e => e.id === p.employeeId);
                const cli = clients.find(c => c.id === p.clientId);
                const job = jobs.find(j => j.id === p.jobId);
                const marginSpread = p.billingRate - p.payRate;
                const marginPct = (marginSpread / p.billingRate) * 100;

                return (
                  <tr key={p.id} id={`placement-row-${p.id}`} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                      {p.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">
                        {emp ? `${emp.firstName} ${emp.lastName}` : p.employeeId}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {emp ? `${emp.employeeType} • ${emp.id}` : p.employeeId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-900">{cli?.name || p.clientId}</div>
                      <div className="text-[11px] text-stone-500">{job?.title || p.jobId}</div>
                    </td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                      {formatDate(p.startDate)}
                      <span className="text-stone-400 block text-[10px]">
                        {p.endDate ? `to ${formatDate(p.endDate)}` : 'Ongoing'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-stone-900">
                      ${p.billingRate.toFixed(2)}/hr
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-rose-700">
                      ${p.payRate.toFixed(2)}/hr
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-emerald-700 block">
                        +${marginSpread.toFixed(2)}/hr
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {marginPct.toFixed(1)}% margin
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === 'Active' ? 'success' : 'neutral'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`edit-placement-${p.id}`}
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                          title="Edit Placement"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {p.status === 'Active' && (
                          <button
                            id={`delete-placement-${p.id}`}
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-stone-100"
                            title="End Placement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedPlacements.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400">
                    No placements found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPlacements.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Placement Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingPlacement ? `Edit Placement ${editingPlacement.id}` : 'Create Staffing Placement'}
        subtitle="Establish contractual assignment connecting employee, client, job, and rate cards"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-700 mb-1">Employee / Worker *</label>
            <select
              id="placement-form-employee"
              value={formData.employeeId}
              onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full p-2 rounded-lg border border-stone-200 bg-white"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.id} - {e.employeeType})
                </option>
              ))}
            </select>
            {formErrors.employeeId && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.employeeId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Client Account *</label>
              <select
                id="placement-form-client"
                value={formData.clientId}
                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
              {formErrors.clientId && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.clientId}</p>}
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Job / Requisition *</label>
              <select
                id="placement-form-job"
                value={formData.jobId}
                onChange={e => setFormData({ ...formData, jobId: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.id})
                  </option>
                ))}
              </select>
              {formErrors.jobId && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.jobId}</p>}
            </div>
          </div>

          {/* Rates Section with Live Margin Spread Preview */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <h4 className="font-semibold text-stone-900">Commercial Rate Structure</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Client Bill Rate ($/hr) *</label>
                <input
                  id="placement-form-bill-rate"
                  type="number"
                  step="0.01"
                  value={formData.billingRate}
                  onChange={e => setFormData({ ...formData, billingRate: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 rounded-lg border border-stone-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Worker Pay Rate ($/hr) *</label>
                <input
                  id="placement-form-pay-rate"
                  type="number"
                  step="0.01"
                  value={formData.payRate}
                  onChange={e => setFormData({ ...formData, payRate: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 rounded-lg border border-stone-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">OT Multiplier</label>
                <input
                  id="placement-form-ot-multiplier"
                  type="number"
                  step="0.1"
                  value={formData.overtimeMultiplier}
                  onChange={e => setFormData({ ...formData, overtimeMultiplier: parseFloat(e.target.value) || 1.5 })}
                  className="w-full p-2 rounded-lg border border-stone-200 bg-white"
                />
              </div>
            </div>

            {/* Live Spread Banner */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200 text-xs">
              <span className="text-stone-500">Gross Margin Spread:</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${liveMargin > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  ${liveMargin.toFixed(2)}/hr
                </span>
                <span className="text-stone-400">({liveMarginPct.toFixed(1)}%)</span>
              </div>
            </div>
            {formErrors.billingRate && <p className="text-rose-600 text-[11px]">{formErrors.billingRate}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Start Date *</label>
              <input
                id="placement-form-start-date"
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">End Date (Optional)</label>
              <input
                id="placement-form-end-date"
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Status *</label>
              <select
                id="placement-form-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as PlacementStatus })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Terminated">Terminated</option>
              </select>
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
              id="save-placement-submit"
              type="submit"
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold"
            >
              {editingPlacement ? 'Update Placement' : 'Create Placement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
