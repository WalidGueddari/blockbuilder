// nodeSlice.ts
import { InitNetwork } from '@/types/v1/network';
import { Node, NodeResponse, NodesResponse } from '@/types/v1/node';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { RootState } from '../store';

interface NodeState {
  loading: boolean;
  error: string | null;
  networks: InitNetwork[];
  nodes: Node[];
  currentServerId: string | null;
}

const initialState: NodeState = {
  loading: false,
  error: null,
  networks: [],
  nodes: [],
  currentServerId: null,
};

// Fetch nodes by network ID
export const fetchNodesByNetworkId = createAsyncThunk<
  NodesResponse,
  string,
  { rejectValue: string }
>('node/fetchNodesByNetworkId', async (networkId, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/node/nodes-by-network/${networkId}`,
    );
    if (response.data.success) {
      return response.data;
    } else {
      return rejectWithValue('No nodes found for the specified network');
    }
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch nodes');
  }
});

// Fetch node by ID
export const fetchNodesById = createAsyncThunk<NodeResponse, string, { rejectValue: string }>(
  'node/fetchNodesById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/node/${id}`);
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue('No node found with the specified ID');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch node');
    }
  },
);

// Fetch all networks
export const fetchNetworks = createAsyncThunk<InitNetwork[], void, { rejectValue: string }>(
  'node/fetchNetworks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/networks`);
      if (response.data.success) {
        return response.data.networks;
      } else {
        return rejectWithValue('No networks found');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch networks');
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
    setCurrentServerId: (state, action: PayloadAction<string>) => {
      state.currentServerId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchNodesByNetworkId
      .addCase(fetchNodesByNetworkId.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNodesByNetworkId.fulfilled, (state, action: PayloadAction<NodesResponse>) => {
        state.nodes = action.payload.nodes; // Ensure this matches API response
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchNodesByNetworkId.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch nodes';
        state.loading = false;
      })

      // Handle fetchNodesById
      .addCase(fetchNodesById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNodesById.fulfilled, (state, action: PayloadAction<NodeResponse>) => {
        state.nodes = [action.payload.node]; // Assuming response contains a single node
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchNodesById.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch node';
        state.loading = false;
      })

      // Handle fetchNetworks
      .addCase(fetchNetworks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNetworks.fulfilled, (state, action: PayloadAction<InitNetwork[]>) => {
        state.networks = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchNetworks.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch networks';
        state.loading = false;
      });
  },
});

export const { clearNodeError, setCurrentServerId } = nodeSlice.actions;

export const selectNodes = (state: RootState): Node[] => state.node.nodes;
export const selectNetworks = (state: RootState): InitNetwork[] => state.node.networks;
export const selectNodeLoading = (state: RootState) => state.node.loading;
export const selectNodeError = (state: RootState) => state.node.error;
export const selectCurrentServerId = (state: RootState) => state.node.currentServerId;

export default nodeSlice.reducer;
