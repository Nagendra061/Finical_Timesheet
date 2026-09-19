/**
 * jobService
 *
 * Provides CRUD data-access methods for client staffing jobs and requisitions.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const jobService = {
  async getAll() {
    await delay();
    return loadCollection('jobs') || [];
  },

  async getById(id) {
    await delay();
    const jobs = loadCollection('jobs') || [];
    return jobs.find(j => j.id === id) || null;
  },

  async create(jobData) {
    await delay();
    const jobs = loadCollection('jobs') || [];
    const now = new Date().toISOString();
    const newJob = {
      ...jobData,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    const updated = [newJob, ...jobs];
    saveCollection('jobs', updated);
    return newJob;
  },

  async update(id, updates) {
    await delay();
    const jobs = loadCollection('jobs') || [];
    let updatedJob = null;
    const updated = jobs.map(j => {
      if (j.id === id) {
        updatedJob = {
          ...j,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (j.version || 1) + 1
        };
        return updatedJob;
      }
      return j;
    });
    saveCollection('jobs', updated);
    return updatedJob;
  },

  async delete(id) {
    await delay();
    const jobs = loadCollection('jobs') || [];
    const updated = jobs.filter(j => j.id !== id);
    saveCollection('jobs', updated);
    return true;
  }
};
