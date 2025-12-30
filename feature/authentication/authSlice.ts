import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/lib/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  uid: string | null;
}

interface SetCredentialsPayload {
  access_token?: string;
  refresh_token?: string;
  user?: User;
  uid?: string;
}

const initialState: AuthState = {
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  user: typeof window !== 'undefined' 
    ? (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null)
    : null,
  uid: typeof window !== 'undefined' ? localStorage.getItem('uid') : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      const { access_token, refresh_token, user, uid } = action.payload;
      
      if (access_token) {
        state.accessToken = access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', access_token);
        }
      }
      
      if (refresh_token) {
        state.refreshToken = refresh_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', refresh_token);
        }
      }
      
      if (user) {
        state.user = user;
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      
      if (uid) {
        state.uid = uid;
        if (typeof window !== 'undefined') {
          localStorage.setItem('uid', uid);
        }
      } else if (user?.id) {
        state.uid = user.id;
        if (typeof window !== 'undefined') {
          localStorage.setItem('uid', user.id);
        }
      }
    },
    logOut: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.uid = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('uid');
      }
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => 
  !!state.auth.accessToken && !!state.auth.user;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectUid = (state: { auth: AuthState }) => state.auth.uid;

export default authSlice.reducer;

