/**
 * invoicesSlice
 *
 * Redux Toolkit slice managing client invoices and line items.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoiceService } from '../../services/invoiceService';
import { loadCollection } from '../../services/apiClient';

export const fetchInvoices = createAsyncThunk('invoices/fetchInvoices', async () => {
  return await invoiceService.getAll();
});

const initialState = {
  items: loadCollection('invoices') || [],
  status: 'idle',
  error: null
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setInvoices: (state, action) => {
      state.items = action.payload;
    },
    addInvoice: (state, action) => {
      state.items.unshift(action.payload);
    },
    addInvoices: (state, action) => {
      state.items.unshift(...action.payload);
    },
    updateInvoice: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(i => i.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setInvoices, addInvoice, addInvoices, updateInvoice } = invoicesSlice.actions;

export const selectAllInvoices = (state) => state.invoices.items;

export default invoicesSlice.reducer;
