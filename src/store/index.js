import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';

import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import storeReducer from "./reducer";
import tokenExchange from './tokenExchange';

import logger from "redux-logger";
import thunk from "redux-thunk";

const persistConfig = {
  key: 'root',
  whitelist: [tokenExchange.name],
  storage,
};

const configureStore = () => {
  const middleware = [thunk, logger];
  const initState = {};

  const persistedReducer = persistReducer(persistConfig, storeReducer);
  const store = createStore(persistedReducer, initState, applyMiddleware(...middleware));
  const persistor = persistStore(store);

  return { store, persistor };
}

export default configureStore;