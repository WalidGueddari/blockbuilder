'use client';

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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Activity,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Server,
  Shield,
  Wallet,
  Wifi,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

const NetworkDetails: React.FC<NetworkDetailsProps> = ({ networkId }) => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const loading = useAppSelector(selectNodeLoading);
  const nodeError = useAppSelector(selectNodeError);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPrivateKey, setShowPrivateKey] = useState<Record<string, boolean>>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Mock data for transactions and wallets - replace with actual data fetching
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      hash: '0x1234...5678',
      from: '0xabcd...ef01',
      to: '0x2345...6789',
      value: '0.5 ETH',
      timestamp: '2023-05-15 14:30:45',
    },
    {
      id: '2',
      hash: '0x8765...4321',
      from: '0x2345...6789',
      to: '0xabcd...ef01',
      value: '1.2 ETH',
      timestamp: '2023-05-15 15:45:22',
    },
    {
      id: '3',
      hash: '0xfedc...ba98',
      from: '0x3456...7890',
      to: '0x4567...8901',
      value: '0.3 ETH',
      timestamp: '2023-05-15 16:12:08',
    },
  ]);

  const [wallets, setWallets] = useState([
    {
      id: '1',
      address: '0xabcd...ef01',
      publicIp: '192.168.1.1',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      balance: '2.5 ETH',
    },
    {
      id: '2',
      address: '0x2345...6789',
      publicIp: '192.168.1.2',
      privateKey: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
      balance: '1.8 ETH',
    },
    {
      id: '3',
      address: '0x3456...7890',
      publicIp: '192.168.1.3',
      privateKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      balance: '3.2 ETH',
    },
  ]);

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
  const networkIp = nodes[0]?.network?.publicIp || 'Unknown IP';
  const chainId = nodes[0]?.network?.chainId || 'Unknown Chain ID';

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
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                            <Activity className="text-primary h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{tx.hash}</p>
                            <p className="text-muted-foreground text-xs">{tx.timestamp}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{tx.value}</p>
                          <p className="text-muted-foreground text-xs">
                            From: {tx.from.substring(0, 6)}...
                            {tx.from.substring(tx.from.length - 4)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
                <Metamask className="h-36 w-36 text-orange-500" />
                <Button className="w-full bg-orange-500 text-white hover:bg-orange-600">
                  Connect MetaMask
                </Button>
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
                  <Card key={node.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{node.name}</CardTitle>
                        <Badge
                          className={node.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'}
                        >
                          {node.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">IP Address:</span>
                          <span className="font-medium">{node.nodeIp}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">HTTP Port:</span>
                          <span className="font-medium">{node.rpcHttpPort}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">WS Port:</span>
                          <span className="font-medium">{node.rpcWsPort}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() =>
                          (window.location.href = `/network/${node.networkId}/node/${node.container}`)
                        }
                      >
                        View Logs
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
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
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction Hash</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{tx.hash}</TableCell>
                        <TableCell>{tx.from}</TableCell>
                        <TableCell>{tx.to}</TableCell>
                        <TableCell>{tx.value}</TableCell>
                        <TableCell>{tx.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {wallets.map((wallet) => (
                  <Card key={wallet.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          <Wallet className="mr-2 inline h-5 w-5" />
                          {wallet.address}
                        </CardTitle>
                        <Badge>{wallet.balance}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Public IP:</span>
                          <span className="font-medium">{wallet.publicIp}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Private Key:</span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  {showPrivateKey[wallet.id] ? (
                                    <Eye className="mr-2 h-4 w-4" />
                                  ) : (
                                    <EyeOff className="mr-2 h-4 w-4" />
                                  )}
                                  {showPrivateKey[wallet.id] ? 'Hide Key' : 'View Key'}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Security Verification</DialogTitle>
                                  <DialogDescription>
                                    Enter the verification code to view the private key.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <Input
                                    type="text"
                                    placeholder="Enter verification code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                  />
                                  {verificationError && (
                                    <p className="text-sm text-red-500">{verificationError}</p>
                                  )}
                                  {showPrivateKey[wallet.id] && (
                                    <div className="bg-muted mt-4 rounded-md p-3">
                                      <p className="break-all font-mono text-xs">
                                        {wallet.privateKey}
                                      </p>
                                    </div>
                                  )}
                                  <Button
                                    onClick={() => verifyAndShowPrivateKey(wallet.id)}
                                    className="w-full"
                                  >
                                    Verify
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkDetails;

export function Metamask(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" {...props}>
      <path
        fill="none"
        stroke="#f97316"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M23.971 35.016h2.262l.726 3.415h-3.335"
      ></path>
      <path
        fill="none"
        stroke="#f97316"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m42.158 31.771l-11.57.213l-4.355 3.032l.384-18.232l2.391-5.934l11.613-4.611L42.5 11.96l-1.708 6.746l.171 3.415l-1.11 1.638zl-2.092 8.496l-8.539-2.647l-4.568 4.141h-2.988m15.882-18.002l-8.155-2.406m9.094-2.647l1.494-.256m0 1.878l-1.404.171m-14.443 4.745l7.949-.177"
      ></path>
      <path
        fill="none"
        stroke="#f97316"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m35.647 31.891l-4.12 5.729l-.939-5.636l3.8-6.917l-2.69-3.714l-5.081-4.569L40.621 6.239M26.233 35.016l5.294 2.604"
      ></path>
      <path
        fill="none"
        stroke="#f97316"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m27.45 29.663l3.186-1.185l-2.274-1.185zm1.558-18.813h-5.037m.058 24.166h-2.262l-.726 3.415h2.583"
      ></path>
      <path
        fill="none"
        stroke="#f97316"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5.842 31.771l11.57.213l4.355 3.032l-.384-18.232l-2.391-5.934L7.379 6.239L5.5 11.96l1.708 6.746l-.171 3.415l1.11 1.638zl2.092 8.496l8.539-2.647l4.568 4.141h2.988M8.147 23.759l8.155-2.406m-9.094-2.647l-1.495-.256m0 1.878l1.405.171m14.443 4.745l-7.949-.177"
      ></path>
      <path
        fill="none"
        stroke="#f97316"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m12.353 31.891l4.12 5.729l.939-5.636l-3.8-6.917l2.69-3.714l5.081-4.569L7.379 6.239m14.388 28.777l-5.294 2.604"
      ></path>
      <path
        fill="none"
        stroke="#f97316"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m20.55 29.663l-3.186-1.185l2.274-1.185zM18.992 10.85h5.037"
      ></path>
    </svg>
  );
}
