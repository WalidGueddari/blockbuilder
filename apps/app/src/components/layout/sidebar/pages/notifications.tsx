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
import { Bell } from 'lucide-react';
import * as React from 'react';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export function NotificationPanel() {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: '1',
      title: 'New message',
      description: 'You have a new message from Sarah',
      time: '5 min ago',
      read: false,
    },
    {
      id: '2',
      title: 'Project update',
      description: 'Changes were committed to the project',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '3',
      title: 'Reminder',
      description: 'Meeting with the team tomorrow at 10 AM',
      time: 'Yesterday',
      read: true,
    },
    {
      id: '4',
      title: 'New message',
      description: 'You have a new message from Sarah',
      time: '5 min ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto text-xs font-normal"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex cursor-pointer flex-col items-start py-2"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full justify-between gap-2">
                  <span className={`font-medium ${notification.read ? '' : 'text-primary'}`}>
                    {notification.title}
                  </span>
                  <span className="text-muted-foreground text-xs">{notification.time}</span>
                </div>
                <span className="text-muted-foreground text-sm">{notification.description}</span>
                {!notification.read && <div className="bg-primary mt-1 h-2 w-2 rounded-full"></div>}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="text-muted-foreground py-6 text-center">No notifications</div>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center">
          <Button variant="ghost" size="sm" className="w-full" disabled>
            View all notifications
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
