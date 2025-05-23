//DemoUserDashboard
'use client';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  activateUser,
  deactivateUser,
  fetchAllUsers,
  selectAdminLimit,
  selectAdminPage,
  selectAdminTotal,
  selectAdminUsers,
} from '@/services/v1/adminSlice';
import type { User } from '@/types/v1/admin';
import { format } from 'date-fns';
import { Calendar, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CreateDemoUserForm } from './create-demo-user-form';
import { DemoUserTable } from './demo-user-table';

//DemoUserDashboard

export type DemoUser = User;

export default function DemoUserDashboard() {
  const dispatch = useDispatch();
  const users = useSelector(selectAdminUsers);
  const total = useSelector(selectAdminTotal);
  const currentPage = useSelector(selectAdminPage);
  const limit = useSelector(selectAdminLimit);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    loadUsers();
  }, [activeTab, currentPage]);

  const loadUsers = () => {
    dispatch(
      fetchAllUsers({
        isActive: activeTab === 'active' ? true : activeTab === 'inactive' ? false : true,
        page: currentPage,
        limit,
        search: searchQuery,
        date: date ? format(date, 'yyyy-MM-dd') : undefined,
      }) as any,
    );
  };

  const handleSearch = () => {
    setIsSearching(true);
    loadUsers();
    setIsSearching(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      loadUsers();
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDate(undefined);
    loadUsers();
  };

  const toggleUserStatus = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      if (user.isActive) {
        dispatch(deactivateUser({ userId }) as any);
      } else {
        dispatch(activateUser({ userId, code: '123456' }) as any);
      }
    }
  };

  const handleCreateSuccess = (name: string, email: string) => {
    setDialogOpen(false);
    loadUsers();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Create New User</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Demo User</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new demo user account.
                  </DialogDescription>
                </DialogHeader>
                <CreateDemoUserForm
                  onSuccess={handleCreateSuccess}
                  onCancel={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div className="flex w-full gap-2 sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button variant="outline" onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      {date ? format(date, 'PPP') : 'Filter by date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                {/* <TabsTrigger value="all">All Users</TabsTrigger> */}
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <DemoUserTable users={users} toggleUserStatus={toggleUserStatus} />
              </TabsContent>
              <TabsContent value="active" className="mt-4">
                <DemoUserTable users={users} toggleUserStatus={toggleUserStatus} />
              </TabsContent>
              <TabsContent value="inactive" className="mt-4">
                <DemoUserTable users={users} toggleUserStatus={toggleUserStatus} />
              </TabsContent>
            </Tabs>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            dispatch(
                              fetchAllUsers({
                                isActive:
                                  activeTab === 'active'
                                    ? true
                                    : activeTab === 'inactive'
                                      ? false
                                      : true,
                                page: currentPage - 1,
                                limit,
                                search: searchQuery,
                                date: date ? format(date, 'yyyy-MM-dd') : undefined,
                              }) as any,
                            );
                          }
                        }}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            isActive={pageNumber === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              dispatch(
                                fetchAllUsers({
                                  isActive:
                                    activeTab === 'active'
                                      ? true
                                      : activeTab === 'inactive'
                                        ? false
                                        : true,
                                  page: pageNumber,
                                  limit,
                                  search: searchQuery,
                                  date: date ? format(date, 'yyyy-MM-dd') : undefined,
                                }) as any,
                              );
                            }}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) {
                            dispatch(
                              fetchAllUsers({
                                isActive:
                                  activeTab === 'active'
                                    ? true
                                    : activeTab === 'inactive'
                                      ? false
                                      : true,
                                page: currentPage + 1,
                                limit,
                                search: searchQuery,
                                date: date ? format(date, 'yyyy-MM-dd') : undefined,
                              }) as any,
                            );
                          }
                        }}
                        className={
                          currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
