'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import {
  clearNetworkError,
  selectNetworkError,
  selectNetworkLoading,
  selectNetworks,
} from '@/services/v1/networkSlice';
import { Activity, Clock } from 'lucide-react';
import Link from 'next/link';

export default function NetworkList() {
  const dispatch = useAppDispatch();
  const networks = useAppSelector(selectNetworks);
  const loading = useAppSelector(selectNetworkLoading);
  const error = useAppSelector(selectNetworkError);

  return (
    <div>
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
                <Badge variant="secondary">{network.status}</Badge>
              </CardTitle>
              <CardDescription>{'Some info about this network.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4" /> Last activity: Today at 10:00 AM
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
  );
}
