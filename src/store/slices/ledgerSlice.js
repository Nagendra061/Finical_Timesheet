/**
 * ledgerSlice
 *
 * Redux Toolkit slice managing double-entry financial transaction ledger entries.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ledgerService } from '../../services/ledgerService';
import { loadCollection } from '../../services/apiClient';

export const fetchLedger = createAsyncThunk('ledger/fetchLedger', async () => {
  return await ledgerService.getAll();
});

const initialState = {
  entries: loadCollection('transactions') || [],
  status: 'idle',
  error: null
};

const ledgerSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {
    setTransactions: (state, action) => {
      state.entries = action.payload;
    },
    addTransactions: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.entries.unshift(...items);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLedger.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLedger.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.entries = action.payload;
      })
      .addCase(fetchLedger.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setTransactions, addTransactions } = ledgerSlice.actions;

export const selectAllLedgerEntries = (state) => state.ledger.entries;

export default ledgerSlice.reducer;
