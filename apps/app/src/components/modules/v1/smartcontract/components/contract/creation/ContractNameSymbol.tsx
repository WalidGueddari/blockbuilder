'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { ContractConfig } from '../../../types';

interface ContractNameSymbolProps {
  contractConfig: ContractConfig;
  setContractConfig: (config: ContractConfig) => void;
  validationErrors: { [key: string]: string };
  className?: string;
}

export const ContractNameSymbol = ({
  contractConfig,
  setContractConfig,
  validationErrors,
  className = '',
}: ContractNameSymbolProps) => {
  return (
    <div className={`grid gap-6 md:grid-cols-2 ${className}`}>
      <div className="space-y-3">
        <Label htmlFor="name" className="text-base font-medium">
          What should we name your token?
        </Label>
        <Input
          id="name"
          type="text"
          value={contractConfig.name}
          onChange={(e) => setContractConfig({ ...contractConfig, name: e.target.value })}
          placeholder="Enter token name"
          className={`h-11 ${validationErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {validationErrors.name && <p className="text-xs text-red-500">{validationErrors.name}</p>}
      </div>

      <div className="space-y-3">
        <Label htmlFor="symbol" className="text-base font-medium">
          Choose a token symbol
        </Label>
        <Input
          id="symbol"
          type="text"
          value={contractConfig.symbol}
          onChange={(e) => setContractConfig({ ...contractConfig, symbol: e.target.value })}
          placeholder="Enter token symbol"
          className={`h-11 ${validationErrors.symbol ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {validationErrors.symbol && (
          <p className="text-xs text-red-500">{validationErrors.symbol}</p>
        )}
      </div>
    </div>
  );
};
