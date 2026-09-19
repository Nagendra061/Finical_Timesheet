import React from 'react';
import { DollarSign, Eye } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} invoiceNumber
 * @property {string} clientId
 * @property {string} invoiceDate
 * @property {string} dueDate
 * @property {number} total
 * @property {number} amountPaid
 * @property {number} balance
 * @property {string} status
 */

/**
 * @typedef {Object} InvoiceTableProps
 * @property {Invoice[]} invoices
 * @property {Array<Object>} clients
 * @property {(invoice: Invoice) => void} onRecordPayment
 * @property {(invoice: Invoice) => void} onView
 */

/**
 * InvoiceTable Component
 * Renders the accounts receivable invoices table with client info, balances, and action buttons.
 * 
 * @param {InvoiceTableProps} props
 * @returns {React.ReactElement}
 */
export const InvoiceTable = ({
  invoices,
  clients,
  onRecordPayment,
  onView
}) => {
  return (
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
          {invoices.map(inv => {
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
                        onClick={() => onRecordPayment(inv)}
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
                      onClick={() => onView(inv)}
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

          {invoices.length === 0 && (
            <tr>
              <td colSpan={9} className="py-8 text-center text-stone-400">
                No AR invoices found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
