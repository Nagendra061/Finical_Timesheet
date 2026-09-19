/**
 * timesheetsSlice
 *
 * Redux Toolkit slice managing timesheets, daily entries, submissions, and approvals.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { timesheetService } from '../../services/timesheetService';
import { loadCollection } from '../../services/apiClient';

export const fetchTimesheets = createAsyncThunk('timesheets/fetchTimesheets', async () => {
  return await timesheetService.getAll();
});

const initialState = {
  items: loadCollection('timesheets') || [],
  status: 'idle',
  error: null
};

const timesheetsSlice = createSlice({
  name: 'timesheets',
  initialState,
  reducers: {
    setTimesheets: (state, action) => {
      state.items = action.payload;
    },
    addTimesheet: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateTimesheet: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(t => t.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    deleteTimesheet: (state, action) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimesheets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTimesheets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTimesheets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setTimesheets, addTimesheet, updateTimesheet, deleteTimesheet } = timesheetsSlice.actions;

export const selectAllTimesheets = (state) => state.timesheets.items;

export default timesheetsSlice.reducer;
