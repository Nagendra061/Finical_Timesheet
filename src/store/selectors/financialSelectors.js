/**
 * financialSelectors.js
 *
 * Centralized business logic selectors and calculations.
 * Derives financial metrics, gross margin, aging analysis, and operational totals from Redux state.
 */

import { createSelector } from '@reduxjs/toolkit';
import {
  calculateStaffingMargin,
  getARAgingCategory,
  getAPAgingCategory
} from '../../utils/formatters';

export const selectEmployeesState = (state) => state.employees.items;
export const selectClientsState = (state) => state.clients.items;
export const selectJobsState = (state) => state.jobs.items;
export const selectPlacementsState = (state) => state.placements.items;
export const selectTimesheetsState = (state) => state.timesheets.items;
export const selectIncomesState = (state) => state.income.items;
export const selectInvoicesState = (state) => state.invoices.items;
export const selectArPaymentsState = (state) => state.ar.payments;
export const selectApBillsState = (state) => state.ap.bills;
export const selectApPaymentsState = (state) => state.ap.payments;
export const selectLedgerState = (state) => state.ledger.entries;
export const selectAuditLogsState = (state) => state.auditLogs.logs;
export const selectImportBatchesState = (state) => state.imports.batches;
export const selectConfigState = (state) => state.config.data;

/**
 * Calculates high-level dashboard KPIs
 */
export const selectDashboardKPIs = createSelector(
  [
    selectEmployeesState,
    selectClientsState,
    selectPlacementsState,
    selectTimesheetsState,
    selectIncomesState,
    selectApBillsState,
    selectInvoicesState
  ],
  (employees, clients, placements, timesheets, incomes, apBills, invoices) => {
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const activeClients = clients.filter(c => c.status === 'Active').length;
    const activePlacements = placements.filter(p => p.status === 'Active').length;

    const totalHours = timesheets.reduce((acc, t) => acc + (t.totalHours || 0), 0);
    const billableHours = timesheets
      .filter(t => t.status === 'Approved' || t.status === 'Submitted')
      .reduce((acc, t) => acc + ((t.regularHours || 0) + (t.overtimeHours || 0)), 0);

    const totalRevenue = incomes.reduce((acc, inc) => acc + (inc.totalIncome || 0), 0);
    const totalPayrollCost = apBills.reduce((acc, b) => acc + (b.totalPayable || 0), 0);

    const { grossMargin, grossMarginPercent } = calculateStaffingMargin(totalRevenue, totalPayrollCost);

    // Total AR balance
    const totalAR = invoices.reduce((acc, inv) => acc + (inv.balance > 0 ? inv.balance : 0), 0);
    // Total AP balance
    const totalAP = apBills.reduce((acc, bill) => acc + (bill.balance > 0 ? bill.balance : 0), 0);

    return {
      activeEmployees,
      activeClients,
      activePlacements,
      totalHours,
      billableHours,
      totalRevenue,
      totalPayrollCost,
      grossMargin,
      grossMarginPercent,
      totalAR,
      totalAP
    };
  }
);

/**
 * Calculates AR aging breakdown
 */
export const selectARAgingBreakdown = createSelector(
  [selectInvoicesState],
  (invoices) => {
    const breakdown = {
      Current: { count: 0, total: 0 },
      '1-30 Days': { count: 0, total: 0 },
      '31-60 Days': { count: 0, total: 0 },
      '61-90 Days': { count: 0, total: 0 },
      '90+ Days': { count: 0, total: 0 }
    };
    let totalAR = 0;

    invoices.forEach(inv => {
      if (inv.balance > 0) {
        totalAR += inv.balance;
        const category = getARAgingCategory(inv.dueDate);
        if (breakdown[category]) {
          breakdown[category].count += 1;
          breakdown[category].total += inv.balance;
        }
      }
    });

    return { breakdown, totalAR };
  }
);

/**
 * Calculates AP aging breakdown
 */
export const selectAPAgingBreakdown = createSelector(
  [selectApBillsState],
  (apBills) => {
    const breakdown = {
      Current: { count: 0, total: 0 },
      'Due This Week': { count: 0, total: 0 },
      'Due Next Week': { count: 0, total: 0 },
      Overdue: { count: 0, total: 0 }
    };
    let totalAP = 0;

    apBills.forEach(bill => {
      if (bill.balance > 0) {
        totalAP += bill.balance;
        const category = getAPAgingCategory(bill.dueDate);
        if (breakdown[category]) {
          breakdown[category].count += 1;
          breakdown[category].total += bill.balance;
        }
      }
    });

    return { breakdown, totalAP };
  }
);

/**
 * Calculates client revenue rankings
 */
export const selectRevenueByClient = createSelector(
  [selectIncomesState, selectClientsState],
  (incomes, clients) => {
    const map = {};
    incomes.forEach(inc => {
      const client = clients.find(c => c.id === inc.clientId);
      const name = client?.name || inc.clientId;
      map[name] = (map[name] || 0) + (inc.totalIncome || 0);
    });

    return Object.entries(map)
      .map(([clientName, revenue]) => ({ clientName, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }
);
