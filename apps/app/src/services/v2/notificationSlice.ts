// notificationsSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'success' | 'error';
  // Additional fields:
  read?: boolean;
  time?: string; // e.g. to store creation timestamp
}

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [],
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.push(action.payload);
    },
    updateNotification: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<Notification> }>,
    ) => {
      const { id, changes } = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...changes };
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addNotification, updateNotification, removeNotification } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
