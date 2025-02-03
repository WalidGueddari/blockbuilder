'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  clearNodeError,
  createNetwork,
  selectNodeError,
  selectNodeLoading,
} from '@/services/containerSlice';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  const loading = useAppSelector(selectNodeLoading);
  const error = useAppSelector(selectNodeError);
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);

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

    const payload = {
      name: values.name,
      nodeCount: values.nodeCount,
      userId: userId,
    };

    try {
      const result = await dispatch(createNetwork(payload)).unwrap();
      form.reset();
      toast({
        title: 'Network Created',
        description: `The network ${result.name} with ${result.nodeCount} nodes was initialized!`,
        variant: 'default',
      });
      router.push(`/network/${result.id}`);
    } catch (err) {
      console.error('Failed to create network:', err);
      toast({
        title: 'Network Creation Failed',
        description: 'Failed to initialize network. Please try again.',
        variant: 'destructive',
      });
    }
  }

  useEffect(() => {
    return () => {
      dispatch(clearNodeError());
    };
  }, [dispatch]);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <Network className="h-6 w-6" />
          Create New Network
        </CardTitle>
        <CardDescription>Set up your blockchain network with custom parameters.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Network Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" placeholder="Enter network name" {...field} />
                  </FormControl>
                  {/* <FormDescription>Choose a unique, descriptive name for your network.</FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormDescription>Select the number of nodes to initialize (2-4).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading || !userId}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initializing...
            </>
          ) : (
            'Initialize Network'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
