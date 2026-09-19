/**
 * clientsSlice
 *
 * Redux Toolkit slice managing client organizations, contacts, and terms.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clientService } from '../../services/clientService';
import { loadCollection } from '../../services/apiClient';

export const fetchClients = createAsyncThunk('clients/fetchClients', async () => {
  return await clientService.getAll();
});

const initialState = {
  items: loadCollection('clients') || [],
  status: 'idle',
  error: null
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setClients: (state, action) => {
      state.items = action.payload;
    },
    addClient: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateClient: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(c => c.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    deleteClient: (state, action) => {
      state.items = state.items.filter(c => c.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setClients, addClient, updateClient, deleteClient } = clientsSlice.actions;

export const selectAllClients = (state) => state.clients.items;
export const selectClientById = (id) => (state) => state.clients.items.find(c => c.id === id);

export default clientsSlice.reducer;
