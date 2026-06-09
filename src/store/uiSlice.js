import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loadingCount: 0,
  toast: null, // { message: string, type: 'success' | 'error' }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loadingCount += 1;
    },
    stopLoading: (state) => {
      if (state.loadingCount > 0) {
        state.loadingCount -= 1;
      }
    },
    showToast: (state, action) => {
      state.toast = action.payload;
    },
    hideToast: (state) => {
      state.toast = null;
    },
  },
});

export const { startLoading, stopLoading, showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
