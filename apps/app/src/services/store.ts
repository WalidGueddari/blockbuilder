import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import networkReducer from './networkSlice';
import nodeReducer from './nodeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    network: networkReducer,
    node: nodeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
