'use client';

import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { deleteDraft, loadDrafts, saveDraft } from '@/services/v1/smartContractSlice';
import type { DraftContract } from '@/types/smartContract';
import { useEffect } from 'react';

import type { ContractConfig } from '../types';

export const useDrafts = () => {
  const dispatch = useAppDispatch();
  const { drafts, loading, error } = useAppSelector((state) => state.smartContract);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(loadDrafts());
  }, [dispatch]);

  const saveDraftHandler = (config: ContractConfig, generatedCode: string) => {
    const draft: DraftContract = {
      id: Date.now().toString(),
      name: config.name || 'Untitled Contract',
      content: generatedCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      networkId: undefined,
      description: config.description,
      tags: config.tags,
    };

    dispatch(saveDraft(draft));

    toast({
      title: 'Draft Saved',
      description: `Your contract "${draft.name}" has been saved as a draft.`,
    });
  };

  const loadDraftHandler = (draftId: string): ContractConfig | null => {
    const draft = drafts.find((d) => d.id === draftId);
    if (draft) {
      toast({
        title: 'Draft Loaded',
        description: `Loaded draft "${draft.name}"`,
      });
      // Convert DraftContract to ContractConfig
      return {
        contractType: 'Custom',
        name: draft.name,
        symbol: '',
        mintable: false,
        burnable: false,
        pausable: false,
        description: draft.description,
        tags: draft.tags,
        customCode: draft.content,
      };
    }
    return null;
  };

  const deleteDraftHandler = (draftId: string) => {
    dispatch(deleteDraft(draftId));
  };

  return {
    savedDrafts: drafts,
    loading,
    error,
    saveDraft: saveDraftHandler,
    loadDraft: loadDraftHandler,
    deleteDraft: deleteDraftHandler,
  };
};
