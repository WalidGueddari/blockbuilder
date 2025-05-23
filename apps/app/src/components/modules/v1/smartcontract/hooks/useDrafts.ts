'use client';

import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import {
  deleteDraft,
  loadDrafts,
  saveDraft,
  setDraftToEditId,
} from '@/services/v1/smartContractSlice';
import type { DraftContract } from '@/types/smartContract';
import { useEffect, useState } from 'react';

import type { ContractConfig } from '../types';

export const useDrafts = () => {
  const dispatch = useAppDispatch();
  const { drafts, loading, error } = useAppSelector((state) => state.smartContract);
  const { toast } = useToast();
  const [isDraftSavedPopupOpen, setIsDraftSavedPopupOpen] = useState(false);
  const [savedDraftName, setSavedDraftName] = useState('');

  useEffect(() => {
    dispatch(loadDrafts());
  }, [dispatch]);

  const saveDraftHandler = (config: ContractConfig, generatedCode: string, networkId?: string) => {
    console.log('[useDrafts] saveDraftHandler called with networkId:', networkId);
    const draft: DraftContract = {
      id: Date.now().toString(),
      name: config.name || 'Untitled Contract',
      content: generatedCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      networkId: networkId,
      description: config.description,
      tags: config.tags || [],
      type: config.contractType,
      config: config,
    };

    dispatch(saveDraft(draft));

    toast({
      title: 'Draft Saved',
      description: `Your contract "${draft.name}" has been saved as a draft.`,
    });

    setSavedDraftName(draft.name);
    setIsDraftSavedPopupOpen(true);
  };

  const loadDraftForEditing = (draftId: string) => {
    console.log('[useDrafts] loadDraftForEditing called with ID:', draftId);
    const draft = drafts.find((d) => d.id === draftId);
    if (draft) {
      console.log('[useDrafts] Draft found:', draft);
      dispatch(setDraftToEditId(draftId));
      toast({
        title: 'Draft Loaded for Editing',
        description: `Draft "${draft.name}" is ready to be edited.`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Could not find the draft to load for editing.',
        variant: 'destructive',
      });
    }
  };

  const deleteDraftHandler = (draftId: string) => {
    dispatch(deleteDraft(draftId));
  };

  const closeDraftSavedPopup = () => {
    setIsDraftSavedPopupOpen(false);
    setSavedDraftName('');
  };

  return {
    savedDrafts: drafts,
    loading,
    error,
    saveDraft: saveDraftHandler,
    loadDraftForEditing,
    deleteDraft: deleteDraftHandler,
    isDraftSavedPopupOpen,
    savedDraftName,
    closeDraftSavedPopup,
  };
};
