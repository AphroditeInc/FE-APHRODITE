import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logOut, setCredentials } from "../../feature/authentication/authSlice";
import { Mutex } from "async-mutex";
import { VITE_USER_BASE_URL } from "../utils/config";

interface RootState {
  auth?: {
    accessToken?: string;
    refreshToken?: string;
    uid?: string;
  };
}

interface RefreshTokenResponse {
  tokens?: {
    accessToken?: string;
    access_token?: string;
    refreshToken?: string;
    refresh_token?: string;
  };
  user?: {
    id?: string;
  };
  data?: {
    user?: {
      id?: string;
    };
  };
  uid?: string;
  userId?: string;
}

interface ExtraOptions {
  serviceKey?: keyof typeof baseUrls;
}

const baseUrls = {
  us: VITE_USER_BASE_URL(),
};

const mutex = new Mutex();

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions: ExtraOptions = {}
) => {
  const { serviceKey } = extraOptions;
  
  const baseUrl = serviceKey && baseUrls[serviceKey] ? baseUrls[serviceKey] : baseUrls.us;

  const baseFetch = fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const accessToken = state.auth?.accessToken;
      const uid = state.auth?.uid;

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
        if (uid) {
          headers.set("userId", uid);
        }
      }

      return headers;
    },
  });

  let result = await baseFetch(args, api, extraOptions);

  // Handle 401 responses
  if (result?.error && 'status' in result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const state = api.getState() as RootState;
        const refreshToken = state.auth?.refreshToken;
        if (!refreshToken) {
          api.dispatch(logOut());
          return result;
        }

        const refreshResult = await baseFetch(
          {
            url: "/auth/refresh",
            method: "POST",
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const data = refreshResult.data as RefreshTokenResponse;
          // Handle different response formats
          const tokens = data.tokens || data;
          const userData = data.user || data.data?.user;
          
          // Type guard for tokens
          const accessToken = (tokens && typeof tokens === 'object' && 'accessToken' in tokens)
            ? tokens.accessToken
            : (tokens && typeof tokens === 'object' && 'access_token' in tokens)
              ? tokens.access_token
              : '';
          
          const refreshToken = (tokens && typeof tokens === 'object' && 'refreshToken' in tokens)
            ? tokens.refreshToken
            : (tokens && typeof tokens === 'object' && 'refresh_token' in tokens)
              ? tokens.refresh_token
              : '';
          
          // Only pass user if it has a valid id (User type requires id: string)
          const user = (userData && typeof userData === 'object' && 'id' in userData && userData.id && typeof userData.id === 'string')
            ? (userData as { id: string; [key: string]: unknown })
            : undefined;
          
          api.dispatch(setCredentials({
            access_token: accessToken || '',
            refresh_token: refreshToken || '',
            user: user,
            uid: user?.id || data.uid || data.userId || undefined,
          }));
          result = await baseFetch(args, api, extraOptions);
        } else {
          api.dispatch(logOut());
        }
      } finally {
        release();
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User', 'Profile', 'Chat', 'Room'],
  endpoints: (builder) => ({}),
});

