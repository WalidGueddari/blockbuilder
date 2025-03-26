'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import useWebSocket from '@/hooks/useWebSocket';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { setCurrentServerId } from '@/services/v1/nodeSlice';
import { clearMessages } from '@/services/v1/websocketSlice';
import type { Node } from '@/types/v1/node';
import { Activity, ChevronRight, Wifi } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect } from 'react';

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

  const statusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') return 'bg-green-500';
    if (statusLower === 'inactive') return 'bg-amber-500';
    if (statusLower === 'error') return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <Card className="overflow-hidden border-none shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="from-muted/80 to-muted/30 bg-gradient-to-r pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{node.name}</CardTitle>
          <Badge className={`${statusColor(nodeStatus || node.status)} shadow-sm`}>
            {nodeStatus || node.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
              <Wifi className="text-primary h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">IP Address</p>
              <p className="font-medium">{node.nodeIp}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
              <Activity className="text-primary h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">HTTP Port</p>
              <p className="font-medium">{node.rpcHttpPort}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 pt-4">
        <Button
          onClick={handleViewLogs}
          variant="default"
          className="w-full transition-all duration-200 hover:shadow-md"
        >
          View Node Logs
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NodeCard;
