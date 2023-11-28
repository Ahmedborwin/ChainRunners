import { combineReducers } from 'redux';
import counterReducer from './counterReducer';
import tokenExchangeReducer from './tokenExchangeReducer';

const rootReducer = combineReducers({
  counter: counterReducer,
  // Add other reducers here
  tokenExchange: tokenExchangeReducer,
});

export default rootReducer;