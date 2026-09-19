import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

/**
 * @typedef {Object} Placement
 * @property {string} id
 * @property {string} employeeId
 * @property {string} clientId
 * @property {string} jobId
 * @property {number} billingRate
 * @property {number} payRate
 * @property {number} [overtimeMultiplier]
 * @property {string} startDate
 * @property {string} [endDate]
 * @property {string} status
 */

/**
 * @typedef {Object} PlacementTableProps
 * @property {Placement[]} placements
 * @property {Array<Object>} employees
 * @property {Array<Object>} clients
 * @property {Array<Object>} jobs
 * @property {(placement: Placement) => void} onEdit
 * @property {(id: string) => void} onDelete
 */

/**
 * PlacementTable Component
 * Renders the table view for placements including rate spreads and margins.
 * 
 * @param {PlacementTableProps} props
 * @returns {React.ReactElement}
 */
export const PlacementTable = ({
  placements,
  employees,
  clients,
  jobs,
  onEdit,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto">
      <table id="placements-table" className="w-full text-left text-xs text-stone-700">
        <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Placement ID</th>
            <th className="px-4 py-3">Employee / Contractor</th>
            <th className="px-4 py-3">Client & Job Role</th>
            <th className="px-4 py-3">Active Period</th>
            <th className="px-4 py-3 text-right">Bill Rate</th>
            <th className="px-4 py-3 text-right">Pay Rate</th>
            <th className="px-4 py-3 text-right">Gross Margin Spread</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {placements.map(p => {
            const emp = employees.find(e => e.id === p.employeeId);
            const cli = clients.find(c => c.id === p.clientId);
            const job = jobs.find(j => j.id === p.jobId);
            const marginSpread = p.billingRate - p.payRate;
            const marginPct = (marginSpread / p.billingRate) * 100;

            return (
              <tr key={p.id} id={`placement-row-${p.id}`} className="hover:bg-stone-50/60 transition-colors">
                <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                  {p.id}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-stone-900">
                    {emp ? `${emp.firstName} ${emp.lastName}` : p.employeeId}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {emp ? `${emp.employeeType} • ${emp.id}` : p.employeeId}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-stone-900">{cli?.name || p.clientId}</div>
                  <div className="text-[11px] text-stone-500">{job?.title || p.jobId}</div>
                </td>
                <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                  {formatDate(p.startDate)}
                  <span className="text-stone-400 block text-[10px]">
                    {p.endDate ? `to ${formatDate(p.endDate)}` : 'Ongoing'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-stone-900">
                  ${p.billingRate.toFixed(2)}/hr
                </td>
                <td className="px-4 py-3 text-right font-medium text-rose-700">
                  ${p.payRate.toFixed(2)}/hr
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-bold text-emerald-700 block">
                    +${marginSpread.toFixed(2)}/hr
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {marginPct.toFixed(1)}% margin
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === 'Active' ? 'success' : 'neutral'}>
                    {p.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      id={`edit-placement-${p.id}`}
                      type="button"
                      onClick={() => onEdit(p)}
                      className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                      title="Edit Placement"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {p.status === 'Active' && (
                      <button
                        id={`delete-placement-${p.id}`}
                        type="button"
                        onClick={() => onDelete(p.id)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-stone-100"
                        title="End Placement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {placements.length === 0 && (
            <tr>
              <td colSpan={9} className="py-8 text-center text-stone-400">
                No placements found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
