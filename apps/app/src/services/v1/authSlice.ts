import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSelector } from 'reselect';

import { RootState } from '../store';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface AuthState {
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  user: User | null;
}

const isClient = typeof window !== 'undefined';

const initialState: AuthState = {
  loading: false,
  error: null,
  accessToken: isClient ? sessionStorage.getItem('access_token') : null,
  user:
    isClient && sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')!) : null,
};

// ------------------- ASYNC ACTIONS -------------------

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`, {
      email,
      password,
    });
    return response.data;
  },
);

// ------------------- SLICE -------------------

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.accessToken = null;
      state.user = null;
      if (isClient) {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
      }
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (isClient) {
          sessionStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.accessToken = action.payload.access_token;
        state.user = action.payload.user;
        if (isClient) {
          sessionStorage.setItem('access_token', action.payload.access_token);
          sessionStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to login';
      });
  },
});

// ------------------- EXPORTS -------------------

export const { logout, updateUser } = authSlice.actions;

export const selectAuthState = (state: RootState) => state.auth;

export const selectAuth = createSelector([selectAuthState], (auth) => ({
  ...auth,
  isAuthenticated: !!auth.accessToken,
  userRole: auth.user?.role || null,
  isActive: auth.user?.isActive ?? null,
}));

export default authSlice.reducer;
