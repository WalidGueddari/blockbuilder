// services/slices/adminSlice.ts
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import {
  ActivateUserPayload,
  CreateUserPayload,
  DeactivateUserPayload,
  FetchUsersParams,
  GetAllUsersResponse,
  User,
} from '../../types/v1/admin';
import { RootState } from '../store';

interface AdminState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  users: User[];
  total: number;
  page: number;
  limit: number;
}

const initialState: AdminState = {
  loading: false,
  error: null,
  successMessage: null,
  users: [],
  total: 0,
  page: 1,
  limit: 5,
};

/* ──────────────────────────── ASYNC THUNKS ──────────────────────────── */

// create user
export const createUsers = createAsyncThunk<
  { message: string; code: string },
  CreateUserPayload,
  { rejectValue: string }
>('admin/create-users', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/create-user`,
      payload,
    );
    return data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
    return rejectWithValue(msg);
  }
});

// activate user
export const activateUser = createAsyncThunk(
  'admin/activate-user',
  async ({ userId, code }: ActivateUserPayload, { rejectWithValue }) => {
    try {
      // annotate axios so TS knows exactly what data shape to expect
      const response = await axios.post<{
        message: string;
        code: string;
        data: User;
      }>(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/activate-user/${userId}`, { code });
      console.log('activate user response', response.data);
      return response.data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err.message ?? 'Could not activate user. Please try again.';
      return rejectWithValue(msg);
    }
  },
);

// deactivate user
export const deactivateUser = createAsyncThunk<
  { message: string; code: string; data: User },
  DeactivateUserPayload,
  { rejectValue: string }
>('admin/deactivate-user', async ({ userId }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/deactivate-user/${userId}`,
    );
    return data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'Could not deactivate user. Please try again.';
    return rejectWithValue(msg);
  }
});

// fetch the paginated list of users
export const fetchAllUsers = createAsyncThunk<
  GetAllUsersResponse,
  FetchUsersParams,
  { rejectValue: string }
>('admin/get-all-users', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/get-all-users`, {
      params,
    });
    return data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.message || err?.message || 'Could not fetch users. Please try again.';
    return rejectWithValue(msg);
  }
});

/* ────────────────────────────── SLICE ─────────────────────────────── */

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminState: (state) => {
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // createUsers
    builder
      .addCase(createUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        createUsers.fulfilled,
        (state, action: PayloadAction<{ message: string; code: string }>) => {
          state.loading = false;
          state.successMessage = action.payload.message;
        },
      )
      .addCase(createUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Registration failed. Please try again.';
      });

    // activateUser
    builder
      .addCase(activateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        activateUser.fulfilled,
        (state, action: PayloadAction<{ message: string; code: string; data: User }>) => {
          state.loading = false;
          state.successMessage = action.payload.message;
          const idx = state.users.findIndex((u) => u.id === action.payload.data.id);
          if (idx !== -1) {
            state.users[idx] = action.payload.data;
          } else {
            state.users.unshift(action.payload.data);
          }
        },
      )
      .addCase(activateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Could not activate user. Please try again.';
      });

    // deactivateUser
    builder
      .addCase(deactivateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        deactivateUser.fulfilled,
        (state, action: PayloadAction<{ message: string; code: string; data: User }>) => {
          state.loading = false;
          state.successMessage = action.payload.message;
          const idx = state.users.findIndex((u) => u.id === action.payload.data.id);
          if (idx !== -1) {
            state.users[idx] = action.payload.data;
          }
        },
      )
      .addCase(deactivateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Could not deactivate user. Please try again.';
      });

    // fetchAllUsers
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<GetAllUsersResponse>) => {
        state.loading = false;
        state.users = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Could not fetch users. Please try again.';
      });
  },
});

/* ────────────────────────── SELECTORS & EXPORTS ───────────────────────── */

export const { clearAdminState } = adminSlice.actions;

export const selectAdminState = (state: RootState) => state.admin;
export const selectAdminLoading = (state: RootState) => state.admin.loading;
export const selectAdminError = (state: RootState) => state.admin.error;
export const selectAdminSuccessMessage = (state: RootState) => state.admin.successMessage;
export const selectAdminUsers = (state: RootState) => state.admin.users;
export const selectAdminTotal = (state: RootState) => state.admin.total;
export const selectAdminPage = (state: RootState) => state.admin.page;
export const selectAdminLimit = (state: RootState) => state.admin.limit;

export default adminSlice.reducer;
