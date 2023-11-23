import { INCREMENT } from '../actionTypes';
import * as actionTypes from '../actionTypes';

export const increment = () => ({
    type: INCREMENT,
});

export const tokenExchangeRequest = () => ({
    type: actionTypes.TOKEN_EXCHANGE_REQUEST,
});

export const tokenExchangeSuccess = (data) => ({
    type: actionTypes.TOKEN_EXCHANGE_SUCCESS,
    payload: data,
});

export const tokenExchangeFailure = (error) => ({
    type: actionTypes.TOKEN_EXCHANGE_FAILURE,
    payload: error,
});