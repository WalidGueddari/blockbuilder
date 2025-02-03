import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Node } from '@/types/node';
import { Activity, Server, Wifi } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

interface NodeCardProps {
  node: Node;
}

const NodeCard: React.FC<NodeCardProps> = ({ node }) => {
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
      <CardFooter className="">
        <Link href={`/network/${node.networkId}/node/${node.container}`} passHref>
          <Button variant="outline" className="w-full">
            View Node Logs
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default NodeCard;
