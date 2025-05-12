'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import type { ContractConfig } from '../../../types';
import { COMMON_TAGS } from '../../../types';

interface ContractMetadataProps {
  contractConfig: ContractConfig;
  setContractConfig: (config: ContractConfig) => void;
  className?: string;
}

export const ContractMetadata = ({
  contractConfig,
  setContractConfig,
  className = '',
}: ContractMetadataProps) => {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (!newTag.trim()) return;

    // Don't add duplicate tags
    if (contractConfig.tags?.includes(newTag.trim().toLowerCase())) return;

    setContractConfig({
      ...contractConfig,
      tags: [...(contractConfig.tags || []), newTag.trim().toLowerCase()],
    });
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setContractConfig({
      ...contractConfig,
      tags: contractConfig.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="description">Contract Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the purpose of your contract..."
          value={contractConfig.description || ''}
          onChange={(e) => setContractConfig({ ...contractConfig, description: e.target.value })}
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="mb-2 flex flex-wrap gap-2">
          {contractConfig.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:bg-muted ml-1 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag} tag</span>
              </button>
            </Badge>
          ))}
          {!contractConfig.tags?.length && (
            <span className="text-muted-foreground text-sm">No tags added yet</span>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" size="sm" onClick={addTag} disabled={!newTag.trim()}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="mt-2">
          <Label className="text-sm">Suggested Tags</Label>
          <div className="mt-1 flex flex-wrap gap-1">
            {COMMON_TAGS.filter((tag) => !contractConfig.tags?.includes(tag)).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="hover:bg-secondary cursor-pointer"
                onClick={() => {
                  setContractConfig({
                    ...contractConfig,
                    tags: [...(contractConfig.tags || []), tag],
                  });
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
