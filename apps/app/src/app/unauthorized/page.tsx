'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ShieldX } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Unauthorized() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Access Denied</CardTitle>
          <CardDescription className="text-gray-600">
            You don't have permission to access this page. Please contact your administrator if you
            believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={handleGoHome} className="w-full" size="lg">
            <Home className="mr-2 h-4 w-4" />
            Go to Home Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
