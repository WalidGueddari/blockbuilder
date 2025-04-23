// useWebSocket.ts
import {
  addMessage,
  connect as connectAction,
  connected,
  disconnected,
  setError,
  updateStatus,
} from '@/services/v1/websocketSlice';
import { addNotification, updateNotification } from '@/services/v2/notificationSlice';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

interface UseWebSocketParams {
  mode: 'logs' | 'status' | 'status-job';
  networkId?: string;
  container?: string;
  vmId?: string;
  nodeId?: string;
  userId?: string;
}

const useWebSocket = ({ mode, networkId, container, vmId, nodeId, userId }: UseWebSocketParams) => {
  const dispatch = useDispatch();
  const socketRef = useRef<WebSocket | null>(null);
  const lastStatuses = useRef<Record<string, string>>({});

  useEffect(() => {
    let url: string | null = null;

    switch (mode) {
      case 'logs':
        if (!container || !vmId || !networkId) return;
        url = `${process.env.NEXT_PUBLIC_BASE_WS_URL_V2}/ws/get-logs/${container}/${vmId}`;
        break;

      case 'status':
        if (!nodeId) return;
        url = `${process.env.NEXT_PUBLIC_BASE_WS_URL_V2}/ws/get-status/${nodeId}`;
        break;

      case 'status-job':
        if (!userId) return;
        url = `${process.env.NEXT_PUBLIC_BASE_WS_URL_V2}/ws/get-status-job/${userId}`;
        break;

      default:
        return;
    }

    dispatch(connectAction());
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connected:', url);
      dispatch(connected());
    };

    socket.onmessage = (event) => {
      try {
        const { success, data, error, message } = JSON.parse(event.data);

        if (!success) {
          dispatch(setError(error || message));
          return;
        }

        if (mode === 'logs' && data.log) {
          dispatch(
            addMessage({
              timestamp: new Date().toISOString(),
              message: data.log,
            }),
          );
        } else if (mode === 'status' && data.status) {
          dispatch(updateStatus(data.status));
        } else if (mode === 'status-job' && data.jobId && data.status && data.networkName) {
          const { jobId, status, networkName } = data;
          console.log('Job status update:', jobId, status, networkName);
          const prev = lastStatuses.current[jobId];
          const time = new Date()
            .toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
            .toLowerCase();

          if (!prev) {
            lastStatuses.current[jobId] = status;
            dispatch(
              addNotification({
                id: `${jobId}-created-${Date.now()}`,
                title: `Network: ${networkName}`,
                description: `Status: ${status}`,
                time,
                read: false,
              }),
            );
          } else if (prev !== status) {
            lastStatuses.current[jobId] = status;
            dispatch(
              updateNotification({
                id: `${jobId}-updated-${Date.now()}`,
                changes: {
                  description: `Status: ${status}`,
                  read: false,
                },
              }),
            );
          }
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
        dispatch(setError('Error parsing message from server.'));
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      dispatch(setError('WebSocket encountered an error.'));
    };

    socket.onclose = (event) => {
      console.log('WebSocket closed:', event);
      dispatch(disconnected());
    };

    return () => {
      socketRef.current?.close();
    };
  }, [mode, networkId, container, vmId, nodeId, userId, dispatch]);

  const sendMessage = (msg: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(msg);
    }
  };

  return { sendMessage };
};

export default useWebSocket;
