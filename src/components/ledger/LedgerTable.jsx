import React from 'react';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * @typedef {Object} TransactionLedgerEntry
 * @property {string} id
 * @property {string} transactionType
 * @property {string} sourceType
 * @property {string} sourceId
 * @property {string} transactionDate
 * @property {string} account
 * @property {number} debit
 * @property {number} credit
 * @property {string} description
 */

/**
 * @typedef {Object} LedgerTableProps
 * @property {TransactionLedgerEntry[]} entries
 */

/**
 * LedgerTable Component
 * Renders the full double-entry transaction journal with account debits/credits.
 * 
 * @param {LedgerTableProps} props
 * @returns {React.ReactElement}
 */
export const LedgerTable = ({ entries }) => {
  return (
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
          {entries.map(e => (
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
                {formatDate(e.transactionDate || e.date)}
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

          {entries.length === 0 && (
            <tr>
              <td colSpan={8} className="py-8 text-center text-stone-400 font-sans">
                No ledger entries found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
