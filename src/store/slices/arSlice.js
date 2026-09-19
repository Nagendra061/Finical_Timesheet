/**
 * arSlice
 *
 * Redux Toolkit slice managing Accounts Receivable payments and remittances.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { arService } from '../../services/arService';
import { loadCollection } from '../../services/apiClient';

export const fetchArPayments = createAsyncThunk('ar/fetchArPayments', async () => {
  return await arService.getPayments();
});

const initialState = {
  payments: loadCollection('arPayments') || [],
  status: 'idle',
  error: null
};

const arSlice = createSlice({
  name: 'ar',
  initialState,
  reducers: {
    setArPayments: (state, action) => {
      state.payments = action.payload;
    },
    addArPayment: (state, action) => {
      state.payments.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArPayments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchArPayments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.payments = action.payload;
      })
      .addCase(fetchArPayments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setArPayments, addArPayment } = arSlice.actions;

export const selectAllArPayments = (state) => state.ar.payments;

export default arSlice.reducer;
