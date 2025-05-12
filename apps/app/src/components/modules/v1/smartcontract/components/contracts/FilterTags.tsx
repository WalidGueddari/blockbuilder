'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface FilterTagsProps {
  allTags: string[];
  activeFilters: string[];
  toggleFilter: (tag: string) => void;
  clearFilters: () => void;
}

export const FilterTags = ({
  allTags,
  activeFilters,
  toggleFilter,
  clearFilters,
}: FilterTagsProps) => {
  if (allTags.length === 0) return null;

  return (
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
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
};
