import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    handleFulfilled,
    handlePending,
    handleRejected,
    defaultRequestState
} from "../utils";

const basePath = 'https://www.strava.com/oauth/token';
export const exchangeToken = createAsyncThunk("EXCHANGE_TOKEN", async ({ clientId, clientSecret, redirectUri, authorizationCode }, { rejectWithValue }) => {
    // Set up the request parameters
    const requestData = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: authorizationCode,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
    });
    
    try {
        const response = await axios.post(
            basePath,
            requestData.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
        return { ...response };
    } catch (error) {
        if (!error.response) throw error;
        throw rejectWithValue(error.response);
    }
})

const initialState = { ...defaultRequestState };
const sliceName = "tokenExchange";
const tokenExchange = createSlice({
    name: sliceName,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(exchangeToken.pending, (state) => {
                handlePending(state);
            })
            .addCase(exchangeToken.fulfilled, (state, action) => {
                handleFulfilled(state);
                state.tokenExchange = action.payload;
            })
            .addCase(exchangeToken.rejected, (state) => {
                handleRejected(state);
            });
    }
})

export const selectAuthDetails = (state) => state[sliceName]?.tokenExchange?.data;

export default tokenExchange;