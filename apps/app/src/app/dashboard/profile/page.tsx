'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-bold tracking-tighter text-transparent">
          Profile Settings
        </h1>
        <p className="mt-2 text-gray-400">Manage your account settings and preferences</p>
      </div>

      <Card className="border-gray-800 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-300">
                  First name
                </Label>
                <Input
                  id="firstName"
                  defaultValue="John"
                  disabled={isLoading}
                  className="border-gray-800 bg-gray-900/50 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-300">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  defaultValue="Doe"
                  disabled={isLoading}
                  className="border-gray-800 bg-gray-900/50 text-gray-100"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-gray-800 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Security</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-gray-300">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                disabled={isLoading}
                className="border-gray-800 bg-gray-900/50 text-gray-100"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-300">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  disabled={isLoading}
                  className="border-gray-800 bg-gray-900/50 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  disabled={isLoading}
                  className="border-gray-800 bg-gray-900/50 text-gray-100"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
