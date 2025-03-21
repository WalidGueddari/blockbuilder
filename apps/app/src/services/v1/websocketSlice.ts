// websocketSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface WebSocketMessage {
  timestamp: string;
  message: string;
}

interface WebSocketState {
  messages: WebSocketMessage[];
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  error: string | null;
  nodeStatus: string; // Added for status updates
}

const initialState: WebSocketState = {
  messages: [],
  connectionStatus: 'disconnected',
  error: null,
  nodeStatus: '', // default value
};

const websocketSlice = createSlice({
  name: 'websocket',
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
    addMessage(state, action: PayloadAction<WebSocketMessage>) {
      state.messages.push(action.payload);
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.connectionStatus = 'disconnected';
    },
    clearMessages(state) {
      state.messages = [];
    },
    updateStatus(state, action: PayloadAction<string>) {
      state.nodeStatus = action.payload;
    },
  },
});

export const {
  connect,
  connected,
  disconnected,
  addMessage,
  setError,
  clearMessages,
  updateStatus,
} = websocketSlice.actions;

export default websocketSlice.reducer;
