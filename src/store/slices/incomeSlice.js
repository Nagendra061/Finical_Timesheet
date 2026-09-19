/**
 * incomeSlice
 *
 * Redux Toolkit slice managing accrued income records from approved timesheets.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { incomeService } from '../../services/incomeService';
import { loadCollection } from '../../services/apiClient';

export const fetchIncome = createAsyncThunk('income/fetchIncome', async () => {
  return await incomeService.getAll();
});

const initialState = {
  items: loadCollection('income') || [],
  status: 'idle',
  error: null
};

const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    setIncomes: (state, action) => {
      state.items = action.payload;
    },
    addIncome: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateIncome: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(i => i.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    markIncomesBilled: (state, action) => {
      const { ids, invoiceId } = action.payload;
      const idSet = new Set(ids);
      const now = new Date().toISOString();
      state.items.forEach(i => {
        if (idSet.has(i.id)) {
          i.status = 'Billed';
          i.invoiceId = invoiceId;
          i.updatedAt = now;
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncome.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchIncome.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchIncome.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setIncomes, addIncome, updateIncome, markIncomesBilled } = incomeSlice.actions;

export const selectAllIncomes = (state) => state.income.items;

export default incomeSlice.reducer;
