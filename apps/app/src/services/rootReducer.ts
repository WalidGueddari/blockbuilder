import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import containerReducer from './containerSlice';
import logReducer from './logsSlice';
import networkReducer from './networkSlice';
import nodeReducer from './nodeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  container: containerReducer,
  node: nodeReducer,
  network: networkReducer,
  logs: logReducer,
});

export default rootReducer;
