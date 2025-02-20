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
// --- Import your thunks and any selectors you need:
import { createServer, setupServer } from '@/services/v2/serverSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Reusing your existing schema for the network name/nodeCount:
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
    // Retrieve the userId from sessionStorage
    const user = sessionStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserId(parsedUser.id);
        console.log('User ID set:', parsedUser.id); // Debug log
      } catch (e) {
        console.error('Failed to parse user from sessionStorage:', e);
      }
    } else {
      console.log('No user found in sessionStorage'); // Debug log
    }
  }, []);

  // Set up the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nodeCount: 2,
    },
  });

  // The core logic: chain your four calls in order
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('onSubmit called with values:', values); // Debug log

    if (!userId) {
      console.error('User ID is not available.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating server...'); // Debug log
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
      console.log('Server created with ID:', createRes.id); // Debug log

      console.log('Setting up network...'); // Debug log
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
      console.log('Network set up with ID:', networkRes.id); // Debug log

      console.log('Setting up server...'); // Debug log
      await dispatch(
        setupServer({
          id: createRes.id,
          networkId: networkRes.id,
        }),
      ).unwrap();
      console.log('Server setup complete'); // Debug log

      console.log('Starting network...'); // Debug log
      const startRes = await dispatch(
        startNetwork({
          payload: {
            vmId: createRes.id,
            networkId: networkRes.id,
            nodeCount: values.nodeCount,
          },
        }),
      ).unwrap();

      // if (!startRes?.success) {
      //   throw new Error("Network failed to start properly.")
      // }
      // console.log("Network started successfully") // Debug log

      console.log('Showing toast notification...'); // Debug log
      toast({
        title: 'All Steps Complete',
        description: `Network "${values.name}" is created and started.`,
      });

      console.log('Redirecting to network details page...'); // Debug log
      router.push(`/network/${networkRes.id}`);
    } catch (err) {
      console.error('Failed to complete the full setup chain:', err);
      toast({
        title: 'Setup Failed',
        description: String(err),
        variant: 'destructive',
      });
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
        <CardDescription>Set up your blockchain network and required VM resources.</CardDescription>
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

      <CardFooter>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading || !userId}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Initialize Network & Server
        </Button>
      </CardFooter>
    </Card>
  );
}
