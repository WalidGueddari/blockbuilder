// nodeSlice.ts
import api from '@/lib/api';
import { InitNetwork, InitNetworkPayload } from '@/types/v1/network';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { RootState } from '../store';

interface NodeState {
  nodes: any;
  loading: boolean;
  error: string | null;
  networks: InitNetwork[];
}

const initialState: NodeState = {
  loading: false,
  error: null,
  networks: [],
  nodes: [],
};

// Async Thunks
export const createNetwork = createAsyncThunk<
  InitNetwork, // Return type of the payload creator
  InitNetworkPayload, // First argument to the payload creator
  { rejectValue: string } // Types for rejectWithValue
>('node/createNetwork', async (payload: InitNetworkPayload, { rejectWithValue }) => {
  try {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/containers/build-network`,
      {
        initNetPayload: payload,
        payload: {
          resourceGroup: payload.name, // same value as name
          userId: payload.userId, // same userId in both objects
          vmName: payload.name, // same value as name
          sshKeyName: payload.name, // same value as name
        },
      }, // Wrapping payload inside initNetPayload
    );
    console.log(response.data.Outputs.Network);
    return response.data.Outputs.Network; // Adjust based on your API response
  } catch (error: any) {
    // Check if the error response exists and has a message
    if (error.response && error.response.data && error.response.data.message) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue('Failed to create network');
  }
});

// Node Slice
const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    clearNodeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Network
      .addCase(createNetwork.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNetwork.fulfilled, (state, action: PayloadAction<InitNetwork>) => {
        state.networks.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createNetwork.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create network';
      });
  },
});

// Actions
export const { clearNodeError } = nodeSlice.actions;

// Selectors
export const selectNetworks = (state: RootState) => state.node.networks;
export const selectNodeLoading = (state: RootState) => state.node.loading;
export const selectNodeError = (state: RootState) => state.node.error;

export default nodeSlice.reducer;
