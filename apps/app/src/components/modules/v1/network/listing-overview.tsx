'use client';

import { NetworkList } from '@/components/modules/v1/network/pages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch } from '@/services/hooks';
import { fetchNetworksByUserId } from '@/services/v1/networkSlice';
import { PlusCircle } from 'lucide-react';
// Import NetworkList component
import { Activity, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CreateNetworkPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  // Retrieve userId from sessionStorage when component mounts
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

  // Fetch networks when userId is available
  useEffect(() => {
    if (userId) {
      dispatch(fetchNetworksByUserId({ userId, page: 1, limit: 3 }));
    }
  }, [dispatch, userId]);

  return (
    <div className="container mx-auto h-full space-y-12 px-4 py-8">
      {/* Top Section */}
      <Card className="mx-auto w-full max-w-2xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-foreground text-3xl font-bold">Create a Network</CardTitle>
          <CardDescription>
            Let's go ahead and build out your first blockchain network.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/create-network">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground text-md hover:bg-primary/90 flex items-center justify-center"
            >
              <PlusCircle strokeWidth={3} className="mr-2 h-5 w-5" /> Create Network
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Bottom Section: Last Active Networks */}
      <h2 className="text-foreground mb-6 flex items-center text-2xl font-semibold">
        <Activity className="mr-2" /> Last Active Networks
      </h2>
      <NetworkList />
    </div>
  );
}
