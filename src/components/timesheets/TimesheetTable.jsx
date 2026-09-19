import React from 'react';
import { CheckCircle2, Eye, Trash2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

/**
 * @typedef {Object} Timesheet
 * @property {string} id
 * @property {string} employeeId
 * @property {string} placementId
 * @property {string} clientId
 * @property {string} periodStartDate
 * @property {string} periodEndDate
 * @property {number} regularHours
 * @property {number} overtimeHours
 * @property {number} holidayHours
 * @property {number} totalHours
 * @property {string} status
 */

/**
 * @typedef {Object} TimesheetTableProps
 * @property {Timesheet[]} timesheets
 * @property {Array<Object>} employees
 * @property {Array<Object>} clients
 * @property {Array<Object>} placements
 * @property {(timesheet: Timesheet) => void} onApprove
 * @property {(timesheet: Timesheet) => void} onReject
 * @property {(timesheet: Timesheet) => void} onView
 * @property {(id: string) => void} onDelete
 */

/**
 * TimesheetTable Component
 * Renders weekly timesheet logs with worker & placement info, hours, status, and approval actions.
 * 
 * @param {TimesheetTableProps} props
 * @returns {React.ReactElement}
 */
export const TimesheetTable = ({
  timesheets,
  employees,
  clients,
  placements,
  onApprove,
  onReject,
  onView,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto">
      <table id="timesheets-table" className="w-full text-left text-xs text-stone-700">
        <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Timesheet ID</th>
            <th className="px-4 py-3">Worker & Placement</th>
            <th className="px-4 py-3">Client Account</th>
            <th className="px-4 py-3">Period (Week)</th>
            <th className="px-4 py-3 text-center">Reg / OT / Hol</th>
            <th className="px-4 py-3 text-right">Total Hours</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {timesheets.map(t => {
            const emp = employees.find(e => e.id === t.employeeId);
            const cli = clients.find(c => c.id === t.clientId);
            const placement = placements.find(p => p.id === t.placementId);

            return (
              <tr key={t.id} id={`timesheet-row-${t.id}`} className="hover:bg-stone-50/60 transition-colors">
                <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                  {t.id}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-stone-900">
                    {emp ? `${emp.firstName} ${emp.lastName}` : t.employeeId}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {t.placementId} {placement ? `($${placement.payRate}/hr)` : ''}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-stone-800">
                  {cli?.name || t.clientId}
                </td>
                <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                  {formatDate(t.periodStartDate)} – {formatDate(t.periodEndDate)}
                </td>
                <td className="px-4 py-3 text-center font-mono text-stone-600">
                  {t.regularHours}r / {t.overtimeHours}ot / {t.holidayHours}h
                </td>
                <td className="px-4 py-3 text-right font-bold text-stone-900">
                  {t.totalHours} hrs
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      t.status === 'Approved'
                        ? 'success'
                        : t.status === 'Submitted'
                        ? 'warning'
                        : t.status === 'Rejected'
                        ? 'danger'
                        : 'neutral'
                    }
                  >
                    {t.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {t.status === 'Submitted' && (
                      <>
                        <button
                          id={`approve-timesheet-${t.id}`}
                          type="button"
                          onClick={() => onApprove(t)}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs flex items-center gap-1"
                          title="Approve Timesheet (Generates Income & AP)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          id={`reject-timesheet-${t.id}`}
                          type="button"
                          onClick={() => onReject(t)}
                          className="px-2 py-1 rounded-md bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 font-medium text-[11px] border border-stone-200"
                          title="Reject Timesheet"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      id={`view-timesheet-${t.id}`}
                      type="button"
                      onClick={() => onView(t)}
                      className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                      title="View Hours Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {t.status !== 'Approved' && (
                      <button
                        id={`delete-timesheet-${t.id}`}
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this timesheet entry?')) onDelete(t.id);
                        }}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-stone-100"
                        title="Delete Timesheet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {timesheets.length === 0 && (
            <tr>
              <td colSpan={8} className="py-8 text-center text-stone-400">
                No timesheets found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
