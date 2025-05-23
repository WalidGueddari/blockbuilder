//DemoUserTable
'use client';

import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, X } from 'lucide-react';

import type { DemoUser } from './demo-user-dashboard';

//DemoUserTable

interface DemoUserTableProps {
  users: DemoUser[];
  toggleUserStatus: (userId: string) => void;
}

export function DemoUserTable({ users = [], toggleUserStatus }: DemoUserTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.create_at ? formatDate(user.create_at) : 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {user.role.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'outline' : 'destructive'} className="gap-1">
                    {user.isActive ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" />
                        <span>Inactive</span>
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => toggleUserStatus(user.id)}
                    />
                    <span className="text-muted-foreground text-xs">
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
