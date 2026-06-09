import { createSlice } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const systemTheme = Appearance.getColorScheme() || 'light';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: systemTheme,       // 'light' | 'dark'
    systemMode: systemTheme, // tracks OS preference
    isManual: false,         // true = user manually set theme
  },
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;
      state.isManual = true;
      // Persist to AsyncStorage (side-effect handled outside reducer)
    },
    setSystemTheme: (state, action) => {
      state.systemMode = action.payload;
      // Only auto-change if user hasn't manually set theme
      if (!state.isManual) {
        state.mode = action.payload;
      }
    },
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      state.isManual = true;
    },
    resetToSystem: (state) => {
      state.mode = state.systemMode;
      state.isManual = false;
    },
  },
});

export const { setTheme, setSystemTheme, toggleTheme, resetToSystem } = themeSlice.actions;

/**
 * Thunk: Load saved theme from AsyncStorage on app start
 */
export const loadSavedTheme = () => async (dispatch) => {
  try {
    const saved = await AsyncStorage.getItem('@theme');
    if (saved) {
      dispatch(setTheme(saved));
    }
  } catch (_) {}
};

/**
 * Thunk: Persist theme to AsyncStorage when user changes it
 */
export const persistTheme = (mode) => async (dispatch) => {
  dispatch(setTheme(mode));
  try {
    await AsyncStorage.setItem('@theme', mode);
  } catch (_) {}
};

export default themeSlice.reducer;
