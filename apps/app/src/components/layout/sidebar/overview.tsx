'use client';

import SubscriptionPopUp from '@/components/common/subscription-alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type React from 'react';

import { AppSidebar } from './pages/app-sidebar';
import { DynamicBreadcrumb } from './pages/dynamic-breadcrumb';
import { NotificationPanel } from './pages/notifications';
import { SettingsDropdown } from './pages/settings-dropdown';

interface SidebarProps {
  children: React.ReactNode;
}

export default function Page({ children }: SidebarProps) {
  const { userRole } = useAuth();
  const isDemo = userRole === 'DEMO';
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleCreateClick = () => {
    if (isDemo) {
      setShowPopup(true);
    } else {
      router.push('/create-network');
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb />
            </div>
            <div className="flex items-center gap-4 pr-4">
              <Button
                size="sm"
                onClick={handleCreateClick}
                className="flex items-center justify-center gap-1"
              >
                Create new Network
              </Button>
              <div className="flex items-center gap-2">
                <NotificationPanel />
                <SettingsDropdown />
              </div>
            </div>
          </header>

          {showPopup && <SubscriptionPopUp />}

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
