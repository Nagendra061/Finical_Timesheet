/**
 * auditLogsSlice
 *
 * Redux Toolkit slice managing operational and compliance audit trail logs.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auditService } from '../../services/auditService';
import { loadCollection } from '../../services/apiClient';

export const fetchAuditLogs = createAsyncThunk('auditLogs/fetchAuditLogs', async () => {
  return await auditService.getAll();
});

const initialState = {
  logs: loadCollection('auditLogs') || [],
  status: 'idle',
  error: null
};

const auditLogsSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {
    setAuditLogs: (state, action) => {
      state.logs = action.payload;
    },
    addAuditLog: (state, action) => {
      state.logs.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.logs = action.payload;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setAuditLogs, addAuditLog } = auditLogsSlice.actions;

export const selectAllAuditLogs = (state) => state.auditLogs.logs;

export default auditLogsSlice.reducer;
