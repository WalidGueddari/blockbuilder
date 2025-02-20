import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Node } from '@/types/v1/node';
import type React from 'react';

interface NodeTableProps {
  nodes: Node[];
}

const NodeTable: React.FC<NodeTableProps> = ({ nodes }) => {
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((node) => (
          <TableRow key={node.id}>
            <TableCell className="font-medium">{node.name}</TableCell>
            <TableCell>
              <Badge>{node.status}</Badge>
            </TableCell>
            <TableCell>{node.nodeIp}</TableCell>
            <TableCell>{node.p2pPort}</TableCell>
            <TableCell>{node.rpcHttpPort}</TableCell>
            <TableCell>{node.rpcWsPort}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default NodeTable;
