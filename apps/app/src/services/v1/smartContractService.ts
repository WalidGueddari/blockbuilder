import {
  DeployContractPayload,
  DeployContractResponse,
  InteractContractPayload,
  InteractContractResponse,
} from '@/types/smartContract';
import axios from 'axios';

class SmartContractService {
  async deployContract({
    contractName,
    contractContent,
    networkId,
  }: DeployContractPayload): Promise<DeployContractResponse> {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_V4}/smartcontract/${networkId}/deploy`,
        {
          contractName,
          contractContent,
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
    args = [],
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
}

export const smartContractService = new SmartContractService();
