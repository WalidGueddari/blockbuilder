// src/components/modules/v2/activation/overview.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { activateUser, selectAdminLoading } from '@/services/v1/adminSlice';
import { CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// src/components/modules/v2/activation/overview.tsx

export default function ActivationPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isLoading = useAppSelector(selectAdminLoading);

  // null = loading; true/false = determined
  const [userIsActive, setUserIsActive] = useState<boolean | null>(null);
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [activationError, setActivationError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // On mount: load user, set id & activation status, or redirect to login
  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (!stored) {
      router.replace('/login');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.id) setUserId(parsed.id);
      setUserIsActive(Boolean(parsed.isActive));
    } catch {
      console.error('Invalid user in sessionStorage');
      router.replace('/login');
    }
  }, [router]);

  // Redirect if already active
  useEffect(() => {
    if (userIsActive === true) {
      router.replace('/');
    }
  }, [userIsActive, router]);

  // Show loading while we determine activation status
  if (userIsActive === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Checking activation status…</p>
      </div>
    );
  }

  // Handle activation form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activationCode = code.join('');
    if (activationCode.length !== code.length) {
      return toast({
        title: 'Invalid code',
        description: `Enter all ${code.length} digits.`,
        variant: 'destructive',
      });
    }
    if (!userId) {
      return toast({
        title: 'Missing user ID',
        description: 'Unable to activate without your user ID.',
        variant: 'destructive',
      });
    }

    try {
      const payload = await dispatch(activateUser({ userId, code: activationCode })).unwrap();

      // 1) mark active locally
      setUserIsActive(true);

      // 2) **correctly** persist the updated flag
      const stored = sessionStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.isActive = true; // <- force it true
          sessionStorage.setItem('user', JSON.stringify(parsed));
        } catch {
          console.error('Failed to update sessionStorage user');
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Activation failed. Please try again.';
      setActivationError(errorMsg);
    }
  };

  // UI
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Activate Your Account</CardTitle>
          <CardDescription>Please enter the 6-digit code sent to your email.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Show success or error or form */}
          {userIsActive ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center text-lg font-medium">Activation successful!</p>
              <p className="text-center text-sm text-gray-500">Redirecting you home…</p>
            </div>
          ) : activationError ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-center text-lg font-medium">Activation failed</p>
              <p className="text-center text-sm text-gray-500">{activationError}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setActivationError(null);
                  setCode(Array(6).fill(''));
                }}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-6 flex justify-center space-x-2">
                {code.map((digit, idx) => (
                  <Input
                    key={idx}
                    id={`code-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !/^[0-9]$/.test(val)) return;
                      const newCode = [...code];
                      newCode[idx] = val;
                      setCode(newCode);
                      if (val && idx < code.length - 1) {
                        document.getElementById(`code-${idx + 1}`)?.focus();
                      }
                    }}
                    className="h-12 w-12 text-center text-xl"
                  />
                ))}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Activating...' : 'Activate'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-center text-sm text-gray-500">
            Didn’t receive a code? Check your spam folder or…
          </p>
          <Button variant="link" className="h-auto p-0" disabled={isLoading}>
            Request a new code
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
