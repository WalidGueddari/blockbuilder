'use client';

import type { DeployedContract } from '@/types/smartContract';

import ContractListItem from './ContractListItem';
import { EmptyState } from './EmptyState';

interface ContractListProps {
  contracts: DeployedContract[];
  toggleFavorite: (contractId: string) => Promise<void>;
  openContractModal: (contract: DeployedContract) => void;
  type: 'all' | 'favorites';
  hasFilters: boolean;
}

export const ContractList = ({
  contracts,
  toggleFavorite,
  openContractModal,
  type,
  hasFilters,
}: ContractListProps) => {
  if (contracts.length === 0) {
    return <EmptyState type={type} hasFilters={hasFilters} />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {contracts.map((contract) => (
        <ContractListItem
          key={contract.id}
          name={contract.name}
          type={contract.type}
          address={contract.address}
          description={contract.description}
          status={{
            successCount: 0,
            failureCount: 0,
            lastInteraction: contract.deployedAt,
          }}
          accounts={[]}
          tags={contract.tags}
          onInteract={() => openContractModal(contract)}
          onToggleFavorite={() => toggleFavorite(contract.id)}
          isFavorite={contract.favorites.length > 0}
        />
      ))}
    </div>
  );
};
