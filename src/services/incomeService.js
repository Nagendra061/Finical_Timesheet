/**
 * incomeService
 *
 * Provides data access for Income (accrued revenue) records created from approved timesheets.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const incomeService = {
  async getAll() {
    await delay();
    return loadCollection('income') || [];
  },

  async create(incomeData) {
    await delay();
    const incomes = loadCollection('income') || [];
    const now = new Date().toISOString();
    const newIncome = {
      ...incomeData,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    const updated = [newIncome, ...incomes];
    saveCollection('income', updated);
    return newIncome;
  },

  async update(id, updates) {
    await delay();
    const incomes = loadCollection('income') || [];
    let updatedInc = null;
    const updated = incomes.map(i => {
      if (i.id === id) {
        updatedInc = {
          ...i,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (i.version || 1) + 1
        };
        return updatedInc;
      }
      return i;
    });
    saveCollection('income', updated);
    return updatedInc;
  },

  async markAsBilled(incomeIds, invoiceId) {
    await delay();
    const incomes = loadCollection('income') || [];
    const idSet = new Set(incomeIds);
    const now = new Date().toISOString();
    const updated = incomes.map(i => {
      if (idSet.has(i.id)) {
        return {
          ...i,
          status: 'Billed',
          invoiceId,
          updatedAt: now
        };
      }
      return i;
    });
    saveCollection('income', updated);
    return updated;
  }
};
