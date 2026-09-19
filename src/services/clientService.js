/**
 * clientService
 *
 * Provides CRUD data-access methods for managing client organizations, contacts, and terms.
 * Interfaces with the JSON data store.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const clientService = {
  /**
   * Retrieves all clients.
   * @returns {Promise<Array>}
   */
  async getAll() {
    await delay();
    return loadCollection('clients') || [];
  },

  /**
   * Retrieves a client by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    await delay();
    const clients = loadCollection('clients') || [];
    return clients.find(c => c.id === id) || null;
  },

  /**
   * Creates a new client.
   * @param {Object} clientData
   * @returns {Promise<Object>}
   */
  async create(clientData) {
    await delay();
    const clients = loadCollection('clients') || [];
    const now = new Date().toISOString();
    const newClient = {
      ...clientData,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    const updated = [newClient, ...clients];
    saveCollection('clients', updated);
    return newClient;
  },

  /**
   * Updates an existing client.
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async update(id, updates) {
    await delay();
    const clients = loadCollection('clients') || [];
    let updatedCli = null;
    const updated = clients.map(c => {
      if (c.id === id) {
        updatedCli = {
          ...c,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (c.version || 1) + 1
        };
        return updatedCli;
      }
      return c;
    });
    saveCollection('clients', updated);
    return updatedCli;
  },

  /**
   * Deletes a client by ID.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    await delay();
    const clients = loadCollection('clients') || [];
    const updated = clients.filter(c => c.id !== id);
    saveCollection('clients', updated);
    return true;
  }
};
