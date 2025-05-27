'use client';

import { SideBar } from '@/components/layout/sidebar';
import ChatBubble from '@/components/modules/v1/bot/chatBubble-overview';
import { useAuth } from '@/context/AuthContext';
// Update if you're switching to Redux
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isActive } = useAuth();
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

    // All good — allow rendering
    setChecking(false);
  }, [isAuthenticated, isActive, router]);

  // Don't flash protected content while auth is being validated
  if (checking || !isAuthenticated || isActive === false) {
    return null;
  }

  return (
    <SideBar>
      <ChatBubble />
      {children}
    </SideBar>
  );
};

export default ProtectedRoute;
