import { combineReducers } from 'redux';
import tokenExchange from './tokenExchange';

// app
export default combineReducers({
    [tokenExchange.name]: tokenExchange.reducer,
})