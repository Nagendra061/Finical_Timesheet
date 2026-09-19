/**
 * jobsSlice
 *
 * Redux Toolkit slice managing staffing job requisitions.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobService } from '../../services/jobService';
import { loadCollection } from '../../services/apiClient';

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  return await jobService.getAll();
});

const initialState = {
  items: loadCollection('jobs') || [],
  status: 'idle',
  error: null
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs: (state, action) => {
      state.items = action.payload;
    },
    addJob: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateJob: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(j => j.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    deleteJob: (state, action) => {
      state.items = state.items.filter(j => j.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setJobs, addJob, updateJob, deleteJob } = jobsSlice.actions;

export const selectAllJobs = (state) => state.jobs.items;

export default jobsSlice.reducer;
