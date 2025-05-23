'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { setDraftToEditId } from '@/services/v1/smartContractSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdvancedMode } from './components/contract/creation/AdvancedMode';
import { BeginnerMode } from './components/contract/creation/BeginnerMode';
import { ModeSelector } from './components/contract/creation/ModeSelector';
import { DeploymentSuccessModal } from './components/contract/deployment/DeploymentSuccessModal';
import { useDeployment } from './hooks/useDeployment';
import { useDrafts } from './hooks/useDrafts';
import { useNetwork } from './hooks/useNetwork';
import type { ContractConfig } from './types';
import { generateContract } from './utils/index';

// Default ERC20 configuration
const defaultConfig: ContractConfig = {
  contractType: 'ERC20',
  name: 'MyToken',
  symbol: 'MTK',
  mintable: false,
  burnable: false,
  pausable: false,
};

// Generate initial code for the default configuration
const initialCode = generateContract(defaultConfig);

export const SmartContract = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'beginner' | 'advanced'>('beginner');
  const [contractConfig, setContractConfig] = useState<ContractConfig>(defaultConfig);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [generatedCode, setGeneratedCode] = useState<string>(initialCode);

  const { selectedNetworkId, setSelectedNetworkId, networks, networksLoading } = useNetwork();
  const { loading, deploymentSuccess, setDeploymentSuccess, handleDeployContract } =
    useDeployment();
  const { saveDraft, isDraftSavedPopupOpen, savedDraftName, closeDraftSavedPopup, savedDrafts } =
    useDrafts();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const draftToEditId = useAppSelector((state) => state.smartContract.draftToEditId);

  useEffect(() => {
    console.log(
      '[CreateContractOverview] useEffect running. draftToEditId:',
      draftToEditId,
      'savedDrafts count:',
      savedDrafts.length,
    );
    if (draftToEditId && savedDrafts.length > 0) {
      const draftToLoad = savedDrafts.find((d) => d.id === draftToEditId);
      console.log('[CreateContractOverview] Attempting to find draft. Found:', draftToLoad);
      if (draftToLoad) {
        console.log('[CreateContractOverview] Loading draft to form:', draftToLoad);
        const effectiveConfig = draftToLoad.config || defaultConfig;
        setContractConfig(effectiveConfig);

        // Prioritize draft.content. Fallback to config.customCode if content is empty (for older custom drafts).
        let codeToDisplay = draftToLoad.content;
        if (!codeToDisplay && effectiveConfig.customCode) {
          console.log(
            '[CreateContractOverview] Using customCode from config as draft content is empty.',
          );
          codeToDisplay = effectiveConfig.customCode;
        }
        setGeneratedCode(codeToDisplay || ''); // Ensure it's at least an empty string if both are null/undefined

        // Set mode to advanced when editing any draft
        setMode('advanced');
        console.log('[CreateContractOverview] Set mode to advanced for draft editing.');

        // Set selected network from draft
        if (draftToLoad.networkId) {
          console.log(
            '[CreateContractOverview] Setting selectedNetworkId from draft:',
            draftToLoad.networkId,
          );
          setSelectedNetworkId(draftToLoad.networkId);
        } else {
          console.log(
            '[CreateContractOverview] Draft has no networkId. Current selectedNetworkId:',
            selectedNetworkId,
          );
        }

        dispatch(setDraftToEditId(null));
        console.log('[CreateContractOverview] Cleared draftToEditId.');
      }
    }
  }, [
    draftToEditId,
    savedDrafts,
    dispatch,
    setContractConfig,
    setGeneratedCode,
    setMode,
    setSelectedNetworkId,
    defaultConfig,
    selectedNetworkId,
  ]);

  const validateConfig = () => {
    const errors: { [key: string]: string } = {};

    if (!contractConfig.name) {
      errors.name = 'Contract name is required';
    } else if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(contractConfig.name)) {
      errors.name = 'Contract name must start with a letter and contain only letters and numbers';
    }

    if (!contractConfig.symbol) {
      errors.symbol = 'Contract symbol is required';
    } else if (!/^[A-Z0-9]{1,5}$/.test(contractConfig.symbol)) {
      errors.symbol = 'Symbol must be 1-5 uppercase letters or numbers';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerateCode = () => {
    if (!validateConfig()) {
      return;
    }

    try {
      const code = generateContract(contractConfig);
      setGeneratedCode(code);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate contract code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeploy = async () => {
    if (!validateConfig()) {
      return;
    }

    // Always regenerate the code to ensure we're using the latest configuration
    const codeToUse = generatedCode || generateContract(contractConfig);
    setGeneratedCode(codeToUse);

    try {
      const result = await handleDeployContract({
        name: contractConfig.name,
        content: codeToUse,
        networkId: selectedNetworkId,
        description: contractConfig.description,
        tags: contractConfig.tags,
        type: contractConfig.contractType,
        config: contractConfig,
      });

      if (result) {
        setDeploymentSuccess({
          open: true,
          address: result.contractAddress,
        });
      }
    } catch (error) {
      toast({
        title: 'Deployment Failed',
        description: error instanceof Error ? error.message : 'Failed to deploy contract',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDraft = () => {
    if (!validateConfig()) {
      return;
    }

    let codeToSave = generatedCode;
    if (mode === 'beginner') {
      try {
        codeToSave = generateContract(contractConfig);
        setGeneratedCode(codeToSave);
      } catch (error) {
        toast({
          title: 'Error',
          description:
            'Failed to generate contract code before saving. Please check configuration.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (!codeToSave) {
      toast({
        title: 'Cannot Save Draft',
        description: 'Contract code is empty. Please generate or write code first.',
        variant: 'destructive',
      });
      return;
    }

    console.log('[CreateContractOverview] Saving draft with networkId:', selectedNetworkId);
    saveDraft(contractConfig, codeToSave, selectedNetworkId);
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Smart Contract Generator</h1>
        <p className="text-muted-foreground mt-2">
          Create, customize, and deploy smart contracts with ease
        </p>
        <div className="mt-4 flex justify-end">
          <Link href="/smartcontract/drafts">
            <Button variant="outline" size="sm">
              View Saved Drafts
            </Button>
          </Link>
        </div>
      </div>

      <ModeSelector mode={mode} onModeChange={setMode} />

      <div className="mt-8">
        {mode === 'beginner' ? (
          <BeginnerMode
            selectedNetworkId={selectedNetworkId}
            setSelectedNetworkId={setSelectedNetworkId}
            networks={networks}
            networksLoading={networksLoading}
            contractConfig={contractConfig}
            setContractConfig={setContractConfig}
            validationErrors={validationErrors}
            loading={loading}
            onDeploy={handleDeploy}
            onSaveDraft={handleSaveDraft}
          />
        ) : (
          <AdvancedMode
            selectedNetworkId={selectedNetworkId}
            setSelectedNetworkId={setSelectedNetworkId}
            networks={networks}
            networksLoading={networksLoading}
            contractConfig={contractConfig}
            setContractConfig={setContractConfig}
            validationErrors={validationErrors}
            loading={loading}
            onDeploy={handleDeploy}
            onSaveDraft={handleSaveDraft}
            generatedCode={generatedCode}
            setGeneratedCode={setGeneratedCode}
          />
        )}
      </div>

      <DeploymentSuccessModal
        deploymentSuccess={deploymentSuccess}
        setDeploymentSuccess={setDeploymentSuccess}
      />

      {/* Draft Saved Popup */}
      <AlertDialog open={isDraftSavedPopupOpen} onOpenChange={closeDraftSavedPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Draft Saved Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              Your contract "{savedDraftName}" has been saved as a draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDraftSavedPopup}>Stay Here</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                router.push('/smartcontract/drafts');
                closeDraftSavedPopup();
              }}
            >
              View Drafts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
