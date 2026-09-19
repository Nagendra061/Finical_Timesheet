import React from 'react';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';

/**
 * @typedef {Object} IncomeRecord
 * @property {string} id
 * @property {string} timesheetId
 * @property {string} employeeId
 * @property {string} clientId
 * @property {number} regularHours
 * @property {number} overtimeHours
 * @property {number} billingRate
 * @property {number} totalIncome
 * @property {string} status
 */

/**
 * @typedef {Object} IncomeTableProps
 * @property {IncomeRecord[]} incomes
 * @property {Array<Object>} employees
 * @property {Array<Object>} clients
 * @property {string[]} selectedIds
 * @property {(id: string) => void} onToggleSelect
 * @property {() => void} onSelectAll
 * @property {boolean} allSelected
 * @property {boolean} canSelectAny
 */

/**
 * IncomeTable Component
 * Renders approved revenue income items ready for AR invoice aggregation.
 * 
 * @param {IncomeTableProps} props
 * @returns {React.ReactElement}
 */
export const IncomeTable = ({
  incomes,
  employees,
  clients,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  allSelected,
  canSelectAny
}) => {
  return (
    <div className="overflow-x-auto">
      <table id="income-table" className="w-full text-left text-xs text-stone-700">
        <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
          <tr>
            <th className="px-3 py-3 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                disabled={!canSelectAny}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-400"
                title="Select all unbilled records"
              />
            </th>
            <th className="px-3 py-3">Income ID</th>
            <th className="px-3 py-3">Source Timesheet</th>
            <th className="px-3 py-3">Employee</th>
            <th className="px-3 py-3">Client</th>
            <th className="px-3 py-3 text-center">Hours (Reg / OT)</th>
            <th className="px-3 py-3 text-right">Bill Rate</th>
            <th className="px-3 py-3 text-right">Total Revenue</th>
            <th className="px-3 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {incomes.map(inc => {
            const emp = employees.find(e => e.id === inc.employeeId);
            const cli = clients.find(c => c.id === inc.clientId);
            const isSelected = selectedIds.includes(inc.id);

            return (
              <tr
                key={inc.id}
                id={`income-row-${inc.id}`}
                className={`hover:bg-stone-50/60 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}
              >
                <td className="px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={inc.status !== 'Unbilled'}
                    onChange={() => onToggleSelect(inc.id)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-400 disabled:opacity-30"
                  />
                </td>
                <td className="px-3 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                  {inc.id}
                </td>
                <td className="px-3 py-3 font-mono text-stone-600">
                  {inc.timesheetId}
                </td>
                <td className="px-3 py-3">
                  <div className="font-semibold text-stone-900">
                    {emp ? `${emp.firstName} ${emp.lastName}` : inc.employeeId}
                  </div>
                  <div className="text-[11px] text-stone-400">{inc.employeeId}</div>
                </td>
                <td className="px-3 py-3 font-medium text-stone-800">
                  {cli?.name || inc.clientId}
                </td>
                <td className="px-3 py-3 text-center font-mono text-stone-600">
                  {inc.regularHours}r {inc.overtimeHours > 0 ? `+ ${inc.overtimeHours}ot` : ''}
                </td>
                <td className="px-3 py-3 text-right font-medium text-stone-900">
                  ${inc.billingRate.toFixed(2)}/hr
                </td>
                <td className="px-3 py-3 text-right font-bold text-emerald-700">
                  {formatCurrency(inc.totalIncome)}
                </td>
                <td className="px-3 py-3">
                  <Badge variant={inc.status === 'Unbilled' ? 'warning' : 'success'}>
                    {inc.status}
                  </Badge>
                </td>
              </tr>
            );
          })}

          {incomes.length === 0 && (
            <tr>
              <td colSpan={9} className="py-8 text-center text-stone-400">
                No income records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
