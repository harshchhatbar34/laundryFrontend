import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  tenantId?: string;
  [key: string]: any;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

export const loadUser = createAsyncThunk<
  { token: string | null; user: User | null; cart: any[] | null },
  void,
  { rejectValue: string }
>('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const [token, userJson, cartJson] = await Promise.all([
      AsyncStorage.getItem('@token'),
      AsyncStorage.getItem('@user'),
      AsyncStorage.getItem('@cart'),
    ]);

    let cart = null;
    if (cartJson) {
      try {
        cart = JSON.parse(cartJson);
      } catch (e) {
        if (__DEV__) {
          console.warn('Failed to parse saved cart JSON:', e);
        }
      }
    }

    if (token && userJson) {
      const user = JSON.parse(userJson);
      return { token, user, cart };
    }
    return { token: null, user: null, cart: null };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const login = createAsyncThunk<
  { token: string; user: User },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { login: loginApi } = await import('../../api/auth');
    const data = await loginApi(email, password);

    if (!data?.success || !data?.data) {
      return rejectWithValue(data?.message || 'Login failed');
    }

    const { token, user } = data.data;
    await Promise.all([
      AsyncStorage.setItem('@token', token),
      AsyncStorage.setItem('@user', JSON.stringify(user)),
    ]);
    return { token, user };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
  }
});

export const register = createAsyncThunk<
  { token: string; user: User },
  { name: string; email: string; password: string; tenantCode: string; mobileNumber?: string },
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { register: registerApi } = await import('../../api/auth');
    const data = await registerApi(
      payload.name,
      payload.email,
      payload.password,
      payload.tenantCode,
      payload.mobileNumber
    );

    if (!data?.success || !data?.data) {
      return rejectWithValue(data?.message || 'Registration failed');
    }

    const { token, user } = data.data;
    await Promise.all([
      AsyncStorage.setItem('@token', token),
      AsyncStorage.setItem('@user', JSON.stringify(user)),
    ]);
    return { token, user };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.multiRemove(['@token', '@user', '@cart']);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    updateUser(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        AsyncStorage.setItem('@user', JSON.stringify(state.user)).catch(e => {
          if (__DEV__) console.warn('Failed to save updated user to AsyncStorage:', e);
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        const { token, user } = action.payload;
        if (token && user) {
          state.token = token;
          state.user = user;
          state.isLoggedIn = true;
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load user';
      });

    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isLoggedIn = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to login';
      });

    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isLoggedIn = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to register';
      });

    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.isLoggedIn = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to logout';
      });
  },
});

export const { clearAuthError, updateUser } = authSlice.actions;
export default authSlice.reducer;
