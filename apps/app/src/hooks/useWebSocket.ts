'use client';

import { selectAuthState } from '@/services/v1/authSlice';
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
import { useDispatch, useSelector } from 'react-redux';

interface UseWebSocketParams {
  mode: 'logs' | 'status' | 'jobs';
  networkId?: string;
  container?: string;
  vmId?: string;
  nodeId?: string;
  jobId?: string;
}

const useWebSocket = ({ mode, networkId, container, vmId, nodeId, jobId }: UseWebSocketParams) => {
  const dispatch = useDispatch();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // figure out the URL strictly inside the effect
    let url: string | null = null;

    if (mode === 'logs') {
      if (!container || !vmId || networkId === undefined) {
        return; // exit the EFFECT, not the hook
      }
      url = `${process.env.NEXT_PUBLIC_BASE_WS_URL_V2}/ws/get-logs/${container}/${vmId}`;
    } else if (mode === 'status') {
      if (!nodeId) return;
      url = `${process.env.NEXT_PUBLIC_BASE_WS_URL_V2}/ws/get-status/${nodeId}`;
    } else if (mode === 'jobs') {
      if (!jobId) return;
      url = `${process.env.NEXT_PUBLIC_BASE_WS_URL_V2}/ws/jobs/${jobId}`;
    } else {
      return;
    }

    // now we know we have a URL, so start the socket
    dispatch(connectAction());
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => dispatch(connected());

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.success && (data.error || data.message)) {
          dispatch(setError(data.error || data.message));
          return;
        }
        switch (mode) {
          case 'logs':
            data.log &&
              dispatch(
                addMessage({
                  timestamp: new Date().toISOString(),
                  message: data.log,
                }),
              );
            break;
          case 'status':
            data.data && dispatch(updateStatus(data.data.status));
            break;
          case 'jobs':
            if (data.type === 'job_created') {
              dispatch(addNotification(data.job));
            } else if (data.type === 'job_updated') {
              dispatch(
                updateNotification({
                  id: data.job.id,
                  changes: {
                    status: data.job.status,
                    updatedAt: data.job.updatedAt,
                  },
                }),
              );
            }
            break;
        }
      } catch {
        dispatch(setError('Error parsing message from server.'));
      }
    };

    socket.onerror = () => dispatch(setError('WebSocket encountered an error.'));
    socket.onclose = () => dispatch(disconnected());

    return () => {
      socketRef.current?.close();
    };
  }, [mode, networkId, container, vmId, nodeId, jobId, dispatch]);

  return {
    sendMessage: (msg: string) => socketRef.current?.send(msg),
  };
};

export default useWebSocket;
