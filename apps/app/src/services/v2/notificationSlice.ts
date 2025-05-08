// notificationsSlice.ts
import api from '@/lib/api';
import { Pagination } from '@/types/v1/network';
import type { JobNotification } from '@/types/v2/job';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  read?: boolean;
  time?: string;
}

interface NotificationResponse {
  success: boolean;
  data: JobNotification[];
  pagination: Pagination;
}

interface NotificationsState {
  items: JobNotification[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  loading: false,
  error: null,
  items: [],
  pagination: null,
};

export const fetchJobsByUserId = createAsyncThunk<
  NotificationResponse,
  { userId: string; page: number; limit: number },
  { rejectValue: string }
>('jobs/fetchJobsByUserId', async ({ userId, page, limit }, { rejectWithValue }) => {
  try {
    const response = await api.get<NotificationResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL_V4}/blockchain/jobs/${userId}`,
      {
        params: {
          page,
          limit,
        },
      },
    );
    if (response.data.success) {
      return response.data;
    } else {
      return rejectWithValue('No jobs found for the specified user.');
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.error) {
      return rejectWithValue(error.response.data.error);
    }
    return rejectWithValue('Failed to fetch jobs.');
  }
});

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<JobNotification>) => {
      state.items.push(action.payload);
    },
    updateNotification: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<JobNotification> }>,
    ) => {
      const { id, changes } = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...changes };
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchJobsByUserId.fulfilled,
        (state, action: PayloadAction<NotificationResponse>) => {
          state.items = action.payload.data;
          state.pagination = action.payload.pagination;
          state.loading = false;
        },
      )
      .addCase(fetchJobsByUserId.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch jobs.';
        state.loading = false;
      });
  },
});

export const { addNotification, updateNotification, removeNotification } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
