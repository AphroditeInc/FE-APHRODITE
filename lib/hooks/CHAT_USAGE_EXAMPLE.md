# Chat Message API Usage

## Overview
The chat message functionality allows you to send messages to other users or rooms with support for attachments, metadata, replies, and temporary IDs for optimistic UI updates.

## Quick Start

### Using the `useChat` Hook

```tsx
import { useChat } from '@/lib/hooks';

function ChatComponent() {
  const { sendMessage, isSending, error } = useChat();

  const handleSend = async () => {
    const response = await sendMessage({
      receiverId: "507f1f77bcf86cd799439011",
      content: "Hello, how are you?",
      type: "text",
      metadata: {
        imageUrl: "https://example.com/image.jpg"
      },
      attachments: [
        "https://example.com/file1.pdf",
        "https://example.com/file2.jpg"
      ],
      replyTo: "507f1f77bcf86cd799439012", // Optional: ID of message being replied to
      tempId: "temp_1234567890" // Optional: For optimistic UI updates
    });

    if (response.success) {
      console.log("Message sent:", response.data);
    } else {
      console.error("Error:", response.error);
    }
  };

  return (
    <button onClick={handleSend} disabled={isSending}>
      {isSending ? "Sending..." : "Send Message"}
    </button>
  );
}
```

### Using the `useApi` Hook Directly

```tsx
import { useApi } from '@/lib/context/ApiContext';

function ChatComponent() {
  const { sendMessage, isLoading, error } = useApi();

  const handleSend = async () => {
    const response = await sendMessage({
      receiverId: "507f1f77bcf86cd799439011",
      content: "Hello, how are you?",
      type: "text",
    });
    // Handle response...
  };
}
```

## Message Payload Structure

```typescript
interface SendMessagePayload {
  receiverId?: string;        // ID of the user receiving the message
  content: string;            // Message content (required)
  type: "text" | "image" | "file" | "video" | "audio"; // Message type (required)
  metadata?: {                // Optional metadata object
    imageUrl?: string;        // For image messages
    [key: string]: unknown;    // Any additional metadata
  };
  attachments?: string[];     // Array of attachment URLs
  replyTo?: string;           // ID of message being replied to
  tempId?: string;            // Temporary ID for optimistic UI updates
}
```

## Example: Send Text Message

```tsx
const response = await sendMessage({
  receiverId: "507f1f77bcf86cd799439011",
  content: "Hello, how are you?",
  type: "text"
});
```

## Example: Send Message with Image

```tsx
const response = await sendMessage({
  receiverId: "507f1f77bcf86cd799439011",
  content: "Check out this image!",
  type: "image",
  metadata: {
    imageUrl: "https://example.com/image.jpg"
  }
});
```

## Example: Send Message with Attachments

```tsx
const response = await sendMessage({
  receiverId: "507f1f77bcf86cd799439011",
  content: "Here are the files you requested",
  type: "file",
  attachments: [
    "https://example.com/file1.pdf",
    "https://example.com/file2.jpg"
  ]
});
```

## Example: Reply to a Message

```tsx
const response = await sendMessage({
  receiverId: "507f1f77bcf86cd799439011",
  content: "This is a reply",
  type: "text",
  replyTo: "507f1f77bcf86cd799439012" // ID of the original message
});
```

## Example: Optimistic UI Update

```tsx
// Generate temporary ID for optimistic UI
const tempId = `temp_${Date.now()}`;

// Add message to UI immediately (optimistic update)
addMessageToUI({
  id: tempId,
  content: messageContent,
  status: "sending"
});

// Send the actual message
const response = await sendMessage({
  receiverId: "507f1f77bcf86cd799439011",
  content: messageContent,
  type: "text",
  tempId: tempId
});

// Update UI with actual message ID when response comes back
if (response.success) {
  replaceTempMessage(tempId, response.data);
} else {
  // Mark message as failed
  markMessageAsFailed(tempId);
}
```

## Response Structure

```typescript
interface ApiResponse<ChatMessage> {
  success: boolean;
  data?: ChatMessage;  // The sent message with server-generated ID
  error?: string;      // Error message if failed
}

interface ChatMessage {
  id: string;           // Server-generated message ID
  senderId: string;     // ID of the sender
  receiverId?: string;  // ID of the receiver
  roomId: string;       // ID of the chat room
  content: string;       // Message content
  type: MessageType;    // Message type
  status: MessageStatus; // Message status (sending, sent, delivered, read, failed)
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
  metadata?: Record<string, unknown>;
  attachments?: string[];
  readAt?: string;
  deliveredAt?: string;
  replyTo?: string;
  tempId?: string;
}
```

## Error Handling

```tsx
const { sendMessage, error } = useChat();

const handleSend = async () => {
  const response = await sendMessage({
    receiverId: "507f1f77bcf86cd799439011",
    content: "Hello",
    type: "text"
  });

  if (!response.success) {
    // Handle error
    console.error("Failed to send:", response.error);
    alert(`Error: ${response.error}`);
  }
};
```

## Complete Example Component

See `components/chat/MessageSender.tsx` for a complete working example with form handling, attachments, and error display.

