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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/services/hooks';
import { startNetwork } from '@/services/v4/blockchainSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Info, Key, Loader2, Network, Server } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().nonempty({ message: 'Network name is required.' }),
  secretKey: z.string().nonempty({ message: 'Secret key is required.' }),
  nodeCount: z
    .number()
    .min(1, { message: 'Node count must be at least 1.' })
    .max(4, { message: 'Node count cannot exceed 4.' }),
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as any).message === 'string'
  ) {
    return (error as any).message;
  }
  return 'An unknown error occurred';
}

export default function CreateNetworkDialog() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);

  useEffect(() => {
    try {
      const user = sessionStorage.getItem('user');
      if (!user) throw new Error('Not logged in');
      const parsed = JSON.parse(user);
      if (!parsed?.id) throw new Error('Invalid session');
      setUserId(parsed.id);
    } catch {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create a network.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', secretKey: '', nodeCount: 2 },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) return;
    setIsLoading(true);

    try {
      const networkRes = await dispatch(
        startNetwork({
          initNetPayload: {
            name: values.name,
            userId,
            nodeCount: values.nodeCount,
          },
        }),
      ).unwrap();

      if (networkRes.success === false) {
        // limit reached
        setLimitDialogOpen(true);
      } else {
        // success → redirect
        router.push(`/network/${networkRes.network?.id}`);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast({ title: 'Setup Failed', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="bg-background border-border w-full max-w-xl border">
      <CardHeader className="pb-4">
        <div className="mb-1 flex items-center gap-2">
          <Network className="text-primary h-5 w-5" />
          <CardTitle className="text-2xl font-semibold">Create New Network</CardTitle>
        </div>
        <CardDescription>Set up your blockchain network with just a few steps.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-sm font-medium">
                    <Info className="text-muted-foreground h-4 w-4" />
                    Network Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter network name"
                      {...field}
                      className="focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-sm font-medium">
                    <Key className="text-muted-foreground h-4 w-4" />
                    Choose your secret key
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter secret key"
                      {...field}
                      className="focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground mt-1 flex items-start gap-1.5 text-xs">
                    <Info className="text-primary mt-0.5 h-3.5 w-3.5 min-w-[14px] opacity-80" />
                    <span>
                      This key will be used to get the private keys of the generated wallets with
                      the blockchain.
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nodeCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-sm font-medium">
                    <Server className="text-muted-foreground h-4 w-4" />
                    How many nodes?
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3 pt-1">
                      {[2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => field.onChange(num)}
                          className={`flex h-10 w-10 items-center justify-center rounded-md border transition-all duration-200 ${
                            field.value === num
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card hover:bg-accent hover:border-primary/30 border-border'
                          }`}
                        >
                          <span className="text-base font-medium">{num}</span>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription className="text-muted-foreground mt-1 text-xs">
                    Select the number of nodes for your blockchain network.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col pb-5 pt-2">
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading || !userId}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Network...
            </>
          ) : (
            'Initialize Network'
          )}
        </Button>
        {!userId && (
          <p className="text-destructive mt-3 flex items-center justify-center gap-1.5 text-xs">
            <AlertTriangle className="h-3 w-3" />
            You must be logged in to create a network.
          </p>
        )}
      </CardFooter>

      {/* Limit-Reached Dialog */}
      <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Limit Reached
            </DialogTitle>
            <DialogDescription className="pt-1">
              Our demo tier supports only one active network at a time, and you've reached that
              limit. To spin up more networks, please upgrade your plan or get in touch with us for
              options.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setLimitDialogOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
