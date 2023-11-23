import * as actionTypes from '../actionTypes';

const initialState = {
    isLoading: false,
    data: null,
    error: null,
};

const tokenExchangeReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.TOKEN_EXCHANGE_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case actionTypes.TOKEN_EXCHANGE_SUCCESS:
            return {
                ...state,
                isLoading: false,
                data: action.payload,
            };

        case actionTypes.TOKEN_EXCHANGE_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};

export default tokenExchangeReducer;