import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import networkReducer from './networkSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  network: networkReducer,
});

export default rootReducer;
