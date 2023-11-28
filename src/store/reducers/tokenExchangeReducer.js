import { createSlice } from '@reduxjs/toolkit';

const tokenExchangeSlice = createSlice({
    name: 'tokenExchange',
    initialState: {
        isLoading: false,
        data: null,
        error: null,
    },
    reducers: {
        tokenExchangeRequest: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        tokenExchangeSuccess: (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        },
        tokenExchangeFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },
    },
});

// Export the actions and the selector
export const {
    tokenExchangeRequest,
    tokenExchangeSuccess,
    tokenExchangeFailure,
} = tokenExchangeSlice.actions;

export const selectUserData = (state) => state.tokenExchange;

export default tokenExchangeSlice.reducer;