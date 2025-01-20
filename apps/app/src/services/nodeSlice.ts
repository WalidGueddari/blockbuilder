import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { RootState } from './store';

// Define types
export interface Node {
  id: string;
  name: string;
  status: 'active' | 'stopped';
  networkId: string;
  createdAt: string;
  updatedAt: string;
}

interface NodeState {
  loading: boolean;
  error: string | null;
  nodes: Node[];
  currentNode: Node | null;
}

const initialState: NodeState = {
  loading: false,
  error: null,
  nodes: [],
  currentNode: null,
};

// Async Thunks
export const fetchNetworkNodes = createAsyncThunk(
  'node/fetchNetworkNodes',
  async (networkId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/node/network/${networkId}/nodes`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

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
      // Fetch Network Nodes
      .addCase(fetchNetworkNodes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNetworkNodes.fulfilled, (state, action) => {
        state.nodes = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchNetworkNodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch nodes';
      });
  },
});

// Actions
export const { clearNodeError } = nodeSlice.actions;

// Selectors
export const selectNodes = (state: RootState) => state.node.nodes;
export const selectNodeLoading = (state: RootState) => state.node.loading;
export const selectNodeError = (state: RootState) => state.node.error;

export default nodeSlice.reducer;
