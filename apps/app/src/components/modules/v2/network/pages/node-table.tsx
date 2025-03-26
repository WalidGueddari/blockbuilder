'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppDispatch } from '@/services/hooks';
import { setCurrentServerId } from '@/services/v1/nodeSlice';
import type { Node } from '@/types/v1/node';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';

interface NodeTableProps {
  nodes: Node[];
}

const NodeTable: React.FC<NodeTableProps> = ({ nodes }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleViewLogs = (node: Node) => {
    dispatch(setCurrentServerId(node.network.serverId));
    router.push(`/network/${node.networkId}/node/${node.container}`);
  };

  const statusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') return 'bg-green-500';
    if (statusLower === 'inactive') return 'bg-amber-500';
    if (statusLower === 'error') return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>IP</TableHead>
          <TableHead>P2P Port</TableHead>
          <TableHead>RPC HTTP Port</TableHead>
          <TableHead>RPC WS Port</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((node) => (
          <TableRow key={node.id}>
            <TableCell className="font-medium">{node.name}</TableCell>
            <TableCell>
              <Badge className={statusColor(node.status)}>{node.status}</Badge>
            </TableCell>
            <TableCell>{node.nodeIp}</TableCell>
            <TableCell>{node.p2pPort}</TableCell>
            <TableCell>{node.rpcHttpPort}</TableCell>
            <TableCell>{node.rpcWsPort}</TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm" onClick={() => handleViewLogs(node)}>
                View Logs
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default NodeTable;
