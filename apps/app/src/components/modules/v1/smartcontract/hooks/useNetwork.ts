import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import {
  fetchNetworksByUserId,
  selectNetworkLoading,
  selectNetworks,
} from '@/services/v1/networkSlice';
import { useEffect, useState } from 'react';

export const useNetwork = () => {
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const networks = useAppSelector(selectNetworks);
  const networksLoading = useAppSelector(selectNetworkLoading);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // Get user ID from sessionStorage
  useEffect(() => {
    try {
      const user = sessionStorage.getItem('user');
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to create a smart contract.',
          variant: 'destructive',
        });
        return;
      }

      const parsedUser = JSON.parse(user);
      if (!parsedUser?.id) {
        toast({
          title: 'Invalid User Data',
          description: 'Your session appears to be corrupted. Please log in again.',
          variant: 'destructive',
        });
        return;
      }

      setUserId(parsedUser.id);
    } catch (e) {
      console.error('Failed to parse user from sessionStorage:', e);
      toast({
        title: 'Session Error',
        description: 'There was a problem with your session. Please log in again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Fetch networks when userId is available
  useEffect(() => {
    if (userId) {
      dispatch(fetchNetworksByUserId({ userId, page: 1, limit: 10 }));
    }
  }, [dispatch, userId]);

  return {
    selectedNetworkId,
    setSelectedNetworkId,
    networks,
    networksLoading,
  };
};
