'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { PlusCircleIcon } from 'lucide-react';
import { ThemeProvider } from 'next-themes';
import Link from 'next/link';
import type React from 'react';

import { AppSidebar } from './pages/app-sidebar';
import { DynamicBreadcrumb } from './pages/dynamic-breadcrumb';
import { NotificationPanel } from './pages/notifications';
import { SettingsDropdown } from './pages/settings-dropdown';

interface SidebarProps {
  children: React.ReactNode;
}

export default function Page({ children }: SidebarProps) {
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
              {' '}
              {/* Increased gap for better separation */}
              <Link href="/create-network">
                <Button size="sm" className="flex items-center justify-center gap-1">
                  Create new Network
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <NotificationPanel />
                <SettingsDropdown />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
