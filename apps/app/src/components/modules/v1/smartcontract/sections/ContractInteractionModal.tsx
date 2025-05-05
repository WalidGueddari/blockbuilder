'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Code, Eye, HelpCircle, Send } from 'lucide-react';
import { useState } from 'react';

interface FunctionInput {
  name: string;
  type: string;
  internalType: string;
}

interface FunctionOutput {
  name: string;
  type: string;
  internalType: string;
}

interface FunctionAbi {
  name: string;
  type: string;
  stateMutability: string;
  inputs: FunctionInput[];
  outputs: FunctionOutput[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  abi?: any[];
  address?: string;
  name?: string;
  providerUrl?: string;
  signerPrivateKey?: string;
}

// Function descriptions for beginner mode
const functionDescriptions: Record<string, string> = {
  name: 'Gets the name of this token or NFT collection',
  symbol: 'Gets the symbol of this token (like BTC for Bitcoin)',
  totalSupply: 'Shows the total amount of tokens that exist',
  mint: 'Creates new tokens and assigns them to an address',
  transfer: 'Sends tokens from your address to another address',
  safeMint: 'Creates a new NFT and assigns it to an address',
  tokenURI: 'Gets the metadata URI for a specific NFT',
};

// Input field descriptions for beginner mode
const inputDescriptions: Record<string, Record<string, string>> = {
  mint: {
    to: 'The wallet address that will receive the new tokens',
    amount: 'How many tokens to create',
  },
  transfer: {
    to: 'The wallet address that will receive the tokens',
    amount: 'How many tokens to send',
  },
  safeMint: {
    to: 'The wallet address that will own the new NFT',
    uri: "The link to the NFT's metadata (image, properties, etc.)",
  },
  tokenURI: {
    tokenId: 'The ID number of the NFT you want to look up',
  },
};

export default function ContractInteractionModal({
  open,
  onClose,
  abi = [],
  address = '',
  name = '',
}: Props) {
  const [inputs, setInputs] = useState<Record<string, string[]>>({});
  const [output, setOutput] = useState<Record<string, string>>({});
  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleInputChange = (fnName: string, index: number, value: string) => {
    setInputs((prev) => {
      const current = prev[fnName] || [];
      const newInputs = [...current];
      newInputs[index] = value;
      return { ...prev, [fnName]: newInputs };
    });
  };

  const handleCall = (fn: FunctionAbi) => {
    setLoading((prev) => ({ ...prev, [fn.name]: true }));

    // Simulate network delay
    setTimeout(() => {
      const args = inputs[fn.name] || [];
      console.log(`Calling function ${fn.name} on ${address} with`, args);

      // Mock responses based on function name for better demo
      let mockResponse = '';
      if (fn.name === 'name') {
        mockResponse = name || 'TokenName';
      } else if (fn.name === 'symbol') {
        mockResponse = name?.substring(0, 3).toUpperCase() || 'TKN';
      } else if (fn.name === 'totalSupply') {
        mockResponse = '1000000000000000000000000';
      } else if (fn.name === 'tokenURI') {
        mockResponse = `https://example.com/metadata/${args[0] || '1'}.json`;
      } else {
        mockResponse = `Response: ${JSON.stringify(
          fn.outputs.map((o) =>
            o.type.includes('int')
              ? '123'
              : o.type === 'bool'
                ? 'true'
                : o.type === 'address'
                  ? '0x123...'
                  : 'Sample data',
          ),
        )}`;
      }

      setOutput((prev) => ({ ...prev, [fn.name]: mockResponse }));
      setLoading((prev) => ({ ...prev, [fn.name]: false }));
    }, 1000);
  };

  const handleSend = (fn: FunctionAbi) => {
    setLoading((prev) => ({ ...prev, [fn.name]: true }));

    // Simulate network delay
    setTimeout(() => {
      const args = inputs[fn.name] || [];
      console.log(`Sending transaction to function ${fn.name} on ${address} with`, args);

      const txHash =
        '0x' +
        Array(64)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('');

      setOutput((prev) => ({
        ...prev,
        [fn.name]: `Transaction sent! Hash: ${txHash}`,
      }));
      setLoading((prev) => ({ ...prev, [fn.name]: false }));
    }, 1500);
  };

  const renderFunctionCard = (fn: FunctionAbi, index: number) => {
    const isView = fn.stateMutability === 'view' || fn.stateMutability === 'pure';
    const isActive = activeFunction === fn.name;

    return (
      <Card
        key={`${fn.name}-${index}`}
        className={`mb-4 transition-all ${isActive ? 'ring-primary ring-2' : ''}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {fn.name}
              <Badge variant={isView ? 'secondary' : 'default'} className="ml-2">
                {isView ? 'Read' : 'Write'}
              </Badge>
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    {functionDescriptions[fn.name] ||
                      `This function ${isView ? 'reads data from' : 'modifies'} the contract`}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>
            {functionDescriptions[fn.name] ||
              (isView
                ? 'This function reads information from the blockchain'
                : 'This function will modify data on the blockchain')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {fn.inputs.length > 0 && (
            <div className="space-y-3">
              {fn.inputs.map((input: FunctionInput, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${fn.name}-input-${i}`} className="font-medium">
                      {input.name || `arg${i}`}
                    </Label>
                    <Badge variant="outline" className="font-mono text-xs">
                      {input.type}
                    </Badge>
                    {inputDescriptions[fn.name]?.[input.name] && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="text-muted-foreground h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{inputDescriptions[fn.name][input.name]}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {inputDescriptions[fn.name]?.[input.name] && (
                    <p className="text-muted-foreground mb-1 text-xs">
                      {inputDescriptions[fn.name][input.name]}
                    </p>
                  )}

                  <Input
                    id={`${fn.name}-input-${i}`}
                    placeholder={getBeginnerPlaceholder(fn.name, input)}
                    onChange={(e) => handleInputChange(fn.name, i, e.target.value)}
                    value={inputs[fn.name]?.[i] || ''}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {isView ? (
              <Button onClick={() => handleCall(fn)} disabled={loading[fn.name]} className="gap-2">
                {loading[fn.name] ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Read
              </Button>
            ) : (
              <Button onClick={() => handleSend(fn)} disabled={loading[fn.name]} className="gap-2">
                {loading[fn.name] ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Write
              </Button>
            )}
          </div>

          {output[fn.name] && (
            <div className="space-y-1 pt-2">
              <Label>Result</Label>
              <div className="bg-muted overflow-x-auto rounded-md p-3 font-mono text-sm">
                {output[fn.name]}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Helper function to get user-friendly placeholders for beginner mode
  const getBeginnerPlaceholder = (fnName: string, input: FunctionInput) => {
    if (fnName === 'transfer' || fnName === 'mint' || fnName === 'safeMint') {
      if (input.name === 'to' || input.type === 'address') {
        return '0x... (wallet address)';
      }
      if (input.name === 'amount' && input.type.includes('int')) {
        return 'Amount of tokens';
      }
    }

    if (input.type === 'address') return '0x... (wallet address)';
    if (input.type.includes('int')) return 'Enter a number';
    if (input.type === 'string') return 'Enter text';
    if (input.type === 'bool') return 'true or false';

    return `Enter ${input.type} value`;
  };

  // Group functions by read/write for better organization
  const readFunctions = abi.filter(
    (fn: FunctionAbi) =>
      fn.type === 'function' && (fn.stateMutability === 'view' || fn.stateMutability === 'pure'),
  );

  const writeFunctions = abi.filter(
    (fn: FunctionAbi) =>
      fn.type === 'function' && fn.stateMutability !== 'view' && fn.stateMutability !== 'pure',
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {name}
            <Badge variant="outline" className="ml-2 font-mono text-xs">
              {address.substring(0, 6)}...{address.substring(address.length - 4)}
            </Badge>
          </DialogTitle>
          <DialogDescription>Interact with this smart contract on the blockchain</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="read" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="read" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Read Contract</span>
            </TabsTrigger>
            <TabsTrigger value="write" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span>Write Contract</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="read" className="space-y-4">
            {readFunctions.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                No read functions available
              </div>
            ) : (
              readFunctions.map((fn: FunctionAbi, index) => renderFunctionCard(fn, index))
            )}
          </TabsContent>

          <TabsContent value="write" className="space-y-4">
            {writeFunctions.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                No write functions available
              </div>
            ) : (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Write functions will modify data on the blockchain and may require gas fees.
                  </AlertDescription>
                </Alert>
                {writeFunctions.map((fn: FunctionAbi, index) => renderFunctionCard(fn, index))}
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="contract-details">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>Contract Details</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Address:</span>{' '}
                    <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                      {address}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">ABI:</span>
                    <pre className="bg-muted mt-1 overflow-x-auto rounded p-2 text-xs">
                      {JSON.stringify(abi, null, 2).substring(0, 300)}...
                    </pre>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
