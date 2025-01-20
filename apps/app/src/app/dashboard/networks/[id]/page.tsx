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
import { useAppDispatch } from '@/services/hooks';
import { Node, fetchNetworkNodes, selectNodeLoading, selectNodes } from '@/services/nodeSlice';
import { Server } from 'lucide-react';
import { Activity } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function NetworkDetailPage() {
  const params = useParams();
  const networkId = params.id as string;
  const dispatch = useAppDispatch();

  const nodes = useSelector(selectNodes);
  const loading = useSelector(selectNodeLoading);

  useEffect(() => {
    const loadNodes = async () => {
      try {
        await dispatch(fetchNetworkNodes(networkId)).unwrap();
      } catch (error) {
        console.error('Failed to fetch nodes:', error);
      }
    };

    loadNodes();
  }, [dispatch, networkId]);

  const [newNode, setNewNode] = useState({ name: '', type: '' });

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
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card className="border-gray-800 bg-black/40 backdrop-blur-xl">
            <CardContent className="flex items-center justify-center py-8">
              Loading nodes...
            </CardContent>
          </Card>
        ) : (
          nodes.map((node) => (
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div>Status: {node.status}</div>
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
                        <Alert className="border-l-4 border-l-blue-500 bg-black/40 backdrop-blur-sm">
                          <AlertDescription className="flex items-center justify-between text-gray-300">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="border-blue-500 text-xs uppercase text-blue-500"
                              >
                                info
                              </Badge>
                              <span>Node started successfully</span>
                            </div>
                            <span className="text-sm text-gray-500">12:00 PM</span>
                          </AlertDescription>
                        </Alert>
                        <Alert className="border-l-4 border-l-yellow-500 bg-black/40 backdrop-blur-sm">
                          <AlertDescription className="flex items-center justify-between text-gray-300">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="border-yellow-500 text-xs uppercase text-yellow-500"
                              >
                                warning
                              </Badge>
                              <span>High memory usage detected</span>
                            </div>
                            <span className="text-sm text-gray-500">11:55 AM</span>
                          </AlertDescription>
                        </Alert>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
