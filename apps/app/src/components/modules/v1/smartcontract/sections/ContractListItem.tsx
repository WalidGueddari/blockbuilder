'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, ExternalLink } from 'lucide-react';

interface Props {
  name: string;
  type: string;
  address: string;
  description?: string;
  onInteract: () => void;
}

export default function ContractListItem({ name, type, address, description, onInteract }: Props) {
  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{name}</CardTitle>
          <Badge variant="outline" className="ml-2">
            {type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
        <TooltipProvider>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Address:</span>
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-sm">
              {shortenAddress(address)}
            </code>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(address)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="sr-only">Copy address</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy address</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="sr-only">View on explorer</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View on explorer</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onInteract} variant="default">
          Interact with Contract
        </Button>
      </CardFooter>
    </Card>
  );
}
