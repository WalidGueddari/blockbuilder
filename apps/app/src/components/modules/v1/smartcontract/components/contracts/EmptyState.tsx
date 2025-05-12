'use client';

import { Search, Star } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'favorites' | 'all';
  hasFilters: boolean;
}

export const EmptyState = ({ type, hasFilters }: EmptyStateProps) => {
  let icon = <Search className="h-6 w-6" />;
  let title = 'No contracts found';
  let description = 'Try adjusting your search or filters';

  if (type === 'favorites') {
    icon = <Star className="h-6 w-6" />;
    title = 'No favorite contracts';
    description = 'Pin your most used contracts for quick access';
  } else if (type === 'all' && !hasFilters) {
    description = 'Deploy your first contract to get started';
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-muted-foreground bg-muted mb-4 rounded-full p-3">{icon}</div>
      <h3 className="mb-2 text-xl font-medium">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </div>
  );
};
