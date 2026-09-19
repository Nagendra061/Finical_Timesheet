/**
 * placementService
 *
 * Provides CRUD data-access methods for placements connecting employees to client jobs.
 * Stores bill rates, pay rates, and placement dates.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const placementService = {
  async getAll() {
    await delay();
    return loadCollection('placements') || [];
  },

  async getById(id) {
    await delay();
    const placements = loadCollection('placements') || [];
    return placements.find(p => p.id === id) || null;
  },

  async create(placementData) {
    await delay();
    const placements = loadCollection('placements') || [];
    const now = new Date().toISOString();
    const newPlacement = {
      ...placementData,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    const updated = [newPlacement, ...placements];
    saveCollection('placements', updated);
    return newPlacement;
  },

  async update(id, updates) {
    await delay();
    const placements = loadCollection('placements') || [];
    let updatedPlc = null;
    const updated = placements.map(p => {
      if (p.id === id) {
        updatedPlc = {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (p.version || 1) + 1
        };
        return updatedPlc;
      }
      return p;
    });
    saveCollection('placements', updated);
    return updatedPlc;
  },

  async delete(id) {
    await delay();
    const placements = loadCollection('placements') || [];
    const updated = placements.filter(p => p.id !== id);
    saveCollection('placements', updated);
    return true;
  }
};
