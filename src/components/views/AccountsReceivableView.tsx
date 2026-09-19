import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Plus,
  DollarSign,
  Eye,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileText,
  CreditCard,
  Building2,
  Download
} from 'lucide-react';
import { useStaffing } from '../../context/StaffingContext';
import { Invoice, InvoiceStatus, PaymentMethod } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import {
  formatCurrency,
  formatDate,
  getARAgingCategory
} from '../../utils/formatters';

export const AccountsReceivableView: React.FC = () => {
  const {
    invoices,
    clients,
    arPayments,
    recordARPayment
  } = useStaffing();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InvoiceStatus>('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'aging' | 'payments'>('invoices');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ACH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const cli = clients.find(c => c.id === inv.clientId);
      const searchStr = `${inv.invoiceNumber} ${inv.id} ${cli?.name || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const matchesClient = clientFilter === 'ALL' || inv.clientId === clientFilter;
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [invoices, clients, searchQuery, statusFilter, clientFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // AR Aging Buckets calculation
  const agingBuckets = useMemo(() => {
    const buckets: Record<string, { count: number; total: number; invoices: Invoice[] }> = {
      Current: { count: 0, total: 0, invoices: [] },
      '1-30 Days': { count: 0, total: 0, invoices: [] },
      '31-60 Days': { count: 0, total: 0, invoices: [] },
      '61-90 Days': { count: 0, total: 0, invoices: [] },
      '90+ Days': { count: 0, total: 0, invoices: [] },
    };

    invoices.forEach(inv => {
      if (inv.balance > 0) {
        const cat = getARAgingCategory(inv.dueDate);
        if (buckets[cat]) {
          buckets[cat].count += 1;
          buckets[cat].total += inv.balance;
          buckets[cat].invoices.push(inv);
        }
      }
    });

    return buckets;
  }, [invoices]);

  const totalOutstanding = Object.values(agingBuckets).reduce((acc, b) => acc + b.total, 0);

  const handleOpenPayment = (inv: Invoice) => {
    setPaymentInvoice(inv);
    setPaymentAmount(inv.balance);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('ACH');
    setReferenceNumber(`REM-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaymentNotes('Client remittance receipt');
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice || paymentAmount <= 0) return;

    recordARPayment({
      invoiceId: paymentInvoice.id,
      amount: paymentAmount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      notes: paymentNotes
    });

    setIsPaymentModalOpen(false);
    setPaymentInvoice(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Sub-navigation */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('invoices')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'invoices'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Invoices & Receivables ({invoices.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('aging')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'aging'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          AR Aging Schedule ({formatCurrency(totalOutstanding)})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('payments')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'payments'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Payment Remittances ({arPayments.length})
        </button>
      </div>

      {/* Subtab 1: Invoices */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <input
                  id="ar-search-input"
                  type="text"
                  placeholder="Search by invoice #, client name..."
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
                id="ar-status-filter"
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>

              <select
                id="ar-client-filter"
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
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table id="ar-invoices-table" className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Invoice Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Remaining Balance</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paginatedInvoices.map(inv => {
                    const cli = clients.find(c => c.id === inv.clientId);
                    return (
                      <tr key={inv.id} id={`ar-invoice-row-${inv.id}`} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-900">
                          {cli?.name || inv.clientId}
                        </td>
                        <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                          {formatDate(inv.invoiceDate)}
                        </td>
                        <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                          {formatDate(inv.dueDate)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-stone-900">
                          {formatCurrency(inv.total)}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700 font-medium">
                          {formatCurrency(inv.amountPaid)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-stone-900">
                          {inv.balance > 0 ? (
                            <span className={inv.status === 'Overdue' ? 'text-rose-700' : 'text-stone-900'}>
                              {formatCurrency(inv.balance)}
                            </span>
                          ) : (
                            <span className="text-emerald-700">$0.00</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              inv.status === 'Paid'
                                ? 'success'
                                : inv.status === 'Overdue'
                                ? 'danger'
                                : inv.status === 'Partially Paid'
                                ? 'purple'
                                : 'warning'
                            }
                          >
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.balance > 0 && (
                              <button
                                id={`record-pay-${inv.id}`}
                                type="button"
                                onClick={() => handleOpenPayment(inv)}
                                className="px-2.5 py-1 rounded-md bg-stone-900 hover:bg-stone-800 text-white font-medium text-[11px] shadow-xs flex items-center gap-1"
                                title="Apply Client Payment Remittance"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                Record Pay
                              </button>
                            )}
                            <button
                              id={`view-invoice-${inv.id}`}
                              type="button"
                              onClick={() => setSelectedInvoice(inv)}
                              className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                              title="View Invoice Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedInvoices.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-stone-400">
                        No AR invoices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredInvoices.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Subtab 2: AR Aging Schedule */}
      {activeSubTab === 'aging' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {Object.entries(agingBuckets).map(([bucket, data]) => {
              const isOverdue = bucket !== 'Current';
              return (
                <div
                  key={bucket}
                  className={`p-4 rounded-xl border bg-white shadow-xs ${
                    isOverdue && data.total > 0 ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200'
                  }`}
                >
                  <p className="text-xs font-semibold text-stone-500">{bucket}</p>
                  <p className="text-xl font-bold text-stone-900 mt-1">{formatCurrency(data.total)}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{data.count} open invoices</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
            <h4 className="font-semibold text-stone-900 text-sm mb-3">Outstanding Receivables by Due Date</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto divide-y divide-stone-100 text-xs">
              {invoices
                .filter(i => i.balance > 0)
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .map(inv => {
                  const cli = clients.find(c => c.id === inv.clientId);
                  const agingCat = getARAgingCategory(inv.dueDate);
                  return (
                    <div key={inv.id} className="pt-2 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900">{inv.invoiceNumber}</span>
                        <span className="text-stone-500 ml-2">{cli?.name}</span>
                        <span className="block text-[11px] text-stone-400">Due: {formatDate(inv.dueDate)}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900 block">{formatCurrency(inv.balance)}</span>
                        <Badge variant={agingCat === 'Current' ? 'success' : 'danger'}>{agingCat}</Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: AR Payments Remittance Log */}
      {activeSubTab === 'payments' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Invoice Reference</th>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Reference / Check #</th>
                  <th className="px-4 py-3 text-right">Amount Remitted</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {arPayments.map(p => {
                  const inv = invoices.find(i => i.id === p.invoiceId);
                  const cli = inv ? clients.find(c => c.id === inv.clientId) : null;
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/60">
                      <td className="px-4 py-3 font-mono font-medium text-stone-900">{p.id}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-stone-900">{inv?.invoiceNumber || p.invoiceId}</span>
                        <span className="block text-[10px] text-stone-400">{cli?.name}</span>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{formatDate(p.paymentDate)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-stone-100 font-mono text-[11px]">{p.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-600">{p.referenceNumber || 'N/A'}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3 text-stone-500 truncate max-w-xs">{p.notes || '—'}</td>
                    </tr>
                  );
                })}
                {arPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentInvoice && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Record Payment for ${paymentInvoice.invoiceNumber}`}
          subtitle={`Client: ${clients.find(c => c.id === paymentInvoice.clientId)?.name} • Current Balance: ${formatCurrency(paymentInvoice.balance)}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Remittance Amount ($) *</label>
              <input
                id="ar-payment-amount"
                type="number"
                step="0.01"
                max={paymentInvoice.balance}
                value={paymentAmount}
                onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border border-stone-200 text-base font-bold text-stone-900"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Enter amount received. Max remaining balance: {formatCurrency(paymentInvoice.balance)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Payment Date *</label>
                <input
                  id="ar-payment-date"
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Payment Method *</label>
                <select
                  id="ar-payment-method"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2 rounded-lg border border-stone-200 bg-white"
                >
                  <option value="ACH">ACH Transfer</option>
                  <option value="Wire">Wire Transfer</option>
                  <option value="Check">Check</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Reference / Transaction / Check #</label>
              <input
                id="ar-payment-ref"
                type="text"
                value={referenceNumber}
                onChange={e => setReferenceNumber(e.target.value)}
                placeholder="e.g. ACH-948123 or Check #4401"
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Notes</label>
              <input
                id="ar-payment-notes"
                type="text"
                value={paymentNotes}
                onChange={e => setPaymentNotes(e.target.value)}
                placeholder="Bank confirmation or remittance details"
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 font-medium"
              >
                Cancel
              </button>
              <button
                id="confirm-record-payment-btn"
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Remittance
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle={`Issued: ${formatDate(selectedInvoice.invoiceDate)} • Due: ${formatDate(selectedInvoice.dueDate)}`}
          maxWidth="2xl"
        >
          {(() => {
            const cli = clients.find(c => c.id === selectedInvoice.clientId);
            const invoicePayments = arPayments.filter(p => p.invoiceId === selectedInvoice.id);

            return (
              <div className="space-y-4 text-xs">
                {/* Invoice Bill-To Box */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Billed To:</span>
                    <p className="font-bold text-stone-900 text-sm">{cli?.name}</p>
                    <p className="text-stone-600 text-[11px] whitespace-pre-line">{cli?.billingAddress}</p>
                    <p className="text-stone-400 text-[11px] mt-1">{cli?.primaryContactEmail}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Invoice Status:</span>
                    <Badge variant={selectedInvoice.status === 'Paid' ? 'success' : 'warning'}>
                      {selectedInvoice.status}
                    </Badge>
                    <div className="mt-3">
                      <span className="text-[10px] text-stone-400 block">Payment Terms:</span>
                      <span className="font-semibold text-stone-800">{cli?.paymentTerms || 'Net 30'}</span>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-stone-600 font-semibold">
                      <tr>
                        <th className="px-3 py-2">Description / Worker</th>
                        <th className="px-3 py-2">Source Timesheet</th>
                        <th className="px-3 py-2 text-center">Hours</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedInvoice.lineItems.map(item => (
                        <tr key={item.id}>
                          <td className="px-3 py-2.5 font-medium text-stone-900">{item.description}</td>
                          <td className="px-3 py-2.5 font-mono text-stone-500">{item.timesheetId || '—'}</td>
                          <td className="px-3 py-2.5 text-center">{item.hours} hrs</td>
                          <td className="px-3 py-2.5 text-right font-mono">${item.rate.toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-right font-bold text-stone-900">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Breakdown */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-1.5 p-3 rounded-lg bg-stone-50 border border-stone-200 text-right">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Invoice Total:</span>
                      <span className="font-bold text-stone-900">{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Total Paid:</span>
                      <span className="font-bold">-{formatCurrency(selectedInvoice.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-stone-200 text-stone-900 font-bold">
                      <span>Remaining Balance:</span>
                      <span>{formatCurrency(selectedInvoice.balance)}</span>
                    </div>
                  </div>
                </div>

                {/* Applied Payments History */}
                {invoicePayments.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-stone-700 block mb-1.5">Remittances Applied to this Invoice</span>
                    <div className="space-y-1">
                      {invoicePayments.map(p => (
                        <div key={p.id} className="p-2 bg-stone-50 rounded border border-stone-200 flex justify-between text-[11px]">
                          <span>
                            {formatDate(p.paymentDate)} via {p.paymentMethod} (Ref: {p.referenceNumber})
                          </span>
                          <span className="font-bold text-emerald-700">{formatCurrency(p.amount)}</span>
                        </div>
                      ))}
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
