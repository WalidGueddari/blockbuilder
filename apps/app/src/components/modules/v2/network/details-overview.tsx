'use client';

import { MetamaskIcon, NodeCard, WalletCard } from '@/components/modules/v2/network/pages';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useWebSocket from '@/hooks/useWebSocket';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import {
  fetchNodesByNetworkId,
  selectNodeError,
  selectNodeLoading,
  selectNodes,
} from '@/services/v1/nodeSlice';
import { clearMessages } from '@/services/v1/websocketSlice';
import type { NetworkDetailsProps } from '@/types/v1/network';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Info,
  Loader2,
  Server,
  Shield,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
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
  const [copied, setCopied] = useState<string | null>(null);
  const [networkHealth, setNetworkHealth] = useState<number>(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const mode = 'status';
  useWebSocket({ mode, nodeId: nodes[0]?.id });

  // Extract network data once to avoid redundancy
  const networkData = {
    name: nodes[0]?.network?.name || 'Unknown Network',
    ip: nodes[0]?.network?.server?.publicIpAddress || 'Unknown IP',
    dns: nodes[0]?.network?.server?.dnsName || 'Unknown DNS',
    blockscoutDns: nodes[0]?.network?.blockscoutServer?.dnsName,
    chainId: nodes[0]?.network?.chainId?.toString() || 'Unknown Chain ID',
    wallets: nodes[0]?.network?.allocs || [],
    rpcUrl: nodes[0]?.network?.server?.dnsName
      ? `https://${nodes[0]?.network?.server?.dnsName}`
      : 'Unknown URL',
  };

  const activeNodes = nodes.filter((node) => node.status === 'ACTIVE').length;
  const nodeHealthPercentage = (activeNodes / (nodes.length || 1)) * 100;

  // Mock data for network statistics
  const networkStats = {
    blockHeight: '12,345,678',
    gasPrice: '25 Gwei',
    avgBlockTime: '13.2s',
    peers: activeNodes,
    lastChecked: '2 minutes ago',
  };

  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // Fetch nodes once on mount or when networkId changes
  useEffect(() => {
    if (networkId) {
      dispatch(fetchNodesByNetworkId(networkId));
      dispatch(clearMessages());
    }
  }, [networkId, dispatch]);

  // Simulate network health loading
  useEffect(() => {
    if (!loading && nodes.length > 0) {
      const timer = setTimeout(() => {
        setNetworkHealth(95);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, nodes]);

  // Reset copy state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Reset success toast after 3 seconds
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
  };

  const addToMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${Number.parseInt(networkData.chainId).toString(16)}`,
              chainName: networkData.name,
              nativeCurrency: {
                name: `${networkData.name} Token`,
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [networkData.rpcUrl],
            },
          ],
        });
        setShowSuccessToast(true);
      } catch (error) {
        console.error('Error adding network to MetaMask:', error);
      }
    } else {
      window.open('https://metamask.io/download.html', '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="text-primary h-10 w-10 animate-spin" />
          <p className="text-muted-foreground animate-pulse text-sm">Loading network details...</p>
        </div>
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white shadow-lg">
          <CheckCircle2 className="h-5 w-5" />
          <span>Network added to MetaMask successfully!</span>
        </div>
      )}

      {/* Network Header */}
      <Card className="from-primary/5 to-primary/10 mb-6 overflow-hidden border-none bg-gradient-to-r shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                <Globe className="text-primary h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{networkData.name}</h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  if (networkData.blockscoutDns) {
                    window.open(`https://${networkData.blockscoutDns}`, '_blank');
                  }
                }}
                disabled={!networkData.blockscoutDns}
                className="flex items-center gap-2"
              >
                {!networkData.blockscoutDns ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading Explorer</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    <span>Blockscout</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => copyToClipboard(networkData.rpcUrl, 'rpcUrl')}
              >
                {copied === 'rpcUrl' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy RPC URL</span>
                  </>
                )}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <MetamaskIcon className="h-4 w-4 text-orange-500" />
                    <span>Connect MetaMask</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="overflow-hidden p-0 sm:max-w-md">
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <MetamaskIcon className="h-10 w-10 text-orange-500" />
                      <DialogTitle className="text-xl">Add to MetaMask</DialogTitle>
                    </div>
                    <DialogDescription className="mt-2">
                      Connect your wallet to interact with the {networkData.name} network
                    </DialogDescription>
                  </div>

                  <div className="space-y-5 p-6">
                    <div className="bg-muted/40 space-y-3 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="text-primary h-4 w-4" />
                          <span className="text-sm font-medium">Network Name</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm">{networkData.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(networkData.name, 'dialogName')}
                          >
                            {copied === 'dialogName' ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">RPC URL</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="max-w-[180px] truncate font-mono text-sm">
                            {networkData.rpcUrl}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(networkData.rpcUrl, 'dialogRpc')}
                          >
                            {copied === 'dialogRpc' ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Chain ID</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm">{networkData.chainId}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(networkData.chainId, 'dialogChainId')}
                          >
                            {copied === 'dialogChainId' ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Currency</span>
                        </div>
                        <span className="font-mono text-sm">ETH (18 decimals)</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        className="flex h-11 w-full items-center justify-center gap-2 bg-orange-500 text-white hover:bg-orange-600"
                        onClick={addToMetaMask}
                      >
                        <MetamaskIcon className="h-5 w-5" />
                        <span>Add to MetaMask</span>
                      </Button>

                      <div className="text-muted-foreground mt-1 flex items-center justify-center gap-1 text-xs">
                        <Info className="h-3 w-3" />
                        <span>Don't have MetaMask?</span>
                        <a
                          href="https://metamask.io/download.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-500 hover:underline"
                        >
                          Download here
                        </a>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="nodes" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span>Nodes</span>
          </TabsTrigger>
          <TabsTrigger value="wallets" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Wallets</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader>
              <CardTitle>Network Information</CardTitle>
              <CardDescription>Key details about this blockchain network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
                    <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
                      <Globe className="text-primary h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Network Name</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(networkData.name, 'name')}
                        >
                          {copied === 'name' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm">{networkData.name}</p>
                    </div>
                  </div>

                  <div className="hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                      <Wifi className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Public IP</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(networkData.ip, 'ip')}
                        >
                          {copied === 'ip' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm">{networkData.ip}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10">
                      <Shield className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Chain ID</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(networkData.chainId, 'chainId')}
                        >
                          {copied === 'chainId' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm">{networkData.chainId}</p>
                    </div>
                  </div>

                  <div className="hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10">
                      <Server className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Node Status</h3>
                        <Badge
                          variant={activeNodes === nodes.length ? 'default' : 'outline'}
                          className="ml-1"
                        >
                          {activeNodes === nodes.length ? 'All Active' : 'Partially Active'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {activeNodes}/{nodes.length} nodes online
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Health and Quick Actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Network Health</CardTitle>
                <CardDescription>Current status and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Block Height</span>
                      </div>
                      <span className="font-mono text-sm">{networkStats.blockHeight}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Gas Price</span>
                      </div>
                      <span className="font-mono text-sm">{networkStats.gasPrice}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Avg Block Time</span>
                      </div>
                      <span className="font-mono text-sm">{networkStats.avgBlockTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Peers</span>
                      </div>
                      <span className="font-mono text-sm">{networkStats.peers} connected</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Network Health</span>
                    <span className="font-mono text-sm">{networkHealth}%</span>
                  </div>
                  <Progress value={networkHealth} className="h-2" />
                  <div className="bg-muted rounded-md p-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Network is healthy</span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Last checked: {networkStats.lastChecked}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common network operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      networkData.blockscoutDns ? `https://${networkData.blockscoutDns}` : '#',
                      '_blank',
                    )
                  }
                  disabled={!networkData.blockscoutDns}
                >
                  <span>View Transactions</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline">
                  <span>Monitor Gas Prices</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() => setActiveTab('nodes')}
                >
                  <span>Check Node Status</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline">
                  <span>Network Analytics</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
              <CardFooter>
                <div className="bg-muted/50 flex w-full items-center gap-2 rounded-md p-3">
                  <Info className="h-4 w-4 text-blue-500" />
                  <p className="text-muted-foreground text-xs">
                    Access more actions in the network settings
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Nodes Tab */}
        <TabsContent value="nodes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Network Nodes</CardTitle>
                <CardDescription>All nodes connected to {networkData.name}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={nodeHealthPercentage === 100 ? 'default' : 'outline'}
                  className="px-3 py-1"
                >
                  {nodeHealthPercentage.toFixed(0)}% Healthy
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Node health is calculated based on active nodes vs total nodes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Network Wallets</CardTitle>
                <CardDescription>Wallets associated with {networkData.name}</CardDescription>
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  const addresses = networkData.wallets.map((w) => w.public_address).join('\n');
                  copyToClipboard(addresses, 'wallets');
                }}
              >
                {copied === 'wallets' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Export Addresses</span>
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <WalletCard wallets={networkData.wallets} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkDetails;
