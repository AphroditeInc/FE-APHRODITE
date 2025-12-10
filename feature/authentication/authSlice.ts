import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAuthTokens, getUser, saveAuthTokens, saveUser, clearAuthData } from "../../lib/utils/storage.utils";
import type { User, AuthTokens } from "../../lib/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  uid: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// Initialize state from localStorage (only on client side)
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      accessToken: null,
      refreshToken: null,
      uid: null,
      user: null,
      isAuthenticated: false,
    };
  }

  const tokens = getAuthTokens();
  const user = getUser();

  return {
    accessToken: tokens?.accessToken || null,
    refreshToken: tokens?.refreshToken || null,
    uid: user?.id || null,
    user: user || null,
    isAuthenticated: !!tokens?.accessToken,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      access_token: string;
      refresh_token: string;
      user?: User;
      uid?: string;
    }>) => {
      const { access_token, refresh_token, user, uid } = action.payload;
      
      const tokens: AuthTokens = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: '3600',
      };

      state.accessToken = access_token;
      state.refreshToken = refresh_token;
      state.uid = uid || user?.id || null;
      state.user = user || state.user;
      state.isAuthenticated = true;

      // Save to localStorage
      saveAuthTokens(tokens);
      if (user) {
        saveUser(user);
      }
    },
    logOut: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.uid = null;
      state.user = null;
      state.isAuthenticated = false;

      // Clear localStorage
      clearAuthData();
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.uid = action.payload.id;
      saveUser(action.payload);
    },
  },
});

export const { setCredentials, logOut, setUser } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectCurrentRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentUid = (state: { auth: AuthState }) => state.auth.uid;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;








