// src/hooks/use-activation.ts
import { useEffect, useState } from 'react';

export function useUserActive() {
  const [userIsActive, setUserIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = false;
    try {
      const stored = sessionStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed user from sessionStorage:', parsed);
        active = Boolean(parsed.isActive);
        console.log(`User ${parsed.email} is:`, active);
      }
    } catch (err) {
      console.error('Failed to parse user from sessionStorage', err);
    }

    setUserIsActive(active);

    console.log('User is active:', active);
    setIsLoading(false);
  }, []);

  return { userIsActive, isLoading };
}
