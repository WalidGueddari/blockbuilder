'use client';

import { Badge } from '@/components/ui/badge';
// Adjust the path as needed
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import {
  clearNetworkError,
  fetchNetworksByUserId,
  selectNetworkError,
  selectNetworkLoading,
  selectNetworks,
} from '@/services/v1/networkSlice';
import { Activity, Clock, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CreateNetworkPage() {
  const [userId, setUserId] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const networks = useAppSelector(selectNetworks);
  const loading = useAppSelector(selectNetworkLoading);
  const error = useAppSelector(selectNetworkError);

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
  }, [dispatch, userId]); // Added 'userId' to dependency array

  return (
    <div className="container mx-auto h-full space-y-12 px-4 py-8">
      {/* Top Section */}
      <Card className="mx-auto w-full max-w-2xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-primary text-3xl font-bold">Create a Network</CardTitle>
          <CardDescription>
            Let's go ahead and build out your first blockchain network.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/create-network">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <PlusCircle className="mr-2 h-5 w-5" /> CREATE NETWORK
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Bottom Section: Last Active Networks */}
      <div>
        <h2 className="text-primary mb-6 flex items-center text-2xl font-semibold">
          <Activity className="mr-2" /> Last Active Networks
        </h2>

        {/* Handle Loading and Error States */}
        {loading && <p>Loading networks...</p>}
        {error && (
          <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
            <p>Error: {error}</p>
            <Button variant="outline" onClick={() => dispatch(clearNetworkError())}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Display Networks */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {!loading && !error && networks.length === 0 && <p>No networks found.</p>}
          {networks.map((network) => (
            <Card key={network.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{network.name}</span>
                  <Badge variant="secondary">Active</Badge>
                </CardTitle>
                <CardDescription>{'Some info about this network.'}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4" /> Last activity:{' '}
                  {/* {new Date(network.createdAt).toLocaleDateString()} */}
                  Today at 10:00 AM
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/network/${network.id}`}>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
