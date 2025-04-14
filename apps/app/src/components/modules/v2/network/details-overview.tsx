'use client';

import {
  MetamaskIcon,
  NodeCard,
  Transactions,
  WalletCard,
} from '@/components/modules/v2/network/pages';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import {
  fetchNodesByNetworkId,
  selectNodeError,
  selectNodeLoading,
  selectNodes,
} from '@/services/v1/nodeSlice';
import { clearMessages } from '@/services/v1/websocketSlice';
import type { NetworkDetailsProps } from '@/types/v1/network';
import { Activity, ChevronRight, Globe, Server, Shield, Wifi } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

const NetworkDetails: React.FC<NetworkDetailsProps> = ({ networkId }) => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const loading = useAppSelector(selectNodeLoading);
  const nodeError = useAppSelector(selectNodeError);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPrivateKey, setShowPrivateKey] = useState<Record<string, boolean>>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Fetch nodes once on mount or when networkId changes
  useEffect(() => {
    if (networkId) {
      dispatch(fetchNodesByNetworkId(networkId));
      dispatch(clearMessages());
    }
  }, [networkId, dispatch]);

  const verifyAndShowPrivateKey = (walletId: string) => {
    // This is a mock verification - in a real app, you would verify against a backend
    if (verificationCode === '123456') {
      setShowPrivateKey((prev) => ({ ...prev, [walletId]: true }));
      setVerificationError('');
    } else {
      setVerificationError('Invalid verification code');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Activity className="text-primary animate-spin" />
      </div>
    );
  }

  if (nodeError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>Error: {nodeError}</AlertDescription>
      </Alert>
    );
  }

  if (!nodes || nodes.length === 0) {
    return (
      <Alert className="my-4">
        <AlertDescription>No nodes found for this network.</AlertDescription>
      </Alert>
    );
  }

  const activeNodes = nodes.filter((node) => node.status === 'ACTIVE').length;
  const networkName = nodes[0]?.network?.name || 'Unknown Network';
  const networkIp = nodes[0]?.network?.server?.publicIpAddress || 'Unknown IP';
  const networkDns = nodes[0]?.network?.server?.dnsName || 'Unknown DNS';
  const chainId = nodes[0]?.network?.chainId?.toString() || 'Unknown Chain ID';
  const wallets = nodes[0]?.network?.allocs || [];

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mb-6 overflow-hidden border-none shadow-md">
        <CardHeader className="from-primary/10 to-primary/5 bg-gradient-to-r pb-6">
          <div className="flex flex-col space-y-1">
            <CardTitle className="text-2xl font-bold">{networkName}</CardTitle>
            <CardDescription className="text-base">Blockchain Network</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="from-primary/10 to-primary/5 overflow-hidden border-none bg-gradient-to-br shadow-md transition-all duration-200 hover:shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Network Name
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Globe className="text-primary h-5 w-5" />
                  <span className="text-2xl font-bold">{networkName}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-md transition-all duration-200 hover:shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Public IP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold">{networkIp}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none bg-gradient-to-br from-purple-500/10 to-purple-500/5 shadow-md transition-all duration-200 hover:shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Chain ID
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl font-bold">{chainId}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-md transition-all duration-200 hover:shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Node Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-green-500" />
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">
                      {activeNodes}/{nodes.length}
                    </span>
                    <Badge
                      className="ml-2"
                      variant={activeNodes === nodes.length ? 'default' : 'outline'}
                    >
                      {activeNodes === nodes.length ? 'All Active' : 'Partially Active'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="col-span-1 lg:col-span-2 lg:row-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest activity on the network</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Transactions />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connect Wallet</CardTitle>
                <CardDescription>
                  Connect your MetaMask wallet to interact with this network
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
                <MetamaskIcon className="h-36 w-36 text-orange-500" />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-orange-500 text-white hover:bg-orange-600">
                      Connect MetaMask
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Network to MetaMask</DialogTitle>
                      <DialogDescription>
                        Use these details to add {networkName} to your MetaMask wallet
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex justify-center pb-2">
                        <MetamaskIcon className="h-36 w-36 text-orange-500" />
                      </div>
                      <div className="space-y-3 rounded-md border p-4">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-sm font-medium">Network Name:</div>
                          <div className="col-span-2 font-mono text-sm">{networkName}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-sm font-medium">RPC URL:</div>
                          <div className="col-span-2 break-all font-mono text-sm">{`https://${networkDns}`}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-sm font-medium">Chain ID:</div>
                          <div className="col-span-2 font-mono text-sm">{chainId}</div>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-orange-500 text-white hover:bg-orange-600"
                        disabled={false}
                        onClick={() => {
                          if (window.ethereum) {
                            window.ethereum
                              .request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                  {
                                    chainId: `0x${Number.parseInt(chainId).toString(16)}`,
                                    chainName: networkName,
                                    nativeCurrency: {
                                      name: `${networkName} Token`,
                                      symbol: 'ETH',
                                      decimals: 18,
                                    },
                                    rpcUrls: [`https://${networkDns}`],
                                    // blockExplorerUrls: nodes[0]?.network?.blockExplorerUrl
                                    //   ? [nodes[0].network.blockExplorerUrl]
                                    //   : null,
                                  },
                                ],
                              })
                              .catch((error) => {
                                console.error('Error adding network to MetaMask:', error);
                              });
                          } else {
                            window.open('https://metamask.io/download.html', '_blank');
                          }
                        }}
                      >
                        Add to MetaMask
                      </Button>
                      <p className="text-muted-foreground text-center text-xs">
                        Click the button above to automatically configure MetaMask for this network
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
                <p className="text-muted-foreground text-center text-xs">
                  Connect your wallet to view balances and send transactions on this network
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Health</CardTitle>
                <CardDescription>Current status and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Block Height</span>
                    <span className="font-mono text-sm">12,345,678</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Gas Price</span>
                    <span className="font-mono text-sm">25 Gwei</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Block Time</span>
                    <span className="font-mono text-sm">13.2s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Peers</span>
                    <span className="font-mono text-sm">{activeNodes} connected</span>
                  </div>
                </div>
                <div className="bg-muted rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Network is healthy</span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">Last checked: 2 minutes ago</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nodes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Nodes</CardTitle>
              <CardDescription>All nodes connected to {networkName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {nodes.map((node) => (
                  <NodeCard key={node.id} node={node} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Transactions processed on {networkName}</CardDescription>
            </CardHeader>
            <CardContent>
              <Transactions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Wallets</CardTitle>
              <CardDescription>Wallets associated with {networkName}</CardDescription>
            </CardHeader>
            <CardContent>
              <WalletCard wallets={wallets} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkDetails;
