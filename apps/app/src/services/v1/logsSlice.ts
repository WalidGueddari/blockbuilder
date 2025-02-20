// src/features/logs/logsSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface Log {
  timestamp: string; // You can adjust the fields based on your log format
  message: string;
}

interface LogsState {
  logs: Log[];
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  error: string | null;
}

const initialState: LogsState = {
  logs: [],
  connectionStatus: 'disconnected',
  error: null,
};

const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    connect(state) {
      state.connectionStatus = 'connecting';
      state.error = null;
    },
    connected(state) {
      state.connectionStatus = 'connected';
      state.error = null;
    },
    disconnected(state) {
      state.connectionStatus = 'disconnected';
    },
    addLog(state, action: PayloadAction<Log>) {
      state.logs.push(action.payload);
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.connectionStatus = 'disconnected';
    },
    clearLogs(state) {
      state.logs = [];
    },
  },
});

export const { connect, connected, disconnected, addLog, setError, clearLogs } = logsSlice.actions;

export default logsSlice.reducer;
