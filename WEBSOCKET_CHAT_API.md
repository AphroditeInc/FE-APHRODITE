# Chat WebSocket API Documentation

## Overview

The Aphrodite Backend provides real-time chat functionality through WebSocket connections using Socket.IO. This document outlines all available events, authentication, and implementation examples.

## Connection Details

- **WebSocket URL**: `ws://localhost:5001/chat` (development) / `wss://your-domain.com/chat` (production)
- **Namespace**: `/chat`
- **Protocol**: Socket.IO
- **Authentication**: JWT Bearer Token

## Authentication

### Required Headers/Auth

```javascript
const socket = io('http://localhost:5001/chat', {
  withCredentials: true,
  auth: {
    token: 'your-jwt-token-here',
  },
  transports: ['websocket'],
});

// Alternative: Pass token in headers
const socket = io('http://localhost:5001/chat', {
  withCredentials: true,
  extraHeaders: {
    Authorization: 'Bearer your-jwt-token-here',
  },
});
```

### Connection Events

#### `connected`

**Direction**: Server → Client  
**Description**: Confirmation that connection was successful

```javascript
socket.on('connected', (data) => {
  console.log(data);
  // { message: 'Connected to chat server', userId: 'user123' }
});
```

#### `error`

**Direction**: Server → Client  
**Description**: Authentication or connection errors

```javascript
socket.on('error', (error) => {
  console.error(error);
  // { message: 'Authentication failed' }
});
```

## Message Events

### Sending Messages

#### `sendMessage`

**Direction**: Client → Server  
**Description**: Send a new message to a user or room

```javascript
socket.emit('sendMessage', {
  receiverId: 'user123', // Required: Target user ID
  roomId: 'room456', // Required: Chat room ID
  content: 'Hello there!', // Required: Message content
  type: 'text', // Optional: 'text', 'image', 'file', etc.
  tempId: 'temp_123', // Optional: Client-side temporary ID
  metadata: {
    // Optional: Additional data
    replyTo: 'message_id',
  },
});
```

#### `messageDelivered`

**Direction**: Server → Client  
**Description**: Confirmation that message was sent successfully

```javascript
socket.on('messageDelivered', (data) => {
  console.log('Message sent:', data);
  // {
  //   tempId: 'temp_123',
  //   message: { id: 'msg123', content: 'Hello there!', ... }
  // }
});
```

#### `messageError`

**Direction**: Server → Client  
**Description**: Error occurred while sending message

```javascript
socket.on('messageError', (error) => {
  console.error('Message error:', error);
  // { error: 'Room not found', tempId: 'temp_123' }
});
```

### Receiving Messages

#### `newMessage`

**Direction**: Server → Client  
**Description**: Receive a new message from another user

```javascript
socket.on('newMessage', (data) => {
  console.log('New message:', data.message);
  // {
  //   message: {
  //     id: 'msg123',
  //     senderId: 'user456',
  //     receiverId: 'user789',
  //     roomId: 'room123',
  //     content: 'Hello!',
  //     type: 'text',
  //     status: 'delivered',
  //     createdAt: '2025-12-05T10:00:00Z',
  //     metadata: {},
  //     attachments: []
  //   }
  // }
});
```

#### `roomMessage`

**Direction**: Server → Client  
**Description**: Receive a message in a group chat room

```javascript
socket.on('roomMessage', (data) => {
  console.log('Room message:', data.message);
  // Same structure as newMessage
});
```

## Room Management

### Joining Rooms

#### `joinRoom`

**Direction**: Client → Server  
**Description**: Join a chat room

```javascript
socket.emit('joinRoom', {
  roomId: 'room123', // Required: Room ID to join
});
```

#### `roomJoined`

**Direction**: Server → Client  
**Description**: Confirmation of successful room join

```javascript
socket.on('roomJoined', (data) => {
  console.log('Joined room:', data);
  // {
  //   roomId: 'room123',
  //   room: { id: 'room123', participants: [...], ... }
  // }
});
```

