// useWebSocket.ts (modified for status mode)
import {
  addMessage,
  connect as connectAction,
  connected,
  disconnected,
  setError,
  updateStatus, // import new action
} from '@/services/v1/websocketSlice';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

interface UseWebSocketParams {
  mode: 'logs' | 'status';
  networkId?: string;
  container?: string;
  vmId?: string;
  nodeId?: string;
}

const useWebSocket = ({ mode, networkId, container, vmId, nodeId }: UseWebSocketParams) => {
  const dispatch = useDispatch();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let url: string | null = null;

    if (mode === 'logs') {
      if (!container || !vmId || networkId === undefined) return;
      url = `${process.env.NEXT_PUBLIC_BASE_WS_URL_V2}/ws/get-logs/${container}/${vmId}`;
    } else if (mode === 'status') {
      if (!nodeId) return;
      url = `${process.env.NEXT_PUBLIC_BASE_WS_URL_V2}/ws/get-status/${nodeId}`;
    } else {
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
        const data = JSON.parse(event.data);

        if (!data.success && (data.error || data.message)) {
          dispatch(setError(data.error || data.message));
          return;
        }

        if (mode === 'logs') {
          if (data.log) {
            dispatch(addMessage({ timestamp: new Date().toISOString(), message: data.log }));
          } else if (data.message) {
            console.log('Message from logs server:', data.message);
          }
        } else if (mode === 'status') {
          if (data.data) {
            // Dispatch updateStatus action with the new status
            dispatch(updateStatus(data.data.status));
          } else if (data.message) {
            console.log('Message from status server:', data.message);
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
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [mode, networkId, container, vmId, nodeId, dispatch]);

  const sendMessage = (msg: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(msg);
    }
  };

  return { sendMessage };
};

export default useWebSocket;
