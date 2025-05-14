'use client';

import { useToast } from '@/components/ui/use-toast';
import { useAppDispatch } from '@/services/hooks';
import { deployContract } from '@/services/v1/smartContractSlice';
import { useState } from 'react';

import type { ContractConfig } from '../types';

interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
}

export const useDeployment = () => {
  const [loading, setLoading] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState<{
    open: boolean;
    address: string;
  }>({
    open: false,
    address: '',
  });
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const handleDeployContract = async (
    contractName: string,
    contractCode: string,
    networkId: string,
    config?: ContractConfig,
  ): Promise<DeploymentResult | null> => {
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

      const result = await dispatch(
        deployContract({
          contractName,
          contractContent: contractCode,
          networkId,
        }),
      ).unwrap();

      const deploymentResult: DeploymentResult = {
        contractAddress: result.result,
        transactionHash: result.result, // In a real implementation, we would get the transaction hash from the deployment result
      };

      toast({
        title: 'Success',
        description: `Contract ${contractName} deployed successfully!`,
      });

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