#### `userJoinedRoom`

**Direction**: Server → Client  
**Description**: Another user joined the room

```javascript
socket.on('userJoinedRoom', (data) => {
  console.log('User joined:', data);
  // {
  //   roomId: 'room123',
  //   userId: 'user456',
  //   user: { id: 'user456', name: 'John Doe' }
  // }
});
```

### Leaving Rooms

#### `leaveRoom`

**Direction**: Client → Server  
**Description**: Leave a chat room

```javascript
socket.emit('leaveRoom', {
  roomId: 'room123', // Required: Room ID to leave
});
```

#### `roomLeft`

**Direction**: Server → Client  
**Description**: Confirmation of successful room leave

```javascript
socket.on('roomLeft', (data) => {
  console.log('Left room:', data);
  // { roomId: 'room123' }
});
```

#### `userLeftRoom`

**Direction**: Server → Client  
**Description**: Another user left the room

```javascript
socket.on('userLeftRoom', (data) => {
  console.log('User left:', data);
  // { roomId: 'room123', userId: 'user456' }
});
```

#### `roomError`

**Direction**: Server → Client  
**Description**: Error occurred during room operations

```javascript
socket.on('roomError', (error) => {
  console.error('Room error:', error);
  // {
  //   error: 'Room not found',
  //   action: 'join',
  //   roomId: 'room123'
  // }
});
```

## Typing Indicators

#### `typing`

**Direction**: Client → Server  
**Description**: Send typing indicator to room

```javascript
socket.emit('typing', {
  roomId: 'room123', // Required: Room ID
  isTyping: true, // Required: true when starting to type, false when stopped
});
```

#### `userTyping`

**Direction**: Server → Client  
**Description**: Receive typing indicator from another user

```javascript
socket.on('userTyping', (data) => {
  console.log('User typing:', data);
  // {
  //   roomId: 'room123',
  //   userId: 'user456',
  //   isTyping: true
  // }
});
```

## Message Status & Read Receipts

### Mark Messages as Read

#### `markAsRead`

**Direction**: Client → Server  
**Description**: Mark specific messages as read

```javascript
socket.emit('markAsRead', {
  roomId: 'room123', // Required: Room ID
  messageIds: ['msg1', 'msg2', 'msg3'], // Required: Array of message IDs
});
```

#### `messagesRead`

**Direction**: Server → Client  
**Description**: Notification that messages were read by someone

```javascript
socket.on('messagesRead', (data) => {
  console.log('Messages read:', data);
  // {
  //   roomId: 'room123',
  //   messageIds: ['msg1', 'msg2'],
  //   readBy: 'user456',
  //   readAt: '2025-12-05T10:05:00Z'
  // }
});
```

### Get Unread Count

#### `getUnreadCount`

**Direction**: Client → Server  
**Description**: Get unread message count for a room

```javascript
socket.emit('getUnreadCount', {
  roomId: 'room123', // Required: Room ID
});
```

#### `unreadCount`

**Direction**: Server → Client  
**Description**: Response with unread message count

```javascript
socket.on('unreadCount', (data) => {
  console.log('Unread count:', data);
  // {
  //   roomId: 'room123',
  //   unreadCount: 5
  // }
});
```

## User Presence & Status

#### `userPresenceChanged`

**Direction**: Server → Client  
**Description**: Notification when user goes online/offline

```javascript
socket.on('userPresenceChanged', (data) => {
  console.log('User presence changed:', data);
  // {
  //   roomId: 'room123',
  //   userId: 'user456',
  //   isOnline: true,
  //   timestamp: '2025-12-05T10:00:00Z'
  // }
});
```

## Room Information

### Get User Rooms

#### `getUserRooms`

**Direction**: Client → Server  
**Description**: Get all rooms user is part of

```javascript
socket.emit('getUserRooms');
```

