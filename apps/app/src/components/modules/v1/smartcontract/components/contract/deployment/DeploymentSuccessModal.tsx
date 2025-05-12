'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Copy, ExternalLink, ListChecks } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import type { DeploymentSuccess } from '../../../types';

// Mock confetti function since the package might not be available
const confetti = {
  create: () => ({
    addConfetti: () => {},
  }),
};

interface DeploymentSuccessModalProps {
  deploymentSuccess: DeploymentSuccess;
  setDeploymentSuccess: (success: DeploymentSuccess) => void;
}

export const DeploymentSuccessModal = ({
  deploymentSuccess,
  setDeploymentSuccess,
}: DeploymentSuccessModalProps) => {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (deploymentSuccess.open) {
      // Mock confetti effect
      console.log('Showing confetti effect');
      // In a real implementation, you would use the canvas-confetti package
    }
  }, [deploymentSuccess.open]);

  return (
    <Dialog
      open={deploymentSuccess.open}
      onOpenChange={(open) => setDeploymentSuccess({ ...deploymentSuccess, open })}
    >
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Contract Deployed Successfully
          </DialogTitle>
          <DialogDescription className="text-base">
            Your smart contract has been deployed to the blockchain and is ready to use.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Contract Address</Label>
            <div className="flex items-center gap-2">
              <code className="bg-muted flex-1 overflow-x-auto rounded-md px-3 py-2 font-mono text-sm">
                {deploymentSuccess.address}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10 h-10 w-10 transition-all duration-200"
                onClick={() => {
                  navigator.clipboard.writeText(deploymentSuccess.address);
                  toast({
                    title: 'Copied!',
                    description: 'Contract address copied to clipboard',
                  });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300">Important</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              Save this address. You will need it to interact with your contract from outside
              applications.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="w-full gap-2 sm:w-auto"
            onClick={() =>
              window.open(`https://etherscan.io/address/${deploymentSuccess.address}`, '_blank')
            }
            disabled
          >
            <ExternalLink className="h-4 w-4" />
            View on Explorer
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2 sm:w-auto"
            onClick={() => {
              setDeploymentSuccess({ ...deploymentSuccess, open: false });
              router.push('/deployedcontracts');
            }}
          >
            <ListChecks className="h-4 w-4" />
            View All Contracts
          </Button>
          <Button
            onClick={() => setDeploymentSuccess({ ...deploymentSuccess, open: false })}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
