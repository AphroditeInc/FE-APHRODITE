"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';
import { useAuth } from '../hooks/useAuth';
import { ChatRoom, ChatMessage } from '../types/auth.types';

// Keep local RoomParticipant for backwards compatibility if needed,
// but ChatRoom now comes from auth.types with participants as string[]

interface TypingUser {
  userId: string;
  roomId: string;
  timestamp: number;
}

interface ChatContextType {
  rooms: ChatRoom[];
  onlineUsers: Map<string, boolean>;
  unreadCounts: Map<string, number>;
  typingUsers: Map<string, TypingUser>;
  connected: boolean;
  reconnecting: boolean;
  loading: boolean;
  refreshRooms: () => void;
  isUserOnline: (userId: string) => boolean;
  getUnreadCount: (roomId: string) => number;
  isUserTyping: (roomId: string, userId: string) => boolean;
  getTotalUnreadCount: () => number;
  updateMessageStatus: (messageId: string, status: string) => void;
  messageStatuses: Map<string, string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket, connected, reconnecting, getRoomList, getAllUnreadCounts } = useChatSocket();
  const { userId, isAuthenticated } = useAuth();
  
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, boolean>>(new Map());
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const [messageStatuses, setMessageStatuses] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  
  const typingTimeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastRoomsFetchTime = useRef<number>(0);

  // Update user presence on window focus/blur
  useEffect(() => {
    if (!socket || !connected) return;

    const handleFocus = () => {
      rooms.forEach(room => {
        socket.emit('userPresence', { roomId: room.roomId, isActive: true });
      });
    };

    const handleBlur = () => {
      rooms.forEach(room => {
        socket.emit('userPresence', { roomId: room.roomId, isActive: false });
      });
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [socket, connected, rooms]);

  // Request room list when connected
  useEffect(() => {
    if (connected && socket && isAuthenticated) {
      
      // Check if this is a reconnection (not first connection)
      const now = Date.now();
      const isReconnection = lastRoomsFetchTime.current > 0 && (now - lastRoomsFetchTime.current) > 5000;
      
      if (isReconnection) {
        // Request full room list to catch up on missed messages
        getRoomList();
        getAllUnreadCounts();
      } else {
        // First connection or quick reconnect
        getRoomList();
        getAllUnreadCounts();
      }
      
      lastRoomsFetchTime.current = now;
      setLoading(false);
    }
  }, [connected, socket, isAuthenticated, getRoomList, getAllUnreadCounts]);

  // Listen for room list updates
  useEffect(() => {
    if (!socket) return;

    const handleRoomListUpdate = (data: { rooms: ChatRoom[]; timestamp: string }) => {
      const sortedRooms = [...data.rooms].sort((a, b) => {
        const timeA = new Date(a.updatedAt).getTime();
        const timeB = new Date(b.updatedAt).getTime();
        return timeB - timeA;
      });
      
      setRooms(sortedRooms);
      
      // Update online users map
      const newOnlineUsers = new Map<string, boolean>();
      sortedRooms.forEach(room => {
        if (Array.isArray(room.participants)) {
          room.participants.forEach(participantId => {
            if (participantId && participantId !== userId) {
              newOnlineUsers.set(participantId, false);
            }
          });
        }
      });
      setOnlineUsers(newOnlineUsers);
      
      // Update unread counts
      const newUnreadCounts = new Map<string, number>();
      sortedRooms.forEach(room => {
        if (room.unreadCount !== undefined) {
          const key = room.roomId || room.id;
          newUnreadCounts.set(key, room.unreadCount);
        }
      });
      setUnreadCounts(newUnreadCounts);
    };

    const handleUnreadCountUpdate = (data: { roomId: string; unreadCount: number }) => {
      setUnreadCounts(prev => {
        const updated = new Map(prev);
        updated.set(data.roomId, data.unreadCount);
        return updated;
      });
    };

    const handleAllUnreadCounts = (data: { unreadCounts: Record<string, number> }) => {
      const newUnreadCounts = new Map<string, number>();
      Object.entries(data.unreadCounts).forEach(([roomId, count]) => {
        newUnreadCounts.set(roomId, count);
      });
      setUnreadCounts(newUnreadCounts);
    };

    const handleUserPresenceChanged = (data: { roomId: string; userId: string; isOnline: boolean }) => {
      if (data.userId !== userId) {
        setOnlineUsers(prev => {
          const updated = new Map(prev);
          updated.set(data.userId, data.isOnline);
          return updated;
        });
      }
      
      // Online status is tracked in onlineUsers Map, not in room participants anymore
      // since participants are now string[] instead of RoomParticipant[]
    };

    const handleUserTyping = (data: { roomId: string; userId: string; isTyping: boolean }) => {
      const key = `${data.roomId}_${data.userId}`;
      
      if (data.isTyping) {
        // User started typing
        setTypingUsers(prev => {
          const updated = new Map(prev);
          updated.set(key, {
            userId: data.userId,
            roomId: data.roomId,
            timestamp: Date.now(),
          });
          return updated;
        });
        
        // Clear existing timeout for this user
        const existingTimeout = typingTimeoutRefs.current.get(key);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
        
        // Set timeout to remove typing indicator after 5 seconds
        const timeout = setTimeout(() => {
          setTypingUsers(prev => {
            const updated = new Map(prev);
            updated.delete(key);
            return updated;
          });
          typingTimeoutRefs.current.delete(key);
        }, 5000);
        
        typingTimeoutRefs.current.set(key, timeout);
      } else {
        // User stopped typing
        setTypingUsers(prev => {
          const updated = new Map(prev);
          updated.delete(key);
          return updated;
        });
        
        const timeout = typingTimeoutRefs.current.get(key);
        if (timeout) {
          clearTimeout(timeout);
          typingTimeoutRefs.current.delete(key);
        }
      }
    };

    const handleNewMessage = (data: { message: ChatMessage }) => {
      // Refresh room list to update last message and unread count
      getRoomList();
      
      // Update message status if it was sent by current user
      if (data.message.senderId === userId && data.message.tempId) {
        setMessageStatuses(prev => {
          const updated = new Map(prev);
          updated.set(data.message.tempId!, 'sent');
          updated.set(data.message.id, 'sent');
          return updated;
        });
      }
    };

    const handleMessageDelivered = (data: { message: ChatMessage; tempId?: string }) => {
      setMessageStatuses(prev => {
        const updated = new Map(prev);
        if (data.tempId) {
          updated.set(data.tempId, 'delivered');
        }
        updated.set(data.message.id, 'delivered');
        return updated;
      });
    };

    const handleMessagesRead = (data: { roomId: string; messageIds: string[]; readBy: string }) => {
      setMessageStatuses(prev => {
        const updated = new Map(prev);
        data.messageIds.forEach(messageId => {
          updated.set(messageId, 'read');
        });
        return updated;
      });
    };

    socket.on('roomListUpdate', handleRoomListUpdate);
    socket.on('unreadCountUpdate', handleUnreadCountUpdate);
    socket.on('allUnreadCounts', handleAllUnreadCounts);
    socket.on('userPresenceChanged', handleUserPresenceChanged);
    socket.on('userTyping', handleUserTyping);
    socket.on('newMessage', handleNewMessage);
    socket.on('messageDelivered', handleMessageDelivered);
    socket.on('messagesRead', handleMessagesRead);

    return () => {
      socket.off('roomListUpdate', handleRoomListUpdate);
      socket.off('unreadCountUpdate', handleUnreadCountUpdate);
      socket.off('allUnreadCounts', handleAllUnreadCounts);
      socket.off('userPresenceChanged', handleUserPresenceChanged);
      socket.off('userTyping', handleUserTyping);
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDelivered', handleMessageDelivered);
      socket.off('messagesRead', handleMessagesRead);
      
      // Clear all typing timeouts
      typingTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRefs.current.clear();
    };
  }, [socket, userId, getRoomList]);

  const refreshRooms = useCallback(() => {
    if (connected && socket) {
      getRoomList();
      getAllUnreadCounts();
    }
  }, [connected, socket, getRoomList, getAllUnreadCounts]);

  const isUserOnline = useCallback((checkUserId: string): boolean => {
    return onlineUsers.get(checkUserId) || false;
  }, [onlineUsers]);

  const getUnreadCount = useCallback((roomId: string): number => {
    return unreadCounts.get(roomId) || 0;
  }, [unreadCounts]);

  const isUserTyping = useCallback((roomId: string, checkUserId: string): boolean => {
    const key = `${roomId}_${checkUserId}`;
    return typingUsers.has(key);
  }, [typingUsers]);

  const getTotalUnreadCount = useCallback((): number => {
    let total = 0;
    unreadCounts.forEach(count => {
      total += count;
    });
    return total;
  }, [unreadCounts]);

  const updateMessageStatus = useCallback((messageId: string, status: string) => {
    setMessageStatuses(prev => {
      const updated = new Map(prev);
      updated.set(messageId, status);
      return updated;
    });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        rooms,
        onlineUsers,
        unreadCounts,
        typingUsers,
        connected,
        reconnecting,
        loading,
        refreshRooms,
        isUserOnline,
        getUnreadCount,
        isUserTyping,
        getTotalUnreadCount,
        updateMessageStatus,
        messageStatuses,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
