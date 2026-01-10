import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logOut, setCredentials } from "../../feature/authentication/authSlice";
import { Mutex } from "async-mutex";
import { VITE_USER_BASE_URL } from "../utils/config";
import type { 
  ApiResponse, 
  User, 
  AuthPayload, 
  AuthResponse,
  BasicDetailsPayload,
  EmailRegistrationPayload, 
  CompleteUserPayload, 
  SendOTPPayload,
  CheckAvailabilityPayload,
  CheckAvailabilityResponse,
  IntrospectTokenPayload,
  IntrospectTokenResponse,
  ChatMessage, 
  ChatRoom, 
  SendMessagePayload, 
  CreateRoomPayload, 
  GetMessagesQuery,
  UpdateMessageStatusPayload,
  RoomStats,
  WalletBalance,
  FundWalletPayload,
  FundWalletResponse,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
  Transaction,
  WithdrawalAccount,
  AddWithdrawalAccountPayload,
  SetDefaultAccountPayload,
  VerifyAccountPayload,
  VerifyAccountResponse,
  Bank,
  CreatePayoutPayload,
  Payout,
  CancelPayoutPayload,
  CreateRiderProfilePayload,
  UpdateRiderProfilePayload,
  UploadVerificationDocumentsPayload,
  UpdateLocationPayload,
  SetAvailabilityPayload,
  RiderProfile,
  CreateOrderPayload,
  CancelOrderPayload,
  AssignRiderPayload,
  UpdateOrderLocationPayload,
  Order,
  ListOrdersQuery,
  CreateProfilePayload,
  UpdateProfilePayload,
  CreatePricingPayload,
  UpdatePricingPayload,
  AddCustomCategoryPayload,
  CreateServicePayload,
  VideoProofPayload,
  AddMediaPayload,
  CreateReviewPayload,
  ReviewsResponse,
  ListProfilesQuery,
  GetReviewsQuery,
  CreateAdminPayload,
  VerifyRiderPayload,
  PendingVerification,
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
        
        // Helper function to normalize a message object
        const normalizeMessage = (msg: any): ChatMessage => {
          // Extract senderId - can be string or object with _id
          let senderId = '';
          if (typeof msg.senderId === 'string') {
            senderId = msg.senderId;
          } else if (msg.senderId && typeof msg.senderId === 'object' && '_id' in msg.senderId) {
            senderId = String(msg.senderId._id);
          } else if (msg.senderId && typeof msg.senderId === 'object' && 'id' in msg.senderId) {
            senderId = String(msg.senderId.id);
          }
          
          // Extract receiverId - can be string or object with _id
          let receiverId = '';
          if (typeof msg.receiverId === 'string') {
            receiverId = msg.receiverId;
          } else if (msg.receiverId && typeof msg.receiverId === 'object' && '_id' in msg.receiverId) {
            receiverId = String(msg.receiverId._id);
          } else if (msg.receiverId && typeof msg.receiverId === 'object' && 'id' in msg.receiverId) {
            receiverId = String(msg.receiverId.id);
          }
          
          // Extract id from _id or id field
          const id = msg._id ? String(msg._id) : (msg.id ? String(msg.id) : '');
          
          return {
            id,
            senderId,
            receiverId,
            roomId: msg.roomId || '',
            content: msg.content || '',
            type: (msg.type || 'text') as ChatMessage['type'],
            status: (msg.status || 'sent') as ChatMessage['status'],
            createdAt: msg.createdAt || new Date().toISOString(),
            updatedAt: msg.updatedAt || msg.createdAt || new Date().toISOString(),
            metadata: msg.metadata || {},
            attachments: msg.attachments || [],
            readAt: msg.readAt || undefined,
            deliveredAt: msg.deliveredAt || undefined,
            replyTo: msg.replyTo || undefined,
          };
        };
        
        // Case 1: Response is already an array (direct from API - SUCCESS case)
        if (Array.isArray(response)) {
          console.log('[getRoomMessages transformResponse] Response is array (success), length:', response.length);
          if (response.length > 0) {
            console.log('[getRoomMessages transformResponse] First message before normalization:', response[0]);
          }
          // Normalize all messages
          const normalizedMessages = response.map(normalizeMessage);
          console.log('[getRoomMessages transformResponse] Normalized messages count:', normalizedMessages.length);
          return normalizedMessages;
        }
        
        // Case 2: Response is wrapped in an object with success: true
        if (response && typeof response === 'object' && response !== null) {
          const responseObj = response as Record<string, unknown>;
          
          // Check for { success: true, data: [...] }
          if ('success' in responseObj && responseObj.success === true && 'data' in responseObj && Array.isArray(responseObj.data)) {
            console.log('[getRoomMessages transformResponse] Found success:true with data array, length:', responseObj.data.length);
            const normalizedMessages = (responseObj.data as any[]).map(normalizeMessage);
            return normalizedMessages;
          }
          
          // Check for { data: [...] } (without success field, assume success)
          if ('data' in responseObj && Array.isArray(responseObj.data)) {
            console.log('[getRoomMessages transformResponse] Found response.data array, length:', responseObj.data.length);
            const normalizedMessages = (responseObj.data as any[]).map(normalizeMessage);
            return normalizedMessages;
          }
          
          // Check for { items: [...] }
          if ('items' in responseObj && Array.isArray(responseObj.items)) {
            console.log('[getRoomMessages transformResponse] Found response.items array, length:', responseObj.items.length);
            const normalizedMessages = (responseObj.items as any[]).map(normalizeMessage);
            return normalizedMessages;
          }
          
          // Check for { messages: [...] }
          if ('messages' in responseObj && Array.isArray(responseObj.messages)) {
            console.log('[getRoomMessages transformResponse] Found response.messages array, length:', responseObj.messages.length);
            const normalizedMessages = (responseObj.messages as any[]).map(normalizeMessage);
            return normalizedMessages;
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
      // Keep cached data for 5 minutes to prevent unnecessary refetches when switching rooms
      keepUnusedDataFor: 300,
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
            return responseObj as unknown as ChatMessage;
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
            return responseObj.data as unknown as ChatRoom[];
          }
          
          // Check for { data: [...] } (without success field, assume success)
          if ('data' in responseObj && Array.isArray(responseObj.data)) {
            console.log('[getUserRooms] Extracted from ApiResponse.data (no success field), length:', responseObj.data.length);
            return responseObj.data as unknown as ChatRoom[];
          }
        }
        
        // Fallback: if response is already an array, return it
        if (Array.isArray(response)) {
          console.log('[getUserRooms] Response is already array, length:', response.length);
          return response as unknown as ChatRoom[];
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
      // Keep cached data for 5 minutes
      keepUnusedDataFor: 300,
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
        
        // Note: transformResponse is only called for successful responses (2xx status codes)
        // Error responses are handled by transformErrorResponse or caught as fetch errors
        // Don't throw errors here - just transform the successful response
        
        if (!response) {
          console.warn('[createRoom transformResponse] Response is null/undefined');
          return {} as ChatRoom; // Return empty object instead of throwing
        }
        
        // Case 1: Response is already a ChatRoom object (has roomId, id, or _id)
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          const responseObj = response as Record<string, unknown>;
          
          if ('roomId' in responseObj || 'id' in responseObj || '_id' in responseObj) {
            console.log('[createRoom transformResponse] Response is ChatRoom object:', responseObj);
            return responseObj as unknown as ChatRoom;
          }
          
          // Case 2: Response is wrapped in { data: ChatRoom }
          if ('data' in responseObj && responseObj.data && typeof responseObj.data === 'object') {
            console.log('[createRoom transformResponse] Found response.data:', responseObj.data);
            const roomData = responseObj.data as Record<string, unknown>;
            if ('roomId' in roomData || 'id' in roomData || '_id' in roomData) {
              return roomData as unknown as ChatRoom;
            }
          }
          
          // Case 3: Response is wrapped in { success: true, data: ChatRoom }
          if ('success' in responseObj && responseObj.success === true && 'data' in responseObj && responseObj.data && typeof responseObj.data === 'object') {
            console.log('[createRoom transformResponse] Found ApiResponse format with success:true:', responseObj.data);
            const roomData = responseObj.data as Record<string, unknown>;
            if ('roomId' in roomData || 'id' in roomData || '_id' in roomData) {
              return roomData as unknown as ChatRoom;
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
          
          // Check for nested data.message (common format)
          if ('data' in errorObj && errorObj.data && typeof errorObj.data === 'object') {
            const dataObj = errorObj.data as Record<string, unknown>;
            if ('message' in dataObj) {
              const message = String(dataObj.message);
              console.error('[createRoom transformErrorResponse] Error message:', message);
              return { message };
            }
          }
          
          // Check for direct message property
          if ('message' in errorObj) {
            const message = String(errorObj.message);
            console.error('[createRoom transformErrorResponse] Error message:', message);
            return { message };
          }
          
          // Check for error property
          if ('error' in errorObj && typeof errorObj.error === 'string') {
            console.error('[createRoom transformErrorResponse] Error string:', errorObj.error);
            return { message: String(errorObj.error) };
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

    // Additional Auth Endpoints
    setBasicDetails: builder.mutation<ApiResponse<AuthResponse>, { userId: string; data: BasicDetailsPayload }>({
      query: ({ userId, data }) => ({
        url: `/auth/users/${userId}/basic-details`,
        method: "POST",
        body: data,
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
    checkAvailability: builder.mutation<ApiResponse<CheckAvailabilityResponse>, CheckAvailabilityPayload>({
      query: (body) => ({
        url: "/auth/check-availability",
        method: "POST",
        body,
      }),
    }),
    getAuthProfile: builder.query<ApiResponse<User>, void>({
      query: () => "/auth/profile",
      providesTags: ['User'],
    }),
    updateAuthProfile: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: (body) => ({
        url: "/auth/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<ApiResponse<{ success: boolean }>, { currentPassword: string; newPassword: string }>({
      query: (body) => ({
        url: "/auth/password",
        method: "PUT",
        body,
      }),
    }),
    logout: builder.mutation<ApiResponse<{ success: boolean }>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch }) {
        dispatch(logOut());
      },
    }),
    introspectToken: builder.mutation<ApiResponse<IntrospectTokenResponse>, IntrospectTokenPayload>({
      query: (body) => ({
        url: "/auth/introspect",
        method: "POST",
        body,
      }),
    }),

    // User/Admin Endpoints
    createAdmin: builder.mutation<ApiResponse<User>, CreateAdminPayload>({
      query: (body) => ({
        url: "/user/admin",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    verifyRider: builder.mutation<ApiResponse<any>, { riderId: string; data: VerifyRiderPayload }>({
      query: ({ riderId, data }) => ({
        url: `/user/admin/riders/${riderId}/verify`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getPendingVerifications: builder.query<ApiResponse<PendingVerification[]>, void>({
      query: () => "/user/admin/riders/pending",
      providesTags: ['User'],
    }),

    // Profile Endpoints
    createProfile: builder.mutation<ApiResponse<any>, CreateProfilePayload>({
      query: (body) => ({
        url: "/profiles",
        method: "POST",
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    listProfiles: builder.query<ApiResponse<any>, ListProfilesQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        searchParams.append('type', params.type);
        if (params.cursor) searchParams.append('cursor', params.cursor);
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.city) searchParams.append('city', params.city);
        if (params.state) searchParams.append('state', params.state);
        return `/profiles?${searchParams.toString()}`;
      },
      providesTags: ['Profile'],
    }),
    getProfileById: builder.query<ApiResponse<any>, string>({
      query: (id) => `/profiles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Profile', id }],
    }),
    getProfileByUserId: builder.query<ApiResponse<any>, string>({
      query: (userId) => `/profiles/user/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Profile', id: userId }],
    }),
    updateProfile: builder.mutation<ApiResponse<any>, { id: string; data: UpdateProfilePayload }>({
      query: ({ id, data }) => ({
        url: `/profiles/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Profile', id }],
    }),
    toggleFollow: builder.mutation<ApiResponse<{ action: 'followed' | 'unfollowed'; followersCount: number }>, string>({
      query: (id) => ({
        url: `/profiles/${id}/follow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Profile', id }],
    }),
    createPricing: builder.mutation<ApiResponse<any>, { id: string; data: CreatePricingPayload }>({
      query: ({ id, data }) => ({
        url: `/profiles/${id}/pricing`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Profile', id }],
    }),
    updatePricing: builder.mutation<ApiResponse<any>, { id: string; data: UpdatePricingPayload }>({
      query: ({ id, data }) => ({
        url: `/profiles/${id}/pricing`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Profile', id }],
    }),
    addCustomCategory: builder.mutation<ApiResponse<any>, { id: string; data: AddCustomCategoryPayload }>({
      query: ({ id, data }) => ({
        url: `/profiles/${id}/pricing/custom`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Profile', id }],
    }),
    createService: builder.mutation<ApiResponse<any>, { id: string; data: CreateServicePayload }>({
      query: ({ id, data }) => ({
        url: `/profiles/${id}/services`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Profile', id }],
    }),
    uploadVideoProof: builder.mutation<ApiResponse<any>, { id: string; data: VideoProofPayload }>({
      query: ({ id, data }) => ({
        url: `/profiles/${id}/video-proof`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Profile', id }],
    }),
    addMedia: builder.mutation<ApiResponse<any>, { id: string; data: AddMediaPayload }>({
      query: ({ id, data }) => ({
        url: `/profiles/${id}/media`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Profile', id }],
    }),
    createReview: builder.mutation<ApiResponse<any>, { id: string; data: CreateReviewPayload }>({
      query: ({ id, data }) => ({
        url: `/profiles/${id}/reviews`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Profile', id }],
    }),
    getReviews: builder.query<ApiResponse<ReviewsResponse>, { id: string; query?: GetReviewsQuery }>({
      query: ({ id, query }) => {
        const searchParams = new URLSearchParams();
        if (query?.cursor) searchParams.append('cursor', query.cursor);
        if (query?.limit) searchParams.append('limit', query.limit.toString());
        return `/profiles/${id}/reviews${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      },
      providesTags: (result, error, { id }) => [{ type: 'Profile', id }],
    }),

    // Wallet Endpoints
    getWalletBalance: builder.query<ApiResponse<WalletBalance>, void>({
      query: () => "/wallet/balance",
      providesTags: ['User'],
    }),
    fundWallet: builder.mutation<ApiResponse<FundWalletResponse>, FundWalletPayload>({
      query: (body) => ({
        url: "/wallet/fund",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    verifyPayment: builder.mutation<ApiResponse<VerifyPaymentResponse>, VerifyPaymentPayload>({
      query: (body) => ({
        url: "/wallet/verify-payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getTransactions: builder.query<ApiResponse<Transaction[]>, { limit?: number }>({
      query: ({ limit = 50 }) => `/wallet/transactions?limit=${limit}`,
      providesTags: ['User'],
    }),
    addWithdrawalAccount: builder.mutation<ApiResponse<WithdrawalAccount>, AddWithdrawalAccountPayload>({
      query: (body) => ({
        url: "/wallet/withdrawal-accounts",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getWithdrawalAccounts: builder.query<ApiResponse<WithdrawalAccount[]>, void>({
      query: () => "/wallet/withdrawal-accounts",
      providesTags: ['User'],
    }),
    setDefaultAccount: builder.mutation<ApiResponse<{ success: boolean }>, SetDefaultAccountPayload>({
      query: (body) => ({
        url: "/wallet/withdrawal-accounts/set-default",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    deleteWithdrawalAccount: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (accountId) => ({
        url: `/wallet/withdrawal-accounts/${accountId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['User'],
    }),
    getBanks: builder.query<ApiResponse<Bank[]>, void>({
      query: () => "/wallet/banks",
      providesTags: ['User'],
    }),
    verifyBankAccount: builder.mutation<ApiResponse<VerifyAccountResponse>, VerifyAccountPayload>({
      query: (body) => ({
        url: "/wallet/verify-account",
        method: "POST",
        body,
      }),
    }),
    createPayout: builder.mutation<ApiResponse<Payout>, CreatePayoutPayload>({
      query: (body) => ({
        url: "/wallet/payout",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getPayouts: builder.query<ApiResponse<Payout[]>, { limit?: number }>({
      query: ({ limit = 50 }) => `/wallet/payouts?limit=${limit}`,
      providesTags: ['User'],
    }),
    getPayoutById: builder.query<ApiResponse<Payout>, string>({
      query: (payoutId) => `/wallet/payouts/${payoutId}`,
      providesTags: ['User'],
    }),
    cancelPayout: builder.mutation<ApiResponse<{ success: boolean }>, { payoutId: string; data: CancelPayoutPayload }>({
      query: ({ payoutId, data }) => ({
        url: `/wallet/payouts/${payoutId}/cancel`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Rider Endpoints
    createRiderProfile: builder.mutation<ApiResponse<RiderProfile>, CreateRiderProfilePayload>({
      query: (body) => ({
        url: "/rider/profile",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getRiderProfile: builder.query<ApiResponse<RiderProfile>, void>({
      query: () => "/rider/profile",
      providesTags: ['User'],
    }),
    updateRiderProfile: builder.mutation<ApiResponse<RiderProfile>, UpdateRiderProfilePayload>({
      query: (body) => ({
        url: "/rider/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    uploadVerificationDocuments: builder.mutation<ApiResponse<RiderProfile>, UploadVerificationDocumentsPayload>({
      query: (body) => ({
        url: "/rider/verification/documents",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    updateRiderLocation: builder.mutation<ApiResponse<RiderProfile>, UpdateLocationPayload>({
      query: (body) => ({
        url: "/rider/location",
        method: "PUT",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    setRiderAvailability: builder.mutation<ApiResponse<RiderProfile>, SetAvailabilityPayload>({
      query: (body) => ({
        url: "/rider/availability",
        method: "PUT",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getNearbyOrders: builder.query<ApiResponse<Order[]>, { maxDistance?: number }>({
      query: ({ maxDistance = 10 }) => `/rider/orders/nearby?maxDistance=${maxDistance}`,
      providesTags: ['User'],
    }),
    acceptOrderByRider: builder.mutation<ApiResponse<Order>, string>({
      query: (orderId) => ({
        url: `/rider/orders/${orderId}/accept`,
        method: "POST",
      }),
      invalidatesTags: ['User'],
    }),
    rejectOrderByRider: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (orderId) => ({
        url: `/rider/orders/${orderId}/reject`,
        method: "POST",
      }),
      invalidatesTags: ['User'],
    }),

    // Order Endpoints
    createOrder: builder.mutation<ApiResponse<Order>, CreateOrderPayload>({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    listOrders: builder.query<ApiResponse<Order[]>, ListOrdersQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.role) searchParams.append('role', params.role);
        if (params.status) searchParams.append('status', params.status);
        if (params.cursor) searchParams.append('cursor', params.cursor);
        if (params.limit) searchParams.append('limit', params.limit.toString());
        return `/orders${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      },
      providesTags: ['User'],
    }),
    getOrderById: builder.query<ApiResponse<Order>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    acceptOrderByProvider: builder.mutation<ApiResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}/accept`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    rejectOrderByProvider: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (id) => ({
        url: `/orders/${id}/reject`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    markOrderReady: builder.mutation<ApiResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}/ready`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    startOrder: builder.mutation<ApiResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}/start`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    completeOrder: builder.mutation<ApiResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}/complete`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    cancelOrder: builder.mutation<ApiResponse<Order>, { id: string; data: CancelOrderPayload }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}/cancel`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    assignRider: builder.mutation<ApiResponse<Order>, { id: string; data: AssignRiderPayload }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}/assign-rider`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    getRiderChatRoom: builder.query<ApiResponse<{ roomId: string }>, string>({
      query: (id) => `/orders/${id}/rider-chat-room`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    riderPickedUp: builder.mutation<ApiResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}/rider-picked-up`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateOrderLocation: builder.mutation<ApiResponse<Order>, { id: string; data: UpdateOrderLocationPayload }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}/location`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
  }),
});

export const {
  // Auth
  useRegisterUserMutation,
  useRegisterWithEmailMutation,
  useLoginUserMutation,
  useLoginWithEmailMutation,
  useSendOTPMutation,
  useSetBasicDetailsMutation,
  useCheckAvailabilityMutation,
  useGetAuthProfileQuery,
  useUpdateAuthProfileMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useIntrospectTokenMutation,
  
  // User
  useCreateCompleteUserMutation,
  useGetUserProfileQuery,
  useUpdateUserMutation,
  useCreateAdminMutation,
  useVerifyRiderMutation,
  useGetPendingVerificationsQuery,
  
  // Profile
  useCreateProfileMutation,
  useListProfilesQuery,
  useGetProfileByIdQuery,
  useGetProfileByUserIdQuery,
  useUpdateProfileMutation,
  useToggleFollowMutation,
  useCreatePricingMutation,
  useUpdatePricingMutation,
  useAddCustomCategoryMutation,
  useCreateServiceMutation,
  useUploadVideoProofMutation,
  useAddMediaMutation,
  useCreateReviewMutation,
  useGetReviewsQuery,
  
  // Wallet
  useGetWalletBalanceQuery,
  useFundWalletMutation,
  useVerifyPaymentMutation,
  useGetTransactionsQuery,
  useAddWithdrawalAccountMutation,
  useGetWithdrawalAccountsQuery,
  useSetDefaultAccountMutation,
  useDeleteWithdrawalAccountMutation,
  useGetBanksQuery,
  useVerifyBankAccountMutation,
  useCreatePayoutMutation,
  useGetPayoutsQuery,
  useGetPayoutByIdQuery,
  useCancelPayoutMutation,
  
  // Rider
  useCreateRiderProfileMutation,
  useGetRiderProfileQuery,
  useUpdateRiderProfileMutation,
  useUploadVerificationDocumentsMutation,
  useUpdateRiderLocationMutation,
  useSetRiderAvailabilityMutation,
  useGetNearbyOrdersQuery,
  useAcceptOrderByRiderMutation,
  useRejectOrderByRiderMutation,
  
  // Order
  useCreateOrderMutation,
  useListOrdersQuery,
  useGetOrderByIdQuery,
  useAcceptOrderByProviderMutation,
  useRejectOrderByProviderMutation,
  useMarkOrderReadyMutation,
  useStartOrderMutation,
  useCompleteOrderMutation,
  useCancelOrderMutation,
  useAssignRiderMutation,
  useGetRiderChatRoomQuery,
  useRiderPickedUpMutation,
  useUpdateOrderLocationMutation,
  
  // Chat
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

