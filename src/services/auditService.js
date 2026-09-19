/**
 * auditService
 *
 * Provides data access and recording for compliance and operational audit trails.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const auditService = {
  async getAll() {
    await delay();
    return loadCollection('auditLogs') || [];
  },

  async log(action, entity, entityId, details = '', previousValue = '', newValue = '') {
    await delay();
    const existing = loadCollection('auditLogs') || [];
    const newLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      organizationId: 'ORG-001',
      action,
      entity,
      entityType: entity,
      entityId,
      user: 'Operations Admin',
      timestamp: new Date().toISOString(),
      previousValue,
      newValue,
      details
    };
    const updated = [newLog, ...existing];
    saveCollection('auditLogs', updated);
    return newLog;
  }
};
