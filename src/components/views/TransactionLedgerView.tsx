import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Download,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useStaffing } from '../../context/StaffingContext';
import { TransactionType, TransactionLedgerEntry } from '../../types';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const TransactionLedgerView: React.FC = () => {
  const { ledger } = useStaffing();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filteredEntries = useMemo(() => {
    return ledger.filter((entry: TransactionLedgerEntry) => {
      const searchStr = `${entry.id} ${entry.sourceId} ${entry.sourceType} ${entry.account} ${entry.description}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'ALL' || entry.transactionType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [ledger, searchQuery, typeFilter]);

  const totalPages = Math.ceil(filteredEntries.length / pageSize);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalDebits = filteredEntries.reduce((acc: number, e: TransactionLedgerEntry) => acc + e.debit, 0);
  const totalCredits = filteredEntries.reduce((acc: number, e: TransactionLedgerEntry) => acc + e.credit, 0);

  const handleExportCSV = () => {
    const headers = ['ID', 'Type', 'Source Type', 'Source ID', 'Date', 'Account', 'Debit', 'Credit', 'Description'];
    const rows = filteredEntries.map((e: TransactionLedgerEntry) => [
      e.id,
      e.transactionType,
      e.sourceType,
      e.sourceId,
      e.date || e.transactionDate,
      `"${e.account}"`,
      e.debit,
      e.credit,
      `"${e.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Total Ledger Entries</span>
          <span className="text-2xl font-bold text-stone-900 mt-1 block">{filteredEntries.length}</span>
          <span className="text-[11px] text-stone-400">Complete audit double-entry movements</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Total Debits</span>
          <span className="text-2xl font-bold text-stone-900 mt-1 block">{formatCurrency(totalDebits)}</span>
          <span className="text-[11px] text-emerald-600 font-medium">Cash & Receivables active balance</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Total Credits</span>
          <span className="text-2xl font-bold text-stone-900 mt-1 block">{formatCurrency(totalCredits)}</span>
          <span className="text-[11px] text-stone-500">Accrued staffing revenue & payables</span>
        </div>
      </div>

      {/* Filter and Export Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              id="ledger-search-input"
              type="text"
              placeholder="Search ledger by entry ID, source ID, account..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white text-stone-900"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          <select
            id="ledger-type-filter"
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="REVENUE_ACCRUAL">Revenue Accrual</option>
            <option value="INVOICE_GENERATED">Invoice Generated</option>
            <option value="AR_PAYMENT_RECEIVED">AR Payment Received</option>
            <option value="AP_BILL_ACCRUED">AP Bill Accrued</option>
            <option value="AP_PAYMENT_DISBURSED">AP Payment Disbursed</option>
          </select>
        </div>

        <button
          id="export-ledger-csv-button"
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="transaction-ledger-table" className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Entry ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Source ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Financial Account</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {paginatedEntries.map((e: TransactionLedgerEntry) => (
                <tr key={e.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-900 whitespace-nowrap">
                    {e.id}
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <Badge
                      variant={
                        e.transactionType === 'AR_PAYMENT_RECEIVED'
                          ? 'success'
                          : e.transactionType === 'REVENUE_ACCRUAL'
                          ? 'info'
                          : e.transactionType === 'INVOICE_GENERATED'
                          ? 'purple'
                          : e.transactionType === 'AP_BILL_ACCRUED'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {e.transactionType.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-stone-700 whitespace-nowrap">
                    {e.sourceId} ({e.sourceType})
                  </td>
                  <td className="px-4 py-3 font-sans text-stone-600 whitespace-nowrap">
                    {formatDate(e.transactionDate)}
                  </td>
                  <td className="px-4 py-3 font-sans font-medium text-stone-900">
                    {e.account}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-stone-900">
                    {e.debit > 0 ? formatCurrency(e.debit) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-stone-900">
                    {e.credit > 0 ? formatCurrency(e.credit) : '—'}
                  </td>
                  <td className="px-4 py-3 font-sans text-stone-600 truncate max-w-xs" title={e.description}>
                    {e.description}
                  </td>
                </tr>
              ))}

              {paginatedEntries.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400 font-sans">
                    No ledger entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredEntries.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
