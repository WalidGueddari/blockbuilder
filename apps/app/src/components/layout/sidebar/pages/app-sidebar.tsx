'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Activity,
  Blocks,
  BookOpen,
  Code,
  Database,
  GitBranch,
  Settings2,
  Shield,
  Wallet,
} from 'lucide-react';
import type * as React from 'react';

import { NavMain } from './nav-main';
import { NavProjects } from './nav-project';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';

// This is sample data for a blockchain builder application.
const data = {
  user: {
    name: 'Alice Nakamoto',
    email: 'alice@blockbuilder.com',
    avatar: '',
  },
  teams: [
    {
      name: 'Team 1',
      logo: Wallet,
      plan: 'Enterprise',
    },
    {
      name: 'Team 2',
      logo: GitBranch,
      plan: 'Enterprise',
    },
    {
      name: 'Custom Chain',
      logo: Blocks,
      plan: 'Development',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: Activity,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: '#',
        },
        {
          title: 'Analytics',
          url: '#',
        },
        {
          title: 'Performance',
          url: '#',
        },
      ],
    },
    {
      title: 'Nodes',
      url: '#',
      icon: Database,
      items: [
        {
          title: 'Manage Nodes',
          url: '#',
        },
        {
          title: 'Node Health',
          url: '#',
        },
        {
          title: 'Scaling',
          url: '#',
        },
      ],
    },
    {
      title: 'Smart Contracts',
      url: '#',
      icon: Code,
      items: [
        {
          title: 'Deploy',
          url: '#',
        },
        {
          title: 'Interact',
          url: '#',
        },
        {
          title: 'Audit',
          url: '#',
        },
      ],
    },
    {
      title: 'Security',
      url: '#',
      icon: Shield,
      items: [
        {
          title: 'Permissions',
          url: '#',
        },
        {
          title: 'Encryption',
          url: '#',
        },
        {
          title: 'Monitoring',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Getting Started',
          url: '#',
        },
        {
          title: 'API Reference',
          url: '#',
        },
        {
          title: 'Best Practices',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Network Config',
          url: '#',
        },
        {
          title: 'Integrations',
          url: '#',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Team 1',
      url: '#',
      icon: Wallet,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
