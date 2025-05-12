import { UseCase } from '../types';

export const exampleUseCases: UseCase[] = [
  {
    id: 'erc20',
    name: 'ERC20 Token',
    type: 'ERC20',
    description: 'Create a standard fungible token for payments, rewards, or governance.',
    defaults: {
      name: 'MyToken',
      symbol: 'MTK',
      mintable: true,
      burnable: true,
      pausable: true,
    },
  },
  {
    id: 'erc721',
    name: 'NFT Collection',
    type: 'ERC721',
    description:
      'Create a unique token collection for digital art, collectibles, or in-game items.',
    defaults: {
      name: 'MyNFT',
      symbol: 'MNFT',
      mintable: true,
      burnable: true,
      pausable: true,
    },
  },
  {
    id: 'erc1155',
    name: 'Multi-Token',
    type: 'ERC1155',
    description: 'Create a flexible token standard that can handle multiple token types.',
    defaults: {
      name: 'MyMultiToken',
      symbol: 'MMT',
      mintable: true,
      burnable: true,
      pausable: true,
    },
  },
  {
    id: 'stablecoin',
    name: 'Stablecoin',
    type: 'Stablecoin',
    description: 'Create a price-stable token pegged to a fiat currency or commodity.',
    defaults: {
      name: 'MyStablecoin',
      symbol: 'MUSD',
      mintable: true,
      burnable: true,
      pausable: true,
    },
  },
  {
    id: 'rwa',
    name: 'Real-World Asset',
    type: 'RWA',
    description: 'Create a token representing ownership of real-world assets or securities.',
    defaults: {
      name: 'MyAsset',
      symbol: 'MASS',
      mintable: true,
      burnable: true,
      pausable: true,
    },
  },
  {
    id: 'governor',
    name: 'Governance Token',
    type: 'Governor',
    description: 'Create a token for decentralized governance and voting.',
    defaults: {
      name: 'MyGovernor',
      symbol: 'MGOV',
      mintable: false,
      burnable: false,
      pausable: false,
    },
  },
];
