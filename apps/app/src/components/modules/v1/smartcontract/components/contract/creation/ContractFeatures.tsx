'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import type { ContractConfig } from '../../../types';

interface ContractFeaturesProps {
  contractConfig: ContractConfig;
  setContractConfig: (config: ContractConfig) => void;
  className?: string;
}

export const ContractFeatures = ({
  contractConfig,
  setContractConfig,
  className = '',
}: ContractFeaturesProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-base font-medium">Should it be mintable or pausable?</Label>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="hover:bg-muted/50 space-y-2 rounded-lg border p-4 transition-colors">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mintable"
              checked={contractConfig.mintable}
              onCheckedChange={(checked) =>
                setContractConfig({ ...contractConfig, mintable: checked === true })
              }
              className="h-5 w-5"
            />
            <Label htmlFor="mintable" className="font-medium">
              Mintable
            </Label>
          </div>
          <p className="text-muted-foreground pl-7 text-sm">
            Allows creating new tokens after deployment
          </p>
        </div>

        <div className="hover:bg-muted/50 space-y-2 rounded-lg border p-4 transition-colors">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pausable"
              checked={contractConfig.pausable}
              onCheckedChange={(checked) =>
                setContractConfig({ ...contractConfig, pausable: checked === true })
              }
              className="h-5 w-5"
            />
            <Label htmlFor="pausable" className="font-medium">
              Pausable
            </Label>
          </div>
          <p className="text-muted-foreground pl-7 text-sm">
            Allows pausing all transfers in case of emergency
          </p>
        </div>
      </div>
    </div>
  );
};
