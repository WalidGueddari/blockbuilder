'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

import { useContractImport } from '../../hooks/useContractImport';
import type { Contract } from '../../types';
import { NetworkSelect } from '../contract/deployment/NetworkSelect';

interface ImportContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (contract: Contract) => void;
  networkId: string;
  networks: any[];
  networksLoading: boolean;
  setSelectedNetworkId: (value: string) => void;
}

const CONTRACT_TYPES = [
  'ERC20',
  'ERC721',
  'ERC1155',
  'Stablecoin',
  'RWA',
  'Governor',
  'Custom',
  'Imported',
] as const;

export const ImportContractDialog = ({
  open,
  onOpenChange,
  onImport,
  networkId,
  networks,
  networksLoading,
  setSelectedNetworkId,
}: ImportContractDialogProps) => {
  const {
    isLoading,
    formData,
    newTag,
    setNewTag,
    updateFormData,
    updateConfig,
    addTag,
    removeTag,
    resetForm,
    importContract,
  } = useContractImport({
    networkId,
    onImport: (contract) => {
      onImport(contract);
      onOpenChange(false);
    },
  });

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    updateFormData('name', name);
    // Auto-generate symbol from name
    updateConfig('symbol', name.toUpperCase().replace(/\s+/g, ''));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NetworkSelect
              selectedNetworkId={networkId}
              setSelectedNetworkId={setSelectedNetworkId}
              networks={networks}
              networksLoading={networksLoading}
            />
          </DialogTitle>
          <DialogDescription>
            Add a contract that wasn't deployed through this interface
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="abi" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="abi">Import with ABI</TabsTrigger>
            <TabsTrigger value="code">Import with Code</TabsTrigger>
          </TabsList>
          <TabsContent value="abi">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="contract-name">Contract Name</Label>
                <Input
                  id="contract-name"
                  placeholder="My External Contract"
                  value={formData.name}
                  onChange={handleNameChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contract-symbol">Contract Symbol</Label>
                <Input
                  id="contract-symbol"
                  placeholder="MEC"
                  value={formData.config.symbol}
                  onChange={(e) => updateConfig('symbol', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contract-address">Contract Address</Label>
                <Input
                  id="contract-address"
                  placeholder="0x..."
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contract-type">Contract Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    updateFormData('type', value);
                    updateConfig('contractType', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contract-description">Description</Label>
                <Textarea
                  id="contract-description"
                  placeholder="Describe your contract..."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button type="button" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        className="hover:text-destructive ml-1"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contract-abi">Contract ABI (JSON)</Label>
                <Textarea
                  id="contract-abi"
                  placeholder="[{...}]"
                  className="min-h-[100px]"
                  value={formData.abi}
                  onChange={(e) => updateFormData('abi', e.target.value)}
                />
              </div>
              <div className="grid gap-4">
                <Label>Contract Features</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mintable"
                      checked={formData.config.mintable}
                      onCheckedChange={(checked) => updateConfig('mintable', checked)}
                    />
                    <Label htmlFor="mintable">Mintable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="burnable"
                      checked={formData.config.burnable}
                      onCheckedChange={(checked) => updateConfig('burnable', checked)}
                    />
                    <Label htmlFor="burnable">Burnable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pausable"
                      checked={formData.config.pausable}
                      onCheckedChange={(checked) => updateConfig('pausable', checked)}
                    />
                    <Label htmlFor="pausable">Pausable</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={() => importContract('abi')} disabled={isLoading}>
                {isLoading ? 'Importing...' : 'Import Contract'}
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="code">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="contract-name-code">Contract Name</Label>
                <Input
                  id="contract-name-code"
                  placeholder="My External Contract"
                  value={formData.name}
                  onChange={handleNameChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contract-symbol-code">Contract Symbol</Label>
                <Input
                  id="contract-symbol-code"
                  placeholder="MEC"
                  value={formData.config.symbol}
                  onChange={(e) => updateConfig('symbol', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contract-address-code">Contract Address</Label>
                <Input
                  id="contract-address-code"
                  placeholder="0x..."
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contract-type-code">Contract Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    updateFormData('type', value);
                    updateConfig('contractType', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contract-description-code">Description</Label>
                <Textarea
                  id="contract-description-code"
                  placeholder="Describe your contract..."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button type="button" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        className="hover:text-destructive ml-1"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contract-code">Contract Source Code</Label>
                <Textarea
                  id="contract-code"
                  placeholder="// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract MyContract { ... }"
                  className="min-h-[200px] font-mono"
                  value={formData.code}
                  onChange={(e) => updateFormData('code', e.target.value)}
                />
              </div>
              <div className="grid gap-4">
                <Label>Contract Features</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mintable-code"
                      checked={formData.config.mintable}
                      onCheckedChange={(checked) => updateConfig('mintable', checked)}
                    />
                    <Label htmlFor="mintable-code">Mintable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="burnable-code"
                      checked={formData.config.burnable}
                      onCheckedChange={(checked) => updateConfig('burnable', checked)}
                    />
                    <Label htmlFor="burnable-code">Burnable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pausable-code"
                      checked={formData.config.pausable}
                      onCheckedChange={(checked) => updateConfig('pausable', checked)}
                    />
                    <Label htmlFor="pausable-code">Pausable</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={() => importContract('code')} disabled={isLoading}>
                {isLoading ? 'Importing...' : 'Import Contract'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
