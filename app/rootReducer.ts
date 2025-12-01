import { combineReducers } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authReducer from "../feature/authentication/authSlice";

// Combine all your reducers
const appReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
});

// Create the root reducer that will handle resetting on sign-out
const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/logOut") {
    // Reset all state on sign-out by setting state to `undefined`
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;

