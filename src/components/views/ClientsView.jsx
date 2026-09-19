/**
 * ClientsView
 *
 * Primary master data management view for Client Organizations and Commercial Accounts.
 * Features search, payment terms filtering, status filtering, pagination,
 * Add/Edit Client modal, and multi-tab client detail drawer
 * (Profile, Jobs, Placements, Invoices, Remittances, and Profitability Summary).
 *
 * Data Source:
 * Redux store via useStaffing hook
 */

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Plus
} from 'lucide-react';
import { useStaffing } from '../../hooks/useStaffing';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { ClientTable } from '../clients/ClientTable';
import {
  formatCurrency,
  formatDate,
  formatPercent,
  calculateStaffingMargin,
  safeConfirm
} from '../../utils/formatters';

export const ClientsView = () => {
  const {
    clients = [],
    jobs = [],
    placements = [],
    timesheets = [],
    invoices = [],
    arPayments = [],
    incomes = [],
    apBills = [],
    addClient,
    updateClient,
    deleteClient
  } = useStaffing();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [termsFilter, setTermsFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [detailClient, setDetailClient] = useState(null);
  const [detailTab, setDetailTab] = useState('info');

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active',
    paymentTerms: 'Net 30',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    billingAddress: '',
    billingEmail: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Calculations per client
  const clientStats = useMemo(() => {
    const stats = {};

    clients.forEach(c => {
      const clientPlacements = placements.filter(p => p.clientId === c.id && p.status === 'Active');
      const clientInvoices = invoices.filter(i => i.clientId === c.id);
      const openAR = clientInvoices.reduce((acc, inv) => acc + (inv.balance || 0), 0);

      const clientIncomes = incomes.filter(i => i.clientId === c.id);
      const totalRevenue = clientIncomes.reduce((acc, i) => acc + (i.totalIncome || 0), 0);

      const placementIds = placements.filter(p => p.clientId === c.id).map(p => p.id);
      const clientBills = apBills.filter(b => placementIds.includes(b.placementId));
      const totalCost = clientBills.reduce((acc, b) => acc + (b.totalPayable || 0), 0);

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

  const handleOpenEdit = (c) => {
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
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Client name is required.';
    if (!formData.primaryContactName.trim()) errs.primaryContactName = 'Contact name is required.';
    if (!formData.primaryContactEmail.trim() || !formData.primaryContactEmail.includes('@')) {
      errs.primaryContactEmail = 'Valid contact email is required.';
    }
    if (!formData.billingAddress.trim()) errs.billingAddress = 'Billing address is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
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

  const handleDelete = (id) => {
    if (safeConfirm('Are you sure you want to deactivate this client account?')) {
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
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 cursor-pointer"
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
              setTermsFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 cursor-pointer"
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
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Clients Table Component */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <ClientTable
          clients={paginatedClients}
          clientStats={clientStats}
          onView={(c) => {
            setDetailClient(c);
            setDetailTab('info');
          }}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onAdd={handleOpenAdd}
        />

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
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white cursor-pointer"
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
                onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white cursor-pointer"
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
              className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-client-submit"
              type="submit"
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold cursor-pointer"
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
                    className={`px-3 py-2 font-medium border-b-2 whitespace-nowrap cursor-pointer ${
                      detailTab === 'info' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'
                    }`}
                  >
                    Client Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('jobs')}
                    className={`px-3 py-2 font-medium border-b-2 whitespace-nowrap cursor-pointer ${
                      detailTab === 'jobs' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'
                    }`}
                  >
                    Jobs ({clientJobs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('placements')}
                    className={`px-3 py-2 font-medium border-b-2 whitespace-nowrap cursor-pointer ${
                      detailTab === 'placements' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'
                    }`}
                  >
                    Placements ({clientPlacements.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('invoices')}
                    className={`px-3 py-2 font-medium border-b-2 whitespace-nowrap cursor-pointer ${
                      detailTab === 'invoices' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'
                    }`}
                  >
                    Invoices ({clientInvoices.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('payments')}
                    className={`px-3 py-2 font-medium border-b-2 whitespace-nowrap cursor-pointer ${
                      detailTab === 'payments' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'
                    }`}
                  >
                    Remittances ({clientPayments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab('profitability')}
                    className={`px-3 py-2 font-medium border-b-2 whitespace-nowrap cursor-pointer ${
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

export default ClientsView;
