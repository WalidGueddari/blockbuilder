'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, register, selectAuth } from '@/services/authSlice';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignUpForm() {
  const router = useRouter(); // useRouter hook from Next.js for navigation

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(selectAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Dispatch the SignUp action and wait for it to complete
    await dispatch(register({ email, password }));
  };

  return (
    <div className="dark flex min-h-screen w-full items-center justify-center bg-gradient-to-tl from-black via-gray-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute bottom-0 right-1/2 h-[40rem] w-[40rem] translate-x-1/2 animate-pulse rounded-full bg-purple-500 blur-[10rem]" />
          <div className="absolute right-1/4 top-0 h-[30rem] w-[30rem] animate-pulse rounded-full bg-cyan-500 blur-[10rem] delay-700" />
          <div className="absolute left-1/4 top-1/2 h-[35rem] w-[35rem] animate-pulse rounded-full bg-blue-500 blur-[10rem] delay-1000" />
        </div>
      </div>

      {/* Signup form */}
      <div className="relative mx-4 w-full max-w-md">
        <div className="rounded-2xl border border-gray-800 bg-black/30 p-8 shadow-2xl backdrop-blur-xl">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 animate-pulse rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 opacity-30 blur" />

            <div className="relative flex flex-col space-y-6 rounded-lg bg-black/80 p-6">
              <div className="space-y-2 text-center">
                <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-bold tracking-tighter text-transparent">
                  Create Account
                </h1>
                <p className="text-sm text-gray-400">Enter your details to create your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="you@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={loading}
                    className="border-gray-800 bg-gray-900/50 text-gray-100"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    disabled={loading}
                    className="border-gray-800 bg-gray-900/50 text-gray-100"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign Up'}
                </Button>
                {error && <p className="text-red-500">{error}</p>}
              </form>

              <div className="text-center text-sm">
                <Link href="/login" className="text-gray-400 transition-colors hover:text-gray-300">
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
