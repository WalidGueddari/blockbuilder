'use client';

import { useEffect, useState } from 'react';

// This is a mock function. Replace it with your actual API call.
async function fetchNameById(type: 'network' | 'node', id: string): Promise<string> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100));
  return type === 'network' ? `Network ${id.slice(0, 5)}` : `Node ${id.slice(0, 5)}`;
}

export function useNetworkAndNodeNames(networkId: string | null, nodeId: string | null) {
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [nodeName, setNodeName] = useState<string | null>(null);

  useEffect(() => {
    if (networkId) {
      fetchNameById('network', networkId).then(setNetworkName);
    }
    if (nodeId) {
      fetchNameById('node', nodeId).then(setNodeName);
    }
  }, [networkId, nodeId]);

  return { networkName, nodeName };
}
