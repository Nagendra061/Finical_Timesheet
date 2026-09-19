/**
 * apSlice
 *
 * Redux Toolkit slice managing Accounts Payable bills and worker disbursement payments.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apService } from '../../services/apService';
import { loadCollection } from '../../services/apiClient';

export const fetchApData = createAsyncThunk('ap/fetchApData', async () => {
  const [bills, payments] = await Promise.all([apService.getBills(), apService.getPayments()]);
  return { bills, payments };
});

const initialState = {
  bills: loadCollection('apBills') || [],
  payments: loadCollection('apPayments') || [],
  status: 'idle',
  error: null
};

const apSlice = createSlice({
  name: 'ap',
  initialState,
  reducers: {
    setApBills: (state, action) => {
      state.bills = action.payload;
    },
    addApBill: (state, action) => {
      state.bills.unshift(action.payload);
    },
    updateApBill: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.bills.findIndex(b => b.id === id);
      if (index !== -1) {
        state.bills[index] = { ...state.bills[index], ...updates };
      }
    },
    setApPayments: (state, action) => {
      state.payments = action.payload;
    },
    addApPayment: (state, action) => {
      state.payments.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchApData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bills = action.payload.bills;
        state.payments = action.payload.payments;
      })
      .addCase(fetchApData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setApBills, addApBill, updateApBill, setApPayments, addApPayment } = apSlice.actions;

export const selectAllApBills = (state) => state.ap.bills;
export const selectAllApPayments = (state) => state.ap.payments;

export default apSlice.reducer;
