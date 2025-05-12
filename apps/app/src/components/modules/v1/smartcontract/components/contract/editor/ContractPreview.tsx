'use client';

import { Badge } from '@/components/ui/badge';

import type { ContractConfig } from '../../../types';

interface ContractPreviewProps {
  contractConfig: ContractConfig;
  className?: string;
}

export const ContractPreview = ({ contractConfig, className = '' }: ContractPreviewProps) => {
  return (
    <div className={`bg-muted/30 rounded-lg border p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">Contract Preview</h3>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {contractConfig.contractType}
        </Badge>
      </div>
      <div className="space-y-2 text-sm">
        <div className="border-border/40 flex justify-between border-b pb-2">
          <span className="font-medium">Name:</span>
          <span>{contractConfig.name || 'MyToken'}</span>
        </div>
        <div className="border-border/40 flex justify-between border-b pb-2">
          <span className="font-medium">Symbol:</span>
          <span>{contractConfig.symbol || 'MTK'}</span>
        </div>
        <div className="border-border/40 flex justify-between border-b pb-2">
          <span className="font-medium">Features:</span>
          <div className="flex flex-wrap justify-end gap-1">
            {contractConfig.mintable && (
              <Badge variant="outline" className="text-xs">
                Mintable
              </Badge>
            )}
            {contractConfig.burnable && (
              <Badge variant="outline" className="text-xs">
                Burnable
              </Badge>
            )}
            {contractConfig.pausable && (
              <Badge variant="outline" className="text-xs">
                Pausable
              </Badge>
            )}
            {!contractConfig.mintable && !contractConfig.burnable && !contractConfig.pausable && (
              <span className="text-muted-foreground">None</span>
            )}
          </div>
        </div>

        {contractConfig.description && (
          <div className="border-border/40 flex justify-between border-b pb-2">
            <span className="font-medium">Description:</span>
            <span className="max-w-[70%] text-right">{contractConfig.description}</span>
          </div>
        )}

        {contractConfig.tags && contractConfig.tags.length > 0 && (
          <div className="flex justify-between pt-1">
            <span className="font-medium">Tags:</span>
            <div className="flex flex-wrap justify-end gap-1">
              {contractConfig.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
