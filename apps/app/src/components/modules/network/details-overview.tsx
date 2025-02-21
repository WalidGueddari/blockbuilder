'use client';

import { NodeCard, NodeTable } from '@/components/modules/network/pages';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import {
  fetchNodesByNetworkId,
  selectNodeError,
  selectNodeLoading,
  selectNodes,
} from '@/services/v1/nodeSlice';
import { type NetworkDetailsProps } from '@/types/v1/network';
import { Node } from '@/types/v1/node';
import { Activity, Server, Wifi } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

const NetworkDetails: React.FC<NetworkDetailsProps> = ({ networkId }) => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  console.log('nodes:', nodes);
  const loading = useAppSelector(selectNodeLoading);
  const error = useAppSelector(selectNodeError);
  const [view, setView] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    if (networkId) {
      dispatch(fetchNodesByNetworkId(networkId));
    }
  }, [dispatch, networkId]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Activity className="animate-spin" />
      </div>
    );
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;
  if (!nodes || nodes.length === 0)
    return <div className="text-center text-gray-500">No nodes found.</div>;

  const activeNodes = nodes.filter((node) => node.status === 'active').length;
  console.log('activeNodes:', activeNodes);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Network Overview</CardTitle>
          <CardDescription>Network: {nodes[0].network.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Server className="text-primary" size={24} />
              <div>
                <p className="text-sm font-medium">Total Nodes</p>
                <p className="text-2xl font-bold">{nodes.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Wifi className="text-green-500" size={24} />
              <div>
                <p className="text-sm font-medium">Active Nodes</p>
                <p className="text-2xl font-bold">{nodes.length}</p>
              </div>
            </div>
            <Badge>
              {/* {activeNodes === nodes.length ? 'All Nodes Active' : 'Some Nodes Inactive'} */}
              All Nodes Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs value={view} onValueChange={(value) => setView(value as 'grid' | 'table')}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Network Nodes</h2>
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nodes.map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <NodeTable nodes={nodes} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkDetails;
