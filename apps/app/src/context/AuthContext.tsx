'use client';

import { selectAuth } from '@/services/authSlice';
import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface AuthContextProps {
  isAuthenticated: boolean | null;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector(selectAuth);
  const [localAuth, setLocalAuth] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('access_token');
      setLocalAuth(!!token);
    }
  }, [isAuthenticated]);

  const setAuthenticated = (value: boolean) => {
    setLocalAuth(value);
    if (value && typeof window !== 'undefined') {
      sessionStorage.setItem('access_token', 'your_token_value_here');
    } else if (typeof window !== 'undefined') {
      sessionStorage.removeItem('access_token');
    }
  };

  if (localAuth === null) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
        <div className="flex h-20 w-20 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-blue-600 text-4xl text-blue-600">
          <div className="flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-blue-600 text-2xl text-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: localAuth, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
