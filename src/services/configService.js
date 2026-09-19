/**
 * configService
 *
 * Provides data access for organization settings and ID prefix counters.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const configService = {
  async getConfig() {
    await delay();
    return loadCollection('config');
  },

  async updateConfig(newConfig) {
    await delay();
    const current = loadCollection('config') || {};
    const updated = {
      ...current,
      ...newConfig,
      numbering: {
        ...current.numbering,
        ...(newConfig.numbering || {})
      }
    };
    saveCollection('config', updated);
    return updated;
  },

  async incrementNextNumber(key) {
    await delay();
    const current = loadCollection('config') || {};
    const currentNext = current.numbering?.nextNumbers || {};
    const nextVal = (currentNext[key] || 100) + 1;
    const updated = {
      ...current,
      numbering: {
        ...current.numbering,
        nextNumbers: {
          ...currentNext,
          [key]: nextVal
        }
      }
    };
    saveCollection('config', updated);
    return updated;
  }
};
