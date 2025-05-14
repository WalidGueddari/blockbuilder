'use client';

import { useAppDispatch, useAppSelector } from '@/services/hooks';
import {
  addToFavorites,
  fetchDeployedContracts,
  fetchFavoriteContracts,
  removeFromFavorites,
} from '@/services/v1/smartContractSlice';
import type { DeployedContract } from '@/types/smartContract';
import { useEffect, useState } from 'react';

// Mock data for initial contracts
/* const mockDeployedContracts: DeployedContract[] = [
  {
    address: '0x42AefF2F987dc0b23BbFa5dE1B58Cb2b43bD9273',
    name: 'BlockToken',
    type: 'ERC20',
    deployedAt: new Date().toISOString(),
    description: 'A standard ERC20 token for fast and secure value transfer.',
    tags: ['token', 'mainnet'],
    abi: [
      {
        inputs: [],
        name: 'name',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'symbol',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'totalSupply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
  },
  {
    address: '0x8f23b987D135c29aA29cE2456fD6d01d72eF4f80',
    name: 'RareCollectible',
    type: 'ERC721',
    deployedAt: new Date().toISOString(),
    description: 'A limited edition NFT series representing rare digital artwork.',
    tags: ['nft', 'art', 'testnet'],
    abi: [
      {
        inputs: [],
        name: 'name',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'symbol',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'string', name: 'uri', type: 'string' },
        ],
        name: 'safeMint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
        name: 'tokenURI',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
  },
  {
    address: '0x3a4B7aB9BDFBD17F5E6B441E34e8123bBD52714A',
    name: 'MultiAssetToken',
    type: 'ERC1155',
    deployedAt: new Date().toISOString(),
    description: 'A multi-asset token for gaming items and collectibles.',
    tags: ['gaming', 'multi-token', 'testnet'],
    abi: [
      {
        inputs: [],
        name: 'name',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'uri',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
  },
]; */

export const useContractData = () => {
  const dispatch = useAppDispatch();
  const { deployedContracts, loading, error } = useAppSelector((state) => state.smartContract);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [favoriteContracts, setFavoriteContracts] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchDeployedContracts());
    dispatch(fetchFavoriteContracts());
  }, [dispatch]);

  const handleToggleFavorite = async (contractAddress: string) => {
    try {
      if (favoriteContracts.includes(contractAddress)) {
        await dispatch(removeFromFavorites(contractAddress)).unwrap();
        setFavoriteContracts((prev) => prev.filter((addr) => addr !== contractAddress));
      } else {
        await dispatch(addToFavorites(contractAddress)).unwrap();
        setFavoriteContracts((prev) => [...prev, contractAddress]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
  };

  const getUniqueTags = (contracts: DeployedContract[]): string[] => {
    const tags = new Set<string>();
    contracts.forEach((contract) => {
      contract.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  };

  const filteredContracts = deployedContracts.filter((contract) => {
    const matchesSearch =
      contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters =
      activeFilters.length === 0 || activeFilters.some((filter) => contract.tags?.includes(filter));

    return matchesSearch && matchesFilters;
  });

  const favoritedContracts = deployedContracts.filter((contract) =>
    favoriteContracts.includes(contract.address),
  );

  return {
    contracts: filteredContracts,
    favoritedContracts,
    loading,
    error,
    searchQuery,
    activeFilters,
    favoriteContracts,
    uniqueTags: getUniqueTags(deployedContracts),
    handleSearch,
    handleFilterChange,
    handleToggleFavorite,
  };
};
