import { ContractConfig } from '../types';
import { generateCustomCode } from './custom';
import { generateERC20Code } from './erc20';
import { generateERC721Code } from './erc721';
import { generateERC1155Code } from './erc1155';
import { generateGovernorCode } from './governor';
import { generateRealWorldAssetCode } from './realWorldAsset';
import { generateStablecoinCode } from './stablecoin';

export const generateContract = (config: ContractConfig): string => {
  switch (config.contractType) {
    case 'ERC20':
      return generateERC20Code(config);
    case 'ERC721':
      return generateERC721Code(config);
    case 'ERC1155':
      return generateERC1155Code(config);
    case 'Stablecoin':
      return generateStablecoinCode(config);
    case 'RWA':
      return generateRealWorldAssetCode(config);
    case 'Governor':
      return generateGovernorCode(config);
    case 'Custom':
      return generateCustomCode(config);
    default:
      throw new Error(`Unsupported contract type: ${config.contractType}`);
  }
};
