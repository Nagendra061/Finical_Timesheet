import React, { useState, useMemo } from 'react';
import { Search, Receipt, CheckCircle2, FileCheck } from 'lucide-react';
import { useStaffing } from '../../hooks/useStaffing';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { IncomeTable } from '../income/IncomeTable';
import { formatCurrency } from '../../utils/formatters';

/**
 * IncomeView Component
 * Renders revenue income records generated from approved timesheets,
 * with batch selection to produce Accounts Receivable Invoices.
 *
 * @returns {React.ReactElement}
 */
export const IncomeView = () => {
  const {
    incomes,
    employees,
    clients,
    generateInvoiceFromIncome
  } = useStaffing();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [selectedIncomeIds, setSelectedIncomeIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Invoice Generation Modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNotes, setInvoiceNotes] = useState('Staffing professional services billing');
  const [generationSuccess, setGenerationSuccess] = useState(null);

  const filteredIncomes = useMemo(() => {
    return incomes.filter(inc => {
      const emp = employees.find(e => e.id === inc.employeeId);
      const cli = clients.find(c => c.id === inc.clientId);
      const searchStr = `${inc.id} ${inc.timesheetId} ${emp?.firstName || ''} ${emp?.lastName || ''} ${cli?.name || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
      const matchesClient = clientFilter === 'ALL' || inc.clientId === clientFilter;
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [incomes, employees, clients, searchQuery, statusFilter, clientFilter]);

  const totalPages = Math.ceil(filteredIncomes.length / pageSize);
  const paginatedIncomes = filteredIncomes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Eligible unbilled records
  const unbilledRecords = filteredIncomes.filter(i => i.status === 'Unbilled');

  const handleSelectAllUnbilled = () => {
    if (selectedIncomeIds.length === unbilledRecords.length && unbilledRecords.length > 0) {
      setSelectedIncomeIds([]);
    } else {
      setSelectedIncomeIds(unbilledRecords.map(u => u.id));
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIncomeIds.includes(id)) {
      setSelectedIncomeIds(selectedIncomeIds.filter(i => i !== id));
    } else {
      setSelectedIncomeIds([...selectedIncomeIds, id]);
    }
  };

  // Group selected by client to verify single-client billing
  const selectedRecords = incomes.filter(i => selectedIncomeIds.includes(i.id));
  const distinctClientIds = Array.from(new Set(selectedRecords.map(r => r.clientId)));
  const selectedTotal = selectedRecords.reduce((acc, r) => acc + r.totalIncome, 0);

  const handleGenerateInvoice = () => {
    if (selectedIncomeIds.length === 0) return;
    if (distinctClientIds.length > 1) {
      alert('Selected income items belong to multiple clients. Please select items for a single client to generate an invoice.');
      return;
    }

    const d = new Date(invoiceDate);
    d.setDate(d.getDate() + 30);
    const dueDate = d.toISOString().split('T')[0];

    const generatedInvoices = generateInvoiceFromIncome(selectedIncomeIds, invoiceDate, dueDate, invoiceNotes);
    setIsInvoiceModalOpen(false);
    setSelectedIncomeIds([]);
    if (generatedInvoices && generatedInvoices.length > 0) {
      setGenerationSuccess(`Invoice ${generatedInvoices[0].invoiceNumber} successfully created for ${formatCurrency(generatedInvoices[0].total)}!`);
    }
  };

  return (
    <div className="space-y-4">
      {generationSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-950">Invoice Generated Successfully</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">{generationSuccess}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setGenerationSuccess(null)}
            className="text-stone-400 hover:text-stone-700 font-bold p-1 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              id="income-search-input"
              type="text"
              placeholder="Search income by ID, source TS, client..."
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
            id="income-status-filter"
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Unbilled">Unbilled (Ready to Invoice)</option>
            <option value="Billed">Billed</option>
            <option value="Posted">Posted</option>
          </select>

          <select
            id="income-client-filter"
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

        {/* Generate Invoice Action Button */}
        <button
          id="generate-invoice-button"
          type="button"
          disabled={selectedIncomeIds.length === 0}
          onClick={() => setIsInvoiceModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Receipt className="w-4 h-4" />
          <span>Generate Invoice ({selectedIncomeIds.length})</span>
        </button>
      </div>

      {/* Income Records Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <IncomeTable
          incomes={paginatedIncomes}
          employees={employees}
          clients={clients}
          selectedIds={selectedIncomeIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAllUnbilled}
          allSelected={selectedIncomeIds.length === unbilledRecords.length && unbilledRecords.length > 0}
          canSelectAny={unbilledRecords.length > 0}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredIncomes.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Invoice Generation Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Client AR Invoice"
        subtitle="Bundling selected approved timesheet income into an accounts receivable invoice"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">Target Client:</span>
              <span className="font-bold text-stone-900">
                {clients.find(c => c.id === distinctClientIds[0])?.name || distinctClientIds[0]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Line Items to Bill:</span>
              <span className="font-semibold text-stone-900">{selectedRecords.length} records</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-stone-200">
              <span className="text-stone-700 font-medium">Invoice Total Amount:</span>
              <span className="text-base font-bold text-emerald-700">{formatCurrency(selectedTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Invoice Date *</label>
              <input
                id="invoice-gen-date"
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-stone-200"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Payment Terms</label>
              <div className="p-2 rounded-lg bg-stone-100 text-stone-700 font-mono">
                {clients.find(c => c.id === distinctClientIds[0])?.paymentTerms || 'Net 30'}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Invoice Notes / Description</label>
            <textarea
              id="invoice-gen-notes"
              rows={2}
              value={invoiceNotes}
              onChange={e => setInvoiceNotes(e.target.value)}
              className="w-full p-2 rounded-lg border border-stone-200"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 border border-stone-200 rounded-lg p-2 bg-stone-50/50">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Included Income Records:
            </span>
            {selectedRecords.map(r => (
              <div key={r.id} className="flex justify-between p-1.5 bg-white rounded border border-stone-200 text-[11px]">
                <span>{r.id} • TS: {r.timesheetId} ({r.regularHours + r.overtimeHours} hrs)</span>
                <span className="font-bold text-stone-900">{formatCurrency(r.totalIncome)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 font-medium"
            >
              Cancel
            </button>
            <button
              id="confirm-generate-invoice-btn"
              type="button"
              onClick={handleGenerateInvoice}
              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              Create & Post Invoice
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
