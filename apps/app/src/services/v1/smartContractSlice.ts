import {
  DeployContractPayload,
  DeployContractResponse,
  InteractContractPayload,
  InteractContractResponse,
  SmartContractState,
} from '@/types/smartContract';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { smartContractService } from './smartContractService';

const initialState: SmartContractState = {
  deployedContracts: [],
  loading: false,
  error: null,
};

export const deployContract = createAsyncThunk<DeployContractResponse, DeployContractPayload>(
  'smartContract/deploy',
  async (payload) => {
    const response = await smartContractService.deployContract(payload);
    return response;
  },
);

export const interactWithContract = createAsyncThunk<
  InteractContractResponse,
  InteractContractPayload
>('smartContract/interact', async (payload) => {
  const response = await smartContractService.interactWithContract(payload);
  return response;
});

const smartContractSlice = createSlice({
  name: 'smartContract',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Deploy contract cases
      .addCase(deployContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deployContract.fulfilled, (state, action) => {
        state.loading = false;
        state.deployedContracts.push({
          address: action.payload.result,
          name: action.meta.arg.contractName,
          type: 'Custom', // This could be made dynamic based on the contract type
          deployedAt: new Date().toISOString(),
        });
      })
      .addCase(deployContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to deploy contract';
      })
      // Interact with contract cases
      .addCase(interactWithContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(interactWithContract.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(interactWithContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to interact with contract';
      });
  },
});

export const { clearError } = smartContractSlice.actions;
export default smartContractSlice.reducer;
