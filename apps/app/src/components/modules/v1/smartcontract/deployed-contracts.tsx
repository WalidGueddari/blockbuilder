'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Filter, Plus, Search, Star, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import ContractInteractionModal from './sections/ContractInteractionModal';
import ContractListItem from './sections/ContractListItem';

interface ContractStatus {
  successCount: number;
  failureCount: number;
  lastInteraction: string;
}

interface ContractAccount {
  role: string;
  address: string;
}

interface Contract {
  id: string;
  name: string;
  type: string;
  address: string;
  description?: string;
  status?: ContractStatus;
  accounts?: ContractAccount[];
  tags?: string[];
  abi: any[];
  isFavorite?: boolean;
}

export default function DeployedContractsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [importAbiDialogOpen, setImportAbiDialogOpen] = useState(false);
  const [importAddress, setImportAddress] = useState('');
  const [importAbi, setImportAbi] = useState('');
  const [importName, setImportName] = useState('');
  const [favoriteContracts, setFavoriteContracts] = useState<string[]>([]);

  const openContractModal = (contract: Contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const toggleFavorite = (contractId: string) => {
    setFavoriteContracts((prev) => {
      if (prev.includes(contractId)) {
        return prev.filter((id) => id !== contractId);
      } else {
        return [...prev, contractId];
      }
    });
  };

  const handleImportContract = () => {
    try {
      // Validate inputs
      if (!importAddress || !importAbi || !importName) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all fields to import a contract',
          variant: 'destructive',
        });
        return;
      }

      // Validate ABI JSON
      let parsedAbi;
      try {
        parsedAbi = JSON.parse(importAbi);
      } catch (e) {
        toast({
          title: 'Invalid ABI',
          description: 'The ABI is not valid JSON',
          variant: 'destructive',
        });
        return;
      }

      // Add the imported contract to the list
      const newContract: Contract = {
        id: `imported-${Date.now()}`,
        name: importName,
        type: 'Imported',
        address: importAddress,
        description: 'Manually imported contract',
        abi: parsedAbi,
        tags: ['imported'],
        status: {
          successCount: 0,
          failureCount: 0,
          lastInteraction: '',
        },
      };

      setMockDeployedContracts((prev) => [...prev, newContract]);

      // Reset form and close dialog
      setImportAddress('');
      setImportAbi('');
      setImportName('');
      setImportAbiDialogOpen(false);

      toast({
        title: 'Contract Imported',
        description: `Successfully imported ${importName}`,
      });
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'There was an error importing the contract',
        variant: 'destructive',
      });
    }
  };

  const [mockDeployedContracts, setMockDeployedContracts] = useState<Contract[]>([
    {
      id: '1',
      name: 'BlockToken',
      type: 'ERC20',
      address: '0x42AefF2F987dc0b23BbFa5dE1B58Cb2b43bD9273',
      description: 'A standard ERC20 token for fast and secure value transfer.',
      status: {
        successCount: 12,
        failureCount: 2,
        lastInteraction: '2 hours ago',
      },
      accounts: [
        { role: 'Owner', address: '0x1234567890abcdef1234567890abcdef12345678' },
        { role: 'Minter', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
      ],
      tags: ['token', 'mainnet'],
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
    {
      id: '2',
      name: 'RareCollectible',
      type: 'ERC721',
      address: '0x8f23b987D135c29aA29cE2456fD6d01d72eF4f80',
      description: 'A limited edition NFT series representing rare digital artwork.',
      status: {
        successCount: 5,
        failureCount: 0,
        lastInteraction: '1 day ago',
      },
      accounts: [{ role: 'Creator', address: '0x1234567890abcdef1234567890abcdef12345678' }],
      tags: ['nft', 'art', 'testnet'],
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
          inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'string', name: 'uri', type: 'string' },
          ],
          name: 'safeMint',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
          name: 'tokenURI',
          outputs: [{ internalType: 'string', name: '', type: 'string' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
    },
    {
      id: '3',
      name: 'MultiAssetToken',
      type: 'ERC1155',
      address: '0x3a4B7aB9BDFBD17F5E6B441E34e8123bBD52714A',
      description: 'A multi-asset token for gaming items and collectibles.',
      status: {
        successCount: 8,
        failureCount: 1,
        lastInteraction: '3 days ago',
      },
      tags: ['gaming', 'multi-token', 'testnet'],
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
          name: 'uri',
          outputs: [{ internalType: 'string', name: '', type: 'string' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'id', type: 'uint256' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'bytes', name: 'data', type: 'bytes' },
          ],
          name: 'mint',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
    },
  ]);

  // Get all unique tags from contracts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    mockDeployedContracts.forEach((contract) => {
      contract.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [mockDeployedContracts]);

  // Filter contracts based on search query and active filters
  const filteredContracts = useMemo(() => {
    return mockDeployedContracts.filter((contract) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === '' ||
        contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.type.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by active tags
      const matchesFilters =
        activeFilters.length === 0 ||
        (contract.tags && contract.tags.some((tag) => activeFilters.includes(tag)));

      return matchesSearch && matchesFilters;
    });
  }, [mockDeployedContracts, searchQuery, activeFilters]);

  // Get favorite contracts
  const favoritedContracts = useMemo(() => {
    return filteredContracts.filter((contract) => favoriteContracts.includes(contract.id));
  }, [filteredContracts, favoriteContracts]);

  // Toggle a filter
  const toggleFilter = (tag: string) => {
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Deployed Smart Contracts</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Interact with your deployed smart contracts on the blockchain.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search by name, address, or type..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Dialog open={importAbiDialogOpen} onOpenChange={setImportAbiDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                <span>Import Contract</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import External Contract</DialogTitle>
                <DialogDescription>
                  Add a contract that wasn't deployed through this interface
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="contract-name">Contract Name</Label>
                  <Input
                    id="contract-name"
                    placeholder="My External Contract"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contract-address">Contract Address</Label>
                  <Input
                    id="contract-address"
                    placeholder="0x..."
                    value={importAddress}
                    onChange={(e) => setImportAddress(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contract-abi">Contract ABI (JSON)</Label>
                  <Textarea
                    id="contract-abi"
                    placeholder="[{...}]"
                    className="min-h-[100px]"
                    value={importAbi}
                    onChange={(e) => setImportAbi(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportAbiDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImportContract}>Import Contract</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="default"
            className="gap-2"
            onClick={() => router.push('/create-smartcontract')}
          >
            <Plus className="h-4 w-4" />
            <span>Create New</span>
          </Button>
        </div>
      </div>

      {/* Filter tags */}
      {allTags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="text-muted-foreground h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={activeFilters.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleFilter(tag)}
              >
                {activeFilters.includes(tag) && <X className="mr-1 h-3 w-3" />}
                {tag}
              </Badge>
            ))}
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setActiveFilters([])}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {filteredContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground bg-muted mb-4 rounded-full p-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-medium">No contracts found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery || activeFilters.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Deploy your first contract to get started'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredContracts.map((contract) => (
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
          )}
        </TabsContent>

        <TabsContent value="favorites">
          {favoritedContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground bg-muted mb-4 rounded-full p-3">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-medium">No favorite contracts</h3>
              <p className="text-muted-foreground text-center">
                Pin your most used contracts for quick access
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favoritedContracts.map((contract) => (
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
                  isFavorite={true}
                />
              ))}
            </div>
          )}
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
    </div>
  );
}