#### `userRooms`

**Direction**: Server → Client  
**Description**: Response with user's rooms

```javascript
socket.on('userRooms', (data) => {
  console.log('User rooms:', data.rooms);
  // {
  //   rooms: [
  //     {
  //       roomId: 'room123',
  //       name: 'General Chat',
  //       participants: [...],
  //       lastMessage: { ... },
  //       unreadCount: 2
  //     }
  //   ]
  // }
});
```

## Notifications

#### `notification`

**Direction**: Server → Client  
**Description**: General notifications (mentions, new messages when app is backgrounded, etc.)

```javascript
socket.on('notification', (notification) => {
  console.log('Notification:', notification);
  // Structure varies based on notification type
});
```

## Implementation Example

### React Hook Example

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useChatSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:5001/chat', {
      withCredentials: true,
      auth: { token },
      transports: ['websocket'],
    });

    // Connection events
    newSocket.on('connected', (data) => {
      console.log('Connected:', data);
      setConnected(true);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setConnected(false);
    });

    // Message events
    newSocket.on('newMessage', (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    newSocket.on('messageDelivered', (data) => {
      // Update optimistic message with real data
      setMessages((prev) =>
        prev.map((msg) => (msg.tempId === data.tempId ? data.message : msg)),
      );
    });

    // Typing indicators
    newSocket.on('userTyping', (data) => {
      // Handle typing indicator
    });

    // Presence updates
    newSocket.on('userPresenceChanged', (data) => {
      // Update user online status
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const sendMessage = (messageData) => {
    if (socket && connected) {
      socket.emit('sendMessage', messageData);
    }
  };

  const joinRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('joinRoom', { roomId });
    }
  };

  const setTyping = (roomId, isTyping) => {
    if (socket && connected) {
      socket.emit('typing', { roomId, isTyping });
    }
  };

  return {
    socket,
    connected,
    messages,
    sendMessage,
    joinRoom,
    setTyping,
  };
};
```

### Vue.js Composable Example

```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

export function useChatSocket(token) {
  const socket = ref(null);
  const connected = ref(false);
  const messages = ref([]);

  const connect = () => {
    if (!token.value) return;

    socket.value = io('http://localhost:5001/chat', {
      withCredentials: true,
      auth: { token: token.value },
      transports: ['websocket'],
    });

    socket.value.on('connected', (data) => {
      connected.value = true;
      console.log('Connected:', data);
    });

    socket.value.on('newMessage', (data) => {
      messages.value.push(data.message);
    });

    // Add other event listeners...
  };

  const sendMessage = (messageData) => {
    if (socket.value && connected.value) {
      socket.value.emit('sendMessage', messageData);
    }
  };

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    if (socket.value) {
      socket.value.close();
    }
  });

  return {
    socket: socket.value,
    connected,
    messages,
    sendMessage,
  };
}
```

## Error Handling

Common error scenarios and how to handle them:

1. **Authentication Errors**: Check JWT token validity and refresh if needed
2. **Network Disconnection**: Implement reconnection logic with exponential backoff
3. **Room Access Errors**: Verify user has permission to access the room
4. **Message Send Failures**: Implement retry mechanism with temporary message storage

## Best Practices

1. **Implement optimistic updates** with `tempId` for better UX
2. **Handle reconnection** gracefully with proper state synchronization
3. **Debounce typing indicators** to avoid spam
4. **Cache messages locally** for offline support
5. **Implement proper error boundaries** for WebSocket failures
6. **Use heartbeat/ping** to detect connection issues
7. **Clean up event listeners** to prevent memory leaks

## CORS Configuration

The WebSocket server accepts connections from:

- `http://localhost:3000` (development frontend)
- `https://fe-aphrodite.vercel.app` (production frontend)
- Custom origin via `FRONTEND_URL` environment variable

## Rate Limiting

Consider implementing rate limiting on the client side to avoid overwhelming the server with too many events.
