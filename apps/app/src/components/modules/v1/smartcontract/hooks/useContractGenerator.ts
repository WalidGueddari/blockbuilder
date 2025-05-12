import { useEffect, useState } from 'react';

import { ContractConfig, ContractType, ValidationErrors } from '../types';
import { generateContract } from '../utils';

export const useContractGenerator = () => {
  const [contractConfig, setContractConfig] = useState<ContractConfig>({
    contractType: 'ERC20',
    name: '',
    symbol: '',
    mintable: false,
    burnable: false,
    pausable: false,
  });

  const [generatedCode, setGeneratedCode] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [estimatedGas, setEstimatedGas] = useState<number | null>(null);

  // Validate contract name and symbol
  useEffect(() => {
    const errors: ValidationErrors = {};

    if (contractConfig.name) {
      if (!/^[A-Za-z][A-Za-z0-9]*$/.test(contractConfig.name)) {
        errors.name =
          'Contract name must start with a letter and contain only alphanumeric characters';
      }
    }

    if (contractConfig.symbol) {
      if (contractConfig.symbol.length > 11) {
        errors.symbol = 'Symbol should be 11 characters or less';
      } else if (!/^[A-Z0-9]*$/.test(contractConfig.symbol)) {
        errors.symbol = 'Symbol must contain only uppercase letters and numbers';
      }
    }

    setValidationErrors(errors);
  }, [contractConfig.name, contractConfig.symbol]);

  // Generate code based on contract type and features
  useEffect(() => {
    try {
      const code = generateContract(contractConfig);
      setGeneratedCode(code);

      // Calculate estimated gas
      const baseGas = 1000000;
      const featureMultiplier =
        (contractConfig.mintable ? 1.2 : 1) *
        (contractConfig.burnable ? 1.1 : 1) *
        (contractConfig.pausable ? 1.15 : 1);

      const typeMultiplier = (() => {
        switch (contractConfig.contractType) {
          case 'ERC20':
            return 1;
          case 'ERC721':
            return 1.3;
          case 'ERC1155':
            return 1.5;
          case 'Stablecoin':
            return 1.4;
          case 'RWA':
            return 1.6;
          case 'Governor':
            return 2;
          case 'Custom':
            return 1.2;
          default:
            return 1;
        }
      })();

      setEstimatedGas(Math.floor(baseGas * featureMultiplier * typeMultiplier));
    } catch (error) {
      console.error('Failed to generate contract code:', error);
      setGeneratedCode('// Error generating contract code');
      setEstimatedGas(null);
    }
  }, [contractConfig]);

  return {
    contractConfig,
    setContractConfig,
    generatedCode,
    validationErrors,
    estimatedGas,
  };
};
