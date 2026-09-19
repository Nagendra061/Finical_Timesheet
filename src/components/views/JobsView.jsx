/**
 * JobsView
 *
 * Job requisitions and client staffing assignments management.
 * Features search, client filtering, status filtering, pagination,
 * and Add/Edit Requisition modal.
 *
 * Data Source:
 * Redux store via useStaffing hook
 */

import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Plus
} from 'lucide-react';
import { useStaffing } from '../../hooks/useStaffing';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { JobCard } from '../jobs/JobCard';
import { safeConfirm } from '../../utils/formatters';

export const JobsView = () => {
  const { jobs = [], clients = [], placements = [], addJob, updateJob, deleteJob } = useStaffing();

  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    department: 'Engineering',
    location: 'Remote / Dallas, TX',
    employmentType: 'Contract',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const client = clients.find(c => c.id === j.clientId);
      const matchesSearch =
        `${j.id} ${j.title} ${j.department} ${j.location} ${client?.name || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesClient = clientFilter === 'ALL' || j.clientId === clientFilter;
      const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
      return matchesSearch && matchesClient && matchesStatus;
    });
  }, [jobs, clients, searchQuery, clientFilter, statusFilter]);

  const totalPages = Math.ceil(filteredJobs.length / pageSize);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAdd = () => {
    setEditingJob(null);
    setFormData({
      clientId: clients[0]?.id || '',
      title: '',
      description: '',
      department: 'Clinical / Healthcare',
      location: 'Onsite - Dallas, TX',
      employmentType: 'Contract',
      status: 'Active'
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormData({
      clientId: job.clientId,
      title: job.title,
      description: job.description || '',
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      status: job.status
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Job title is required.';
    if (!formData.clientId) errs.clientId = 'Client selection is required.';
    if (!formData.department.trim()) errs.department = 'Department is required.';
    if (!formData.location.trim()) errs.location = 'Location is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingJob) {
      updateJob(editingJob.id, formData);
    } else {
      addJob(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if (safeConfirm('Are you sure you want to close/delete this job?')) {
      deleteJob(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              id="job-search-input"
              type="text"
              placeholder="Search jobs by title, department, ID..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400 text-stone-900"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          <select
            id="job-client-filter"
            value={clientFilter}
            onChange={e => {
              setClientFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 cursor-pointer"
          >
            <option value="ALL">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            id="job-status-filter"
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Filled">Filled</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <button
          id="add-job-button"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post Job / Requisition</span>
        </button>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="jobs-table" className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Job ID</th>
                <th className="px-4 py-3">Job Title & Description</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Placements</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedJobs.map(j => {
                const client = clients.find(c => c.id === j.clientId);
                const jobPlacements = placements.filter(p => p.jobId === j.id);

                return (
                  <JobCard
                    key={j.id}
                    job={j}
                    client={client}
                    placementsCount={jobPlacements.length}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                  />
                );
              })}

              {paginatedJobs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredJobs.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Job Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingJob ? `Edit Job ${editingJob.id}` : 'Create Job / Requisition'}
        subtitle="Specify client role parameters and hiring requisition details"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Client Account *</label>
              <select
                id="job-form-client"
                value={formData.clientId}
                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white cursor-pointer"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
              {formErrors.clientId && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.clientId}</p>}
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Status *</label>
              <select
                id="job-form-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Filled">Filled</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Job Title *</label>
            <input
              id="job-form-title"
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Registered Nurse ICU Specialist"
              className="w-full p-2 rounded-lg border border-stone-200"
            />
            {formErrors.title && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.title}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Department *</label>
              <input
                id="job-form-department"
                type="text"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="Clinical / IT"
                className="w-full p-2 rounded-lg border border-stone-200"
              />
              {formErrors.department && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.department}</p>}
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Location *</label>
              <input
                id="job-form-location"
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Dallas, TX"
                className="w-full p-2 rounded-lg border border-stone-200"
              />
              {formErrors.location && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.location}</p>}
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Employment Type</label>
              <select
                id="job-form-employment-type"
                value={formData.employmentType}
                onChange={e => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-200 bg-white cursor-pointer"
              >
                <option value="Contract">Contract</option>
                <option value="Contract-to-Hire">Contract-to-Hire</option>
                <option value="Direct Hire">Direct Hire</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Job Description & Notes</label>
            <textarea
              id="job-form-description"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key responsibilities, shift requirements, certifications..."
              className="w-full p-2 rounded-lg border border-stone-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-job-submit"
              type="submit"
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold cursor-pointer"
            >
              {editingJob ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobsView;
