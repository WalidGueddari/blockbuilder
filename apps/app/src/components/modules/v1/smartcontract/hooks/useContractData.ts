'use client';

import { useMemo, useState } from 'react';

import type { Contract } from '../types';

// Mock data for initial contracts
const mockDeployedContracts: Contract[] = [
  {
    id: '1',
    name: 'BlockToken',
    type: 'ERC20',
    address: '0x42AefF2F987dc0b23BbFa5dE1B58Cb2b43bD9273',
    description: 'A standard ERC20 token for fast and secure value transfer.',
    status: {
      successCount: 12,
      failureCount: 2,
      lastInteraction: '2 hours ago',
    },
    accounts: [
      { role: 'Owner', address: '0x1234567890abcdef1234567890abcdef12345678' },
      { role: 'Minter', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
    ],
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
    id: '2',
    name: 'RareCollectible',
    type: 'ERC721',
    address: '0x8f23b987D135c29aA29cE2456fD6d01d72eF4f80',
    description: 'A limited edition NFT series representing rare digital artwork.',
    status: {
      successCount: 5,
      failureCount: 0,
      lastInteraction: '1 day ago',
    },
    accounts: [{ role: 'Creator', address: '0x1234567890abcdef1234567890abcdef12345678' }],
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
    id: '3',
    name: 'MultiAssetToken',
    type: 'ERC1155',
    address: '0x3a4B7aB9BDFBD17F5E6B441E34e8123bBD52714A',
    description: 'A multi-asset token for gaming items and collectibles.',
    status: {
      successCount: 8,
      failureCount: 1,
      lastInteraction: '3 days ago',
    },
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
];

export const useContractData = () => {
  const [contracts, setContracts] = useState<Contract[]>(mockDeployedContracts);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [favoriteContracts, setFavoriteContracts] = useState<string[]>([]);

  // Get all unique tags from contracts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    contracts.forEach((contract) => {
      contract.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [contracts]);

  // Filter contracts based on search query and active filters
  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === '' ||
        contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.type.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by active tags
      const matchesFilters =
        activeFilters.length === 0 ||
        (contract.tags && contract.tags.some((tag) => activeFilters.includes(tag)));

      return matchesSearch && matchesFilters;
    });
  }, [contracts, searchQuery, activeFilters]);

  // Get favorite contracts
  const favoritedContracts = useMemo(() => {
    return filteredContracts.filter((contract) => favoriteContracts.includes(contract.id));
  }, [filteredContracts, favoriteContracts]);

  // Toggle a filter
  const toggleFilter = (tag: string) => {
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
  };

  // Toggle favorite status for a contract
  const toggleFavorite = (contractId: string) => {
    setFavoriteContracts((prev) => {
      if (prev.includes(contractId)) {
        return prev.filter((id) => id !== contractId);
      } else {
        return [...prev, contractId];
      }
    });
  };

  // Add a new contract
  const addContract = (contract: Contract) => {
    setContracts((prev) => [contract, ...prev]);
  };

  return {
    contracts,
    filteredContracts,
    favoritedContracts,
    searchQuery,
    setSearchQuery,
    activeFilters,
    allTags,
    toggleFilter,
    clearFilters,
    favoriteContracts,
    toggleFavorite,
    addContract,
  };
};
