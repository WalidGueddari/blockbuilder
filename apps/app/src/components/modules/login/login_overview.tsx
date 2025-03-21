'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { login, selectAuth } from '@/services/v1/authSlice';
import { BugPlay, Loader2, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(selectAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const resultAction = await dispatch(login({ email, password }));

    if (login.fulfilled.match(resultAction)) {
      router.push('/');
    } else {
      console.error('Login failed');
    }
  };

  return (
    <div className="bg- flex min-h-screen items-center justify-center">
      <div className="flex w-full flex-col items-center justify-center p-4 md:flex-row">
        <Card className="relative w-full max-w-md overflow-hidden border shadow-xl md:w-1/2">
          {/* <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div> */}

          <CardHeader className="space-y-1">
            {/* <div className="flex items-center justify-center mb-2">
              <BugPlay className="h-10 w-10 text-primary" />
            </div> */}
            <CardTitle className="text-center text-3xl font-bold">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email.
                  </Label>
                  <div className="relative">
                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail size={18} />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link href="/support" className="text-primary text-xs hover:underline">
                      Need help?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock size={18} />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-6 text-base font-medium transition-all hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Sign In'}
              </Button>

              <div className="bg-background border-primary rounded-md border p-3 text-sm">
                <p className="text-accent-foreground mb-1 font-medium">Need an account?</p>
                <p className="text-muted-foreground">
                  Contact our team to request access credentials at{' '}
                  <a href="mailto:contact@nexus-lab.io" className="font-medium underline ">
                    contact@nexus-lab.io
                  </a>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
