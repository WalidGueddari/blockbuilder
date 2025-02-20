import { combineReducers } from '@reduxjs/toolkit';

//v1 reducers
import authReducer from './v1/authSlice';
import containerReducer from './v1/containerSlice';
import logReducer from './v1/logsSlice';
import networkReducer from './v1/networkSlice';
import nodeReducer from './v1/nodeSlice';
//v2 reducers
import blockchainReducer from './v2/blockchainSlice';
import serverReducer from './v2/serverSlice';

const rootReducer = combineReducers({
  //v1 reducers
  auth: authReducer,
  container: containerReducer,
  node: nodeReducer,
  network: networkReducer,
  logs: logReducer,

  //v2 reducers
  blockchain: blockchainReducer,
  server: serverReducer,
});

export default rootReducer;
