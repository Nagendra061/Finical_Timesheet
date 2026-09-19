/**
 * apService
 *
 * Provides data access and recording for Accounts Payable bills and payments.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const apService = {
  async getBills() {
    await delay();
    return loadCollection('apBills') || [];
  },

  async getPayments() {
    await delay();
    return loadCollection('apPayments') || [];
  },

  async createBill(billData) {
    await delay();
    const bills = loadCollection('apBills') || [];
    const now = new Date().toISOString();
    const newBill = {
      ...billData,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    const updated = [newBill, ...bills];
    saveCollection('apBills', updated);
    return newBill;
  },

  async updateBill(id, updates) {
    await delay();
    const bills = loadCollection('apBills') || [];
    let updatedBill = null;
    const updated = bills.map(b => {
      if (b.id === id) {
        updatedBill = {
          ...b,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (b.version || 1) + 1
        };
        return updatedBill;
      }
      return b;
    });
    saveCollection('apBills', updated);
    return updatedBill;
  },

  async recordPayment(paymentData) {
    await delay();
    const payments = loadCollection('apPayments') || [];
    const now = new Date().toISOString();
    const newPayment = {
      ...paymentData,
      createdAt: now,
      updatedAt: now
    };
    const updated = [newPayment, ...payments];
    saveCollection('apPayments', updated);
    return newPayment;
  }
};
