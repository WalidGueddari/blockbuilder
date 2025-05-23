'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useUserRole } from '@/hooks/use-user-role';
import { Activity, Code, Database, Settings2, Shield, Wallet } from 'lucide-react';
import type * as React from 'react';

import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';

const networkId = '1';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: Activity,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: '/',
          disabled: false,
        },
        {
          title: 'Analytics',
          url: '#',
          disabled: true, // Future feature
        },
      ],
    },
    {
      title: 'Networks',
      url: '#',
      icon: Database,
      isActive: true,
      items: [
        {
          title: 'Manage Networks',
          url: `/network`,
          disabled: false,
        },
        {
          title: 'Network Health',
          url: '#',
          disabled: true, // Future feature
        },
      ],
    },
    {
      title: 'Smart Contracts',
      url: '#',
      isActive: true,
      icon: Code,
      items: [
        {
          title: 'Deploy Smart Contract',
          url: '/smartcontract/create',
          disabled: false,
        },
        {
          title: 'Deployed Contracts',
          url: '/smartcontract/deployed',
          disabled: false,
        },
        {
          title: 'Drafts',
          url: '/smartcontract/drafts',
          disabled: false,
        },
        {
          title: 'Settings',
          url: '#',
          disabled: true,
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General Settings',
          url: '#',
          disabled: true, // Future feature
        },
      ],
    },
  ],
  adminNav: [
    {
      title: 'Administration',
      url: '#',
      icon: Shield,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: '/admin',
          disabled: false,
        },

        {
          title: 'Demo Accounts',
          url: '/admin/demo-accounts',
          disabled: true,
        },
        {
          title: 'User Management',
          url: '/admin/users',
          disabled: true,
        },
        {
          title: 'System Settings',
          url: '/admin/settings',
          disabled: true,
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Demo Project',
      url: '#',
      icon: Wallet,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isAdmin } = useUserRole();

  // Combine regular nav items with admin items if user is admin
  const navItems = isAdmin ? [...data.navMain, ...data.adminNav] : data.navMain;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
