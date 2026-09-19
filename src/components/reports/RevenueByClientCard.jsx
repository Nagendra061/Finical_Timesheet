import React from 'react';
import { formatCurrency } from '../../utils/formatters';

/**
 * @typedef {Object} RevenueByClientItem
 * @property {string} clientName
 * @property {number} totalRevenue
 * @property {number} count
 */

/**
 * @typedef {Object} RevenueByClientCardProps
 * @property {RevenueByClientItem[]} items
 */

/**
 * RevenueByClientCard Component
 * Displays revenue aggregated across client accounts.
 * 
 * @param {RevenueByClientCardProps} props
 * @returns {React.ReactElement}
 */
export const RevenueByClientCard = ({ items }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-stone-700">
        <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Client Account</th>
            <th className="px-4 py-3 text-center">Accrued Records Count</th>
            <th className="px-4 py-3 text-right">Total Staffing Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {items.map(c => (
            <tr key={c.clientName} className="hover:bg-stone-50/60">
              <td className="px-4 py-3 font-semibold text-stone-900">{c.clientName}</td>
              <td className="px-4 py-3 text-center font-bold text-stone-700">{c.count}</td>
              <td className="px-4 py-3 text-right font-bold text-emerald-700 text-sm">{formatCurrency(c.totalRevenue)}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={3} className="py-8 text-center text-stone-400">
                No revenue records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
