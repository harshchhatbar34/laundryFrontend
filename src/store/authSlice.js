import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

/* ─── Thunks ──────────────────────────────────── */

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    if (data.data.token) {
      await AsyncStorage.setItem('@token', data.data.token);
    }
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    if (data.data.token) {
      await AsyncStorage.setItem('@token', data.data.token);
    }
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
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
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(register.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoggedIn = true;
    });
    builder.addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Login
    builder.addCase(login.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoggedIn = true;
    });
    builder.addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

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
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
