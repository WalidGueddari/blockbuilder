'use client';

// Import useAppDispatch
import { ModeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { logout } from '@/services/authSlice';
import { useAppDispatch } from '@/services/hooks';
import { ArrowLeftRight, Images, LayoutDashboard, LogOut, Menu, Users, X } from 'lucide-react';
// Import X icon for closing
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Separator } from '../ui/separator';

export function Navbar() {
  const [isActive, setIsActive] = useState(false); // State for mobile menu
  const dispatch = useAppDispatch();
  const router = useRouter();

  const toggleMenu = () => {
    setIsActive(!isActive);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Left section */}
          <div className="flex items-center">
            <div className="flex flex-shrink-0 items-center space-x-2">
              <span className="text-xl font-bold uppercase">Admin Panel</span>
            </div>
          </div>

          {/* Hamburger Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 sm:hidden">
            <ModeToggle />
            <Button
              onClick={toggleMenu}
              variant="secondary"
              className="inline-flex items-center justify-center p-2"
              aria-controls="mobile-menu"
              aria-expanded={isActive}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Right section */}
          <div className="hidden sm:ml-6 sm:block">
            <div className="flex space-x-4">
              <a href="/" className="hover:bg-secondary rounded-md px-3 py-2 text-sm font-medium">
                Dashboard
              </a>
              <a
                href="/users"
                className="hover:bg-secondary rounded-md px-3 py-2 text-sm font-medium"
              >
                Users
              </a>
              <a
                href="/transactions"
                className="hover:bg-secondary rounded-md px-3 py-2 text-sm font-medium"
              >
                Transactions
              </a>
              <a
                href="/nfts"
                className="hover:bg-secondary rounded-md px-3 py-2 text-sm font-medium"
              >
                NFTs
              </a>
              <Button
                onClick={handleLogout}
                variant="secondary"
                className="rounded-md px-3 py-2 text-sm font-medium"
              >
                <LogOut />
              </Button>
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`min-w-screen fixed inset-0 z-40 transform transition-transform ${
          isActive ? 'translate-x-0' : 'translate-x-full'
        } sm:hidden`}
      >
        <div className="bg-background relative flex h-full flex-col p-4">
          {/* Close Button */}
          <Button onClick={toggleMenu} variant="ghost" className="absolute right-4 top-4">
            <X className="h-6 w-6" />
          </Button>
          {/* Menu Links */}
          <div className="mt-16 flex-grow space-y-4">
            <a
              href="/"
              className="hover:bg-secondary flex items-center rounded-md px-3 py-2 text-lg font-medium"
            >
              <LayoutDashboard className="mr-2" />
              Dashboard
            </a>
            <a
              href="/users"
              className="hover:bg-secondary flex items-center rounded-md px-3 py-2 text-lg font-medium"
            >
              <Users className="mr-2" />
              Users
            </a>
            <a
              href="/transactions"
              className="hover:bg-secondary flex items-center rounded-md px-3 py-2 text-lg font-medium"
            >
              <ArrowLeftRight className="mr-2" />
              Transactions
            </a>
            <a
              href="/nfts"
              className="hover:bg-secondary flex items-center rounded-md px-3 py-2 text-lg font-medium"
            >
              <Images className="mr-2" />
              NFTs
            </a>
          </div>
          {/* Bottom section: Separator and Logout Button */}
          <div className="mt-auto flex flex-col space-y-4">
            <Separator />
            <Button
              onClick={handleLogout}
              className="text-md flex items-center rounded-md px-3 py-2"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
