// store/serverSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import {
  CreateAzureVMParams,
  CreateServerResponse,
  ServerState,
  SetupServerParams,
  SetupServerResponse,
} from '../../types/v2/server';
import { RootState } from '../store';

// Initial state: make sure you have a valid value for 'Server'
const initialState: ServerState = {
  loading: false,
  error: null,
  server: null,
  setupServer: null,
};

// Create a thunk that returns CreateServerResponse
export const createServer = createAsyncThunk<CreateServerResponse, CreateAzureVMParams>(
  'server/create',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.post<CreateServerResponse>(
        `${process.env.NEXT_PUBLIC_BASE_URL_V2}/server/create`,
        { payload: params },
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const setupServer = createAsyncThunk<
  SetupServerResponse, // The success response type from the backend
  SetupServerParams // The argument type you pass in
>('server/setupServer', async ({ id, networkId }, { rejectWithValue }) => {
  try {
    // Notice how we call `/setup/:id` and pass in the body { id, networkId }:
    const res = await axios.post<SetupServerResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL_V2}/server/setup`,
      { id, networkId },
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const serverSlice = createSlice({
  name: 'server',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // createServer
      .addCase(createServer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.server = null;
      })
      .addCase(createServer.fulfilled, (state, action) => {
        state.loading = false;
        state.server = action.payload;
      })
      .addCase(createServer.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred.';
      })

      // setupServer
      .addCase(setupServer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.setupServer = null;
      })
      .addCase(setupServer.fulfilled, (state, action) => {
        state.loading = false;
        state.setupServer = action.payload;
      })
      .addCase(setupServer.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'An error occurred while setting up Docker/Nginx.';
      });
  },
});

export default serverSlice.reducer;

// Selectors
export const selectServerLoading = (state: RootState) => state.server.loading;
export const selectServerError = (state: RootState) => state.server.error;
export const selectServerData = (state: RootState) => state.server.server;
export const selectSetupResult = (state: RootState) => state.server.setupServer;
