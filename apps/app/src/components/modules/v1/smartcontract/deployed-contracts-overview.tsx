'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAppDispatch } from '@/services/hooks';
import { interactWithContract } from '@/services/v1/smartContractSlice';
import type { DeployedContract } from '@/types/smartContract';
import { Code } from 'lucide-react';
import { useState } from 'react';

import ContractInteractionModal from './components/contracts/ContractInteractionModal';
import { ContractList } from './components/contracts/ContractList';
import { FilterTags } from './components/contracts/FilterTags';
import { ImportContractDialog } from './components/contracts/ImportContractDialog';
import { SearchBar } from './components/contracts/SearchBar';
import { useContractData } from './hooks/useContractData';
import { useNetwork } from './hooks/useNetwork';

export default function DeployedContractsPage() {
  const dispatch = useAppDispatch();
  const {
    contracts,
    favoritedContracts,
    loading,
    error,
    searchQuery,
    activeFilters,
    uniqueTags,
    handleSearch,
    handleFilterChange,
    handleToggleFavorite,
  } = useContractData();

  const { networks, networksLoading, selectedNetworkId, setSelectedNetworkId } = useNetwork();

  const { toast } = useToast();
  const [selectedContract, setSelectedContract] = useState<DeployedContract | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importAbiDialogOpen, setImportAbiDialogOpen] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const openContractModal = (contract: DeployedContract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleContractInteraction = async (
    networkId: string,
    address: string,
    functionName: string,
    args: string[] = [],
  ) => {
    if (!networkId) {
      toast({
        title: 'Error',
        description: 'Network ID is required for contract interaction',
        variant: 'destructive',
      });
      return;
    }

    setIsInteracting(true);
    try {
      const result = await dispatch(
        interactWithContract({
          networkId,
          address,
          functionName,
          args,
        }),
      ).unwrap();

      toast({
        title: 'Success',
        description: `Function ${functionName} executed successfully! Result: ${JSON.stringify(result.result)}`,
      });
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to interact with contract',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsInteracting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="bg-destructive/10 rounded-full p-3">
            <Code className="text-destructive h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Error Loading Contracts</h3>
          <p className="text-muted-foreground mt-2 max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Deployed Smart Contracts</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Interact with your deployed smart contracts on the blockchain.
        </p>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={handleSearch}
        onImportClick={() => setImportAbiDialogOpen(true)}
      />

      <FilterTags
        allTags={uniqueTags}
        activeFilters={activeFilters}
        toggleFilter={(tag) =>
          handleFilterChange(
            activeFilters.includes(tag)
              ? activeFilters.filter((t) => t !== tag)
              : [...activeFilters, tag],
          )
        }
        clearFilters={() => handleFilterChange([])}
      />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ContractList
            contracts={contracts}
            toggleFavorite={handleToggleFavorite}
            openContractModal={openContractModal}
            type="all"
            hasFilters={searchQuery !== '' || activeFilters.length > 0}
          />
        </TabsContent>

        <TabsContent value="favorites">
          <ContractList
            contracts={favoritedContracts}
            toggleFavorite={handleToggleFavorite}
            openContractModal={openContractModal}
            type="favorites"
            hasFilters={searchQuery !== '' || activeFilters.length > 0}
          />
        </TabsContent>
      </Tabs>

      {selectedContract && (
        <ContractInteractionModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          abi={selectedContract.abi || []}
          address={selectedContract.address}
          name={selectedContract.name}
          networkId={selectedContract.networkId}
          onInteract={handleContractInteraction}
          isInteracting={isInteracting}
        />
      )}

      <ImportContractDialog
        open={importAbiDialogOpen}
        onOpenChange={setImportAbiDialogOpen}
        onImport={(contract) => {
          toast({
            title: 'Contract Imported',
            description: `Contract ${contract.name} has been imported successfully.`,
          });
        }}
        networkId={selectedNetworkId}
        networks={networks}
        networksLoading={networksLoading}
        setSelectedNetworkId={setSelectedNetworkId}
      />
    </div>
  );
}
