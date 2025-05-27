'use client';

// Or use Redux if preferred
import { SideBar } from '@/components/layout/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isActive, userRole } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/home');
      return;
    }

    if (isAuthenticated && isActive === false) {
      router.push('/activation');
      return;
    }

    if (userRole !== 'ADMIN') {
      router.push('/unauthorized'); // Optional: create this page
      return;
    }

    setChecking(false);
  }, [isAuthenticated, isActive, userRole, router]);

  if (checking || !isAuthenticated || isActive === false || userRole !== 'ADMIN') {
    return null;
  }

  return (
    <SideBar>
      {/* <ChatBubble /> */}
      {children}
    </SideBar>
  );
};

export default AdminRoute;
