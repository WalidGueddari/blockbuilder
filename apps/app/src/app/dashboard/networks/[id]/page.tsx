'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Activity, Power, Server, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

type Node = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  type: string;
  createdAt: Date;
  logs: Log[];
};

type Log = {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: Date;
};

export default function NetworkDetailPage() {
  const params = useParams();
  const networkId = params.id;

  const [nodes, setNodes] = useState<Node[]>([
    {
      id: '1',
      name: 'Node 1',
      status: 'active',
      type: 'Compute',
      createdAt: new Date(),
      logs: [
        {
          id: '1',
          message: 'Node started successfully',
          type: 'info',
          timestamp: new Date(),
        },
        {
          id: '2',
          message: 'High memory usage detected',
          type: 'warning',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        },
      ],
    },
    {
      id: '2',
      name: 'Node 2',
      status: 'active',
      type: 'Storage',
      createdAt: new Date(),
      logs: [
        {
          id: '3',
          message: 'Connection failed',
          type: 'error',
          timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        },
        {
          id: '4',
          message: 'Connection restored',
          type: 'info',
          timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
        },
      ],
    },
  ]);

  const [newNode, setNewNode] = useState({ name: '', type: '' });

  const handleCreateNode = () => {
    const node: Node = {
      id: Math.random().toString(36).substr(2, 9),
      name: newNode.name,
      type: newNode.type,
      status: 'inactive',
      createdAt: new Date(),
      logs: [],
    };
    setNodes([...nodes, node]);
    setNewNode({ name: '', type: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-bold tracking-tighter text-transparent">
            Network Details
          </h1>
          <p className="mt-2 text-gray-400">Manage your network nodes and monitor their activity</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 text-white hover:bg-blue-600">Add Node</Button>
          </DialogTrigger>
          <DialogContent className="border-gray-800 bg-black/80 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Node</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Node Name
                </Label>
                <Input
                  id="name"
                  value={newNode.name}
                  onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                  className="border-gray-800 bg-gray-900/50 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-300">
                  Node Type
                </Label>
                <Input
                  id="type"
                  value={newNode.type}
                  onChange={(e) => setNewNode({ ...newNode, type: e.target.value })}
                  className="border-gray-800 bg-gray-900/50 text-gray-100"
                />
              </div>
              <Button
                onClick={handleCreateNode}
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
              >
                Add Node
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {nodes.map((node) => (
          <Card key={node.id} className="border-gray-800 bg-black/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <Server
                  className={cn(
                    'h-4 w-4',
                    node.status === 'active' ? 'text-green-500' : 'text-gray-500',
                  )}
                />
                {node.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:bg-green-500/20 hover:text-green-500"
                >
                  <Power className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:bg-red-500/20 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div>Type: {node.type}</div>
                <div>Created: {node.createdAt.toLocaleDateString()}</div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="logs" className="border-gray-800">
                  <AccordionTrigger className="text-gray-300 hover:text-white hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Node Logs
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {node.logs.length === 0 ? (
                        <div className="py-4 text-center text-sm text-gray-500">
                          No logs available for this node
                        </div>
                      ) : (
                        node.logs.map((log) => (
                          <Alert
                            key={log.id}
                            className={cn(
                              'border-l-4 bg-black/40 backdrop-blur-sm',
                              log.type === 'info' && 'border-l-blue-500',
                              log.type === 'warning' && 'border-l-yellow-500',
                              log.type === 'error' && 'border-l-red-500',
                            )}
                          >
                            <AlertDescription className="flex items-center justify-between text-gray-300">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs uppercase',
                                    log.type === 'info' && 'border-blue-500 text-blue-500',
                                    log.type === 'warning' && 'border-yellow-500 text-yellow-500',
                                    log.type === 'error' && 'border-red-500 text-red-500',
                                  )}
                                >
                                  {log.type}
                                </Badge>
                                <span>{log.message}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {log.timestamp.toLocaleTimeString()}
                              </span>
                            </AlertDescription>
                          </Alert>
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
