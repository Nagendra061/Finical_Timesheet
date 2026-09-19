/**
 * placementsSlice
 *
 * Redux Toolkit slice managing worker placement assignments.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { placementService } from '../../services/placementService';
import { loadCollection } from '../../services/apiClient';

export const fetchPlacements = createAsyncThunk('placements/fetchPlacements', async () => {
  return await placementService.getAll();
});

const initialState = {
  items: loadCollection('placements') || [],
  status: 'idle',
  error: null
};

const placementsSlice = createSlice({
  name: 'placements',
  initialState,
  reducers: {
    setPlacements: (state, action) => {
      state.items = action.payload;
    },
    addPlacement: (state, action) => {
      state.items.unshift(action.payload);
    },
    updatePlacement: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(p => p.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    deletePlacement: (state, action) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlacements.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlacements.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPlacements.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setPlacements, addPlacement, updatePlacement, deletePlacement } = placementsSlice.actions;

export const selectAllPlacements = (state) => state.placements.items;

export default placementsSlice.reducer;
