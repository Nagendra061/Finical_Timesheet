/**
 * ledgerService
 *
 * Provides data access for the double-entry transaction ledger.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const ledgerService = {
  async getAll() {
    await delay();
    return loadCollection('transactions') || [];
  },

  async addEntries(entries) {
    await delay();
    const existing = loadCollection('transactions') || [];
    const entriesToAdd = Array.isArray(entries) ? entries : [entries];
    const updated = [...entriesToAdd, ...existing];
    saveCollection('transactions', updated);
    return updated;
  }
};
