// create-network.tsx
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
import { setupNetwork, startNetwork } from '@/services/v2/blockchainSlice';
import { addNotification, updateNotification } from '@/services/v2/notificationSlice';
import { createServer, setupServer } from '@/services/v2/serverSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// create-network.tsx

const formSchema = z.object({
  name: z.string().nonempty({ message: 'Network name is required.' }),
  nodeCount: z
    .number()
    .min(1, { message: 'Node count must be at least 1.' })
    .max(10, { message: 'Node count cannot exceed 10.' }),
});

export default function CreateNetworkDialog() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserId(parsedUser.id);
      } catch (e) {
        console.error('Failed to parse user from sessionStorage:', e);
      }
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nodeCount: 2,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      console.error('User ID is not available.');
      return;
    }

    setIsLoading(true);

    // 1) Add a "pending" notification to Redux:
    const notificationId = uuidv4();
    dispatch(
      addNotification({
        id: notificationId,
        title: `Creating network "${values.name}"`,
        description: 'Starting network creation process...',
        status: 'pending',
        time: new Date().toLocaleTimeString(), // or ISO string
        read: false,
      }),
    );

    try {
      // Start the chain
      const createRes = await dispatch(
        createServer({
          userId,
          vmName: values.name,
          resourceGroup: values.name,
          sshKeyName: values.name,
        }),
      ).unwrap();

      if (!createRes?.id) {
        throw new Error('Failed to retrieve VM ID from createServer call.');
      }

      const networkRes = await dispatch(
        setupNetwork({
          initNetPayload: {
            name: values.name,
            userId,
            nodeCount: values.nodeCount,
          },
          vmId: createRes.id,
        }),
      ).unwrap();

      if (!networkRes?.id) {
        throw new Error('Failed to retrieve network ID from setupNetwork call.');
      }

      // Redirect user immediately after the initial network creation
      toast({
        title: 'Network Setup In Progress',
        description: `Network "${values.name}" is being configured. Redirecting now...`,
      });
      router.push(`/network/${networkRes.id}`);

      // 2) Continue the rest in the background
      (async () => {
        try {
          await dispatch(
            setupServer({
              id: createRes.id,
              networkId: networkRes.id,
            }),
          ).unwrap();

          await dispatch(
            startNetwork({
              payload: {
                vmId: createRes.id,
                networkId: networkRes.id,
                nodeCount: values.nodeCount,
              },
            }),
          ).unwrap();

          // 3) On success, update the original notification to 'success':
          dispatch(
            updateNotification({
              id: notificationId,
              changes: {
                status: 'success',
                description: `Network "${values.name}" setup is fully complete.`,
                read: false,
              },
            }),
          );
        } catch (err) {
          console.error('Failed to complete the remaining setup steps:', err);
          toast({
            title: 'Background Setup Failed',
            description: String(err),
            variant: 'destructive',
          });

          // Mark notification as error
          dispatch(
            updateNotification({
              id: notificationId,
              changes: {
                status: 'error',
                description: `Network "${values.name}" setup failed: ${String(err)}`,
              },
            }),
          );
        }
      })();
    } catch (err) {
      console.error('Failed to complete the full setup chain:', err);
      toast({
        title: 'Setup Failed',
        description: String(err),
        variant: 'destructive',
      });

      // Mark notification as error
      dispatch(
        updateNotification({
          id: notificationId,
          changes: {
            status: 'error',
            description: `Failed to create network "${values.name}": ${String(err)}`,
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

            {/* Submit Button is in CardFooter */}
          </form>
        </Form>

        {/* {isLoading && (
          <div className="mt-6 flex items-center gap-2">
            <Loader2 className="text-foreground h-5 w-5 animate-spin" />
            <span className="font-medium">Creating blockchain network</span>
          </div>
        )} */}
      </CardContent>

      <CardFooter>
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
      </CardFooter>
    </Card>
  );
}
