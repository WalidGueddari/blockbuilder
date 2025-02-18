// NodeCard.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch } from '@/services/hooks';
import { setCurrentServerId } from '@/services/nodeSlice';
import type { Node } from '@/types/node';
import { Activity, Server, Wifi } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';

interface NodeCardProps {
  node: Node;
}

const NodeCard: React.FC<NodeCardProps> = ({ node }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleViewLogs = () => {
    // Dispatch the serverId from the nested network object
    dispatch(setCurrentServerId(node.network.serverId));
    // Navigate to the logs page
    router.push(`/network/${node.networkId}/node/${node.container}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{node.name}</span>
          <Badge>{node.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Server className="text-primary" size={16} />
            <span className="text-sm">ID: {node.id.slice(0, 8)}...</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wifi className="text-primary" size={16} />
            <span className="text-sm">IP: {node.nodeIp}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="text-primary" size={16} />
            <span className="text-sm">P2P Port: {node.p2pPort}</span>
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
