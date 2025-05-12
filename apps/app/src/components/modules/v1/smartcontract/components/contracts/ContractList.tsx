'use client';

import ContractListItem from '../../old/sections/ContractListItem';
import type { Contract } from '../../types';
import { EmptyState } from './EmptyState';

interface ContractListProps {
  contracts: Contract[];
  favoriteContracts: string[];
  toggleFavorite: (contractId: string) => void;
  openContractModal: (contract: Contract) => void;
  type: 'all' | 'favorites';
  hasFilters: boolean;
}

export const ContractList = ({
  contracts,
  favoriteContracts,
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
          status={contract.status}
          accounts={contract.accounts}
          tags={contract.tags}
          onInteract={() => openContractModal(contract)}
          onToggleFavorite={() => toggleFavorite(contract.id)}
          isFavorite={favoriteContracts.includes(contract.id)}
        />
      ))}
    </div>
  );
};
