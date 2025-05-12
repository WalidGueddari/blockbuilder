'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { exampleUseCases } from '../../../constants/useCases';
import type { ContractConfig } from '../../../types';

interface AdvancedFeaturesProps {
  contractConfig: ContractConfig;
  handleFeatureChange: (feature: 'mintable' | 'burnable' | 'pausable', checked: boolean) => void;
  className?: string;
}

export const AdvancedFeatures = ({
  contractConfig,
  handleFeatureChange,
  className = '',
}: AdvancedFeaturesProps) => {
  // Get the current use case based on contract type
  const currentUseCase = exampleUseCases.find((uc) => uc.type === contractConfig.contractType);

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>Features</Label>
      <div className="space-y-2">
        {currentUseCase?.defaults.mintable && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mintable"
              checked={contractConfig.mintable}
              onCheckedChange={(checked) => handleFeatureChange('mintable', checked === true)}
            />
            <Label htmlFor="mintable" className="font-normal">
              Mintable
            </Label>
          </div>
        )}

        {currentUseCase?.defaults.burnable && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="burnable"
              checked={contractConfig.burnable}
              onCheckedChange={(checked) => handleFeatureChange('burnable', checked === true)}
            />
            <Label htmlFor="burnable" className="font-normal">
              Burnable
            </Label>
          </div>
        )}

        {currentUseCase?.defaults.pausable && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pausable"
              checked={contractConfig.pausable}
              onCheckedChange={(checked) => handleFeatureChange('pausable', checked === true)}
            />
            <Label htmlFor="pausable" className="font-normal">
              Pausable
            </Label>
          </div>
        )}
      </div>

      {!currentUseCase?.defaults.mintable &&
        !currentUseCase?.defaults.burnable &&
        !currentUseCase?.defaults.pausable && (
          <p className="text-muted-foreground text-sm">
            No additional features available for this contract type.
          </p>
        )}
    </div>
  );
};
