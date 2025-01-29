import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import containerReducer from './containerSlice';
import networkReducer from './networkSlice';
import nodeReducer from './nodeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  container: containerReducer,
  node: nodeReducer,
  network: networkReducer,
});

export default rootReducer;
