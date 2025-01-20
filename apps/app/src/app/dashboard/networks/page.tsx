'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { selectAuthState } from '@/services/authSlice';
import { useAppDispatch } from '@/services/hooks';
import {
  createNetwork,
  fetchNetworks,
  selectNetworkLoading,
  selectNetworks,
} from '@/services/networkSlice';
import { Globe, Server } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function NetworksPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const networks = useSelector(selectNetworks);
  const loading = useSelector(selectNetworkLoading);
  const { user } = useSelector(selectAuthState);

  const [newNetwork, setNewNetwork] = useState({
    name: '',
    description: '',
    nodeCount: 1,
    consensus: 'QBFT',
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadNetworks = async () => {
      if (user?.id) {
        try {
          await dispatch(fetchNetworks(user.id)).unwrap();
        } catch (error) {
          console.error('Failed to fetch networks:', error);
        }
      }
    };

    loadNetworks();
  }, [dispatch, user?.id]);

  const handleCreateNetwork = async () => {
    const userId = user?.id;
    if (!userId) {
      console.error('User ID is not available');
      return;
    }

    try {
      await dispatch(
        createNetwork({
          ...newNetwork,
          userId,
        }),
      ).unwrap();
      console.log('Network created successfully');
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to create network:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-bold tracking-tighter text-transparent">
            Your Networks
          </h1>
          <p className="mt-2 text-gray-400">Create and manage your network infrastructure</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 text-white hover:bg-blue-600">Create Network</Button>
          </DialogTrigger>
          <DialogContent className="border-gray-800 bg-black/80 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Network</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Network Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Production Network"
                  value={newNetwork.name}
                  onChange={(e) => setNewNetwork({ ...newNetwork, name: e.target.value })}
                  className="border-gray-800 bg-gray-900/50 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Network description"
                  value={newNetwork.description}
                  onChange={(e) => setNewNetwork({ ...newNetwork, description: e.target.value })}
                  className="border-gray-800 bg-gray-900/50 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nodesNumber" className="text-gray-300">
                  Number of Nodes
                </Label>
                <Input
                  id="nodesNumber"
                  type="number"
                  min={1}
                  max={4}
                  value={newNetwork.nodeCount}
                  onChange={(e) =>
                    setNewNetwork({ ...newNetwork, nodeCount: Number(e.target.value) })
                  }
                  className="border-gray-800 bg-gray-900/50 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consensus" className="text-gray-300">
                  Consensus Mechanism
                </Label>
                <Select
                  value={newNetwork.consensus}
                  onValueChange={(value) => setNewNetwork({ ...newNetwork, consensus: value })}
                >
                  <SelectTrigger className="border-gray-800 bg-gray-900/50 text-gray-100">
                    <SelectValue placeholder="Select consensus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QBFT">QBFT</SelectItem>
                    <SelectItem value="IBFT">IBFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateNetwork}
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? 'Creating Network...' : 'Create Network'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <Card className="col-span-full border-dashed border-gray-800 bg-black/40 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 text-gray-400">Loading networks...</div>
            </CardContent>
          </Card>
        ) : networks.length === 0 ? (
          <Card className="col-span-full border-dashed border-gray-800 bg-black/40 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Globe className="mb-4 h-12 w-12 text-gray-500" />
              <h3 className="mb-2 text-lg font-medium text-white">No networks yet</h3>
              <p className="mb-4 max-w-sm text-gray-400">
                Create your first network to start managing your infrastructure
              </p>
            </CardContent>
          </Card>
        ) : (
          networks.map((network) => (
            <Card
              key={network.id}
              className="cursor-pointer border-gray-800 bg-black/40 backdrop-blur-xl transition-all hover:scale-105 hover:bg-black/60"
              onClick={() => router.push(`/dashboard/networks/${network.id}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">{network.name}</CardTitle>
                <Globe
                  className={cn(
                    'h-4 w-4',
                    network.status === 'active' ? 'text-green-500' : 'text-gray-500',
                  )}
                />
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-400">{network.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Server className="h-4 w-4" />
                  <span>{network.nodeCount} Nodes</span>
                </div>
                <p className="text-sm text-gray-400">Consensus: {network.consensus}</p>
                <div className="text-xs text-gray-500">
                  Created {new Date(network.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
