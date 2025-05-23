// src/hooks/useJobsWebSocket.ts
'use client';

import { useAppDispatch } from '@/services/hooks';
import { addNotification, updateNotification } from '@/services/v2/notificationSlice';
import { useEffect, useRef } from 'react';

// src/hooks/useJobsWebSocket.ts

// src/hooks/useJobsWebSocket.ts

// src/hooks/useJobsWebSocket.ts

// src/hooks/useJobsWebSocket.ts

export default function useJobsWebSocket(jobIds: string[]) {
  const dispatch = useAppDispatch();
  // keep all sockets alive across renders
  const socketsRef = useRef<WebSocket[]>([]);

  useEffect(() => {
    // tear down any existing sockets
    socketsRef.current.forEach((s) => s.close());
    socketsRef.current = [];

    // open a new socket for each jobId
    jobIds.forEach((jobId) => {
      const url = `${process.env.NEXT_PUBLIC_BASE_WS_URL_V2}/ws/jobs/${jobId}`;
      const ws = new WebSocket(url);
      socketsRef.current.push(ws);

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
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
      };

      ws.onerror = () => {
        // you could dispatch an error if you have that slice
        console.error(`WebSocket error for job ${jobId}`);
      };
    });

    return () => {
      // clean up when list changes or component unmounts
      socketsRef.current.forEach((s) => s.close());
      socketsRef.current = [];
    };
  }, [dispatch, jobIds.join(',')]); // join for a simple stable dependency

  // no return value needed if you never call sendMessage
}
