'use client';

import { SideBar } from '@/components/layout/sidebar';
import ChatBubble from '@/components/modules/v1/bot/chatBubble-overview';
import { useAuth } from '@/context/AuthContext';
import { useUserActive } from '@/hooks/use-activation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { userIsActive, isLoading } = useUserActive();
  const router = useRouter();

  useEffect(() => {
    // 1) If we're still checking activation, do nothing.
    if (isLoading) {
      return;
    }

    // 2) Not logged in? → /home
    if (!isAuthenticated) {
      router.push('/home');
      return;
    }

    // 3) Logged in but not active? → /activation
    if (!userIsActive) {
      router.push('/activation');
    }
  }, [isAuthenticated, isLoading, userIsActive, router]);

  // While auth or activation is being checked, don't flash protected content
  if (!isAuthenticated || isLoading) {
    return null;
  }

  // Authenticated & active → render protected UI
  return (
    <SideBar>
      <ChatBubble />
      {children}
    </SideBar>
  );
};

export default ProtectedRoute;
