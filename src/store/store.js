/**
 * store.js
 *
 * Central Redux Toolkit store configuring all domain slices.
 */

import { configureStore } from '@reduxjs/toolkit';
import employeesReducer from './slices/employeesSlice';
import clientsReducer from './slices/clientsSlice';
import jobsReducer from './slices/jobsSlice';
import placementsReducer from './slices/placementsSlice';
import timesheetsReducer from './slices/timesheetsSlice';
import incomeReducer from './slices/incomeSlice';
import invoicesReducer from './slices/invoicesSlice';
import arReducer from './slices/arSlice';
import apReducer from './slices/apSlice';
import ledgerReducer from './slices/ledgerSlice';
import auditLogsReducer from './slices/auditLogsSlice';
import importsReducer from './slices/importsSlice';
import configReducer from './slices/configSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    employees: employeesReducer,
    clients: clientsReducer,
    jobs: jobsReducer,
    placements: placementsReducer,
    timesheets: timesheetsReducer,
    income: incomeReducer,
    invoices: invoicesReducer,
    ar: arReducer,
    ap: apReducer,
    ledger: ledgerReducer,
    auditLogs: auditLogsReducer,
    imports: importsReducer,
    config: configReducer,
    ui: uiReducer
  }
});

export default store;
