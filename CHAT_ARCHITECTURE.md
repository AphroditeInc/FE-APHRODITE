# Chat System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────┐         ┌──────────────────────┐         │
│  │  MessagesPage.tsx │◄────────┤  useChatSocket Hook  │         │
│  │   (UI Component)  │         │  (WebSocket Manager) │         │
│  └─────────┬─────────┘         └──────────┬───────────┘         │
│            │                               │                     │
│            │ Uses                    Uses  │                     │
│            ▼                               ▼                     │
│  ┌─────────────────────────────────────────────────┐            │
│  │         RTK Query (chatApiSlice)                │            │
│  │         - useSendMessageMutation()              │            │
│  │         - useGetRoomMessagesQuery()             │            │
│  │         - useCreateRoomMutation()               │            │
│  │         - useGetUserRoomsQuery()                │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                   │
└───────────────────────┬───────────────┬───────────────────────────┘
                        │               │
                   REST │               │ WebSocket (Socket.io)
                        │               │
                        ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Backend API)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐      ┌─────────────────────────┐     │
│  │   REST API Routes    │      │  Socket.io Server       │     │
│  │  /chat/messages      │      │  /chat/socket.io        │     │
│  │  /chat/rooms         │      │                         │     │
│  │  /chat/conversations │      │  Events:                │     │
│  └──────────────────────┘      │  - joinRoom             │     │
│                                 │  - leaveRoom            │     │
│                                 │  - sendMessage          │     │
│                                 │  - typing               │     │
│                                 │  - markAsRead           │     │
│                                 │                         │     │
│                                 │  Emits:                 │     │
│                                 │  - newMessage           │     │
│                                 │  - messageDelivered     │     │
│                                 │  - userTyping           │     │
│                                 │  - messagesRead         │     │
│                                 └─────────────────────────┘     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Message Flow

### Sending a Message (WebSocket Connected)

```
User types message
       │
       ▼
MessagesPage.sendMessage()
       │
       ├── Check: WebSocket connected? ✓
       │
       ▼
useChatSocket.sendMessage()
       │
       │ emit('sendMessage', {
       │   receiverId, roomId,
       │   content, type, tempId
       │ })
       │
       ▼
Server receives 'sendMessage'
       │
       ├── Validate message
       ├── Save to database
       │
       ▼
Server emits 'messageDelivered'
       │
       ▼
Client receives 'messageDelivered'
       │
       ▼
MessagesPage updates UI
       │
       ▼
Server emits 'newMessage' to room
       │
       ▼
Other users receive message instantly
```

### Sending a Message (WebSocket Disconnected)

```
User types message
       │
       ▼
MessagesPage.sendMessage()
       │
       ├── Check: WebSocket connected? ✗
       │
       ▼
useSendMessageMutation()
       │
       │ POST /chat/messages
       │ Body: { receiverId, content, type }
       │
       ▼
Server receives REST request
       │
       ├── Validate message
       ├── Save to database
       ├── Return message object
       │
       ▼
Client receives response
       │
       ▼
MessagesPage updates UI
       │
       ▼
RTK Query refetches messages
```

### Receiving a Message (Real-time)

```
User A sends message
       │
       ▼
Server saves message
       │
       ├── Emit to room: 'newMessage'
       │
       ▼
User B's socket receives 'newMessage'
       │
       ▼
MessagesPage event listener triggered
       │
       ├── Is message for current room? ✓
       │
       ▼
refetchMessages()
       │
       ▼
UI updates with new message
       │
       └── No page refresh needed!
```

## Component Hierarchy

```
app/(protected)/chat/
       │
       ▼
components/dashboard/pages/MessagesPage.tsx
       │
       ├── Uses: useChatSocket()
       │    ├── Creates: Socket.io connection
       │    ├── Returns: { socket, connected, sendMessage, joinRoom, ... }
       │    └── Handles: Reconnection, authentication
       │
       ├── Uses: RTK Query Hooks
       │    ├── useGetUserRoomsQuery() - Get all chat rooms
       │    ├── useGetRoomMessagesQuery() - Get messages for selected room
       │    ├── useSendMessageMutation() - Send message (fallback)
       │    └── useCreateRoomMutation() - Create new chat room
       │
       ├── Renders: ConnectionDot
       │    └── Shows WebSocket connection status
       │
       └── Optional: ChatDebugPanel (dev only)
            └── Shows real-time events and debug info
```

## State Management

```
┌──────────────────────────────────────────────────┐
│              Component State (useState)           │
├──────────────────────────────────────────────────┤
│  selectedChat          - Currently active room    │
│  messageInput          - Text being typed         │
│  typingUsers           - Map of typing users      │
│  participantProfiles   - User profile cache       │
│  localError            - UI error messages        │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│            RTK Query Cache (Redux)                │
├──────────────────────────────────────────────────┤
│  rooms[]               - All user's chat rooms    │
│  messages[]            - Messages for each room   │
│  Tags: ['Chat', 'Room'] - For cache invalidation │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│           WebSocket State (useChatSocket)         │
├──────────────────────────────────────────────────┤
│  socket                - Socket.io instance       │
│  connected             - Connection status        │
│  Event listeners       - For real-time updates    │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│             Auth State (Redux)                    │
├──────────────────────────────────────────────────┤
│  accessToken           - JWT for authentication   │
│  user                  - Current user info        │
│  userId                - Current user ID          │
└──────────────────────────────────────────────────┘
```

## Connection Lifecycle

```
1. User logs in
   └── accessToken stored in Redux

2. MessagesPage mounts
   └── useChatSocket hook initializes

3. useChatSocket checks auth
   ├── Has accessToken? ✓
   └── Create Socket.io connection

4. Socket.io connection sequence
   ├── io(url, { auth: { token } })
   ├── Server validates token
   ├── Connection established
   ├── Emit 'connect' event
   └── Client sets connected = true

5. User selects a chat
   ├── setSelectedChat(roomId)
   └── Emit 'joinRoom' via WebSocket

6. User sends message
   ├── If connected: emit 'sendMessage'
   └── Else: POST /chat/messages

7. User receives message
   ├── Listen for 'newMessage' event
   ├── Check if for current room
   └── Update UI instantly

8. Connection lost
   ├── Auto-reconnect (exponential backoff)
   ├── Max 5 attempts
   ├── Falls back to REST API
   └── Shows yellow dot to user

9. Connection restored
   ├── 'connect' event fires
   ├── Rejoin rooms automatically
   ├── Resume WebSocket messaging
   └── Shows green dot to user

10. User logs out
    ├── Socket disconnects
    └── Clear all state
```

## Error Handling

```
┌─────────────────────────────────────────────────┐
│            Error Type                │ Handler  │
├──────────────────────────────────────┼─────────┤
│ Socket connection failed             │ Retry   │
│ Socket auth failed                   │ Logout  │
│ Message send failed (WebSocket)      │ Use API │
│ Message send failed (API)            │ Show UI │
│ Network disconnected                 │ Retry   │
│ Invalid room ID                      │ Show UI │
│ Invalid user ID                      │ Show UI │
└─────────────────────────────────────────────────┘
```

## Data Flow Summary

1. **Initialization**: 
   - Auth → Socket connection → Join rooms

2. **Real-time Updates**: 
   - WebSocket events → State updates → UI re-render

3. **Fallback Mode**: 
   - REST API → RTK Query cache → UI re-render

4. **Optimistic UI**: 
   - User action → Immediate UI update → Server confirmation

5. **Cache Management**: 
   - RTK Query invalidates tags → Auto-refetch → Fresh data
