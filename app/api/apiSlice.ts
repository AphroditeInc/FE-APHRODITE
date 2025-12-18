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
    accessToken?: string | null;
    refreshToken?: string | null;
    uid?: string | null;
    user?: unknown;
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
      query: (userId) => `/profiles/users/${userId}`,
      // query: (userId) => `/auth/profile`,
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
        if (!roomId || roomId.trim() === '') {
          console.error('[getRoomMessages] Invalid roomId:', roomId);
          throw new Error('Room ID is required');
        }
        
        const params = new URLSearchParams();
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.offset) params.append('offset', query.offset.toString());
        if (query?.before) params.append('before', query.before);
        if (query?.after) params.append('after', query.after);
        
        const queryString = params.toString();
        const url = `/chat/rooms/${roomId}/messages${queryString ? `?${queryString}` : ''}`;
        console.log('[getRoomMessages] Fetching messages for room:', roomId, 'URL:', url);
        return url;
      },
      transformResponse: (response: unknown, meta, arg) => {
        console.log('[getRoomMessages transformResponse] Raw response:', response);
        console.log('[getRoomMessages transformResponse] Response type:', typeof response);
        console.log('[getRoomMessages transformResponse] Is array:', Array.isArray(response));
        
        // Check for error response: { success: false, message: "..." }
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          const responseObj = response as Record<string, unknown>;
          
          // Check for { success: false, message: "..." } - this is an error even with HTTP 200
          if ('success' in responseObj && responseObj.success === false) {
            const errorMessage = 'message' in responseObj ? String(responseObj.message) : 'Failed to fetch messages';
            console.error('[getRoomMessages transformResponse] API returned error:', errorMessage);
            // Throw an error so RTK Query treats it as an error
            throw new Error(errorMessage);
          }
        }
        
        // According to Swagger API docs, endpoint returns array directly: [{...}, {...}]
        // RTK Query's transformResponse receives result.data from baseQuery
        // So if API returns array directly, response should be that array
        
        // Case 1: Response is already an array (direct from API - SUCCESS case)
        if (Array.isArray(response)) {
          console.log('[getRoomMessages transformResponse] Response is array (success), length:', response.length);
          if (response.length > 0) {
            console.log('[getRoomMessages transformResponse] First message:', response[0]);
          }
          return response as ChatMessage[];
        }
        
        // Case 2: Response is wrapped in an object with success: true
        if (response && typeof response === 'object' && response !== null) {
          const responseObj = response as Record<string, unknown>;
          
          // Check for { success: true, data: [...] }
          if ('success' in responseObj && responseObj.success === true && 'data' in responseObj && Array.isArray(responseObj.data)) {
            console.log('[getRoomMessages transformResponse] Found success:true with data array, length:', responseObj.data.length);
            return responseObj.data as ChatMessage[];
          }
          
          // Check for { data: [...] } (without success field, assume success)
          if ('data' in responseObj && Array.isArray(responseObj.data)) {
            console.log('[getRoomMessages transformResponse] Found response.data array, length:', responseObj.data.length);
            return responseObj.data as ChatMessage[];
          }
          
          // Check for { items: [...] }
          if ('items' in responseObj && Array.isArray(responseObj.items)) {
            console.log('[getRoomMessages transformResponse] Found response.items array, length:', responseObj.items.length);
            return responseObj.items as ChatMessage[];
          }
          
          // Check for { messages: [...] }
          if ('messages' in responseObj && Array.isArray(responseObj.messages)) {
            console.log('[getRoomMessages transformResponse] Found response.messages array, length:', responseObj.messages.length);
            return responseObj.messages as ChatMessage[];
          }
          
          // Log the actual structure for debugging
          console.warn('[getRoomMessages transformResponse] Response is object but no array found. Structure:', JSON.stringify(responseObj, null, 2));
        }
        
        // Case 3: Response is null, undefined, or unexpected format
        console.warn('[getRoomMessages transformResponse] Unexpected response format:', response);
        console.warn('[getRoomMessages transformResponse] Returning empty array');
        return [];
      },
      transformErrorResponse: (response: unknown, meta, arg) => {
        console.error('[getRoomMessages transformErrorResponse] Error response:', response);
        // Handle error responses
        if (response && typeof response === 'object') {
          const errorObj = response as Record<string, unknown>;
          if ('message' in errorObj) {
            return { message: String(errorObj.message) };
          }
        }
        return { message: 'Failed to fetch messages' };
      },
      providesTags: (result, error, { roomId }) => {
        console.log('[getRoomMessages providesTags] Result:', result, 'Error:', error, 'RoomId:', roomId);
        return result ? [{ type: 'Chat', id: roomId }] : [];
      },
    }),
    sendMessage: builder.mutation<ChatMessage, SendMessagePayload>({
      query: (body) => ({
        url: "/chat/messages",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown, meta, arg) => {
        console.log('[sendMessage transformResponse] Raw response:', response);
        console.log('[sendMessage transformResponse] Response type:', typeof response);
        
        // According to Swagger: POST /chat/messages returns the message object directly (not wrapped)
        // Status 201 with message object: { id, senderId, receiverId, roomId, content, ... }
        
        // Check if response is already a ChatMessage object (has id or senderId)
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          const responseObj = response as Record<string, unknown>;
          
          // Check for { success: false, message: "..." } - this is an error even with HTTP 201
          if ('success' in responseObj && responseObj.success === false) {
            const errorMessage = 'message' in responseObj ? String(responseObj.message) : 'Failed to send message';
            console.error('[sendMessage transformResponse] API returned error:', errorMessage);
            // Throw an error so RTK Query treats it as an error
            throw new Error(errorMessage);
          }
          
          // Check if it's wrapped in { success: true, data: {...} }
          if ('success' in responseObj && responseObj.success === true && 'data' in responseObj && responseObj.data && typeof responseObj.data === 'object') {
            console.log('[sendMessage transformResponse] Found success:true with data object');
            return responseObj.data as ChatMessage;
          }
          
          // Check if it's wrapped in { data: {...} }
          if ('data' in responseObj && responseObj.data && typeof responseObj.data === 'object') {
            console.log('[sendMessage transformResponse] Found data object');
            return responseObj.data as ChatMessage;
          }
          
          // Check if it's already a message object (has id or senderId)
          if ('id' in responseObj || 'senderId' in responseObj) {
            console.log('[sendMessage transformResponse] Response is already ChatMessage object');
            return responseObj as ChatMessage;
          }
        }
        
        // Last resort: cast to ChatMessage
        console.log('[sendMessage transformResponse] Using fallback cast');
        return response as unknown as ChatMessage;
      },
      transformErrorResponse: (response: unknown, meta, arg) => {
        console.error('[sendMessage transformErrorResponse] Error response:', response);
        // Handle error responses
        if (response && typeof response === 'object') {
          const errorObj = response as Record<string, unknown>;
          if ('message' in errorObj) {
            return { message: String(errorObj.message) };
          }
        }
        return { message: 'Failed to send message' };
      },
      invalidatesTags: (result, error, arg) => result?.roomId ? [{ type: 'Chat', id: result.roomId }, 'Room'] : ['Chat', 'Room'],
    }),
    getUserRooms: builder.query<ChatRoom[], { limit?: number; offset?: number }>({
      query: ({ limit = 10, offset = 0 }) => {
        console.log('[getUserRooms] Query called with:', { limit, offset });
        return `/chat/rooms?limit=${limit}&offset=${offset}`;
      },
      transformResponse: (response: unknown, meta, arg) => {
        console.log('[getUserRooms] Raw response:', response);
        console.log('[getUserRooms] Response type:', typeof response);
        
        // Check for error response: { success: false, message: "..." }
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          const responseObj = response as Record<string, unknown>;
          
          // Check for { success: false, message: "..." } - this is an error even with HTTP 200
          if ('success' in responseObj && responseObj.success === false) {
            const errorMessage = 'message' in responseObj ? String(responseObj.message) : 'Failed to fetch rooms';
            console.error('[getUserRooms] API returned error:', errorMessage);
            // Throw an error so RTK Query treats it as an error
            throw new Error(errorMessage);
          }
        }
        
        // According to Swagger: GET /chat/rooms returns { success: true, data: [...] }
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          const responseObj = response as Record<string, unknown>;
          
          // Check for { success: true, data: [...] }
          if ('success' in responseObj && responseObj.success === true && 'data' in responseObj && Array.isArray(responseObj.data)) {
            console.log('[getUserRooms] Extracted from ApiResponse.data (success:true), length:', responseObj.data.length);
            return responseObj.data as ChatRoom[];
          }
          
          // Check for { data: [...] } (without success field, assume success)
          if ('data' in responseObj && Array.isArray(responseObj.data)) {
            console.log('[getUserRooms] Extracted from ApiResponse.data (no success field), length:', responseObj.data.length);
            return responseObj.data as ChatRoom[];
          }
        }
        
        // Fallback: if response is already an array, return it
        if (Array.isArray(response)) {
          console.log('[getUserRooms] Response is already array, length:', response.length);
          return response as ChatRoom[];
        }
        
        console.warn('[getUserRooms] Unexpected response format, returning empty array');
        return [];
      },
      transformErrorResponse: (response: unknown, meta, arg) => {
        console.error('[getUserRooms transformErrorResponse] Error response:', response);
        // Handle error responses
        if (response && typeof response === 'object') {
          const errorObj = response as Record<string, unknown>;
          if ('message' in errorObj) {
            return { message: String(errorObj.message) };
          }
        }
        return { message: 'Failed to fetch rooms' };
      },
      providesTags: ['Room'],
    }),
    createRoom: builder.mutation<ChatRoom, CreateRoomPayload>({
      query: (body) => {
        console.log('[createRoom query] Creating room with payload:', body);
        return {
          url: "/chat/rooms",
          method: "POST",
          body,
        };
      },
      transformResponse: (response: unknown, meta, arg) => {
        console.log('[createRoom transformResponse] Raw response:', response);
        console.log('[createRoom transformResponse] Response type:', typeof response);
        console.log('[createRoom transformResponse] Is array:', Array.isArray(response));
        
        // Check for error response: { success: false, message: "..." }
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          const responseObj = response as Record<string, unknown>;
          
          // Check for { success: false, message: "..." } - this is an error even with HTTP 201
          if ('success' in responseObj && responseObj.success === false) {
            const errorMessage = 'message' in responseObj ? String(responseObj.message) : 'Failed to create room';
            console.error('[createRoom transformResponse] API returned error:', errorMessage);
            // Throw an error so RTK Query treats it as an error
            throw new Error(errorMessage);
          }
        }
        
        // According to Swagger, POST /chat/rooms returns 201 with room data
        // Handle different response formats
        
        if (!response) {
          console.warn('[createRoom transformResponse] Response is null/undefined');
          throw new Error('Room creation failed: No response from server');
        }
        
        // Case 1: Response is already a ChatRoom object (has roomId, id, or _id)
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          const responseObj = response as Record<string, unknown>;
          
          if ('roomId' in responseObj || 'id' in responseObj || '_id' in responseObj) {
            console.log('[createRoom transformResponse] Response is ChatRoom object:', responseObj);
            return responseObj as ChatRoom;
          }
          
          // Case 2: Response is wrapped in { data: ChatRoom }
          if ('data' in responseObj && responseObj.data && typeof responseObj.data === 'object') {
            console.log('[createRoom transformResponse] Found response.data:', responseObj.data);
            const roomData = responseObj.data as Record<string, unknown>;
            if ('roomId' in roomData || 'id' in roomData || '_id' in roomData) {
              return roomData as ChatRoom;
            }
          }
          
          // Case 3: Response is wrapped in { success: true, data: ChatRoom }
          if ('success' in responseObj && responseObj.success === true && 'data' in responseObj && responseObj.data && typeof responseObj.data === 'object') {
            console.log('[createRoom transformResponse] Found ApiResponse format with success:true:', responseObj.data);
            const roomData = responseObj.data as Record<string, unknown>;
            if ('roomId' in roomData || 'id' in roomData || '_id' in roomData) {
              return roomData as ChatRoom;
            }
          }
          
          console.warn('[createRoom transformResponse] Unexpected response structure:', JSON.stringify(responseObj, null, 2));
        }
        
        // Last resort: try to cast
        console.log('[createRoom transformResponse] Using fallback cast');
        return response as unknown as ChatRoom;
      },
      transformErrorResponse: (response: unknown, meta, arg) => {
        console.error('[createRoom transformErrorResponse] Error response:', response);
        // Handle error responses
        if (response && typeof response === 'object') {
          const errorObj = response as Record<string, unknown>;
          if ('message' in errorObj) {
            return { message: String(errorObj.message) };
          }
        }
        return { message: 'Failed to create room' };
      },
      invalidatesTags: ['Room'], // This should trigger getUserRooms/getConversations to refetch
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

