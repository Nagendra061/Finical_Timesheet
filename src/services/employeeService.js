/**
 * employeeService
 *
 * Provides CRUD data-access methods for managing W2 employees and 1099 contractors.
 * Interfaces with the JSON data store and handles persistence.
 */

import { loadCollection, saveCollection, delay } from './apiClient';

export const employeeService = {
  /**
   * Retrieves all employees from the data store.
   * @returns {Promise<Array>}
   */
  async getAll() {
    await delay();
    return loadCollection('employees') || [];
  },

  /**
   * Retrieves a single employee by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    await delay();
    const employees = loadCollection('employees') || [];
    return employees.find(e => e.id === id) || null;
  },

  /**
   * Creates a new employee record and persists it.
   * @param {Object} employeeData
   * @returns {Promise<Object>}
   */
  async create(employeeData) {
    await delay();
    const employees = loadCollection('employees') || [];
    const now = new Date().toISOString();
    const newEmployee = {
      ...employeeData,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    const updated = [newEmployee, ...employees];
    saveCollection('employees', updated);
    return newEmployee;
  },

  /**
   * Updates an existing employee record.
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async update(id, updates) {
    await delay();
    const employees = loadCollection('employees') || [];
    let updatedEmp = null;
    const updated = employees.map(e => {
      if (e.id === id) {
        updatedEmp = {
          ...e,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (e.version || 1) + 1
        };
        return updatedEmp;
      }
      return e;
    });
    saveCollection('employees', updated);
    return updatedEmp;
  },

  /**
   * Deletes an employee by ID.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    await delay();
    const employees = loadCollection('employees') || [];
    const updated = employees.filter(e => e.id !== id);
    saveCollection('employees', updated);
    return true;
  }
};
