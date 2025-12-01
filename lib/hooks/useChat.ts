import { useCallback } from 'react';
import { 
  useSendMessageMutation, 
  useCreateRoomMutation, 
  useLazyGetRoomMessagesQuery, 
  useLazyGetUserRoomsQuery,
  useUpdateMessageStatusMutation,
  useMarkRoomAsReadMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
} from '@/app/api/apiSlice';
import type { 
  SendMessagePayload, 
  CreateRoomPayload, 
  GetMessagesQuery,
  UpdateMessageStatusPayload,
} from '../types';

/**
 * Custom Chat Hook
 * 
 * Provides easy access to chat functionality including sending messages,
 * managing rooms, and handling message status updates.
 * 
 * @example
 * ```tsx
 * const ChatComponent = () => {
 *   const { sendMessage, isLoading, error } = useChat();
 *   const [message, setMessage] = useState('');
 * 
 *   const handleSend = async () => {
 *     const response = await sendMessage({
 *       receiverId: '507f1f77bcf86cd799439011',
 *       content: message,
 *       type: 'text',
 *     });
 * 
 *     if (response.success) {
 *       setMessage('');
 *       console.log('Message sent:', response.data);
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       <input value={message} onChange={(e) => setMessage(e.target.value)} />
 *       <button onClick={handleSend}>Send</button>
 *     </div>
 *   );
 * };
 * ```
 */
export const useChat = () => {
  const [sendMessageMutation, { isLoading: isSending, error: sendError }] = useSendMessageMutation();
  const [createRoomMutation] = useCreateRoomMutation();
  const [getRoomMessagesQuery] = useLazyGetRoomMessagesQuery();
  const [getUserRoomsQuery] = useLazyGetUserRoomsQuery();
  const [updateMessageStatusMutation] = useUpdateMessageStatusMutation();
  const [markRoomAsReadMutation] = useMarkRoomAsReadMutation();
  const [editMessageMutation] = useEditMessageMutation();
  const [deleteMessageMutation] = useDeleteMessageMutation();

  const sendMessage = useCallback(async (payload: SendMessagePayload) => {
    return sendMessageMutation(payload).unwrap();
  }, [sendMessageMutation]);

  const getRoomMessages = useCallback(async (roomId: string, query?: GetMessagesQuery) => {
    return getRoomMessagesQuery({ roomId, query }).unwrap();
  }, [getRoomMessagesQuery]);

  const createRoom = useCallback(async (payload: CreateRoomPayload) => {
    return createRoomMutation(payload).unwrap();
  }, [createRoomMutation]);

  const getUserRooms = useCallback(async (limit?: number, offset?: number) => {
    return getUserRoomsQuery({ limit, offset }).unwrap();
  }, [getUserRoomsQuery]);

  const getConversations = useCallback(async () => {
    // Note: This uses the query hook directly, not lazy
    // You may want to refactor this to use useLazyGetConversationsQuery if needed
    throw new Error("Use useGetConversationsQuery hook directly in component");
  }, []);

  const updateMessageStatus = useCallback(async (messageId: string, payload: UpdateMessageStatusPayload) => {
    return updateMessageStatusMutation({ messageId, ...payload }).unwrap();
  }, [updateMessageStatusMutation]);

  const markRoomAsRead = useCallback(async (roomId: string) => {
    return markRoomAsReadMutation(roomId).unwrap();
  }, [markRoomAsReadMutation]);

  const getRoomUnreadCount = useCallback(async () => {
    // Note: This is a query, not a mutation. Use the hook directly in component
    throw new Error("Use useGetRoomUnreadCountQuery hook directly in component");
  }, []);

  const getRoomStats = useCallback(async () => {
    // Note: This is a query, not a mutation. Use the hook directly in component
    throw new Error("Use useGetRoomStatsQuery hook directly in component");
  }, []);

  const editMessage = useCallback(async (messageId: string, content: string) => {
    return editMessageMutation({ messageId, content }).unwrap();
  }, [editMessageMutation]);

  const deleteMessage = useCallback(async (messageId: string, hard?: boolean) => {
    return deleteMessageMutation({ messageId, hard }).unwrap();
  }, [deleteMessageMutation]);

  return {
    sendMessage,
    getRoomMessages,
    createRoom,
    getUserRooms,
    getConversations,
    updateMessageStatus,
    markRoomAsRead,
    getRoomUnreadCount,
    getRoomStats,
    editMessage,
    deleteMessage,
    
    isSending,
    isLoading: isSending, // Approximate
    error: (sendError as { data?: { message?: string }; error?: string })?.data?.message || (sendError as { error?: string })?.error || null,
  };
};

