/**
 * Staffing Financial & Timesheet Management System
 * API Client & Data Access Layer
 *
 * Simulates an asynchronous RESTful backend service using local JSON files
 * as the source-of-truth seeds and browser localStorage for write persistence.
 *
 * Future API Integration:
 * When migrating to a real REST/GraphQL backend, update this client to make
 * HTTP requests via window.fetch or axios without altering the Service Layer interfaces.
 */

import initialConfig from '../data/config.json';
import initialEmployees from '../data/employees.json';
import initialClients from '../data/clients.json';
import initialJobs from '../data/jobs.json';
import initialPlacements from '../data/placements.json';
import initialTimesheets from '../data/timesheets.json';
import initialIncome from '../data/income.json';
import initialInvoices from '../data/invoices.json';
import initialArPayments from '../data/arPayments.json';
import initialApBills from '../data/apBills.json';
import initialApPayments from '../data/apPayments.json';
import initialTransactions from '../data/transactions.json';
import initialAuditLogs from '../data/auditLogs.json';
import initialImportBatches from '../data/importBatches.json';

const STORAGE_PREFIX = 'staffing_mgmt_phase1_db_v1';

const DEFAULT_SEEDS = {
  config: initialConfig,
  employees: initialEmployees,
  clients: initialClients,
  jobs: initialJobs,
  placements: initialPlacements,
  timesheets: initialTimesheets,
  income: initialIncome,
  invoices: initialInvoices,
  arPayments: initialArPayments,
  apBills: initialApBills,
  apPayments: initialApPayments,
  transactions: initialTransactions,
  auditLogs: initialAuditLogs,
  importBatches: initialImportBatches
};

/**
 * Loads collection from localStorage if present, else returns seed JSON.
 * @param {string} key
 * @returns {any}
 */
export function loadCollection(key) {
  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_${key}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
  }
  return DEFAULT_SEEDS[key];
}

/**
 * Persists collection to localStorage.
 * @param {string} key
 * @param {any} data
 */
export function saveCollection(key, data) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing ${key} to storage:`, e);
  }
}

/**
 * Clears all user edits and resets store to initial JSON files.
 */
export function resetStorageToDefaults() {
  try {
    Object.keys(DEFAULT_SEEDS).forEach(key => {
      localStorage.removeItem(`${STORAGE_PREFIX}_${key}`);
    });
    localStorage.clear();
  } catch (e) {
    console.warn('Error clearing storage:', e);
  }
  return DEFAULT_SEEDS;
}

/**
 * Exports entire application data store as a JSON backup string.
 * @returns {string}
 */
export function exportFullBackupJSON() {
  const backup = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    organization: loadCollection('config'),
    '/staffing-data/master': {
      employees: loadCollection('employees'),
      clients: loadCollection('clients'),
      jobs: loadCollection('jobs'),
      placements: loadCollection('placements')
    },
    '/staffing-data/timesheets': loadCollection('timesheets'),
    '/staffing-data/income': loadCollection('income'),
    '/staffing-data/ar': {
      invoices: loadCollection('invoices'),
      payments: loadCollection('arPayments')
    },
    '/staffing-data/ap': {
      bills: loadCollection('apBills'),
      payments: loadCollection('apPayments')
    },
    '/staffing-data/ledger': loadCollection('transactions'),
    '/staffing-data/audit': loadCollection('auditLogs'),
    '/staffing-data/imports': loadCollection('importBatches')
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Imports full JSON backup into data store.
 * @param {string} jsonStr
 * @returns {boolean}
 */
export function importFullBackupJSON(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (data['/staffing-data/master']) {
      if (data['/staffing-data/master'].employees) saveCollection('employees', data['/staffing-data/master'].employees);
      if (data['/staffing-data/master'].clients) saveCollection('clients', data['/staffing-data/master'].clients);
      if (data['/staffing-data/master'].jobs) saveCollection('jobs', data['/staffing-data/master'].jobs);
      if (data['/staffing-data/master'].placements) saveCollection('placements', data['/staffing-data/master'].placements);
    }
    if (data['/staffing-data/timesheets']) saveCollection('timesheets', data['/staffing-data/timesheets']);
    if (data['/staffing-data/income']) saveCollection('income', data['/staffing-data/income']);
    if (data['/staffing-data/ar']) {
      if (data['/staffing-data/ar'].invoices) saveCollection('invoices', data['/staffing-data/ar'].invoices);
      if (data['/staffing-data/ar'].payments) saveCollection('arPayments', data['/staffing-data/ar'].payments);
    }
    if (data['/staffing-data/ap']) {
      if (data['/staffing-data/ap'].bills) saveCollection('apBills', data['/staffing-data/ap'].bills);
      if (data['/staffing-data/ap'].payments) saveCollection('apPayments', data['/staffing-data/ap'].payments);
    }
    if (data['/staffing-data/ledger']) saveCollection('transactions', data['/staffing-data/ledger']);
    if (data['/staffing-data/audit']) saveCollection('auditLogs', data['/staffing-data/audit']);
    if (data['/staffing-data/imports']) saveCollection('importBatches', data['/staffing-data/imports']);
    if (data.organization) saveCollection('config', data.organization);
    return true;
  } catch (e) {
    console.error('Failed to import JSON backup:', e);
    return false;
  }
}

/**
 * Simulated async delay helper
 * @param {number} [ms=50]
 * @returns {Promise<void>}
 */
export const delay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));
