'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import {
  BarChart3,
  Coins,
  Cpu,
  Database,
  FileCode,
  GitBranch,
  Key,
  Moon,
  Network,
  Settings,
  Shield,
  Sun,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

export function SettingsDropdown() {
  const { theme, setTheme } = useTheme();

  // Determine if dark mode is active
  const isDarkMode = theme === 'dark';

  // Toggle between light and dark mode
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  // Set system as default if theme is null or undefined
  React.useEffect(() => {
    if (!theme) {
      setTheme('system');
    }
  }, [theme, setTheme]);

  // Dummy state for blockchain builder settings
  const [testnetEnabled, setTestnetEnabled] = React.useState(true);
  const [autoDeployEnabled, setAutoDeployEnabled] = React.useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(true);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Quick toggles section */}
        <div className="grid grid-cols-2 gap-2 p-2">
          <Button
            variant="outline"
            size="sm"
            className="flex h-20 flex-col items-center justify-center gap-1"
            onClick={() => setTestnetEnabled(!testnetEnabled)}
            disabled
          >
            <Network
              className={`h-5 w-5 ${testnetEnabled ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <span className="text-xs">Testnet</span>
            <span className="text-muted-foreground text-[10px]">
              {testnetEnabled ? 'Connected' : 'Off'}
            </span>
          </Button>

          {/* <Button
            variant="outline"
            size="sm"
            className="flex h-20 flex-col items-center justify-center gap-1"
            onClick={() => setAutoDeployEnabled(!autoDeployEnabled)}
          >
            <Zap className={`h-5 w-5 ${autoDeployEnabled ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-xs">Auto Deploy</span>
            <span className="text-[10px] text-muted-foreground">{autoDeployEnabled ? "Enabled" : "Disabled"}</span>
          </Button> */}

          {/* <Button variant="outline" size="sm" className="flex h-20 flex-col items-center justify-center gap-1" disabled>
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs">Gas Limit</span>
            <span className="text-[10px] text-muted-foreground">8,000,000</span>
          </Button> */}

          <Button
            variant="outline"
            size="sm"
            className="flex h-20 flex-col items-center justify-center gap-1"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? (
              <Moon className="text-primary h-5 w-5" />
            ) : (
              <Sun className="text-primary h-5 w-5" />
            )}
            <span className="text-xs">Dark Mode</span>
            <span className="text-muted-foreground text-[10px]">{isDarkMode ? 'On' : 'Off'}</span>
          </Button>
        </div>

        {/* <DropdownMenuSeparator />
        <DropdownMenuLabel>Developer Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </div>
            <Switch checked={analyticsEnabled} onCheckedChange={setAnalyticsEnabled} />
          </DropdownMenuItem>

          <DropdownMenuItem disabled className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="mr-2 h-4 w-4" />
              <span>Database</span>
            </div>
            <span className="text-xs text-muted-foreground">MongoDB</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled className="flex items-center justify-between">
            <div className="flex items-center">
              <GitBranch className="mr-2 h-4 w-4" />
              <span>Version Control</span>
            </div>
            <span className="text-xs text-muted-foreground">GitHub</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Security</span>
            </div>
            <span className="text-xs text-muted-foreground">Configure</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled className="flex items-center justify-between">
            <div className="flex items-center">
              <Cpu className="mr-2 h-4 w-4" />
              <span>Compute Resources</span>
            </div>
            <span className="text-xs text-muted-foreground">Standard</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <Key className="mr-2 h-4 w-4" />
            <span>API Keys</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
            <Users className="mr-2 h-4 w-4" />
            <span>Team Access</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
            <Coins className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
            <FileCode className="mr-2 h-4 w-4" />
            <span>Documentation</span>
          </DropdownMenuItem>
        </DropdownMenuGroup> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
