/**
 * invoiceService
 *
 * Provides data-access methods for client Invoices.
 * Handles invoice creation, income grouping, and balance updates.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const invoiceService = {
  async getAll() {
    await delay();
    return loadCollection('invoices') || [];
  },

  async getById(id) {
    await delay();
    const invoices = loadCollection('invoices') || [];
    return invoices.find(i => i.id === id) || null;
  },

  async create(invoiceData) {
    await delay();
    const invoices = loadCollection('invoices') || [];
    const now = new Date().toISOString();
    const newInvoice = {
      ...invoiceData,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    const updated = [newInvoice, ...invoices];
    saveCollection('invoices', updated);
    return newInvoice;
  },

  async update(id, updates) {
    await delay();
    const invoices = loadCollection('invoices') || [];
    let updatedInv = null;
    const updated = invoices.map(i => {
      if (i.id === id) {
        updatedInv = {
          ...i,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (i.version || 1) + 1
        };
        return updatedInv;
      }
      return i;
    });
    saveCollection('invoices', updated);
    return updatedInv;
  }
};
