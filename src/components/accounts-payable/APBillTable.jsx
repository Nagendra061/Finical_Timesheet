import React from 'react';
import { Send, Eye } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * @typedef {Object} APBill
 * @property {string} id
 * @property {string} timesheetId
 * @property {string} employeeId
 * @property {string} placementId
 * @property {number} regularHours
 * @property {number} overtimeHours
 * @property {string} dueDate
 * @property {number} totalPayable
 * @property {number} amountPaid
 * @property {number} balance
 * @property {string} status
 */

/**
 * @typedef {Object} APBillTableProps
 * @property {APBill[]} bills
 * @property {Array<Object>} employees
 * @property {(bill: APBill) => void} onPay
 * @property {(bill: APBill) => void} onView
 */

/**
 * APBillTable Component
 * Renders the accounts payable bills table for worker and contractor compensation.
 * 
 * @param {APBillTableProps} props
 * @returns {React.ReactElement}
 */
export const APBillTable = ({
  bills,
  employees,
  onPay,
  onView
}) => {
  return (
    <div className="overflow-x-auto">
      <table id="ap-bills-table" className="w-full text-left text-xs text-stone-700">
        <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Bill ID</th>
            <th className="px-4 py-3">Source Timesheet</th>
            <th className="px-4 py-3">Worker & Type</th>
            <th className="px-4 py-3 text-center">Hours (Reg / OT)</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3 text-right">Total Payable</th>
            <th className="px-4 py-3 text-right">Paid</th>
            <th className="px-4 py-3 text-right">Balance</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {bills.map(b => {
            const emp = employees.find(e => e.id === b.employeeId);
            return (
              <tr key={b.id} id={`ap-bill-row-${b.id}`} className="hover:bg-stone-50/60 transition-colors">
                <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                  {b.id}
                </td>
                <td className="px-4 py-3 font-mono text-stone-600">
                  {b.timesheetId}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-stone-900">
                    {emp ? `${emp.firstName} ${emp.lastName}` : b.employeeId}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {emp?.employeeType || 'Worker'} • {b.placementId}
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-mono text-stone-600">
                  {b.regularHours}r {b.overtimeHours > 0 ? `+ ${b.overtimeHours}ot` : ''}
                </td>
                <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                  {formatDate(b.dueDate)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-stone-900">
                  {formatCurrency(b.totalPayable)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-emerald-700">
                  {formatCurrency(b.amountPaid)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-stone-900">
                  {b.balance > 0 ? (
                    <span className={b.status === 'Overdue' ? 'text-rose-700' : 'text-stone-900'}>
                      {formatCurrency(b.balance)}
                    </span>
                  ) : (
                    <span className="text-emerald-700">$0.00</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      b.status === 'Paid'
                        ? 'success'
                        : b.status === 'Overdue'
                        ? 'danger'
                        : b.status === 'Partially Paid'
                        ? 'purple'
                        : 'warning'
                    }
                  >
                    {b.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {b.balance > 0 && (
                      <button
                        id={`disburse-pay-${b.id}`}
                        type="button"
                        onClick={() => onPay(b)}
                        className="px-2.5 py-1 rounded-md bg-stone-900 hover:bg-stone-800 text-white font-medium text-[11px] shadow-xs flex items-center gap-1"
                        title="Disburse Worker Compensation"
                      >
                        <Send className="w-3 h-3" />
                        Pay Worker
                      </button>
                    )}
                    <button
                      id={`view-bill-${b.id}`}
                      type="button"
                      onClick={() => onView(b)}
                      className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                      title="View Bill Breakdown"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {bills.length === 0 && (
            <tr>
              <td colSpan={10} className="py-8 text-center text-stone-400">
                No AP bills recorded.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
