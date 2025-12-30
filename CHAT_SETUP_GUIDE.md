# Chat System Setup Guide

## Overview
The chat system uses a **hybrid approach** combining:
1. **WebSocket (Socket.io)** for real-time messaging
2. **REST API** for message history and fallback

## Architecture

### 1. WebSocket Connection (Real-time)
- **URL**: `https://be-aphrodite-8wrp.onrender.com`
- **Namespace Path**: `/chat/socket.io`
- **Transport**: WebSocket with polling fallback
- **Authentication**: Bearer token in auth header

### 2. REST API Endpoints (Fallback & History)
- **Base URL**: `https://be-aphrodite-8wrp.onrender.com`
- **Endpoints**:
  - `POST /chat/messages` - Send message
  - `GET /chat/rooms` - Get user rooms
  - `GET /chat/rooms/:roomId/messages` - Get room messages
  - `POST /chat/rooms` - Create new room
  - `PUT /chat/messages/:messageId/status` - Update message status
  - `PUT /chat/rooms/:roomId/read` - Mark room as read

## How It Works

### Message Flow

#### Sending Messages:
1. **Primary (WebSocket)**: 
   - If WebSocket is connected → emit `sendMessage` event
   - Server responds with `messageDelivered` event
   - UI updates via WebSocket event listeners

2. **Fallback (REST API)**:
   - If WebSocket is not connected → POST to `/chat/messages`
   - Response contains the created message
   - UI refetches messages via RTK Query

#### Receiving Messages:
1. **WebSocket Events**:
   - `newMessage` - New message in any room
   - `roomMessage` - Message in a specific room
   - `messageDelivered` - Confirmation after sending
   - `userTyping` - Typing indicators
   - `messagesRead` - Read receipts
   - `userPresenceChanged` - Online/offline status

2. **REST API Polling**:
   - RTK Query automatically refetches based on invalidation tags
   - Manual refetch on user actions

### Room Management

#### Joining Rooms:
```typescript
// Emit when selecting a chat
socket.emit('joinRoom', { roomId: 'room_id_here' });
```

#### Leaving Rooms:
```typescript
// Emit when deselecting or navigating away
socket.emit('leaveRoom', { roomId: 'room_id_here' });
```

#### Creating Rooms:
```typescript
// Use REST API
POST /chat/rooms
{
  "type": "direct",
  "participants": ["userId1", "userId2"]
}
```

## Key Files

### 1. `lib/hooks/useChatSocket.ts`
- Manages WebSocket connection
- Provides functions: `sendMessage`, `joinRoom`, `leaveRoom`, `setTyping`, `markAsRead`
- Handles reconnection logic

### 2. `feature/chat/chatApiSlice.ts`
- RTK Query endpoints for REST API
- Provides: `useSendMessageMutation`, `useGetRoomMessagesQuery`, `useCreateRoomMutation`, etc.

### 3. `components/dashboard/pages/MessagesPage.tsx`
- Main chat UI component
- Combines WebSocket and REST API
- Handles message display and user interactions

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_USER_BASE_URL=https://be-aphrodite-8wrp.onrender.com
```

### Socket.io Options
```typescript
{
  path: '/chat/socket.io',          // Important: server socket.io path
  withCredentials: true,             // Send cookies
  auth: { token: accessToken },      // JWT authentication
  transports: ['websocket', 'polling'], // WebSocket first, polling fallback
  reconnection: true,                // Auto-reconnect
  reconnectionAttempts: 5,           // Max retries
  reconnectionDelay: 1000,           // Delay between retries
  timeout: 20000                     // Connection timeout
}
```

## Common Issues & Solutions

### 1. WebSocket Not Connecting
**Symptoms**: Messages only work via REST API, no real-time updates

**Check**:
- Console shows `[useChatSocket] Socket connected`?
- Network tab shows WebSocket connection?
- Auth token is valid?

**Solution**:
```typescript
// Verify the path matches your server's socket.io configuration
path: '/chat/socket.io'  // Must match server config
```

### 2. Messages Not Appearing in Real-time
**Symptoms**: Messages only show after page refresh

**Check**:
- Room joined via `joinRoom(roomId)`?
- WebSocket event listeners attached?
- Console shows `[MessagesPage] Received new message via WebSocket`?

**Solution**:
- Ensure `useEffect` in MessagesPage is joining rooms
- Check socket event listeners are set up correctly

### 3. CORS Issues
**Symptoms**: WebSocket connection fails with CORS error

**Solution**:
- Ensure `withCredentials: true` is set
- Server must allow credentials in CORS config
- Check server's allowed origins

### 4. Authentication Errors
**Symptoms**: Socket connects then immediately disconnects

**Check**:
- Access token is being sent in auth?
- Token is not expired?
- Server validates token correctly?

**Solution**:
```typescript
auth: {
  token: accessToken  // Must be valid JWT
}
```

## Testing the Chat

### 1. Test WebSocket Connection
Open browser console and check for:
```
[useChatSocket] Connecting to WebSocket: https://be-aphrodite-8wrp.onrender.com
[useChatSocket] Socket connected: <socket_id>
[useChatSocket] Server confirmed connection: {...}
```

### 2. Test Sending Messages
1. Select a chat
2. Type a message
3. Click send
4. Check console for:
```
[MessagesPage] Sending message via WebSocket
[MessagesPage] Message delivered via WebSocket: {...}
```

### 3. Test Receiving Messages
1. Have another user send you a message
2. Should appear immediately without refresh
3. Check console for:
```
[MessagesPage] Received new message via WebSocket: {...}
```

## Debugging

### Enable Detailed Logging
All WebSocket and chat operations are logged to console with prefixes:
- `[useChatSocket]` - WebSocket connection events
- `[MessagesPage]` - UI component events
- Server errors will show in Network tab

### Check WebSocket Connection
In browser DevTools:
1. Network tab
2. Filter by "WS" (WebSocket)
3. Look for connection to your server
4. Check Headers and Messages tabs

### Verify REST API
In browser DevTools:
1. Network tab
2. Filter by "Fetch/XHR"
3. Look for `/chat/` endpoints
4. Check request/response payloads

## Production Checklist

- [ ] WebSocket URL configured correctly
- [ ] REST API base URL configured correctly
- [ ] Socket.io path matches server configuration
- [ ] Authentication tokens are being sent
- [ ] CORS is configured on server
- [ ] SSL/TLS is enabled (wss://, not ws://)
- [ ] Error handling is in place
- [ ] Reconnection logic is working
- [ ] Message persistence is working (via REST API)
- [ ] Real-time updates are working (via WebSocket)

## Additional Resources

- Socket.io Client Documentation: https://socket.io/docs/v4/client-api/
- RTK Query Documentation: https://redux-toolkit.js.org/rtk-query/overview
- Chat API Documentation: [Your API docs here]
