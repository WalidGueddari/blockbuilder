// src/hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import {
  addLog,
  connect as connectAction,
  connected,
  disconnected,
  setError,
} from '../services/logsSlice';

interface UseWebSocketParams {
  networkId: string;
  container: string;
}

const useWebSocket = ({ container, networkId }: UseWebSocketParams) => {
  const dispatch = useDispatch();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!container || networkId === undefined) return;

    const url = `ws://localhost:8000/api/v1/containers/ws/get_logs/${container}`;
    dispatch(connectAction());

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connected');
      dispatch(connected());
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.success) {
          if (data.log) {
            dispatch(addLog({ timestamp: new Date().toISOString(), message: data.log }));
          } else if (data.message) {
            console.log('Message from server:', data.message);
          }
        } else {
          if (data.error) {
            dispatch(setError(data.error));
          } else if (data.message) {
            dispatch(setError(data.message));
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

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [container, networkId, dispatch]);

  const sendMessage = (msg: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(msg);
    }
  };

  return { sendMessage };
};

export default useWebSocket;
