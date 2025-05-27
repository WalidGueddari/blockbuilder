'use client';

import { useEffect, useState } from 'react';

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.id && parsed?.role) {
          setRole(parsed.role);
        }
      } catch {
        console.error('Invalid user object in sessionStorage');
      }
    } else {
      console.warn('No user data in sessionStorage');
    }

    setIsLoading(false);
  }, []);

  const isAdmin = role === 'ADMIN';
  console.log('User role:', role, 'Is admin:', isAdmin);

  return { role, isAdmin, isLoading };
}
