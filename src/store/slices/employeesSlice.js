/**
 * employeesSlice
 *
 * Redux Toolkit slice managing employee and contractor state.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeService } from '../../services/employeeService';
import { loadCollection } from '../../services/apiClient';

export const fetchEmployees = createAsyncThunk('employees/fetchEmployees', async () => {
  return await employeeService.getAll();
});

const initialState = {
  items: loadCollection('employees') || [],
  status: 'idle',
  error: null
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployees: (state, action) => {
      state.items = action.payload;
    },
    addEmployee: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateEmployee: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(e => e.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    deleteEmployee: (state, action) => {
      state.items = state.items.filter(e => e.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setEmployees, addEmployee, updateEmployee, deleteEmployee } = employeesSlice.actions;

export const selectAllEmployees = (state) => state.employees.items;
export const selectEmployeeById = (id) => (state) => state.employees.items.find(e => e.id === id);

export default employeesSlice.reducer;
