import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

// WebSocket URL - Socket.IO handles protocol conversion automatically
const getWebSocketUrl = (): string => {
  // Check for environment variable first
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  if (wsUrl) {
    return wsUrl;
  }

  // For development, use localhost:5001 (as per documentation)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5001';
  }
  
  // For production, use the backend URL
  // Socket.IO will automatically use the /chat namespace
  const baseUrl = process.env.NEXT_PUBLIC_USER_BASE_URL || 'https://be-aphrodite-8wrp.onrender.com';
  return baseUrl;
};

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  roomId: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
  attachments?: string[];
  readAt?: string;
  deliveredAt?: string;
  replyTo?: string;
  tempId?: string;
}

interface SendMessageData {
  receiverId: string;
  roomId: string;
  content: string;
  type?: string;
  tempId?: string;
  metadata?: Record<string, unknown>;
}

interface TypingData {
  roomId: string;
  isTyping: boolean;
}

interface UserTypingData {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

interface MessagesReadData {
  roomId: string;
  messageIds: string[];
  readBy: string;
  readAt: string;
}

interface UserPresenceData {
  roomId: string;
  userId: string;
  isOnline: boolean;
  timestamp: string;
}

interface RoomJoinedData {
  roomId: string;
  room: {
    id: string;
    participants: unknown[];
    [key: string]: unknown;
  };
}

interface MessageDeliveredData {
  tempId?: string;
  message: ChatMessage;
}

interface UseChatSocketReturn {
  socket: Socket | null;
  connected: boolean;
  sendMessage: (data: SendMessageData) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  setTyping: (roomId: string, isTyping: boolean) => void;
  markAsRead: (roomId: string, messageIds: string[]) => void;
  getUnreadCount: (roomId: string) => void;
  getUserRooms: () => void;
}

export const useChatSocket = (): UseChatSocketReturn => {
  const { accessToken, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only connect if authenticated and have token
    if (!isAuthenticated || !accessToken) {
      console.log('[useChatSocket] Not authenticated or no token, skipping connection');
      return;
    }

    const wsUrl = getWebSocketUrl();
    // Socket.IO automatically handles the /chat namespace
    const socketUrl = `${wsUrl}/chat`;
    console.log('[useChatSocket] Connecting to WebSocket:', socketUrl);
    console.log('[useChatSocket] Using access token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'none');

    const newSocket = io(socketUrl, {
      withCredentials: true,
      auth: {
        token: accessToken,
      },
      // Also try passing token in extraHeaders as fallback
      extraHeaders: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : undefined,
      transports: ['websocket', 'polling'], // Allow fallback to polling if websocket fails
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000, // 20 second timeout
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('[useChatSocket] Socket connected:', newSocket.id);
      setConnected(true);
      reconnectAttempts.current = 0;
    });

    newSocket.on('connected', (data) => {
      console.log('[useChatSocket] Server confirmed connection:', data);
      setConnected(true);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[useChatSocket] Socket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('[useChatSocket] Socket error:', error);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[useChatSocket] Connection error:', error);
      console.error('[useChatSocket] Error details:', {
        message: error.message,
        type: (error as any).type,
        description: (error as any).description,
        context: (error as any).context,
      });
      setConnected(false);
      
      // Don't retry on authentication errors
      if (error.message?.includes('Authentication') || error.message?.includes('Unauthorized')) {
        console.error('[useChatSocket] Authentication failed - check token validity');
        return;
      }
      
      // Implement exponential backoff for reconnection
      reconnectAttempts.current += 1;
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        console.log(`[useChatSocket] Will retry connection in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          newSocket.connect();
        }, delay);
      } else {
        console.error('[useChatSocket] Max reconnection attempts reached');
      }
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      console.log('[useChatSocket] Cleaning up socket connection');
      newSocket.close();
      setSocket(null);
      setConnected(false);
    };
  }, [isAuthenticated, accessToken]);

  const sendMessage = useCallback((data: SendMessageData) => {
    if (!socket || !connected) {
      console.warn('[useChatSocket] Cannot send message: socket not connected');
      return;
    }

    console.log('[useChatSocket] Sending message:', data);
    socket.emit('sendMessage', {
      receiverId: data.receiverId,
      roomId: data.roomId,
      content: data.content,
      type: data.type || 'text',
      tempId: data.tempId || Date.now().toString(),
      metadata: data.metadata || {},
    });
  }, [socket, connected]);

  const joinRoom = useCallback((roomId: string) => {
    if (!socket || !connected) {
      console.warn('[useChatSocket] Cannot join room: socket not connected');
      return;
    }

    console.log('[useChatSocket] Joining room:', roomId);
    socket.emit('joinRoom', { roomId });
  }, [socket, connected]);

  const leaveRoom = useCallback((roomId: string) => {
    if (!socket || !connected) {
      console.warn('[useChatSocket] Cannot leave room: socket not connected');
      return;
    }

    console.log('[useChatSocket] Leaving room:', roomId);
    socket.emit('leaveRoom', { roomId });
  }, [socket, connected]);

  const setTyping = useCallback((roomId: string, isTyping: boolean) => {
    if (!socket || !connected) {
      return;
    }

    socket.emit('typing', { roomId, isTyping });
  }, [socket, connected]);

  const markAsRead = useCallback((roomId: string, messageIds: string[]) => {
    if (!socket || !connected) {
      console.warn('[useChatSocket] Cannot mark as read: socket not connected');
      return;
    }

    socket.emit('markAsRead', { roomId, messageIds });
  }, [socket, connected]);

  const getUnreadCount = useCallback((roomId: string) => {
    if (!socket || !connected) {
      console.warn('[useChatSocket] Cannot get unread count: socket not connected');
      return;
    }

    socket.emit('getUnreadCount', { roomId });
  }, [socket, connected]);

  const getUserRooms = useCallback(() => {
    if (!socket || !connected) {
      console.warn('[useChatSocket] Cannot get user rooms: socket not connected');
      return;
    }

    socket.emit('getUserRooms');
  }, [socket, connected]);

  return {
    socket,
    connected,
    sendMessage,
    joinRoom,
    leaveRoom,
    setTyping,
    markAsRead,
    getUnreadCount,
    getUserRooms,
  };
};

// Export types for use in components
export type {
  ChatMessage as SocketChatMessage,
  SendMessageData,
  TypingData,
  UserTypingData,
  MessagesReadData,
  UserPresenceData,
  RoomJoinedData,
  MessageDeliveredData,
};

