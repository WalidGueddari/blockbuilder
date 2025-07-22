'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';

export default function SubscriptionPopUp({ onClose }: { onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleContactUs = () => {
    window.location.href =
      'mailto:contact@nexus-lab.io?subject=Full Demo Access Request&body=Hi, I would like to access the full demo of your blockchain builder. Please provide me with login credentials.';
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contact@nexus-lab.io');
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open && onClose) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          <DialogTitle className="text-xl">Demo Plan Limitation</DialogTitle>
          <DialogDescription className="text-base">
            You are currently using our demo plan. To access the full blockchain builder and create
            projects, please contact us for complete demo access.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-blue-200 bg-blue-50">
          <Mail className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Contact us at:</strong>{' '}
            <button onClick={handleCopyEmail} className="font-medium underline hover:no-underline">
              contact@nexus-lab.io
            </button>
          </AlertDescription>
        </Alert>

        <div className="text-muted-foreground space-y-2 text-sm">
          <p className="text-foreground font-medium">What you'll get:</p>
          <ul className="ml-4 space-y-1">
            <li>• Full access to blockchain builder tools</li>
            <li>• Personal login credentials</li>
            <li>• Complete project creation capabilities</li>
            <li>• Technical support during demo period</li>
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Continue Browsing
          </Button>
          <Button onClick={handleContactUs} className="w-full gap-2 sm:w-auto">
            <Mail className="h-4 w-4" />
            Contact Us
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
