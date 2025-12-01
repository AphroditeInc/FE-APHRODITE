import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logOut, setCredentials } from "../../feature/authentication/authSlice";
import { Mutex } from "async-mutex";
import { VITE_USER_BASE_URL } from "../utils/config";

const baseUrls = {
  us: VITE_USER_BASE_URL(),
};

const mutex = new Mutex();

const baseQuery = async (args: any, api: any, extraOptions: any) => {
  const { serviceKey } = extraOptions || {};
  
  const baseUrl = baseUrls[serviceKey as keyof typeof baseUrls] || baseUrls.us;

  let baseFetch = fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
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
  if (result?.error && (result.error as any)?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const state = api.getState() as any;
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
          const data = refreshResult.data as any;
          // Handle different response formats
          const tokens = data.tokens || data;
          const user = data.user || data.data?.user;
          
          api.dispatch(setCredentials({
            access_token: tokens.accessToken || tokens.access_token,
            refresh_token: tokens.refreshToken || tokens.refresh_token,
            user: user,
            uid: user?.id || data.uid || data.userId,
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

