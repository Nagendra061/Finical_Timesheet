/**
 * EmployeeTable
 *
 * Displays the employee and contractor roster with role types (W2 / 1099),
 * status indicators, hire dates, active placements, and row actions.
 *
 * Data Source:
 * Redux employees and placements state
 *
 * Actions:
 * View Details, Edit Record, Deactivate Worker
 */

import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export const EmployeeTable = ({
  employees = [],
  placements = [],
  clients = [],
  sortBy,
  sortOrder,
  onSort,
  onView,
  onEdit,
  onDelete,
  onAdd
}) => {
  return (
    <div className="overflow-x-auto">
      <table id="employees-table" className="w-full text-left text-xs text-stone-700">
        <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
          <tr>
            <th
              className="px-4 py-3 cursor-pointer hover:text-stone-900"
              onClick={() => onSort('id')}
            >
              Employee ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th
              className="px-4 py-3 cursor-pointer hover:text-stone-900"
              onClick={() => onSort('name')}
            >
              Name & Email {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th
              className="px-4 py-3 cursor-pointer hover:text-stone-900"
              onClick={() => onSort('hireDate')}
            >
              Hire Date {sortBy === 'hireDate' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-4 py-3">Current Placement</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {employees.map(emp => {
            const placement = placements.find(p => p.id === emp.currentPlacementId);
            const client = placement ? clients.find(c => c.id === placement.clientId) : null;

            return (
              <tr key={emp.id} id={`employee-row-${emp.id}`} className="hover:bg-stone-50/60 transition-colors">
                <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                  {emp.id}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-stone-900">{emp.firstName} {emp.lastName}</div>
                  <div className="text-[11px] text-stone-400">{emp.email}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={emp.employeeType === 'W2' ? 'purple' : 'info'}>
                    {emp.employeeType}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      emp.status === 'Active'
                        ? 'success'
                        : emp.status === 'Inactive'
                        ? 'neutral'
                        : 'danger'
                    }
                  >
                    {emp.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                  {formatDate(emp.hireDate)}
                </td>
                <td className="px-4 py-3">
                  {placement ? (
                    <div className="text-xs">
                      <span className="font-medium text-stone-800">{client?.name || placement.clientId}</span>
                      <span className="block text-[10px] text-stone-400">
                        ${placement.payRate.toFixed(2)}/hr ({placement.id})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-stone-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      id={`view-employee-${emp.id}`}
                      type="button"
                      onClick={() => onView(emp)}
                      className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
                      title="View Employee Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      id={`edit-employee-${emp.id}`}
                      type="button"
                      onClick={() => onEdit(emp)}
                      className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
                      title="Edit Employee"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {emp.status === 'Active' && (
                      <button
                        id={`delete-employee-${emp.id}`}
                        type="button"
                        onClick={() => onDelete(emp.id)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-stone-100 cursor-pointer"
                        title="Deactivate Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {employees.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-stone-400">
                <p className="text-sm">No employees found.</p>
                <button
                  type="button"
                  onClick={onAdd}
                  className="mt-2 text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  + Add New Employee
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
