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
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertCircle,
  CheckCircle2,
  Code,
  Copy,
  Cpu,
  Eye,
  HelpCircle,
  Info,
  Layers,
  Send,
  Sliders,
  Zap,
} from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import defaultProps from 'prism-react-renderer';
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

interface BatchOperation {
  functionName: string;
  inputs: string[];
  status: 'pending' | 'success' | 'error';
  result?: string;
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
  const [mode, setMode] = useState<'beginner' | 'advanced'>('beginner');
  const [gasLimit, setGasLimit] = useState<number>(100000);
  const [gasPrice, setGasPrice] = useState<number>(5);
  const [batchOperations, setBatchOperations] = useState<BatchOperation[]>([]);
  const [highlightedAbiFunction, setHighlightedAbiFunction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Format big numbers to be more readable
  const formatBigNumber = (value: string): string => {
    if (!value || isNaN(Number(value))) return value;

    const num = Number(value);
    if (num > 1e18) {
      return `${(num / 1e18).toFixed(4)} ETH`;
    } else if (num > 1e9) {
      return `${(num / 1e9).toFixed(2)} Gwei`;
    } else if (num > 1e6) {
      return `${(num / 1e6).toFixed(2)} million`;
    }
    return value;
  };

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
    setHighlightedAbiFunction(fn.name);

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
              ? '123456789000000000000'
              : o.type === 'bool'
                ? 'true'
                : o.type === 'address'
                  ? '0x123...'
                  : 'Sample data',
          ),
        )}`;
      }

      // Format big numbers in the response
      const formattedResponse =
        mode === 'beginner' && fn.name === 'totalSupply'
          ? formatBigNumber(mockResponse)
          : mockResponse;

      setOutput((prev) => ({ ...prev, [fn.name]: formattedResponse }));
      setLoading((prev) => ({ ...prev, [fn.name]: false }));
    }, 1000);
  };

  const handleSend = (fn: FunctionAbi) => {
    setLoading((prev) => ({ ...prev, [fn.name]: true }));
    setHighlightedAbiFunction(fn.name);

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

  const addToBatch = (fn: FunctionAbi) => {
    const args = inputs[fn.name] || [];
    setBatchOperations([
      ...batchOperations,
      {
        functionName: fn.name,
        inputs: [...args],
        status: 'pending',
      },
    ]);
  };

  const executeBatch = () => {
    // Simulate batch execution
    const updatedBatch = [...batchOperations];

    // Set all to loading first
    setBatchOperations(updatedBatch.map((op) => ({ ...op, status: 'pending' })));

    // Process each operation with a delay
    updatedBatch.forEach((operation, index) => {
      setTimeout(
        () => {
          const success = Math.random() > 0.2; // 80% success rate for demo

          setBatchOperations((current) => {
            const updated = [...current];
            updated[index] = {
              ...updated[index],
              status: success ? 'success' : 'error',
              result: success
                ? `Success: ${operation.functionName} executed`
                : `Error: Failed to execute ${operation.functionName}`,
            };
            return updated;
          });
        },
        1000 + index * 500,
      ); // Stagger the updates
    });
  };

  const clearBatch = () => {
    setBatchOperations([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderFunctionCard = (fn: FunctionAbi, index: number) => {
    const isView = fn.stateMutability === 'view' || fn.stateMutability === 'pure';
    const isActive = activeFunction === fn.name;
    const estimatedGas = isView ? 0 : Math.floor(50000 + Math.random() * 100000);

    return (
      <Card
        key={`${fn.name}-${index}`}
        className={`mb-4 transition-all ${isActive ? 'ring-primary ring-2' : ''}`}
        onMouseEnter={() => setHighlightedAbiFunction(fn.name)}
        onMouseLeave={() => setHighlightedAbiFunction(null)}
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

                  {mode === 'beginner' && inputDescriptions[fn.name]?.[input.name] && (
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

          {/* Gas estimation for write functions in advanced mode */}
          {!isView && mode === 'advanced' && (
            <div className="bg-muted rounded-md p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Estimated Gas:</span>
                </div>
                <span className="font-mono">{estimatedGas.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <span>Est. Cost:</span>
                </div>
                <span className="font-mono">
                  {((estimatedGas * gasPrice) / 1e9).toFixed(6)} ETH
                </span>
              </div>
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
              <div className="flex w-full gap-2">
                <Button
                  onClick={() => handleSend(fn)}
                  disabled={loading[fn.name]}
                  className="gap-2"
                >
                  {loading[fn.name] ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Write
                </Button>

                {mode === 'advanced' && (
                  <Button variant="outline" onClick={() => addToBatch(fn)} className="gap-2">
                    <Layers className="h-4 w-4" />
                    Add to Batch
                  </Button>
                )}
              </div>
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

  // Find the ABI function that matches the highlighted function
  const highlightedFunction = abi.find(
    (fn: any) => fn.name === highlightedAbiFunction && fn.type === 'function',
  );

  // Format ABI for display
  const formatAbiForDisplay = () => {
    if (!abi || abi.length === 0) return '[]';

    const formattedAbi = JSON.stringify(abi, null, 2);

    if (!highlightedFunction) return formattedAbi;

    // Simple highlighting by replacing the function definition
    const functionStr = JSON.stringify(highlightedFunction, null, 2);
    const highlightedStr = `\x1b[33m${functionStr}\x1b[0m`; // ANSI yellow

    return formattedAbi.replace(functionStr, highlightedStr);
  };

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

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="mode-switch">Mode:</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="mode-switch"
                checked={mode === 'advanced'}
                onCheckedChange={(checked) => setMode(checked ? 'advanced' : 'beginner')}
              />
              <Label htmlFor="mode-switch">{mode === 'advanced' ? 'Advanced' : 'Beginner'}</Label>
            </div>
          </div>

          {mode === 'advanced' && (
            <Button variant="outline" size="sm" className="gap-1">
              <Sliders className="h-3.5 w-3.5" />
              <span>Settings</span>
            </Button>
          )}
        </div>

        <Tabs defaultValue="read" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="read" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Read Contract</span>
            </TabsTrigger>
            <TabsTrigger value="write" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span>Write Contract</span>
            </TabsTrigger>
            {mode === 'advanced' && (
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>Batch Operations</span>
              </TabsTrigger>
            )}
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

                {mode === 'advanced' && (
                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gas-limit">Gas Limit</Label>
                      <span className="font-mono text-sm">{gasLimit.toLocaleString()}</span>
                    </div>
                    <Slider
                      id="gas-limit"
                      min={21000}
                      max={500000}
                      step={1000}
                      value={[gasLimit]}
                      onValueChange={(value) => setGasLimit(value[0])}
                    />

                    <div className="flex items-center justify-between">
                      <Label htmlFor="gas-price">Gas Price (Gwei)</Label>
                      <span className="font-mono text-sm">{gasPrice}</span>
                    </div>
                    <Slider
                      id="gas-price"
                      min={1}
                      max={100}
                      step={1}
                      value={[gasPrice]}
                      onValueChange={(value) => setGasPrice(value[0])}
                    />
                  </div>
                )}

                {writeFunctions.map((fn: FunctionAbi, index) => renderFunctionCard(fn, index))}
              </>
            )}
          </TabsContent>

          {mode === 'advanced' && (
            <TabsContent value="batch" className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 text-lg font-medium">Batch Operations</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Queue multiple contract function calls to execute in a single transaction
                </p>

                {batchOperations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Layers className="text-muted-foreground mb-2 h-12 w-12" />
                    <p className="text-muted-foreground text-center">
                      No operations in batch. Add operations from the Write tab.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 space-y-2">
                      {batchOperations.map((op, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div>
                            <div className="font-medium">{op.functionName}</div>
                            <div className="text-muted-foreground text-xs">
                              {op.inputs.length > 0
                                ? `Inputs: ${op.inputs.join(', ')}`
                                : 'No inputs'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {op.status === 'pending' ? (
                              <Badge variant="outline">Pending</Badge>
                            ) : op.status === 'success' ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Success
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Error</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={executeBatch} className="gap-2">
                        <Send className="h-4 w-4" />
                        Execute Batch
                      </Button>
                      <Button variant="outline" onClick={clearBatch}>
                        Clear
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          )}
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
                    <div className="flex items-center gap-2">
                      <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                        {address}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(address)}
                      >
                        {copied ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">ABI:</span>
                      {highlightedAbiFunction && (
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Info className="h-3.5 w-3.5" />
                          <span>Hover over functions to highlight in ABI</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-1 max-h-40 overflow-auto rounded border">
                      <Highlight
                        {...defaultProps}
                        code={JSON.stringify(abi, null, 2)}
                        language="json"
                        theme={themes.nightOwl}
                      >
                        {({ className, style, tokens, getLineProps, getTokenProps }) => (
                          <pre
                            className={`${className} max-h-40 overflow-auto rounded p-3 text-sm`}
                            style={style}
                          >
                            {tokens.map((line, i) => (
                              <div key={i} {...getLineProps({ line })}>
                                {line.map((token, key) => (
                                  <span key={key} {...getTokenProps({ token })} />
                                ))}
                              </div>
                            ))}
                          </pre>
                        )}
                      </Highlight>
                    </div>
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
