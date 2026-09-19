/**
 * JobCard
 *
 * Displays individual staffing job requisition details including client,
 * department, location, status, and active placement counts.
 *
 * Data Source:
 * Redux jobs and clients state
 *
 * Actions:
 * Edit Job, Delete Job
 */

import React from 'react';
import { MapPin, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../common/Badge';

export const JobCard = ({
  job,
  client,
  placementsCount = 0,
  onEdit,
  onDelete
}) => {
  return (
    <tr id={`job-row-${job.id}`} className="hover:bg-stone-50/60 transition-colors">
      <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
        {job.id}
      </td>
      <td className="px-4 py-3">
        <div className="font-semibold text-stone-900">{job.title}</div>
        <div className="text-[11px] text-stone-400 truncate max-w-sm">
          {job.description || `${job.employmentType} position`}
        </div>
      </td>
      <td className="px-4 py-3 font-medium text-stone-800">
        {client?.name || job.clientId}
      </td>
      <td className="px-4 py-3 text-stone-600">{job.department}</td>
      <td className="px-4 py-3 text-stone-600">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-stone-400" />
          <span>{job.location}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={job.status === 'Active' ? 'success' : job.status === 'Filled' ? 'info' : 'neutral'}>
          {job.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700">
          {placementsCount} placed
        </span>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <button
            id={`edit-job-${job.id}`}
            type="button"
            onClick={() => onEdit(job)}
            className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
            title="Edit Job"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            id={`delete-job-${job.id}`}
            type="button"
            onClick={() => onDelete(job.id)}
            className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-stone-100 cursor-pointer"
            title="Delete Job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default JobCard;
