import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import {
  BlockchainState,
  SetupNetworkParams,
  SetupNetworkResponse,
} from '../../types/v2/blockchain';
import type { RootState } from '../store';

// 1. Initial State
const initialState: BlockchainState = {
  loading: false,
  error: null,
  setupNetworkResult: null,
  startNetworkResult: null,
};

// 2. Thunk for /setup-network
export const startNetwork = createAsyncThunk<
  SetupNetworkResponse, // The response type
  SetupNetworkParams // The request body type
>('blockchain/setupNetwork', async ({ initNetPayload }, { rejectWithValue }) => {
  try {
    // POST to /setup-network
    const res = await axios.post<SetupNetworkResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL_V4}/blockchain/job/start`,
      {
        initNetPayload,
      },
    );
    return res.data; // typed as SetupNetworkResponse
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// 4. The Slice
export const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState,
  reducers: {}, // no normal reducers for now
  extraReducers: (builder) => {
    // setupNetwork
    builder
      .addCase(startNetwork.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.setupNetworkResult = null;
      })
      .addCase(startNetwork.fulfilled, (state, action) => {
        state.loading = false;
        state.setupNetworkResult = action.payload; // SetupNetworkResponse
      })
      .addCase(startNetwork.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string' ? action.payload : 'Network initialization failed.';
      });
  },
});

export default blockchainSlice.reducer;

// 5. Selectors
export const selectBlockchainLoading = (state: RootState) => state.blockchain.loading;
export const selectBlockchainError = (state: RootState) => state.blockchain.error;
export const selectSetupNetworkResult = (state: RootState) => state.blockchain.setupNetworkResult;
export const selectStartNetworkResult = (state: RootState) => state.blockchain.startNetworkResult;
