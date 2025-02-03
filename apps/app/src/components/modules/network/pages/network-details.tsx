'use client';

import { useAppDispatch, useAppSelector } from '@/services/hooks';
import {
  fetchNodesByNetworkId,
  selectNodeError,
  selectNodeLoading,
  selectNodes,
} from '@/services/nodeSlice';
import type { NetworkDetailsProps } from '@/types/network';
import type React from 'react';
import { useEffect } from 'react';

const NetworkDetails: React.FC<NetworkDetailsProps> = ({ networkId, Lnodes }) => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const loading = useAppSelector(selectNodeLoading);
  const error = useAppSelector(selectNodeError);

  useEffect(() => {
    const fetchNodes = async () => {
      if (networkId) {
        try {
          const response = await dispatch(fetchNodesByNetworkId(networkId)).unwrap();
          console.log('Nodes fetched successfully:', response.nodes); // Log nodes on successful fetch
        } catch (error) {
          console.error('Failed to fetch nodes:', error); // Log error if the fetch fails
        }
      }
    };

    fetchNodes();
  }, [dispatch, networkId]);

  console.log('Nodes:', nodes); // Log nodes to the console

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!nodes || nodes.length === 0) return <div>No nodes found.</div>;

  return (
    <div>
      <h1>Network Nodes</h1>
      <ul>
        {nodes.map((node) => (
          <li key={node.id}>
            {node.name} - {node.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NetworkDetails;
