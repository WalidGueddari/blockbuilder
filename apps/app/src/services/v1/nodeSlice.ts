// nodeSlice.ts
import { InitNetwork } from '@/types/v1/network';
import { Node, NodesResponse } from '@/types/v1/node';
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

export const fetchNodesByNetworkId = createAsyncThunk<
  NodesResponse,
  string, // Argument is the network ID
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
    if (error.response && error.response.data && error.response.data.message) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue('Failed to fetch nodes');
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
    setCurrentServerId: (state, action: PayloadAction<string>) => {
      state.currentServerId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNodesByNetworkId.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNodesByNetworkId.fulfilled, (state, action: PayloadAction<NodesResponse>) => {
        state.nodes = action.payload.nodes; // Ensure this is the structure of your payload
        state.loading = false;
      })
      .addCase(fetchNodesByNetworkId.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch nodes';
        state.loading = false;
      });
  },
});

export const { clearNodeError, setCurrentServerId } = nodeSlice.actions;

export const selectNodes = (state: RootState): Node[] => {
  return state.node.nodes;
};

export const selectNodeLoading = (state: RootState) => state.node.loading;
export const selectNodeError = (state: RootState) => state.node.error;
export const selectCurrentServerId = (state: RootState) => state.node.currentServerId;

export default nodeSlice.reducer;
