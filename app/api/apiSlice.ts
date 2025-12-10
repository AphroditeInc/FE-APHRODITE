import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logOut, setCredentials } from "../../feature/authentication/authSlice";
import { Mutex } from "async-mutex";
import { VITE_USER_BASE_URL } from "../utils/config";
import type { 
  ApiResponse, 
  User, 
  AuthPayload, 
  AuthResponse, 
  EmailRegistrationPayload, 
  CompleteUserPayload, 
  SendOTPPayload, 
  ChatMessage, 
  ChatRoom, 
  SendMessagePayload, 
  CreateRoomPayload, 
  GetMessagesQuery,
  UpdateMessageStatusPayload,
  RoomStats
} from "@/lib/types";

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
  endpoints: (builder) => ({
    // Auth Endpoints
    registerUser: builder.mutation<ApiResponse<User>, AuthPayload>({
      query: (body) => ({
        url: "/auth/users",
        method: "POST",
        body,
      }),
    }),
    registerWithEmail: builder.mutation<ApiResponse<AuthResponse>, EmailRegistrationPayload>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            const { user, tokens } = data.data;
            dispatch(setCredentials({
              user,
              access_token: tokens.accessToken,
              refresh_token: tokens.refreshToken,
              uid: user.id
            }));
          }
        } catch (err) {
          // Handle error
        }
      },
    }),
    loginUser: builder.mutation<ApiResponse<User>, { phoneNumber: string }>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    loginWithEmail: builder.mutation<ApiResponse<AuthResponse>, { email: string; password: string }>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            const { user, tokens } = data.data;
            dispatch(setCredentials({
              user,
              access_token: tokens.accessToken,
              refresh_token: tokens.refreshToken,
              uid: user.id
            }));
          }
        } catch (err) {
          // Handle error
        }
      },
    }),
    sendOTP: builder.mutation<ApiResponse<{ message: string }>, SendOTPPayload>({
      query: (body) => ({
        url: "/otp/send",
        method: "POST",
        body,
      }),
    }),
    
    // User Endpoints
    createCompleteUser: builder.mutation<ApiResponse<User>, CompleteUserPayload>({
      query: (body) => ({
        url: "/user",
        method: "POST",
        body,
      }),
    }),
    getUserProfile: builder.query<ApiResponse<User>, string>({
      query: (userId) => `/auth/users/${userId}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation<ApiResponse<User>, { userId: string; data: Partial<User> }>({
      query: ({ userId, data }) => ({
        url: `/auth/users/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }],
    }),

    // Chat Endpoints
    getRoomMessages: builder.query<ChatMessage[], { roomId: string; query?: GetMessagesQuery }>({
      query: ({ roomId, query }) => {
        const params = new URLSearchParams();
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.offset) params.append('offset', query.offset.toString());
        if (query?.before) params.append('before', query.before);
        if (query?.after) params.append('after', query.after);
        return `/chat/rooms/${roomId}/messages?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<ChatMessage[]> | ChatMessage[]) => {
        // API returns array directly: [{...}, {...}]
        // But handle ApiResponse format if present: { success: true, data: [...] }
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: (result, error, { roomId }) => [{ type: 'Chat', id: roomId }],
    }),
    sendMessage: builder.mutation<ChatMessage, SendMessagePayload>({
      query: (body) => ({
        url: "/chat/messages",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ChatMessage> | ChatMessage) => {
        // Extract data from ApiResponse: { success: true, data: {...} }
        if (response && typeof response === 'object') {
          if ('data' in response && response.data && typeof response.data === 'object') {
            return response.data as ChatMessage;
          }
          // Fallback: if response is already a message object, return it
          if ('id' in response || 'senderId' in response) {
            return response as ChatMessage;
          }
        }
        // Last resort: cast to ChatMessage
        return response as unknown as ChatMessage;
      },
      invalidatesTags: (result, error, arg) => result?.roomId ? [{ type: 'Chat', id: result.roomId }, 'Room'] : ['Chat', 'Room'],
    }),
    getUserRooms: builder.query<ChatRoom[], { limit?: number; offset?: number }>({
      query: ({ limit = 10, offset = 0 }) => {
        console.log('[getUserRooms] Query called with:', { limit, offset });
        return `/chat/rooms?limit=${limit}&offset=${offset}`;
      },
      transformResponse: (response: ApiResponse<ChatRoom[]>) => {
        console.log('[getUserRooms] Raw response:', response);
        // Extract data from ApiResponse: { success: true, data: [...] }
        if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          console.log('[getUserRooms] Extracted from ApiResponse.data:', response.data);
          return response.data;
        }
        // Fallback: if response is already an array, return it
        if (Array.isArray(response)) {
          console.log('[getUserRooms] Response is already array:', response);
          return response;
        }
        console.log('[getUserRooms] Returning empty array');
        return [];
      },
      providesTags: ['Room'],
    }),
    createRoom: builder.mutation<ChatRoom, CreateRoomPayload>({
      query: (body) => ({
        url: "/chat/rooms",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ChatRoom> | ChatRoom) => {
        console.log('[createRoom transformResponse] Raw response:', response);
        // Extract data from ApiResponse: { success: true, data: {...} }
        if (response && typeof response === 'object') {
          if ('data' in response && response.data && typeof response.data === 'object') {
            console.log('[createRoom transformResponse] Extracted from ApiResponse.data:', response.data);
            return response.data as ChatRoom;
          }
          // Fallback: if response is already a room object, return it
          if ('roomId' in response || 'id' in response || '_id' in response) {
            console.log('[createRoom transformResponse] Using direct room object:', response);
            return response as ChatRoom;
          }
        }
        // Last resort: cast to ChatRoom
        console.log('[createRoom transformResponse] Using fallback cast');
        return response as unknown as ChatRoom;
      },
      invalidatesTags: ['Room'], // This should trigger getUserRooms to refetch
    }),
    getConversations: builder.query<ChatRoom[], { limit?: number; offset?: number }>({
      query: ({ limit = 10, offset = 0 }) => `/chat/conversations?limit=${limit}&offset=${offset}`,
      transformResponse: (response: ApiResponse<ChatRoom[]>) => {
        // Extract data from ApiResponse: { success: true, data: [...] }
        if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          return response.data;
        }
        // Fallback: if response is already an array, return it
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      providesTags: ['Room'],
    }),
    updateMessageStatus: builder.mutation<ApiResponse<ChatMessage>, { messageId: string } & UpdateMessageStatusPayload>({
      query: ({ messageId, ...body }) => ({
        url: `/chat/messages/${messageId}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { messageId }) => [{ type: 'Chat', id: messageId }], // Or invalidate room
    }),
    markRoomAsRead: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (roomId) => ({
        url: `/chat/rooms/${roomId}/read`,
        method: "POST",
      }),
      invalidatesTags: (result, error, roomId) => [{ type: 'Chat', id: roomId }, { type: 'Room', id: roomId }],
    }),
    getRoomUnreadCount: builder.query<ApiResponse<{ count: number }>, string>({
      query: (roomId) => `/chat/rooms/${roomId}/unread-count`,
      providesTags: (result, error, roomId) => [{ type: 'Room', id: roomId }],
    }),
    getRoomStats: builder.query<ApiResponse<RoomStats>, string>({
      query: (roomId) => `/chat/rooms/${roomId}/stats`,
      providesTags: (result, error, roomId) => [{ type: 'Room', id: roomId }],
    }),
    editMessage: builder.mutation<ApiResponse<ChatMessage>, { messageId: string; content: string }>({
      query: ({ messageId, content }) => ({
        url: `/chat/messages/${messageId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: (result, error, { messageId }) => [{ type: 'Chat', id: messageId }],
    }),
    deleteMessage: builder.mutation<ApiResponse<{ success: boolean }>, { messageId: string; hard?: boolean }>({
      query: ({ messageId, hard }) => ({
        url: `/chat/messages/${messageId}${hard ? '?hard=true' : ''}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useRegisterWithEmailMutation,
  useLoginUserMutation,
  useLoginWithEmailMutation,
  useSendOTPMutation,
  useCreateCompleteUserMutation,
  useGetUserProfileQuery,
  useUpdateUserMutation,
  useGetRoomMessagesQuery,
  useLazyGetRoomMessagesQuery,
  useSendMessageMutation,
  useGetUserRoomsQuery,
  useLazyGetUserRoomsQuery,
  useCreateRoomMutation,
  useGetConversationsQuery,
  useUpdateMessageStatusMutation,
  useMarkRoomAsReadMutation,
  useGetRoomUnreadCountQuery,
  useGetRoomStatsQuery,
  useEditMessageMutation,
  useDeleteMessageMutation,
} = apiSlice;

