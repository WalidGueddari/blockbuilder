// components/AdminRoute.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserRole } from '@/hooks/use-user-role';

// components/AdminRoute.tsx

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useUserRole();

  // still checking sessionStorage…
  if (isLoading) {
    return null;
  }

  // not an admin → show unauthorized card
  if (!isAdmin) {
    return (
      <Card className="mx-auto mt-10 max-w-md">
        <CardHeader>
          <CardTitle>Unauthorized</CardTitle>
        </CardHeader>
        <CardContent>You do not have permission to view this page.</CardContent>
      </Card>
    );
  }

  // admin → show chatbot + protected content
  return <>{children}</>;
};

export default AdminRoute;
