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
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { updateNotification } from '@/services/v2/notificationSlice';
import { Bell } from 'lucide-react';
import * as React from 'react';

// notifications.tsx

// notifications.tsx

export function NotificationPanel() {
  // 1) Grab notifications from Redux:
  const notifications = useAppSelector((state) => state.notifications.items);
  const dispatch = useAppDispatch();

  // 2) Filter out how many are "unread":
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 3) Mark a single notification as read
  const markAsRead = (id: string) => {
    dispatch(
      updateNotification({
        id,
        changes: { read: true },
      }),
    );
  };

  // 4) Mark all as read
  const markAllAsRead = () => {
    notifications.forEach((notif) => {
      if (!notif.read) {
        dispatch(
          updateNotification({
            id: notif.id,
            changes: { read: true },
          }),
        );
      }
    });
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

                  {/* If it's unread, show the dot */}
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
  );
}
