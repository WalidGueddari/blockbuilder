// notifications.tsx
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
import { Toaster } from '@/components/ui/sonner';
import { useToast } from '@/components/ui/use-toast';
import useWebSocket from '@/hooks/useWebSocket';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { updateNotification } from '@/services/v2/notificationSlice';
import { Bell } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';

// notifications.tsx

export function NotificationPanel() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // 1) Load userId from sessionStorage
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    try {
      const user = sessionStorage.getItem('user');
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to view notifications.',
          variant: 'destructive',
        });
        return;
      }
      const parsed = JSON.parse(user);
      if (!parsed?.id) {
        toast({
          title: 'Invalid User Data',
          description: 'Your session appears to be corrupted. Please log in again.',
          variant: 'destructive',
        });
        return;
      }
      setUserId(parsed.id);
    } catch (e) {
      console.error('Failed to parse user from sessionStorage:', e);
      toast({
        title: 'Session Error',
        description: 'There was a problem with your session. Please log in again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // 2) Subscribe to job‑status updates (will no‑op until userId is set)
  useWebSocket({ mode: 'status-job', userId: userId ?? undefined });

  // 3) Grab and toast new notifications
  const notifications = useAppSelector((state) => state.notifications.items);
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length) {
      unread.forEach((notification) => {
        toast({
          title: notification.title,
          description: notification.description,
          variant: 'default',
        });
      });
    }
  }, [notifications, toast]);

  // 4) Unread count & mark‑read actions
  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAsRead = (id: string) => dispatch(updateNotification({ id, changes: { read: true } }));
  const markAllAsRead = () =>
    notifications.forEach((n) => {
      if (!n.read) {
        dispatch(updateNotification({ id: n.id, changes: { read: true } }));
      }
    });

  return (
    <>
      <Toaster />
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

        <DropdownMenuContent align="end" className="w-96">
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
              [...notifications]
                .slice()
                .reverse()
                .map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex cursor-pointer flex-col items-start py-2"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex w-full justify-between gap-2">
                      <span className={`font-medium ${notification.read ? '' : 'text-primary'}`}>
                        {notification.title}
                      </span>
                      {notification.time && (
                        <span className="text-muted-foreground text-xs">{notification.time}</span>
                      )}
                    </div>

                    {notification.description && (
                      <span className="text-muted-foreground text-sm">
                        {notification.description}
                      </span>
                    )}

                    {!notification.read && (
                      <div className="bg-primary mt-1 h-2 w-2 rounded-full"></div>
                    )}
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
    </>
  );
}
