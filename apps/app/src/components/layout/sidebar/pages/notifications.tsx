//notifiction panel
'use client';

import { Badge } from '@/components/ui/badge';
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
import useWebSocket from '@/hooks/useWebSocket';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { fetchJobsByUserId, updateNotification } from '@/services/v2/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, Dot, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

//notifiction panel

//notifiction panel

export function NotificationPanel() {
  const dispatch = useAppDispatch();
  const [userId, setUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Load user ID from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.id) setUserId(parsed.id);
      } catch {
        console.error('Invalid user in sessionStorage');
      }
    }
  }, []);

  // Fetch jobs when dropdown opens or userId changes
  useEffect(() => {
    if (userId && isOpen) {
      dispatch(fetchJobsByUserId({ userId, page: 1, limit: 5 }));
    }
  }, [dispatch, userId, isOpen]);

  // Refresh notifications every minute when dropdown is open
  useEffect(() => {
    if (!isOpen || !userId) return;

    const intervalId = setInterval(() => {
      dispatch(fetchJobsByUserId({ userId, page: 1, limit: 5 }));
    }, 60000);

    return () => clearInterval(intervalId);
  }, [dispatch, userId, isOpen]);

  // Select notifications state
  const jobs = useAppSelector((state) => state.notifications.items);
  const jobIds = jobs.map((j) => j.id);
  // subscribe them all in one shot
  jobIds.forEach((jobId) => {
    useWebSocket({ mode: 'jobs', jobId });
  });
  const loading = useAppSelector((state) => state.notifications.loading);
  const error = useAppSelector((state) => state.notifications.error);

  // Mock read state (in a real app, this would be stored in your state management)
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  const markAsRead = (id: string) => {
    setReadNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const markAllAsRead = () => {
    const newSet = new Set(readNotifications);
    jobs.forEach((job) => newSet.add(job.id));
    setReadNotifications(newSet);
  };

  const unreadCount = jobs.filter((job) => !readNotifications.has(job.id)).length;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'outline';
      case 'done':
        return 'secondary';
    }
  };

  const normalize = (status: string) => (status === 'Blockchain ready' ? 'Done' : 'Processing...');

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications ({unreadCount} unread)</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[350px] sm:w-[400px]">
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <span className="text-base font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto py-1">
          {loading ? (
            <div className="text-muted-foreground flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : error ? (
            <div className="py-6 text-center text-red-500">
              <p>Failed to load notifications</p>
              <p className="text-xs">{error}</p>
            </div>
          ) : jobs.length > 0 ? (
            [...jobs]
              .slice()
              .reverse()
              .map((job) => {
                const isRead = readNotifications.has(job.id);
                return (
                  <DropdownMenuItem
                    key={job.id}
                    className={`flex cursor-pointer items-start gap-2 p-3 ${isRead ? '' : 'bg-muted/30'}`}
                    onClick={() => markAsRead(job.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isRead ? '' : 'font-semibold'}`}>
                          {job.Network?.name ?? 'Unnamed Network'}
                        </span>
                        <Badge variant={getStatusColor(normalize(job.status))} className="ml-2">
                          {normalize(job.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">{job.status}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(job.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {!isRead && <Dot size={24} className="text-warning" />}
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })
          ) : (
            <div className="text-muted-foreground py-8 text-center">No notifications</div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
