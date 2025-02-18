// ClientPage.tsx
'use client';

import { LogsViewer } from '@/components/modules/logs';
import { useAppSelector } from '@/services/hooks';
import { selectCurrentServerId } from '@/services/nodeSlice';
import { useParams } from 'next/navigation';
import React from 'react';

// ClientPage.tsx

const ClientPage = () => {
  const params = useParams();
  const networkId = params.id as string;
  const container = params.container as string;
  const currentServerId = useAppSelector(selectCurrentServerId);

  if (!networkId || !currentServerId) {
    return <div>Loading ...</div>;
  }

  return (
    <div className="flex h-full items-center justify-center">
      <LogsViewer networkId={networkId} container={container} vmId={currentServerId} />
    </div>
  );
};

export default ClientPage;
