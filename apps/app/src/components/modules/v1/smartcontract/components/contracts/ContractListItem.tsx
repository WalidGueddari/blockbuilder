'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  Star,
  Tag,
  User,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ContractStatus {
  successCount: number;
  failureCount: number;
  lastInteraction: string;
}

interface ContractAccount {
  role: string;
  address: string;
}

interface Props {
  name: string;
  type: string;
  address: string;
  description?: string;
  status?: ContractStatus;
  accounts?: ContractAccount[];
  tags?: string[];
  onInteract: () => void;
  onToggleFavorite?: () => Promise<void>;
  isFavorite?: boolean;
}

export default function ContractListItem({
  name,
  type,
  address,
  description,
  status = { successCount: 0, failureCount: 0, lastInteraction: '' },
  accounts = [],
  tags = [],
  onInteract,
  onToggleFavorite,
  isFavorite = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(isFavorite);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setIsFavorited(isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleFavorite || isToggling) return;

    setIsToggling(true);
    try {
      await onToggleFavorite();
    } finally {
      setIsToggling(false);
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">{name}</CardTitle>
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleToggleFavorite}
                disabled={isToggling}
              >
                <Star
                  className={`h-4 w-4 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                />
                <span className="sr-only">
                  {isFavorited ? 'Unpin favorite' : 'Pin as favorite'}
                </span>
              </Button>
            )}
          </div>
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
                  {copied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span className="sr-only">Copy address</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? 'Copied!' : 'Copy address'}</p>
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

        {/* Status indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {status.successCount > 0 && (
            <div className="flex items-center gap-1 text-green-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{status.successCount} successful</span>
            </div>
          )}
          {status.failureCount > 0 && (
            <div className="flex items-center gap-1 text-red-500">
              <XCircle className="h-3.5 w-3.5" />
              <span>{status.failureCount} failed</span>
            </div>
          )}
          {status.lastInteraction && (
            <div className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Last: {status.lastInteraction}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Expandable section */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Linked accounts */}
              {accounts.length > 0 && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  <h4 className="text-sm font-medium">Linked Accounts</h4>
                  <div className="space-y-1">
                    {accounts.map((account, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <User className="text-muted-foreground h-3.5 w-3.5" />
                        <span className="font-medium">{account.role}:</span>
                        <code className="bg-muted rounded px-1 py-0.5 font-mono">
                          {shortenAddress(account.address)}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" onClick={onInteract} variant="default">
          Interact with Contract
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="-mt-1 flex w-full items-center justify-center gap-1"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-xs">{expanded ? 'Show less' : 'Show more'}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </Button>
      </CardFooter>
    </Card>
  );
}
