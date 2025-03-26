import { combineReducers } from '@reduxjs/toolkit';

//v1 reducers
import authReducer from './v1/authSlice';
import containerReducer from './v1/containerSlice';
import networkReducer from './v1/networkSlice';
import nodeReducer from './v1/nodeSlice';
import websocketReducer from './v1/websocketSlice';
//v2 reducers
// import blockchainReducer from './v2/blockchainSlice';
import { notificationsSlice } from './v2/notificationSlice';
import serverReducer from './v2/serverSlice';
import blockchainReducer from './v3/blockchainSlice';

const rootReducer = combineReducers({
  //v1 reducers
  auth: authReducer,
  container: containerReducer,
  node: nodeReducer,
  network: networkReducer,
  websocket: websocketReducer,

  //v2 reducers
  blockchain: blockchainReducer,
  server: serverReducer,
  notifications: notificationsSlice.reducer,
});

export default rootReducer;
