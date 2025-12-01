import { apiSlice } from "../../app/api/apiSlice";
import endpoints from "../../app/utils/endpoints";

export const chatApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    sendMessage: builder.mutation({
      query: (data) => ({
        url: endpoints.CHAT_MESSAGES,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => {
        // Handle API response structure: {success: true, data: {...}} or direct message object
        if (response && typeof response === 'object') {
          if (response.success && response.data) {
            return response.data;
          }
          // If response is already a message object (has id, senderId, etc.), return it
          if (response.id || response.senderId) {
            return response;
          }
        }
        return response;
      },
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Chat', 'Room'],
    }),
    getRoomMessages: builder.query({
      query: ({ roomId, limit, offset, before, after }) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());
        if (before) params.append('before', before);
        if (after) params.append('after', after);
        
        const queryString = params.toString();
        return {
          url: `${endpoints.CHAT_ROOM_MESSAGES(roomId)}${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        // Handle API response structure: {success: true, data: [...]} or direct array
        if (response && typeof response === 'object') {
          if (response.success && response.data) {
            return response.data;
          }
          // If response is already an array, return it
          if (Array.isArray(response)) {
            return response;
          }
          // If response has data property that's an array
          if (Array.isArray(response.data)) {
            return response.data;
          }
        }
        return response;
      },
      extraOptions: { serviceKey: "us" },
      providesTags: ['Chat'],
      keepUnusedDataFor: 30,
    }),
    createRoom: builder.mutation({
      query: (data) => ({
        url: endpoints.CHAT_ROOMS,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => {
        // Handle API response structure: {success: true, data: {...}}
        if (response && typeof response === 'object') {
          if (response.success && response.data) {
            return response.data;
          }
        }
        return response;
      },
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Room'],
    }),
    getUserRooms: builder.query({
      query: ({ limit = 10, offset = 0 }) => {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());
        return {
          url: `${endpoints.CHAT_ROOMS}?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        // Handle API response structure: {success: true, data: [...]}
        if (response && typeof response === 'object') {
          if (response.success && response.data) {
            return response.data;
          }
          // If response is already an array, return it
          if (Array.isArray(response)) {
            return response;
          }
          // If response has data property that's an array
          if (Array.isArray(response.data)) {
            return response.data;
          }
        }
        return response;
      },
      extraOptions: { serviceKey: "us" },
      providesTags: ['Room'],
      keepUnusedDataFor: 60,
    }),
    getConversations: builder.query({
      query: ({ limit = 10, offset = 0 }) => {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());
        return {
          url: `${endpoints.CHAT_CONVERSATIONS}?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        // Handle API response structure: {success: true, data: [...]}
        if (response && typeof response === 'object') {
          if (response.success && response.data) {
            return response.data;
          }
          // If response is already an array, return it
          if (Array.isArray(response)) {
            return response;
          }
          // If response has data property that's an array
          if (Array.isArray(response.data)) {
            return response.data;
          }
        }
        return response;
      },
      extraOptions: { serviceKey: "us" },
      providesTags: ['Room'],
      keepUnusedDataFor: 60,
    }),
    updateMessageStatus: builder.mutation({
      query: ({ messageId, ...data }) => ({
        url: endpoints.CHAT_MESSAGE_STATUS(messageId),
        method: "PUT",
        body: data,
      }),
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Chat'],
    }),
    markRoomAsRead: builder.mutation({
      query: (roomId: string) => ({
        url: endpoints.CHAT_ROOM_READ(roomId),
        method: "POST",
      }),
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Room', 'Chat'],
    }),
    getRoomUnreadCount: builder.query({
      query: (roomId: string) => ({
        url: endpoints.CHAT_ROOM_UNREAD_COUNT(roomId),
        method: "GET",
      }),
      extraOptions: { serviceKey: "us" },
      providesTags: ['Room'],
    }),
    getRoomStats: builder.query({
      query: (roomId: string) => ({
        url: endpoints.CHAT_ROOM_STATS(roomId),
        method: "GET",
      }),
      extraOptions: { serviceKey: "us" },
      providesTags: ['Room'],
    }),
    editMessage: builder.mutation({
      query: ({ messageId, content }) => ({
        url: endpoints.CHAT_MESSAGE_EDIT(messageId),
        method: "PUT",
        body: { content },
      }),
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Chat'],
    }),
    deleteMessage: builder.mutation({
      query: ({ messageId, hard = false }) => {
        const params = new URLSearchParams();
        if (hard) params.append('hard', 'true');
        return {
          url: `${endpoints.CHAT_MESSAGE_DELETE(messageId)}${params.toString() ? `?${params.toString()}` : ''}`,
          method: "DELETE",
        };
      },
      extraOptions: { serviceKey: "us" },
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetRoomMessagesQuery,
  useCreateRoomMutation,
  useGetUserRoomsQuery,
  useGetConversationsQuery,
  useUpdateMessageStatusMutation,
  useMarkRoomAsReadMutation,
  useGetRoomUnreadCountQuery,
  useGetRoomStatsQuery,
  useEditMessageMutation,
  useDeleteMessageMutation,
} = chatApiSlice;

