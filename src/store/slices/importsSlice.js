/**
 * importsSlice
 *
 * Redux Toolkit slice managing CSV import batch history and error reports.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { importService } from '../../services/importService';
import { loadCollection } from '../../services/apiClient';

export const fetchImportBatches = createAsyncThunk('imports/fetchImportBatches', async () => {
  return await importService.getAllBatches();
});

const initialState = {
  batches: loadCollection('importBatches') || [],
  status: 'idle',
  error: null
};

const importsSlice = createSlice({
  name: 'imports',
  initialState,
  reducers: {
    setImportBatches: (state, action) => {
      state.batches = action.payload;
    },
    addImportBatch: (state, action) => {
      state.batches.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImportBatches.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchImportBatches.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.batches = action.payload;
      })
      .addCase(fetchImportBatches.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setImportBatches, addImportBatch } = importsSlice.actions;

export const selectAllImportBatches = (state) => state.imports.batches;

export default importsSlice.reducer;
