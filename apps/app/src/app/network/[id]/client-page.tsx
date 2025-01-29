'use client';

import { NetworkDetailsOverview } from '@/components/modules/network';
import { useParams } from 'next/navigation';
import React from 'react';

const ClientPage = () => {
  const params = useParams();
  const networkId = params.id as string;

  return (
    <>
      {networkId ? (
        <NetworkDetailsOverview networkId={networkId} />
      ) : (
        <div>Loading or invalid network ID...</div>
      )}
    </>
  );
};

export default ClientPage;
