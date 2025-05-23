'use client';

import { useEffect, useState } from 'react';

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get user data from session storage
    const stored = sessionStorage.getItem('user');
    // console.log('Stored user:', stored);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.id) setRole(parsed.role);
        // console.log('User role:', parsed.role);
      } catch {
        console.error('Invalid user in sessionStorage');
      }
    }
  }, []);

  // setIsLoading(false);
  const isAdmin = role === 'ADMIN';

  console.log('User role:', role);

  return { role, isAdmin, isLoading };
}
