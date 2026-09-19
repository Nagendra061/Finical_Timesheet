/**
 * configSlice
 *
 * Redux Toolkit slice managing organization settings, currency, and entity numbering sequences.
 */

import { createSlice } from '@reduxjs/toolkit';
import { loadCollection } from '../../services/apiClient';

const initialState = {
  data: loadCollection('config') || {
    id: 'ORG-001',
    name: 'Apex Staffing Solutions LLC',
    currency: 'USD',
    timezone: 'America/Chicago',
    fiscalYearStart: 'January',
    numbering: {
      employeePrefix: 'EMP',
      clientPrefix: 'CLI',
      jobPrefix: 'JOB',
      placementPrefix: 'PLC',
      timesheetPrefix: 'TS',
      incomePrefix: 'INC',
      invoicePrefix: 'INV',
      paymentPrefix: 'PAY',
      billPrefix: 'BIL',
      nextNumbers: {
        EMP: 132,
        CLI: 125,
        JOB: 52,
        PLC: 130,
        TS: 110,
        INC: 108,
        INV: 106,
        PAY: 105,
        BIL: 108
      }
    }
  },
  status: 'idle',
  error: null
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfig: (state, action) => {
      state.data = action.payload;
    },
    updateConfig: (state, action) => {
      state.data = {
        ...state.data,
        ...action.payload,
        numbering: {
          ...state.data.numbering,
          ...(action.payload.numbering || {})
        }
      };
    },
    incrementNextNumber: (state, action) => {
      const key = action.payload;
      if (state.data.numbering && state.data.numbering.nextNumbers) {
        state.data.numbering.nextNumbers[key] =
          (state.data.numbering.nextNumbers[key] || 100) + 1;
      }
    }
  }
});

export const { setConfig, updateConfig, incrementNextNumber } = configSlice.actions;

export const selectConfig = (state) => state.config.data;

export default configSlice.reducer;
