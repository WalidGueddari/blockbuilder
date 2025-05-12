'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

import { exampleUseCases } from '../../../constants/useCases';
import type { ContractConfig } from '../../../types';

interface ContractTypeSelectorProps {
  contractConfig: ContractConfig;
  setContractConfig: (config: ContractConfig) => void;
  className?: string;
}

export const ContractTypeSelector = ({
  contractConfig,
  setContractConfig,
  className = '',
}: ContractTypeSelectorProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-base font-medium">What would you like to create?</Label>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exampleUseCases.map((useCase) => (
          <motion.div
            key={useCase.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`cursor-pointer rounded-lg border p-4 transition-all duration-200 ${
              contractConfig.contractType === useCase.type
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'hover:border-primary/30 hover:bg-muted/50'
            }`}
            onClick={() => {
              setContractConfig({
                ...contractConfig,
                contractType: useCase.type,
                name: useCase.defaults.name || '',
                symbol: useCase.defaults.symbol || '',
                mintable: useCase.defaults.mintable ?? false,
                burnable: useCase.defaults.burnable ?? false,
                pausable: useCase.defaults.pausable ?? false,
              });
            }}
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="text-base font-semibold">{useCase.name}</h3>
              {contractConfig.contractType === useCase.type && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Selected
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{useCase.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
