'use client';

import { Spinner } from '@/components/common/spinner';
import { selectAuth } from '@/services/v1/authSlice';
import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface AuthContextProps {
  isAuthenticated: boolean | null;
  setAuthenticated: (value: boolean) => void;
  userRole: string | null;
  setUserRole: (role: string | null) => void;
  isActive: boolean | null;
  setIsActive: (value: boolean | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user } = useSelector(selectAuth);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('access_token');
      const storedUser = sessionStorage.getItem('user');

      setIsAuthenticated(!!token);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserRole(parsedUser.role || null);
        setIsActive(parsedUser.isActive ?? null);
      }
    }
  }, [accessToken, user]);

  const setAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
    if (!value && typeof window !== 'undefined') {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user');
      setUserRole(null);
      setIsActive(null);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setAuthenticated,
        userRole,
        setUserRole,
        isActive,
        setIsActive,
      }}
    >
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
