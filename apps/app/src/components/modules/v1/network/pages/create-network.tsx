'use client';

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/services/hooks';
import { addNotification, updateNotification } from '@/services/v2/notificationSlice';
import { setupNetwork, startNetwork } from '@/services/v3/blockchainSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Loader2, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().nonempty({ message: 'Network name is required.' }),
  nodeCount: z
    .number()
    .min(1, { message: 'Node count must be at least 1.' })
    .max(10, { message: 'Node count cannot exceed 10.' }),
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return 'An unknown error occurred';
}

export default function CreateNetworkDialog() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingValues, setPendingValues] = useState<z.infer<typeof formSchema> | null>(null);

  useEffect(() => {
    try {
      const user = sessionStorage.getItem('user');
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to create a network.',
          variant: 'destructive',
        });
        return;
      }

      const parsedUser = JSON.parse(user);
      if (!parsedUser?.id) {
        toast({
          title: 'Invalid User Data',
          description: 'Your session appears to be corrupted. Please log in again.',
          variant: 'destructive',
        });
        return;
      }

      setUserId(parsedUser.id);
    } catch (e) {
      console.error('Failed to parse user from sessionStorage:', e);
      toast({
        title: 'Session Error',
        description: 'There was a problem with your session. Please log in again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nodeCount: 2,
    },
  });

  // Add form validation feedback
  useEffect(() => {
    const subscription = form.watch(() => {
      if (form.formState.errors.name || form.formState.errors.nodeCount) {
        console.log('Form validation errors:', form.formState.errors);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to create a network.',
        variant: 'destructive',
      });
      return;
    }

    // Store the values and show the warning dialog
    setPendingValues(values);
    setShowWarningDialog(true);
  }

  // Create a new function to handle the actual submission after confirmation
  async function handleConfirmedSubmit() {
    if (!pendingValues || !userId) return;

    setShowWarningDialog(false);
    setIsLoading(true);

    // 1) Add a "pending" notification to Redux:
    const notificationId = uuidv4();
    dispatch(
      addNotification({
        id: notificationId,
        title: `Creating network "${pendingValues.name}"`,
        description: 'Starting network creation process...',
        status: 'pending',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        read: false,
      }),
    );

    try {
      const networkRes = await dispatch(
        setupNetwork({
          initNetPayload: {
            name: pendingValues.name,
            userId,
            nodeCount: pendingValues.nodeCount,
          },
        }),
      ).unwrap();

      if (!networkRes?.id) {
        throw new Error('Network creation failed: No network ID was returned.');
      }

      // Redirect user immediately after the initial network creation
      toast({
        title: 'Network Setup In Progress',
        description: `Network "${pendingValues.name}" is being configured. Redirecting now...`,
      });
      router.push(`/network/${networkRes.id}`);

      // 2) Continue the rest in the background
      (async () => {
        try {
          await dispatch(
            startNetwork({
              payload: {
                vmId: networkRes.serverId,
                networkId: networkRes.id,
                nodeCount: pendingValues.nodeCount,
              },
            }),
          ).unwrap();

          // 3) On success, update the original notification to 'success':
          dispatch(
            updateNotification({
              id: notificationId,
              changes: {
                status: 'success',
                description: `Network "${pendingValues.name}" setup is fully complete.`,
                read: false,
              },
            }),
          );
        } catch (err) {
          const errorMessage = getErrorMessage(err);
          console.error('Failed to complete the remaining setup steps:', err);

          toast({
            title: 'Background Setup Failed',
            description: errorMessage,
            variant: 'destructive',
          });

          // Mark notification as error
          dispatch(
            updateNotification({
              id: notificationId,
              changes: {
                status: 'error',
                description: `Network "${pendingValues.name}" setup failed: ${errorMessage}`,
              },
            }),
          );
        }
      })();
    } catch (err) {
      const errorMessage = getErrorMessage(err);

      console.error('Failed to complete the full setup chain:', err);

      toast({
        title: 'Setup Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      // Mark notification as error
      dispatch(
        updateNotification({
          id: notificationId,
          changes: {
            status: 'error',
            description: `Failed to create network "${pendingValues.name}": ${errorMessage}`,
          },
        }),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <Network className="h-6 w-6" />
          Create New Network
        </CardTitle>
        <CardDescription>Set up your blockchain network.</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Network Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Network Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" placeholder="Enter network name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Node Count */}
            <FormField
              control={form.control}
              name="nodeCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Node Count</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={2}
                        max={4}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <span className="bg-secondary text-secondary-foreground rounded px-2 py-1 font-mono">
                        {field.value}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col">
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading || !userId}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="text-foreground h-5 w-5 animate-spin" />
              Creating Network
            </>
          ) : (
            'Initialize Network'
          )}
        </Button>
        {!userId && (
          <p className="text-destructive mt-2 text-sm">
            You must be logged in to create a network.
          </p>
        )}
      </CardFooter>
      {/* Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Important Notice
            </DialogTitle>
            <DialogDescription className="pt-2">
              Please read this information carefully before proceeding.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <h4 className="mb-2 font-semibold text-amber-800">
                Do not close this page or navigate away
              </h4>
              <p className="text-sm text-amber-700">
                Your network is being set up in the background. Once the initial setup is complete:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-700">
                <li>You will be automatically redirected to the network details page</li>
                <li>You will receive notifications about the setup progress</li>
                <li>The complete setup process may take a few minutes to finish</li>
              </ul>
            </div>

            <p className="text-muted-foreground text-sm">
              Closing this page or navigating away during setup may cause issues with your network
              configuration.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
            <Button variant="outline" onClick={() => setShowWarningDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmedSubmit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              I understand, proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
