'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import useWebSocket from '@/hooks/useWebSocket';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { clearLogs } from '@/services/v1/logsSlice';
import { AlertCircle, CheckCircle2, Loader2, Terminal } from 'lucide-react';
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
  }, [logs]); // Changed dependency to logs to scroll when new logs arrive

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

  const isLoading = connectionStatus !== 'connected' || logs.length === 0;

  return (
    <Card className="mx-auto w-full max-w-6xl">
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
        <ScrollArea className="h-[400px] w-full rounded border">
          {error && (
            <div className="flex h-[400px] w-full flex-col items-center justify-center">
              <div className="flex items-center justify-center">
                <Terminal className="text-muted-foreground h-12 w-12 opacity-20" />
              </div>
              <p className="text-muted-foreground mt-3 text-sm">
                {connectionStatus === 'connected'
                  ? 'Waiting for logs...'
                  : 'Failed to connect to log stream...'}
              </p>
            </div>
          )}
          {isLoading ? (
            <div className="flex h-[400px] w-full flex-col items-center justify-center">
              <div className="flex items-center justify-center">
                <Loader2 className="text-primary h-12 w-12 animate-spin" />
              </div>
              <p className="text-muted-foreground mt-3 text-sm">
                {connectionStatus === 'connected'
                  ? 'Waiting for logs...'
                  : 'Connecting to log stream...'}
              </p>
            </div>
          ) : (
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
          )}
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LogsViewer;
