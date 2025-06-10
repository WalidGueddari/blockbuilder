import { Contract } from '@/components/modules/v1/smartcontract/types/contract';
import {
  DeployContractPayload,
  DeployContractResponse,
  DeployedContract,
  DraftContract,
  InteractContractPayload,
  InteractContractResponse,
  SmartContractState,
} from '@/types/smartContract';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { smartContractService } from './smartContractService';

const initialState: SmartContractState = {
  deployedContracts: [],
  drafts: [],
  loading: false,
  error: null,
  draftToEditId: null,
  importedContracts: [],
};

export const deployContract = createAsyncThunk<
  DeployContractResponse,
  DeployContractPayload,
  { rejectValue: string }
>('smartContract/deployContract', async (payload, { rejectWithValue }) => {
  try {
    const response = await smartContractService.deployContract(payload);
    return response;
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

/* export const addToFavorites = createAsyncThunk<void, string, { rejectValue: string }>(
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
); */

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

export const toggleFavorite = createAsyncThunk<
  { contractId: string; isFavorite: boolean },
  string,
  { rejectValue: string }
>('smartContract/toggleFavorite', async (contractId, { rejectWithValue }) => {
  try {
    const response = await smartContractService.toggleFavorite(contractId);
    return { contractId, isFavorite: response.isFavorite };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const importContractByAbi = createAsyncThunk<
  Contract,
  {
    networkId: string;
    contractName: string;
    contractAddress: string;
    abi: any;
    description: string;
    tags: string[];
    type: string;
    config: any;
  },
  { rejectValue: string }
>('smartContract/importByAbi', async (payload, { rejectWithValue }) => {
  try {
    const { networkId, ...contractData } = payload;
    return await smartContractService.importContractByAbi(networkId, contractData);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const importContractByCode = createAsyncThunk<
  Contract,
  {
    networkId: string;
    contractName: string;
    contractAddress: string;
    contractContent: string;
    description: string;
    tags: string[];
    type: string;
    config: any;
  },
  { rejectValue: string }
>('smartContract/importByCode', async (payload, { rejectWithValue }) => {
  try {
    const { networkId, ...contractData } = payload;
    return await smartContractService.importContractByCode(networkId, contractData);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const smartContractSlice = createSlice({
  name: 'smartContract',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setDraftToEditId: (state, action: PayloadAction<string | null>) => {
      state.draftToEditId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Deploy Contract
      .addCase(deployContract.rejected, (state, action) => {
        state.error = action.payload || 'Failed to deploy contract';
      })
      // Fetch Deployed Contracts
      .addCase(fetchDeployedContracts.fulfilled, (state, action) => {
        state.deployedContracts = action.payload;
      })
      .addCase(fetchDeployedContracts.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch deployed contracts';
      })
      // Toggle Favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const contract = state.deployedContracts.find((c) => c.id === action.payload.contractId);
        if (contract) {
          if (action.payload.isFavorite) {
            contract.favorites = [
              {
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
              },
            ];
          } else {
            contract.favorites = [];
          }
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload || 'Failed to toggle favorite';
      })
      // Save draft cases
      .addCase(saveDraft.fulfilled, (state, action) => {
        const index = state.drafts.findIndex((draft) => draft.id === action.payload.id);
        if (index !== -1) {
          state.drafts[index] = action.payload;
        } else {
          state.drafts.push(action.payload);
        }
      })
      // Load drafts cases
      .addCase(loadDrafts.fulfilled, (state, action) => {
        state.drafts = action.payload;
      })
      // Delete draft cases
      .addCase(deleteDraft.fulfilled, (state, action) => {
        state.drafts = state.drafts.filter((draft) => draft.id !== action.payload);
      })
      // Import by ABI
      .addCase(importContractByAbi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importContractByAbi.fulfilled, (state, action) => {
        state.loading = false;
        state.importedContracts.push(action.payload);
      })
      .addCase(importContractByAbi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to import contract by ABI';
      })
      // Import by Code
      .addCase(importContractByCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importContractByCode.fulfilled, (state, action) => {
        state.loading = false;
        state.importedContracts.push(action.payload);
      })
      .addCase(importContractByCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to import contract by code';
      });
  },
});

export const { clearError, setDraftToEditId } = smartContractSlice.actions;

// Add new selectors
export const selectImportedContracts = (state: { smartContract: SmartContractState }) =>
  state.smartContract.importedContracts;

export default smartContractSlice.reducer;
