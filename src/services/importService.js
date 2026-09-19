/**
 * importService
 *
 * Provides data access and persistence for historical CSV import batches and logs.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const importService = {
  async getAllBatches() {
    await delay();
    return loadCollection('importBatches') || [];
  },

  async addBatch(batch) {
    await delay();
    const existing = loadCollection('importBatches') || [];
    const updated = [batch, ...existing];
    saveCollection('importBatches', updated);
    return batch;
  }
};
