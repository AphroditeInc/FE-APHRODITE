export type MessageType = 'text' | 'image' | 'file' | 'video' | 'audio';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type RoomType = 'direct' | 'group';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  roomId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
  attachments?: string[];
  readAt?: string;
  deliveredAt?: string;
  replyTo?: string;
  tempId?: string;
}

export interface ChatRoom {
  id: string;
  roomId?: string;
  name?: string;
  description?: string;
  type: RoomType;
  participants: string[];
  settings?: {
    notifications: boolean;
    autoDelete: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export interface SendMessagePayload {
  receiverId: string;
  content: string;
  type: MessageType;
  metadata?: Record<string, unknown>;
  attachments?: string[];
  replyTo?: string;
  tempId?: string;
}

export interface CreateRoomPayload {
  name?: string;
  description?: string;
  type: RoomType;
  participants: string[];
  settings?: {
    notifications: boolean;
    autoDelete: boolean;
  };
}

export interface GetMessagesQuery {
  limit?: number;
  offset?: number;
  before?: string;
  after?: string;
}

export interface UpdateMessageStatusPayload {
  status: MessageStatus;
}

export interface RoomStats {
  totalMessages: number;
  unreadCount: number;
  lastActivity: string;
  participants: number;
}

