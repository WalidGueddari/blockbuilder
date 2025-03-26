// NodeCard.tsx (using updated Redux status)
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import useWebSocket from '@/hooks/useWebSocket';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { setCurrentServerId } from '@/services/v1/nodeSlice';
import { clearMessages } from '@/services/v1/websocketSlice';
import type { Node } from '@/types/v1/node';
import { Activity, Wifi } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// NodeCard.tsx (using updated Redux status)

// NodeCard.tsx (using updated Redux status)

interface NodeCardProps {
  node: Node;
}

const NodeCard: React.FC<NodeCardProps> = ({ node }) => {
  const dispatch = useAppDispatch();
  const { nodeStatus } = useAppSelector((state) => state.websocket);
  const router = useRouter();

  const mode = 'status';
  useWebSocket({ mode, nodeId: node.id });

  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const handleViewLogs = () => {
    dispatch(setCurrentServerId(node.network.serverId));
    router.push(`/network/${node.networkId}/node/${node.container}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{node.name}</span>
          <Badge className="cursor-pointer">{nodeStatus || node.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Wifi className="text-primary" size={16} />
            <span className="text-sm">IP: {node.nodeIp}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="text-primary" size={16} />
            <span className="text-sm">HTTP Port: {node.rpcHttpPort}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleViewLogs} variant="outline" className="w-full">
          View Node Logs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NodeCard;
