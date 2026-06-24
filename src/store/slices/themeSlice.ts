import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface ThemeState {
  preference: ThemePreference;
}

const initialState: ThemeState = {
  preference: 'system',
};

// Thunk: Load saved theme preference from AsyncStorage
export const loadSavedTheme = createAsyncThunk<
  ThemePreference,
  void,
  { rejectValue: string }
>('theme/loadSavedTheme', async (_, { rejectWithValue }) => {
  try {
    const preference = await AsyncStorage.getItem('@theme');
    return (preference as ThemePreference) || 'system';
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Thunk: Set theme preference and persist to AsyncStorage
export const setTheme = createAsyncThunk<
  ThemePreference,
  ThemePreference,
  { rejectValue: string }
>('theme/setTheme', async (preference, { rejectWithValue }) => {
  try {
    await AsyncStorage.setItem('@theme', preference);
    return preference;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadSavedTheme.fulfilled, (state, action) => {
        state.preference = action.payload;
      })
      .addCase(setTheme.fulfilled, (state, action) => {
        state.preference = action.payload;
      });
  },
});

export default themeSlice.reducer;
