import { useCallback, useState } from 'react';
import { useApi } from '../context/ApiContext';
import type { 
  SendMessagePayload, 
  ChatMessage, 
  ChatRoom, 
  GetMessagesQuery,
  UpdateMessageStatusPayload,
  RoomStats,
  ApiResponse 
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
  const api = useApi();
  const [isSending, setIsSending] = useState(false);

  /**
   * Send a message to another user or room
   * 
   * @param payload - Message payload containing receiverId, content, type, etc.
   * @returns Promise with the sent message or error
   * 
   * @example
   * ```tsx
   * const response = await sendMessage({
   *   receiverId: '507f1f77bcf86cd799439011',
   *   content: 'Hello, how are you?',
   *   type: 'text',
   *   metadata: {
   *     imageUrl: 'https://example.com/image.jpg'
   *   },
   *   attachments: ['https://example.com/file1.pdf'],
   *   replyTo: '507f1f77bcf86cd799439012',
   *   tempId: 'temp_1234567890'
   * });
   * ```
   */
  const sendMessage = useCallback(async (
    payload: SendMessagePayload
  ): Promise<ApiResponse<ChatMessage>> => {
    setIsSending(true);
    try {
      const response = await api.sendMessage(payload);
      return response;
    } finally {
      setIsSending(false);
    }
  }, [api]);

  /**
   * Get messages from a specific room
   */
  const getRoomMessages = useCallback(async (
    roomId: string,
    query?: GetMessagesQuery
  ): Promise<ApiResponse<ChatMessage[]>> => {
    return api.getRoomMessages(roomId, query);
  }, [api]);

  /**
   * Create a new chat room
   */
  const createRoom = useCallback(async (
    payload: Parameters<typeof api.createRoom>[0]
  ): Promise<ApiResponse<ChatRoom>> => {
    return api.createRoom(payload);
  }, [api]);

  /**
   * Get all chat rooms for the authenticated user
   */
  const getUserRooms = useCallback(async (
    limit?: number,
    offset?: number
  ): Promise<ApiResponse<ChatRoom[]>> => {
    return api.getUserRooms(limit, offset);
  }, [api]);

  /**
   * Get conversation history
   */
  const getConversations = useCallback(async (
    limit?: number,
    offset?: number
  ): Promise<ApiResponse<ChatRoom[]>> => {
    return api.getConversations(limit, offset);
  }, [api]);

  /**
   * Update message status (delivered, read, etc.)
   */
  const updateMessageStatus = useCallback(async (
    messageId: string,
    payload: UpdateMessageStatusPayload
  ): Promise<ApiResponse<ChatMessage>> => {
    return api.updateMessageStatus(messageId, payload);
  }, [api]);

  /**
   * Mark all messages in a room as read
   */
  const markRoomAsRead = useCallback(async (
    roomId: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    return api.markRoomAsRead(roomId);
  }, [api]);

  /**
   * Get unread message count for a room
   */
  const getRoomUnreadCount = useCallback(async (
    roomId: string
  ): Promise<ApiResponse<{ count: number }>> => {
    return api.getRoomUnreadCount(roomId);
  }, [api]);

  /**
   * Get room statistics
   */
  const getRoomStats = useCallback(async (
    roomId: string
  ): Promise<ApiResponse<RoomStats>> => {
    return api.getRoomStats(roomId);
  }, [api]);

  /**
   * Edit a message
   */
  const editMessage = useCallback(async (
    messageId: string,
    content: string
  ): Promise<ApiResponse<ChatMessage>> => {
    return api.editMessage(messageId, content);
  }, [api]);

  /**
   * Delete a message
   */
  const deleteMessage = useCallback(async (
    messageId: string,
    hard?: boolean
  ): Promise<ApiResponse<{ success: boolean }>> => {
    return api.deleteMessage(messageId, hard);
  }, [api]);

  return {
    // Methods
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
    
    // State
    isSending,
    isLoading: api.isLoading,
    error: api.error,
  };
};

