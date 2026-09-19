/**
 * arService
 *
 * Provides data access and recording for Accounts Receivable payments and remittances.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const arService = {
  async getPayments() {
    await delay();
    return loadCollection('arPayments') || [];
  },

  async recordPayment(paymentData) {
    await delay();
    const payments = loadCollection('arPayments') || [];
    const now = new Date().toISOString();
    const newPayment = {
      ...paymentData,
      createdAt: now,
      updatedAt: now
    };
    const updated = [newPayment, ...payments];
    saveCollection('arPayments', updated);
    return newPayment;
  }
};
