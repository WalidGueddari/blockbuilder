'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import useWebSocket from '@/hooks/useWebSocket';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { clearLogs } from '@/services/v1/logsSlice';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef } from 'react';

interface LogsViewerProps {
  networkId: string;
  container: string;
  vmId: string;
}

const LogsViewer: React.FC<LogsViewerProps> = ({ networkId, container, vmId }) => {
  const dispatch = useAppDispatch();
  const { logs, connectionStatus, error } = useAppSelector((state) => state.logs);
  useWebSocket({ networkId, container, vmId });
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(clearLogs());
  }, [dispatch]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logsEndRef]); // Updated dependency

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <Card className="mx-auto w-full max-w-6xl ">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Logs for Container {container}</span>
          <Badge className={`${getStatusColor()} text-white`}>
            {connectionStatus === 'connected' ? (
              <CheckCircle2 className="mr-1 h-4 w-4" />
            ) : (
              <AlertCircle className="mr-1 h-4 w-4" />
            )}
            {connectionStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )} */}
        <ScrollArea className="h-[400px] w-full rounded border">
          <div className="p-4">
            <pre className="whitespace-pre font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="py-1">
                  <span className="mr-2 text-gray-500">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className="text-foreground">{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </pre>
          </div>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LogsViewer;
