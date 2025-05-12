'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onImportClick: () => void;
}

export const SearchBar = ({ searchQuery, setSearchQuery, onImportClick }: SearchBarProps) => {
  const router = useRouter();

  return (
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
        <Button variant="outline" className="gap-2" onClick={onImportClick}>
          <Upload className="h-4 w-4" />
          <span>Import Contract</span>
        </Button>

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
  );
};
