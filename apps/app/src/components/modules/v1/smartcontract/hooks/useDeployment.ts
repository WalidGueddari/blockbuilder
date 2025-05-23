'use client';

import { useToast } from '@/components/ui/use-toast';
import { useAppDispatch } from '@/services/hooks';
import { deployContract } from '@/services/v1/smartContractSlice';
import { useState } from 'react';

import type { ContractConfig } from '../types/contract';
import type {
  DeployContractResponse,
  DeploymentPayload,
  DeploymentResult,
  DeploymentSuccess,
} from '../types/deployment';

export const useDeployment = () => {
  const [loading, setLoading] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState<DeploymentSuccess>({
    open: false,
    address: '',
  });
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const handleDeployContract = async ({
    name,
    content,
    networkId,
    description,
    tags = [],
    abi,
    type = 'default',
    config,
  }: {
    name: string;
    content: string;
    networkId: string;
    description?: string;
    tags?: string[];
    abi?: any;
    type?: string;
    config?: ContractConfig;
  }): Promise<DeploymentResult | null> => {
    setLoading(true);
    try {
      if (!networkId) {
        toast({
          title: 'Network Error',
          description: 'Please select a network to deploy the contract',
          variant: 'destructive',
        });
        return null;
      }

      const response = await dispatch(
        deployContract({
          contractName: name,
          contractContent: content,
          networkId,
          description,
          tags,
          abi,
          type,
          config,
        } as DeploymentPayload),
      ).unwrap();

      // Type assertion to ensure response matches DeployContractResponse
      const result = response as unknown as DeployContractResponse;

      toast({
        title: 'Success',
        description: `Contract ${name} deployment initiated successfully!`,
      });

      setDeploymentSuccess({
        open: true,
        address: result.contractAddress, // Match the property name from DeployContractResponse
      });

      // Transform the response to match DeploymentResult interface
      const deploymentResult: DeploymentResult = {
        id: result.id,
        contractAddress: result.contractAddress,
        transactionHash: result.transactionHash,
        networkId: result.networkId,
      };

      return deploymentResult;
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to deploy contract',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    deploymentSuccess,
    setDeploymentSuccess,
    handleDeployContract,
  };
};
