import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { RootState } from './store';

// Define the structure of the state
interface Network {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  consensus: 'QBFT' | 'IBFT';
  status: 'active' | 'inactive';
  createdAt: Date;
}

interface NetworkState {
  loading: boolean;
  error: string | null;
  networks: Array<Network>;
  currentNetwork: Network | null;
}

const initialState: NetworkState = {
  loading: false,
  error: null,
  networks: [],
  currentNetwork: null,
};

// Async Thunks for network actions
export const createNetwork = createAsyncThunk(
  'network/createNetwork',
  async (
    networkData: {
      name: string;
      description: string;
      nodeCount: number;
      consensus: string;
      userId: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/network/create-network`,
        networkData,
      );
      return response.data.network;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
export const deleteNetwork = createAsyncThunk(
  'network/deleteNetwork',
  async (networkId: string) => {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/network/${networkId}`);
    return networkId; // Return the deleted network ID
  },
);

export const fetchNetworks = createAsyncThunk('network/fetchNetworks', async (userId: string) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_URL}/network/fetchNetworks/${userId}`,
  );
  return response.data.networks || []; // Ensure we return an array
});

export const selectNetwork = (networkId: string) => {
  return (dispatch: any) => {
    dispatch(setCurrentNetwork(networkId));
  };
};

// Network Slice
const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setCurrentNetwork: (state, action: PayloadAction<string>) => {
      const network = state.networks.find((n) => n.id === action.payload);
      state.currentNetwork = network || null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Networks
      .addCase(fetchNetworks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNetworks.fulfilled, (state, action) => {
        state.networks = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchNetworks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })

      // Create Network
      .addCase(createNetwork.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNetwork.fulfilled, (state, action: PayloadAction<Network>) => {
        state.loading = false;
        state.networks.push(action.payload);
      })
      .addCase(createNetwork.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create network';
      })

      // Delete Network
      .addCase(deleteNetwork.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteNetwork.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.networks = state.networks.filter((network) => network.id !== action.payload);
      })
      .addCase(deleteNetwork.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete network';
      });
  },
});

// Actions
export const { setCurrentNetwork, clearError } = networkSlice.actions;

// Selectors
export const selectNetworks = (state: RootState) => state.network.networks;
export const selectCurrentNetwork = (state: RootState) => state.network.currentNetwork;
export const selectNetworkLoading = (state: RootState) => state.network.loading;
export const selectNetworkError = (state: RootState) => state.network.error;

export default networkSlice.reducer;
