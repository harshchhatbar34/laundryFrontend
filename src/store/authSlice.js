import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

/* ─── Thunks ──────────────────────────────────── */

export const sendOtp = createAsyncThunk('auth/sendOtp', async (mobileNumber, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/send-otp', { mobileNumber });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send OTP');
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async ({ mobileNumber, otp }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/verify-otp', { mobileNumber, otp });
    if (data.data.token) {
      await AsyncStorage.setItem('@token', data.data.token);
    }
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
  }
});

export const completeProfile = createAsyncThunk('auth/completeProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/complete-profile', profileData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Profile update failed');
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('@token');
    if (!token) return rejectWithValue('No token');
    const { data } = await api.get('/users/me');
    return { user: data.data.user, token };
  } catch (err) {
    await AsyncStorage.removeItem('@token');
    return rejectWithValue('Session expired');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('@token');
});

/* ─── Slice ───────────────────────────────────── */

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoggedIn: false,
    isNewUser: false,
    loading: false,
    error: null,
    otpSent: false,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearOtpState: (state) => { state.otpSent = false; },
  },
  extraReducers: (builder) => {
    // Send OTP
    builder.addCase(sendOtp.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(sendOtp.fulfilled, (state) => { state.loading = false; state.otpSent = true; });
    builder.addCase(sendOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Verify OTP
    builder.addCase(verifyOtp.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isNewUser = action.payload.isNewUser;
      state.isLoggedIn = !action.payload.isNewUser;
    });
    builder.addCase(verifyOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Complete profile
    builder.addCase(completeProfile.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.isNewUser = false;
      state.isLoggedIn = true;
    });

    // Load user
    builder.addCase(loadUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
    });
    builder.addCase(loadUser.rejected, (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.user = null;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.otpSent = false;
    });
  },
});

export const { clearError, clearOtpState } = authSlice.actions;
export default authSlice.reducer;
