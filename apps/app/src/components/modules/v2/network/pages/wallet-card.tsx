'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatBalance } from '@/utils/ConvertHexToETH';
import { Copy, ExternalLink, Eye, EyeOff, Wallet } from 'lucide-react';
import { useState } from 'react';

interface WalletProps {
  id: string;
  public_address: string;
  private_key: string;
  balance: string;
}

export default function WalletList({ wallets }: { wallets: WalletProps[] }) {
  const [showPrivateKey, setShowPrivateKey] = useState<Record<string, boolean>>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const verifyAndShowPrivateKey = (walletId: string) => {
    // This is a placeholder for actual verification logic
    if (verificationCode === '123456') {
      setShowPrivateKey((prev) => ({ ...prev, [walletId]: true }));
      setVerificationError('');
    } else {
      setVerificationError('Invalid verification code');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {wallets.map((wallet) => (
        <div
          key={wallet.id}
          className="border-border bg-card text-card-foreground w-full overflow-hidden rounded-xl border"
        >
          <div className="space-y-4 p-4">
            {/* Wallet Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-accent/10 rounded-full p-2">
                  <Wallet className="text-accent h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Wallet</p>
                  <div className="flex items-center">
                    <p className="text-primary font-mono text-sm">
                      {truncateAddress(wallet.public_address)}
                    </p>
                    <button
                      onClick={() => copyToClipboard(wallet.public_address)}
                      className="text-muted-foreground hover:text-foreground ml-2 transition"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={`https://etherscan.io/address/${wallet.public_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground ml-2 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-primary/10 rounded-full px-3 py-1">
                <p className="text-primary text-sm font-medium">{formatBalance(wallet.balance)}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-border/50 border-t" />

            {/* Private Key Section */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Private Key</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'bg-muted border-border hover:bg-muted/80 text-muted-foreground',
                      showPrivateKey[wallet.id] && 'bg-primary/10 text-primary',
                    )}
                  >
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
                      <p className="text-destructive text-sm">{verificationError}</p>
                    )}
                    {showPrivateKey[wallet.id] && (
                      <div className="bg-muted mt-4 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-primary break-all font-mono text-xs">
                            {wallet.private_key}
                          </p>
                          <button
                            onClick={() => copyToClipboard(wallet.private_key)}
                            className="text-muted-foreground hover:text-foreground ml-2 transition"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                    <Button onClick={() => verifyAndShowPrivateKey(wallet.id)} className="w-full">
                      Verify
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
