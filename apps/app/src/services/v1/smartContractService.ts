import {
  DeployContractPayload,
  DeployContractResponse,
  DeployedContract,
  DraftContract,
  InteractContractPayload,
  InteractContractResponse,
} from '@/types/smartContract';
import axios from 'axios';

class SmartContractService {
  async deployContract({
    contractName,
    contractContent,
    networkId,
    description,
    tags,
    abi,
    type,
    config,
  }: DeployContractPayload): Promise<DeployContractResponse> {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_V4}/smartcontract/${networkId}/deploy`,
        {
          contractName,
          contractContent,
          description,
          tags,
          abi,
          type,
          config,
        },
      );
      return response.data;
    } catch (error: any) {
      console.error('Deploy contract error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to deploy contract');
    }
  }

  async interactWithContract({
    networkId,
    address,
    functionName,
    args,
  }: InteractContractPayload): Promise<InteractContractResponse> {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_V4}/smartcontract/${networkId}/interact`,
        {
          address,
          functionName,
          args,
        },
      );
      return response.data;
    } catch (error: any) {
      console.error('Interact with contract error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to interact with contract');
    }
  }

  async getDeployedContracts(): Promise<DeployedContract[]> {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_V4}/smartcontract/deployed`,
      );
      return response.data;
    } catch (error: any) {
      console.error('Get deployed contracts error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to get deployed contracts');
    }
  }

  async toggleFavorite(contractId: string): Promise<{ isFavorite: boolean }> {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_V4}/smartcontract/deployed/${contractId}/favorite`,
      );
      return response.data;
    } catch (error: any) {
      console.error('Toggle favorite error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to toggle favorite');
    }
  }

  async saveDraft(draft: DraftContract): Promise<DraftContract> {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_V4}/smartcontract/drafts`,
        draft,
      );
      return response.data;
    } catch (error: any) {
      console.error('Save draft error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to save draft');
    }
  }

  async loadDrafts(): Promise<DraftContract[]> {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_V4}/smartcontract/drafts`,
      );
      return response.data;
    } catch (error: any) {
      console.error('Load drafts error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to load drafts');
    }
  }

  async deleteDraft(draftId: string): Promise<void> {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL_V4}/smartcontract/drafts/${draftId}`);
    } catch (error: any) {
      console.error('Delete draft error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to delete draft');
    }
  }
}

export const smartContractService = new SmartContractService();
