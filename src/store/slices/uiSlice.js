/**
 * uiSlice
 *
 * Redux Toolkit slice managing top-level application navigation, mobile drawer, and alerts.
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'dashboard',
  isMobileSidebarOpen: false,
  feedbackMessage: null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setMobileSidebarOpen: (state, action) => {
      state.isMobileSidebarOpen = action.payload;
    },
    setFeedbackMessage: (state, action) => {
      state.feedbackMessage = action.payload;
    }
  }
});

export const { setActiveTab, setMobileSidebarOpen, setFeedbackMessage } = uiSlice.actions;

export const selectActiveTab = (state) => state.ui.activeTab;
export const selectIsMobileSidebarOpen = (state) => state.ui.isMobileSidebarOpen;
export const selectFeedbackMessage = (state) => state.ui.feedbackMessage;

export default uiSlice.reducer;
