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
import { createServer, setupServer } from '@/services/v2/serverSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Network } from 'lucide-react';
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

const steps = [
  'Initializing server',
  'Creating blockchain network',
  'Setting up server',
  'Running nodes',
];

export default function CreateNetworkDialog() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);

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
    setCurrentStep(0);
    try {
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

      setCurrentStep(1);
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

      setCurrentStep(2);
      await dispatch(
        setupServer({
          id: createRes.id,
          networkId: networkRes.id,
        }),
      ).unwrap();

      setCurrentStep(3);
      await dispatch(
        startNetwork({
          payload: {
            vmId: createRes.id,
            networkId: networkRes.id,
            nodeCount: values.nodeCount,
          },
        }),
      ).unwrap();

      toast({
        title: 'All Steps Complete',
        description: `Network "${values.name}" is created and started.`,
      });

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
      setCurrentStep(null);
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

        {isLoading && (
          <div className="mt-6 space-y-2">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                {index < currentStep! ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : index === currentStep ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <span className={index <= currentStep! ? 'font-medium' : 'text-gray-500'}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading || !userId}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
        >
          {isLoading ? 'Creating Network...' : 'Initialize Network'}
        </Button>
      </CardFooter>
    </Card>
  );
}
