import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  DollarSign,
  Briefcase,
  UserCheck,
  CalendarClock,
  Receipt,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useStaffing } from '../../context/StaffingContext';
import { Client, PaymentTerms, ClientStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import {
  formatCurrency,
  formatDate,
  formatPercent,
  calculateStaffingMargin,
  getARAgingCategory
} from '../../utils/formatters';

export const ClientsView: React.FC = () => {
  const {
    clients,
    jobs,
    placements,
    timesheets,
    invoices,
    arPayments,
    incomes,
    apBills,
    addClient,
    updateClient,
    deleteClient
  } = useStaffing();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClientStatus>('ALL');
  const [termsFilter, setTermsFilter] = useState<'ALL' | PaymentTerms>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'jobs' | 'placements' | 'invoices' | 'payments' | 'aging' | 'profitability'>('info');

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active' as ClientStatus,
    paymentTerms: 'Net 30' as PaymentTerms,
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    billingAddress: '',
    billingEmail: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Calculations per client
  const clientStats = useMemo(() => {
    const stats: Record<string, { activePlacements: number; openAR: number; totalRevenue: number; totalCost: number }> = {};

    clients.forEach(c => {
      const clientPlacements = placements.filter(p => p.clientId === c.id && p.status === 'Active');
      const clientInvoices = invoices.filter(i => i.clientId === c.id);
      const openAR = clientInvoices.reduce((acc, inv) => acc + inv.balance, 0);

      const clientIncomes = incomes.filter(i => i.clientId === c.id);
      const totalRevenue = clientIncomes.reduce((acc, i) => acc + i.totalIncome, 0);

      // Cost from placements for this client
      const placementIds = placements.filter(p => p.clientId === c.id).map(p => p.id);
      const clientBills = apBills.filter(b => placementIds.includes(b.placementId));
      const totalCost = clientBills.reduce((acc, b) => acc + b.totalPayable, 0);

      stats[c.id] = {
        activePlacements: clientPlacements.length,
        openAR,
        totalRevenue,
        totalCost
      };
    });

    return stats;
  }, [clients, placements, invoices, incomes, apBills]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch =
        `${c.name} ${c.id} ${c.primaryContactName} ${c.primaryContactEmail}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesTerms = termsFilter === 'ALL' || c.paymentTerms === termsFilter;
      return matchesSearch && matchesStatus && matchesTerms;
    });
  }, [clients, searchQuery, statusFilter, termsFilter]);

  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      status: 'Active',
      paymentTerms: 'Net 30',
      primaryContactName: '',
      primaryContactEmail: '',
      primaryContactPhone: '',
      billingAddress: '',
      billingEmail: ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setFormData({
      name: c.name,
      status: c.status,
      paymentTerms: c.paymentTerms,
      primaryContactName: c.primaryContactName,
      primaryContactEmail: c.primaryContactEmail,
      primaryContactPhone: c.primaryContactPhone || '',
      billingAddress: c.billingAddress || '',
      billingEmail: c.billingEmail || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Client name is required.';
    if (!formData.primaryContactName.trim()) errs.primaryContactName = 'Contact name is required.';
    if (!formData.primaryContactEmail.trim() || !formData.primaryContactEmail.includes('@')) {
      errs.primaryContactEmail = 'Valid contact email is required.';
    }
    if (!formData.billingAddress.trim()) errs.billingAddress = 'Billing address is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient({
        ...formData,
        contacts: [
          {
            id: `CON-${Date.now()}`,
            name: formData.primaryContactName,
            email: formData.primaryContactEmail,
            phone: formData.primaryContactPhone,
            isPrimary: true
          }
        ]
      });
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this client account?')) {
      deleteClient(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              id="client-search-input"
              type="text"
              placeholder="Search by client name, ID, contact..."
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
            id="client-status-filter"
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
            <option value="On Hold">On Hold</option>
          </select>

          <select
            id="client-terms-filter"
            value={termsFilter}
            onChange={e => {
              setTermsFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
          >
            <option value="ALL">All Payment Terms</option>
            <option value="Due on Receipt">Due on Receipt</option>
            <option value="Net 15">Net 15</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 45">Net 45</option>
            <option value="Net 60">Net 60</option>
          </select>
        </div>

        <button
          id="add-client-button"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="clients-table" className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Client ID</th>
                <th className="px-4 py-3">Client Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment Terms</th>
                <th className="px-4 py-3">Primary Contact</th>
                <th className="px-4 py-3 text-center">Active Placements</th>
                <th className="px-4 py-3 text-right">Outstanding AR</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedClients.map(c => {
                const stats = clientStats[c.id] || { activePlacements: 0, openAR: 0, totalRevenue: 0, totalCost: 0 };
                return (
                  <tr key={c.id} id={`client-row-${c.id}`} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                      {c.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-900">
                      {c.name}
                      <span className="block text-[11px] font-normal text-stone-400 truncate max-w-xs">{c.billingAddress}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.status === 'Active' ? 'success' : c.status === 'Inactive' ? 'danger' : 'neutral'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      <span className="px-2 py-0.5 rounded bg-stone-100 font-mono text-[11px]">{c.paymentTerms}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-stone-900 font-medium">{c.primaryContactName}</div>
                      <div className="text-[11px] text-stone-400">{c.primaryContactEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-800">
                        {stats.activePlacements} active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900">
                      {stats.openAR > 0 ? (
                        <span className="text-amber-700">{formatCurrency(stats.openAR)}</span>
                      ) : (
                        <span className="text-emerald-700">$0.00</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`view-client-${c.id}`}
                          type="button"
                          onClick={() => {
                            setDetailClient(c);
                            setDetailTab('info');
                          }}
                          className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                          title="View Client Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`edit-client-${c.id}`}
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                          title="Edit Client"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {c.status === 'Active' && (
                          <button
                            id={`delete-client-${c.id}`}
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-stone-100"
                            title="Deactivate Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredClients.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Client Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingClient ? `Edit Client ${editingClient.id}` : 'Add New Client Account'}
        subtitle="Manage commercial client profiles, contacts, and payment billing rules"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Client Name *</label>
              <input
                id="client-form-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Acme Health System"
                className="w-full p-2 rounded-lg border border-stone-200"
              />
              {formErrors.name && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Status *</label>
              <select
                id="client-form-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Payment Terms *</label>
              <select
                id="client-form-terms"
                value={formData.paymentTerms}
                onChange={e => setFormData({ ...formData, paymentTerms: e.target.value as PaymentTerms })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Billing Email</label>
              <input
                id="client-form-billing-email"
                type="email"
                value={formData.billingEmail}
                onChange={e => setFormData({ ...formData, billingEmail: e.target.value })}
                placeholder="ap@client.com"
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>
          </div>

          <div className="border-t border-stone-100 pt-3">
            <h4 className="font-semibold text-stone-900 mb-2">Primary Contact Information</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Contact Name *</label>
                <input
                  id="client-form-contact-name"
                  type="text"
                  value={formData.primaryContactName}
                  onChange={e => setFormData({ ...formData, primaryContactName: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full p-2 rounded-lg border border-stone-200"
                />
                {formErrors.primaryContactName && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.primaryContactName}</p>}
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Contact Email *</label>
                <input
                  id="client-form-contact-email"
                  type="email"
                  value={formData.primaryContactEmail}
                  onChange={e => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                  placeholder="jane.doe@client.com"
                  className="w-full p-2 rounded-lg border border-stone-200"
                />
                {formErrors.primaryContactEmail && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.primaryContactEmail}</p>}
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Phone</label>
                <input
                  id="client-form-contact-phone"
                  type="text"
                  value={formData.primaryContactPhone}
                  onChange={e => setFormData({ ...formData, primaryContactPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full p-2 rounded-lg border border-stone-200"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Billing Address *</label>
            <textarea
              id="client-form-address"
              rows={2}
              value={formData.billingAddress}
              onChange={e => setFormData({ ...formData, billingAddress: e.target.value })}
              placeholder="Full invoice billing street address, Suite, City, State, ZIP"
              className="w-full p-2 rounded-lg border border-stone-200"
            />
            {formErrors.billingAddress && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.billingAddress}</p>}
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
              id="save-client-submit"
              type="submit"
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold"
            >
              {editingClient ? 'Update Client' : 'Save Client'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Client Detail View Modal */}
      {detailClient && (
        <Modal
          isOpen={!!detailClient}
          onClose={() => setDetailClient(null)}
          title={`${detailClient.name} (${detailClient.id})`}
          subtitle={`${detailClient.paymentTerms} • Status: ${detailClient.status}`}
          maxWidth="4xl"
        >
          {(() => {
            const clientJobs = jobs.filter(j => j.clientId === detailClient.id);
            const clientPlacements = placements.filter(p => p.clientId === detailClient.id);
            const clientInvoices = invoices.filter(i => i.clientId === detailClient.id);
            const clientInvoiceIds = clientInvoices.map(i => i.id);
            const clientPayments = arPayments.filter(p => clientInvoiceIds.includes(p.invoiceId));

            const stats = clientStats[detailClient.id] || { activePlacements: 0, openAR: 0, totalRevenue: 0, totalCost: 0 };
            const { grossMargin, grossMarginPercent } = calculateStaffingMargin(stats.totalRevenue, stats.totalCost);

            return (
              <div className="space-y-4 text-xs">
                {/* Tabs */}
                <div className="flex border-b border-stone-200 gap-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setDetailTab('info')}
                    className={`px-3 py-2 font-medium border-b-2 whitespace-nowrap ${
                      detailTab === 'info' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'
                    }`}
                  >
                    Client Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('jobs')}
                    className={`px-3 py-2 font-medium border-b-2 whitespace-nowrap ${
                      detailTab === 'jobs' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'
                    }`}
                  >
                    Jobs ({clientJobs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('placements')}
                    className={`px-3 py-2 font-medium border-b-2 whitespace-nowrap ${
                      detailTab === 'placements' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'
                    }`}
                  >
                    Placements ({clientPlacements.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('invoices')}
                    className={`px-3 py-2 font-medium border-b-2 whitespace-nowrap ${
                      detailTab === 'invoices' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'
                    }`}
                  >
                    Invoices ({clientInvoices.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('payments')}
                    className={`px-3 py-2 font-medium border-b-2 whitespace-nowrap ${
                      detailTab === 'payments' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'
                    }`}
                  >
                    Remittances ({clientPayments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('profitability')}
                    className={`px-3 py-2 font-medium border-b-2 whitespace-nowrap ${
                      detailTab === 'profitability' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'
                    }`}
                  >
                    Profitability
                  </button>
                </div>

                {/* Tab: Info */}
                {detailTab === 'info' && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <div>
                      <span className="text-stone-400 block text-[11px]">Primary Contact</span>
                      <span className="font-semibold text-stone-900 text-sm">{detailClient.primaryContactName}</span>
                      <span className="block text-stone-600 text-[11px]">{detailClient.primaryContactEmail}</span>
                      <span className="block text-stone-500 text-[11px]">{detailClient.primaryContactPhone || 'No phone'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Commercial Terms</span>
                      <span className="font-semibold text-stone-900">{detailClient.paymentTerms}</span>
                      <span className="block text-stone-500 text-[11px] mt-1">
                        Billing Email: {detailClient.billingEmail || 'Same as primary'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-stone-400 block text-[11px]">Billing Address</span>
                      <span className="text-stone-800">{detailClient.billingAddress}</span>
                    </div>
                  </div>
                )}

                {/* Tab: Jobs */}
                {detailTab === 'jobs' && (
                  <div className="space-y-2">
                    {clientJobs.map(j => (
                      <div key={j.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-stone-900">{j.title} ({j.id})</span>
                          <span className="block text-[11px] text-stone-500">{j.department} • {j.location}</span>
                        </div>
                        <Badge variant={j.status === 'Active' ? 'success' : 'neutral'}>{j.status}</Badge>
                      </div>
                    ))}
                    {clientJobs.length === 0 && (
                      <p className="py-6 text-center text-stone-400 italic">No requisitions listed for this client.</p>
                    )}
                  </div>
                )}

                {/* Tab: Placements */}
                {detailTab === 'placements' && (
                  <div className="space-y-2">
                    {clientPlacements.map(p => (
                      <div key={p.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-stone-900">{p.id} (Worker ID: {p.employeeId})</span>
                          <span className="block text-[11px] text-stone-500">
                            Billing: ${p.billingRate}/hr | Pay: ${p.payRate}/hr
                          </span>
                        </div>
                        <Badge variant={p.status === 'Active' ? 'success' : 'neutral'}>{p.status}</Badge>
                      </div>
                    ))}
                    {clientPlacements.length === 0 && (
                      <p className="py-6 text-center text-stone-400 italic">No active placements.</p>
                    )}
                  </div>
                )}

                {/* Tab: Invoices */}
                {detailTab === 'invoices' && (
                  <div className="space-y-2">
                    {clientInvoices.map(inv => (
                      <div key={inv.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-stone-900">{inv.invoiceNumber} • Date: {formatDate(inv.invoiceDate)}</span>
                          <span className="block text-[11px] text-stone-500">
                            Due: {formatDate(inv.dueDate)} | Paid: {formatCurrency(inv.amountPaid)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-stone-900 block">{formatCurrency(inv.balance)} Balance</span>
                          <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'}>
                            {inv.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {clientInvoices.length === 0 && (
                      <p className="py-6 text-center text-stone-400 italic">No invoices issued to this client yet.</p>
                    )}
                  </div>
                )}

                {/* Tab: Payments */}
                {detailTab === 'payments' && (
                  <div className="space-y-2">
                    {clientPayments.map(pay => (
                      <div key={pay.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-stone-900">{pay.id} • {pay.paymentMethod}</span>
                          <span className="block text-[11px] text-stone-500">
                            Ref: {pay.referenceNumber || 'N/A'} • Paid: {formatDate(pay.paymentDate)}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700">{formatCurrency(pay.amount)}</span>
                      </div>
                    ))}
                    {clientPayments.length === 0 && (
                      <p className="py-6 text-center text-stone-400 italic">No payments received yet.</p>
                    )}
                  </div>
                )}

                {/* Tab: Profitability */}
                {detailTab === 'profitability' && (
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                    <h4 className="font-semibold text-stone-900 text-sm">Account Profitability Summary</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-white rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Total Revenue</span>
                        <span className="text-base font-bold text-stone-900 mt-1 block">
                          {formatCurrency(stats.totalRevenue)}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Worker Direct Cost</span>
                        <span className="text-base font-bold text-rose-700 mt-1 block">
                          {formatCurrency(stats.totalCost)}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Gross Margin ($)</span>
                        <span className="text-base font-bold text-emerald-700 mt-1 block">
                          {formatCurrency(grossMargin)}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Gross Margin (%)</span>
                        <span className="text-base font-bold text-emerald-700 mt-1 block">
                          {formatPercent(grossMarginPercent)}
                        </span>
                      </div>
                    </div>
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
