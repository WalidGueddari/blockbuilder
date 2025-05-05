'use client';

import { useMemo, useState } from 'react';

import ContractInteractionModal from './sections/ContractInteractionModal';
import ContractListItem from './sections/ContractListItem';

export default function DeployedContractsPage() {
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openContractModal = (contract: any) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const mockDeployedContracts = useMemo(
    () => [
      {
        id: '1',
        name: 'BlockToken',
        type: 'ERC20',
        address: '0x42AefF2F987dc0b23BbFa5dE1B58Cb2b43bD9273',
        description: 'A standard ERC20 token for fast and secure value transfer.',
        abi: [
          {
            inputs: [],
            name: 'name',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'symbol',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'totalSupply',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'address', name: 'to', type: 'address' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            name: 'mint',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'address', name: 'to', type: 'address' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            name: 'transfer',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
      },
      /*       {
        id: "2",
        name: "RareCollectible",
        type: "ERC721",
        address: "0x8f23b987D135c29aA29cE2456fD6d01d72eF4f80",
        description: "A limited edition NFT series representing rare digital artwork.",
        abi: [
          {
            inputs: [],
            name: "name",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "symbol",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "to", type: "address" },
              { internalType: "string", name: "uri", type: "string" },
            ],
            name: "safeMint",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
            name: "tokenURI",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
          },
        ],
      }, */
    ],
    [],
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Deployed Smart Contracts</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Interact with your deployed smart contracts on the blockchain. Choose your experience
          level below.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockDeployedContracts.map((contract) => (
          <ContractListItem
            key={contract.id}
            name={contract.name}
            type={contract.type}
            address={contract.address}
            description={contract.description}
            onInteract={() => openContractModal(contract)}
          />
        ))}
      </div>

      <ContractInteractionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        abi={selectedContract?.abi}
        address={selectedContract?.address}
        name={selectedContract?.name}
      />
    </div>
  );
}
