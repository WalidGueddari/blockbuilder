'use client';

import { SideBar } from '@/components/layout/sidebar';
import ChatBubble from '@/components/modules/v1/bot/chatBubble-overview';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        router.push('/home');
      }
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
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
