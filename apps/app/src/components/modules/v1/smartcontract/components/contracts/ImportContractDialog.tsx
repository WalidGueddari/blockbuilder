'use client';

import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

import type { Contract } from '../../types';

interface ImportContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (contract: Contract) => void;
}

export const ImportContractDialog = ({
  open,
  onOpenChange,
  onImport,
}: ImportContractDialogProps) => {
  const { toast } = useToast();
  const [importAddress, setImportAddress] = useState('');
  const [importAbi, setImportAbi] = useState('');
  const [importName, setImportName] = useState('');

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

      // Create the new contract object
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

      // Call the onImport callback
      onImport(newContract);

      // Reset form and close dialog
      setImportAddress('');
      setImportAbi('');
      setImportName('');
      onOpenChange(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImportContract}>Import Contract</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
