'use client';

import { Button } from '@/components/ui/button';
import useWebSocket from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { setCurrentServerId } from '@/services/v1/nodeSlice';
import { clearMessages } from '@/services/v1/websocketSlice';
import type { Node } from '@/types/v1/node';
import { Activity, ChevronRight, Server, Wifi } from 'lucide-react';
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

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';

    if (statusLower === 'active') return 'bg-primary text-success-foreground';
    if (statusLower === 'inactive') return 'bg-warning text-warning-foreground';
    if (statusLower === 'error') return 'bg-destructive text-destructive-foreground';
    return 'bg-info text-info-foreground';
  };

  return (
    <div className="border-border bg-card text-card-foreground w-full overflow-hidden rounded-xl border">
      <div className="space-y-4 p-4">
        {/* Node Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-accent/10 rounded-full p-2">
              <Server className="text-accent h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Node</p>
              <div className="flex items-center">
                <p className="text-foreground font-medium">{node.name}</p>
              </div>
            </div>
          </div>
          <div
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium',
              getStatusColor(nodeStatus || node.status),
            )}
          >
            {nodeStatus || node.status}
          </div>
        </div>

        {/* Divider */}
        <div className="border-border/50 border-t" />

        {/* Node Details */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
              <Wifi className="text-primary h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">HTTP Port</p>
              <p className="font-medium">{node.rpcHttpPort}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
              <Activity className="text-primary h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Websocket Port</p>
              <p className="font-medium">{node.rpcWsPort}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-border/50 border-t" />

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">View Details:</p>
          <Button
            onClick={handleViewLogs}
            variant="outline"
            size="sm"
            className="bg-muted border-border hover:bg-muted/80 text-muted-foreground"
          >
            View Logs
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NodeCard;
