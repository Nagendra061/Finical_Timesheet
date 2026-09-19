/**
 * timesheetService
 *
 * Provides CRUD, submission, approval, and rejection operations for timesheets.
 * Coordinates financial generation for Income records and AP Bills upon approval.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const timesheetService = {
  async getAll() {
    await delay();
    return loadCollection('timesheets') || [];
  },

  async getById(id) {
    await delay();
    const timesheets = loadCollection('timesheets') || [];
    return timesheets.find(t => t.id === id) || null;
  },

  async create(timesheetData) {
    await delay();
    const timesheets = loadCollection('timesheets') || [];
    const now = new Date().toISOString();
    const newTimesheet = {
      ...timesheetData,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    const updated = [newTimesheet, ...timesheets];
    saveCollection('timesheets', updated);
    return newTimesheet;
  },

  async update(id, updates) {
    await delay();
    const timesheets = loadCollection('timesheets') || [];
    let updatedTs = null;
    const updated = timesheets.map(t => {
      if (t.id === id) {
        updatedTs = {
          ...t,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (t.version || 1) + 1
        };
        return updatedTs;
      }
      return t;
    });
    saveCollection('timesheets', updated);
    return updatedTs;
  },

  async submit(id) {
    await delay();
    const timesheets = loadCollection('timesheets') || [];
    const now = new Date().toISOString();
    let updatedTs = null;
    const updated = timesheets.map(t => {
      if (t.id === id) {
        updatedTs = {
          ...t,
          status: 'Submitted',
          submittedAt: now,
          updatedAt: now
        };
        return updatedTs;
      }
      return t;
    });
    saveCollection('timesheets', updated);
    return updatedTs;
  },

  async reject(id, reason) {
    await delay();
    const timesheets = loadCollection('timesheets') || [];
    const now = new Date().toISOString();
    let updatedTs = null;
    const updated = timesheets.map(t => {
      if (t.id === id) {
        updatedTs = {
          ...t,
          status: 'Rejected',
          rejectionReason: reason,
          updatedAt: now
        };
        return updatedTs;
      }
      return t;
    });
    saveCollection('timesheets', updated);
    return updatedTs;
  },

  async delete(id) {
    await delay();
    const timesheets = loadCollection('timesheets') || [];
    const updated = timesheets.filter(t => t.id !== id);
    saveCollection('timesheets', updated);
    return true;
  }
};
