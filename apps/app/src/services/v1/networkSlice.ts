// networkSlice.ts
import api from '@/lib/api';
import { InitNetwork, NetworksResponse, Pagination } from '@/types/v1/network';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { RootState } from '../store';

interface NetworkState {
  loading: boolean;
  error: string | null;
  networks: InitNetwork[];
  pagination: Pagination | null;
}

const initialState: NetworkState = {
  loading: false,
  error: null,
  networks: [],
  pagination: null,
};

// Async Thunk to fetch networks by user ID with pagination
export const fetchNetworksByUserId = createAsyncThunk<
  NetworksResponse,
  { userId: string; page: number; limit: number },
  { rejectValue: string }
>('network/fetchNetworksByUserId', async ({ userId, page, limit }, { rejectWithValue }) => {
  try {
    const response = await api.get<NetworksResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/network/${userId}`,
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
      return rejectWithValue('No networks found for the specified user.');
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.error) {
      return rejectWithValue(error.response.data.error);
    }
    return rejectWithValue('Failed to fetch networks.');
  }
});

// Network Slice
const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    clearNetworkError: (state) => {
      state.error = null;
    },
    clearNetworks: (state) => {
      state.networks = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNetworksByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchNetworksByUserId.fulfilled,
        (state, action: PayloadAction<NetworksResponse>) => {
          state.networks = action.payload.data;
          state.pagination = action.payload.pagination;
          state.loading = false;
        },
      )
      .addCase(fetchNetworksByUserId.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch networks.';
        state.loading = false;
      });
  },
});

export const { clearNetworkError, clearNetworks } = networkSlice.actions;

// Selectors
export const selectNetworks = (state: RootState & { network: NetworkState }): InitNetwork[] =>
  state.network.networks;

export const selectNetworkPagination = (state: RootState): Pagination | null =>
  state.network.pagination;

export const selectNetworkLoading = (state: RootState) => state.network.loading;

export const selectNetworkError = (state: RootState) => state.network.error;

export default networkSlice.reducer;
