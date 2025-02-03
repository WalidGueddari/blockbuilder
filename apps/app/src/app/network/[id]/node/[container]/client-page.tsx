'use client';

import { LogsViewer } from '@/components/modules/logs';
import { useParams } from 'next/navigation';
import React from 'react';

const ClientPage = () => {
  const params = useParams();
  const networkId = params.id as string;
  const container = params.container as string;

  return (
    <>
      {networkId ? (
        <div className="flex h-full items-center justify-center">
          <LogsViewer networkId={networkId} container={container} />
        </div>
      ) : (
        <div>Loading ...</div>
      )}
    </>
  );
};

export default ClientPage;
