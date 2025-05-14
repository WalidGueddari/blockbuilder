import {
  DeployContractPayload,
  DeployContractResponse,
  DeployedContract,
  DraftContract,
  InteractContractPayload,
  InteractContractResponse,
  SmartContractState,
} from '@/types/smartContract';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { smartContractService } from './smartContractService';

const initialState: SmartContractState = {
  deployedContracts: [],
  drafts: [],
  loading: false,
  error: null,
};

export const deployContract = createAsyncThunk<
  DeployContractResponse,
  DeployContractPayload,
  { rejectValue: string }
>('smartContract/deployContract', async (payload, { rejectWithValue }) => {
  try {
    return await smartContractService.deployContract(payload);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const interactWithContract = createAsyncThunk<
  InteractContractResponse,
  InteractContractPayload,
  { rejectValue: string }
>('smartContract/interactWithContract', async (payload, { rejectWithValue }) => {
  try {
    return await smartContractService.interactWithContract(payload);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchDeployedContracts = createAsyncThunk<
  DeployedContract[],
  void,
  { rejectValue: string }
>('smartContract/fetchDeployedContracts', async (_, { rejectWithValue }) => {
  try {
    return await smartContractService.getDeployedContracts();
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const addToFavorites = createAsyncThunk<void, string, { rejectValue: string }>(
  'smartContract/addToFavorites',
  async (contractAddress, { rejectWithValue }) => {
    try {
      await smartContractService.addToFavorites(contractAddress);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const removeFromFavorites = createAsyncThunk<void, string, { rejectValue: string }>(
  'smartContract/removeFromFavorites',
  async (contractAddress, { rejectWithValue }) => {
    try {
      await smartContractService.removeFromFavorites(contractAddress);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchFavoriteContracts = createAsyncThunk<string[], void, { rejectValue: string }>(
  'smartContract/fetchFavoriteContracts',
  async (_, { rejectWithValue }) => {
    try {
      return await smartContractService.getFavoriteContracts();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const saveDraft = createAsyncThunk<DraftContract, DraftContract>(
  'smartContract/saveDraft',
  async (draft) => {
    const response = await smartContractService.saveDraft(draft);
    return response;
  },
);

export const loadDrafts = createAsyncThunk<DraftContract[]>(
  'smartContract/loadDrafts',
  async () => {
    const response = await smartContractService.loadDrafts();
    return response;
  },
);

export const deleteDraft = createAsyncThunk<string, string>(
  'smartContract/deleteDraft',
  async (draftId) => {
    await smartContractService.deleteDraft(draftId);
    return draftId;
  },
);

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
      // Deploy Contract
      .addCase(deployContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deployContract.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deployContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to deploy contract';
      })
      // Interact with Contract
      .addCase(interactWithContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(interactWithContract.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(interactWithContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to interact with contract';
      })
      // Fetch Deployed Contracts
      .addCase(fetchDeployedContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeployedContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.deployedContracts = action.payload;
      })
      .addCase(fetchDeployedContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch deployed contracts';
      })
      // Add to Favorites
      .addCase(addToFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add contract to favorites';
      })
      // Remove from Favorites
      .addCase(removeFromFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to remove contract from favorites';
      })
      // Fetch Favorite Contracts
      .addCase(fetchFavoriteContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteContracts.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchFavoriteContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch favorite contracts';
      })
      // Save draft cases
      .addCase(saveDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveDraft.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.drafts.findIndex((draft) => draft.id === action.payload.id);
        if (index !== -1) {
          state.drafts[index] = action.payload;
        } else {
          state.drafts.push(action.payload);
        }
      })
      .addCase(saveDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save draft';
      })
      // Load drafts cases
      .addCase(loadDrafts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDrafts.fulfilled, (state, action) => {
        state.loading = false;
        state.drafts = action.payload;
      })
      .addCase(loadDrafts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load drafts';
      })
      // Delete draft cases
      .addCase(deleteDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDraft.fulfilled, (state, action) => {
        state.loading = false;
        state.drafts = state.drafts.filter((draft) => draft.id !== action.payload);
      })
      .addCase(deleteDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete draft';
      });
  },
});

export const { clearError } = smartContractSlice.actions;
export default smartContractSlice.reducer;
