import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

import type { Contract } from '../types';

interface UseContractImportProps {
  networkId: string;
  onImport: (contract: Contract) => void;
}

type ContractConfig = {
  contractType:
    | 'ERC20'
    | 'ERC721'
    | 'ERC1155'
    | 'Stablecoin'
    | 'RWA'
    | 'Governor'
    | 'Custom'
    | 'Imported';
  name: string;
  symbol: string;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  decimals?: number;
  initialSupply?: string;
  maxSupply?: string;
  royaltyFee?: number;
  baseUri?: string;
  governorName?: string;
  votingDelay?: number;
  votingPeriod?: number;
  proposalThreshold?: number;
  quorumNumerator?: number;
  customCode?: string;
};

interface ImportFormData {
  name: string;
  address: string;
  abi?: string;
  code?: string;
  description: string;
  tags: string[];
  type: 'ERC20' | 'ERC721' | 'ERC1155' | 'Stablecoin' | 'RWA' | 'Governor' | 'Custom' | 'Imported';
  config: ContractConfig;
}

const DEFAULT_FORM_DATA: ImportFormData = {
  name: '',
  address: '',
  abi: '',
  code: '',
  description: '',
  tags: [],
  type: 'Imported',
  config: {
    contractType: 'Imported',
    name: '',
    symbol: '',
    mintable: false,
    burnable: false,
    pausable: false,
  },
};

export const useContractImport = ({ networkId, onImport }: UseContractImportProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ImportFormData>(DEFAULT_FORM_DATA);
  const [newTag, setNewTag] = useState('');

  const updateFormData = (field: keyof ImportFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateConfig = (field: keyof ContractConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value,
      },
    }));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setNewTag('');
  };

  const validateForm = (method: 'abi' | 'code'): boolean => {
    if (!formData.name || !formData.address) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return false;
    }

    if (method === 'abi') {
      if (!formData.abi) {
        toast({
          title: 'Missing ABI',
          description: 'Please provide the contract ABI',
          variant: 'destructive',
        });
        return false;
      }

      try {
        JSON.parse(formData.abi);
      } catch (e) {
        toast({
          title: 'Invalid ABI',
          description: 'The ABI is not valid JSON',
          variant: 'destructive',
        });
        return false;
      }
    } else if (method === 'code' && !formData.code) {
      toast({
        title: 'Missing Code',
        description: 'Please provide the contract source code',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const importContract = async (method: 'abi' | 'code') => {
    try {
      setIsLoading(true);

      if (!validateForm(method)) {
        return;
      }

      const endpoint =
        method === 'abi'
          ? `/api/v4/smartcontract/${networkId}/add-external-contract`
          : `/api/v4/smartcontract/${networkId}/add-external-contract-code`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractName: formData.name,
          contractAddress: formData.address,
          ...(method === 'abi'
            ? { abi: JSON.parse(formData.abi!) }
            : { contractContent: formData.code }),
          description: formData.description,
          tags: [...formData.tags, 'imported', method === 'code' ? 'source-code' : ''],
          type: formData.type,
          config: {
            ...formData.config,
            contractType: formData.type,
            name: formData.name,
            symbol: formData.name.toUpperCase().replace(/\s+/g, ''),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to import contract');
      }

      const result = await response.json();

      // Create the new contract object
      const newContract: Contract = {
        id: `imported-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        address: formData.address,
        description: formData.description,
        abi: method === 'abi' ? JSON.parse(formData.abi!) : result.abi,
        tags: [...formData.tags, 'imported', method === 'code' ? 'source-code' : ''],
        config: {
          ...formData.config,
          contractType: formData.type,
          name: formData.name,
          symbol: formData.name.toUpperCase().replace(/\s+/g, ''),
        },
        status: {
          successCount: 0,
          failureCount: 0,
          lastInteraction: '',
        },
      };

      // Call the onImport callback
      onImport(newContract);

      // Reset form
      resetForm();

      toast({
        title: 'Contract Imported',
        description: `Successfully imported ${formData.name}`,
      });

      return true;
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'There was an error importing the contract',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    formData,
    newTag,
    setNewTag,
    updateFormData,
    updateConfig,
    addTag,
    removeTag,
    resetForm,
    importContract,
  };
};
