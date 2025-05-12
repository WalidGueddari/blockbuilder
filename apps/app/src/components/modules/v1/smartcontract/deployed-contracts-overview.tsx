'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

import { ContractList } from './components/contracts/ContractList';
import { FilterTags } from './components/contracts/FilterTags';
import { ImportContractDialog } from './components/contracts/ImportContractDialog';
import { SearchBar } from './components/contracts/SearchBar';
import { useContractData } from './hooks/useContractData';
import ContractInteractionModal from './old/sections/ContractInteractionModal';
import type { Contract } from './types';

export default function DeployedContractsPage() {
  const {
    filteredContracts,
    favoritedContracts,
    searchQuery,
    setSearchQuery,
    activeFilters,
    allTags,
    toggleFilter,
    clearFilters,
    favoriteContracts,
    toggleFavorite,
    addContract,
  } = useContractData();

  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importAbiDialogOpen, setImportAbiDialogOpen] = useState(false);

  const openContractModal = (contract: Contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

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
        setSearchQuery={setSearchQuery}
        onImportClick={() => setImportAbiDialogOpen(true)}
      />

      <FilterTags
        allTags={allTags}
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        clearFilters={clearFilters}
      />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ContractList
            contracts={filteredContracts}
            favoriteContracts={favoriteContracts}
            toggleFavorite={toggleFavorite}
            openContractModal={openContractModal}
            type="all"
            hasFilters={searchQuery !== '' || activeFilters.length > 0}
          />
        </TabsContent>

        <TabsContent value="favorites">
          <ContractList
            contracts={favoritedContracts}
            favoriteContracts={favoriteContracts}
            toggleFavorite={toggleFavorite}
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
          abi={selectedContract.abi}
          address={selectedContract.address}
          name={selectedContract.name}
        />
      )}

      <ImportContractDialog
        open={importAbiDialogOpen}
        onOpenChange={setImportAbiDialogOpen}
        onImport={addContract}
      />
    </div>
  );
}
