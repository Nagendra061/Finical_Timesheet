/**
 * ClientTable
 *
 * Displays client organizations, commercial terms, primary contact details,
 * active placement counts, and outstanding AR balances with row actions.
 *
 * Data Source:
 * Redux clients and financial state
 *
 * Actions:
 * View Details, Edit Client, Deactivate Client
 */

import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';

export const ClientTable = ({
  clients = [],
  clientStats = {},
  onView,
  onEdit,
  onDelete,
  onAdd
}) => {
  return (
    <div className="overflow-x-auto">
      <table id="clients-table" className="w-full text-left text-xs text-stone-700">
        <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Client ID</th>
            <th className="px-4 py-3">Client Name</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Payment Terms</th>
            <th className="px-4 py-3">Primary Contact</th>
            <th className="px-4 py-3 text-center">Active Placements</th>
            <th className="px-4 py-3 text-right">Outstanding AR</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {clients.map(c => {
            const stats = clientStats[c.id] || { activePlacements: 0, openAR: 0 };
            return (
              <tr key={c.id} id={`client-row-${c.id}`} className="hover:bg-stone-50/60 transition-colors">
                <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                  {c.id}
                </td>
                <td className="px-4 py-3 font-semibold text-stone-900">
                  {c.name}
                  <span className="block text-[11px] font-normal text-stone-400 truncate max-w-xs">{c.billingAddress}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={c.status === 'Active' ? 'success' : c.status === 'Inactive' ? 'danger' : 'neutral'}>
                    {c.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-stone-600">
                  <span className="px-2 py-0.5 rounded bg-stone-100 font-mono text-[11px]">{c.paymentTerms}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-stone-900 font-medium">{c.primaryContactName}</div>
                  <div className="text-[11px] text-stone-400">{c.primaryContactEmail}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-800">
                    {stats.activePlacements} active
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-stone-900">
                  {stats.openAR > 0 ? (
                    <span className="text-amber-700">{formatCurrency(stats.openAR)}</span>
                  ) : (
                    <span className="text-emerald-700">$0.00</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      id={`view-client-${c.id}`}
                      type="button"
                      onClick={() => onView(c)}
                      className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
                      title="View Client Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      id={`edit-client-${c.id}`}
                      type="button"
                      onClick={() => onEdit(c)}
                      className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
                      title="Edit Client"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {c.status === 'Active' && (
                      <button
                        id={`delete-client-${c.id}`}
                        type="button"
                        onClick={() => onDelete(c.id)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-stone-100 cursor-pointer"
                        title="Deactivate Client"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {clients.length === 0 && (
            <tr>
              <td colSpan={8} className="py-8 text-center text-stone-400">
                <p>No clients found.</p>
                <button
                  type="button"
                  onClick={onAdd}
                  className="mt-2 text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  + Add New Client
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;
