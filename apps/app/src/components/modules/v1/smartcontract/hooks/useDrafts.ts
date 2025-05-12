import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

import { ContractConfig, Draft } from '../types';

export const useDrafts = () => {
  const [savedDrafts, setSavedDrafts] = useState<Draft[]>([]);
  const { toast } = useToast();

  const saveDraft = (config: ContractConfig, generatedCode: string) => {
    const draft: Draft = {
      id: Date.now().toString(),
      name: config.name || 'Untitled Contract',
      type: config.contractType,
      updatedAt: new Date().toISOString(),
      data: {
        config: {
          contractType: config.contractType,
          name: config.name,
          symbol: config.symbol,
          mintable: config.mintable,
          burnable: config.burnable,
          pausable: config.pausable,
          decimals: config.decimals,
          initialSupply: config.initialSupply,
          maxSupply: config.maxSupply,
          royaltyFee: config.royaltyFee,
          governanceSettings: config.governanceSettings,
          rwaSettings: config.rwaSettings,
          stablecoinSettings: config.stablecoinSettings,
        },
        code: generatedCode,
      },
    };

    setSavedDrafts([draft, ...savedDrafts]);

    toast({
      title: 'Draft Saved',
      description: `Your contract "${draft.name}" has been saved as a draft.`,
    });
  };

  const loadDraft = (draftId: string): ContractConfig | null => {
    const draft = savedDrafts.find((d) => d.id === draftId);
    if (draft) {
      toast({
        title: 'Draft Loaded',
        description: `Loaded draft "${draft.name}"`,
      });
      return draft.data.config;
    }
    return null;
  };

  return {
    savedDrafts,
    saveDraft,
    loadDraft,
  };
};
