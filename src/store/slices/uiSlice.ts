import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

export interface UIState {
  isLoading: boolean;
  loadingCount: number;
  toast: ToastState;
}

const initialState: UIState = {
  isLoading: false,
  loadingCount: 0,
  toast: {
    message: '',
    type: 'success',
    visible: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    startLoading(state) {
      state.loadingCount += 1;
      state.isLoading = true;
    },
    stopLoading(state) {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
      if (state.loadingCount === 0) {
        state.isLoading = false;
      }
    },
    showToast(state, action: PayloadAction<{ message: string; type?: 'success' | 'error' | 'info' | 'warning' }>) {
      state.toast.message = action.payload.message;
      state.toast.type = action.payload.type || 'success';
      state.toast.visible = true;
    },
    hideToast(state) {
      state.toast.visible = false;
      state.toast.message = '';
    },
  },
});

export const { startLoading, stopLoading, showToast, hideToast } = uiSlice.actions;

/**
 * Show a toast that auto-hides after 3 seconds.
 */
export const showToastWithAutoHide = ({ message, type }: { message: string; type?: 'success' | 'error' | 'info' | 'warning' }) => (dispatch: any) => {
  dispatch(showToast({ message, type }));
  setTimeout(() => {
    dispatch(hideToast());
  }, 3000);
};

export default uiSlice.reducer;
