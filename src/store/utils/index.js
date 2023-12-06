export const defaultRequestState = {
    pending: false,
    fulfilled: false,
    rejected: false
}

export const handlePending = (state) => {
    state.pending = true;
    state.fulfilled = false;
    state.rejected = false;
}

export const handleFulfilled = (state) => {
    state.pending = false;
    state.fulfilled = true;
    state.rejected = false;
}

export const handleRejected = (state) => {
    state.pending = false;
    state.fulfilled = false;
    state.rejected = true;
}