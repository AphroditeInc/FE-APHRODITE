"use client";

import {
  Search,
  Menu,
  Check,
  Inbox,
  ArrowLeft,
  Video,
  MoreVertical,
  Play,
  MapPin,
  Image,
  Mic,
  Send,
  CheckCheck,
  X,
  Briefcase,
  Wallet,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, useChatSocket } from "@/lib/hooks";
import { useChatContext } from "@/lib/contexts/ChatContext";
import {
  ConnectionStatus,
  AvatarWithStatus,
  UnreadBadge,
  TypingIndicator,
  MessageStatusIcon,
} from "@/components/chat";
import {
  useGetRoomMessagesQuery,
  useMarkRoomAsReadMutation,
  useSendMessageMutation,
  useCreateRoomMutation,
  useGetUserRoomsQuery,
  useGetProfileByUserIdQuery,
} from "@/app/api/apiSlice";
import { apiService } from "@/lib/services";
import type { ChatRoom, ChatMessage } from "@/lib/types";

// Type definitions for API responses
interface ConversationParticipant {
  _id?: string;
  id?: string;
  userId?: string;
  name?: string;
  firstName?: string;
  username?: string;
}

interface ConversationSender {
  _id: string;
  name?: string;
}

interface ConversationReceiver {
  _id: string;
  name?: string;
}

interface ConversationLastMessage {
  _id?: string;
  id?: string;
  senderId: string;
  receiverId?: string; // Made optional to match ChatMessage type
  roomId?: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
  attachments?: string[];
  readAt?: string;
  deliveredAt?: string;
  replyTo?: string;
}

interface ConversationResponse {
  roomId?: string;
  _id?: string;
  id?: string;
  type?: string;
  sender?: ConversationSender;
  receiver?: ConversationReceiver;
  participants?: (string | ConversationParticipant)[];
  createdAt?: string;
  updatedAt?: string;
  lastMessage?: ConversationLastMessage;
  unreadCount?: number;
}

interface MessagesResponse {
  messages?: ChatMessage[];
  data?: ChatMessage[];
  items?: ChatMessage[];
}

interface Participant {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  firstName?: string;
  username?: string;
  [key: string]: unknown;
}

interface Message {
  id: string;
  sender: "me" | "other";
  type: "text" | "audio" | "video" | "image" | "pricing";
  content: string;
  timestamp: string;
  duration?: string;
  videoThumbnail?: string;
  pricing?: {
    shortTime?: { incall: string; outcall: string };
    overnight?: { incall: string; outcall: string };
    weekend?: { incall: string; outcall: string };
  };
  pricingMetadata?: {
    type?: string;
    incall?: number;
    outcall?: number;
    currency?: string;
    amount?: string;
    allPlans?: Array<{
      type: string;
      incall?: number;
      outcall?: number;
      currency?: string;
    }>;
  };
}

export default function MessagesPage() {
  const {
    user,
    userId,
    isLoading: authLoading,
    isAuthenticated,
    tokens,
  } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fallback: Try to get user ID from localStorage if not in context
  const [fallbackUserId, setFallbackUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId && !user?.id && isAuthenticated) {
      // Try to get user from localStorage as fallback
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.id) {
            console.log("Found user ID in localStorage:", parsedUser.id);
            setFallbackUserId(parsedUser.id);
          }
        }
      } catch (err) {
        console.error("Error reading user from localStorage:", err);
      }
    }
  }, [userId, user?.id, isAuthenticated]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [modalContent, setModalContent] = useState<{
    type: "video" | "image";
    src: string;
    duration?: string;
  } | null>(null);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState("");
  const [participantAvatars, setParticipantAvatars] = useState<
    Map<string, string>
  >(new Map());
  const [preloadedProfileId, setPreloadedProfileId] = useState<string | null>(null);
  const hasProcessedQueryParams = useRef(false);
  const sendingPricingRef = useRef<Set<string>>(new Set());

  // RTK Query hooks
  const currentUserId = userId || user?.id || fallbackUserId;
  
  // Fetch user's profile pricing when dialog opens
  const {
    data: profileData,
    isLoading: loadingProfile,
  } = useGetProfileByUserIdQuery(
    currentUserId || "",
    { skip: !currentUserId || !showPricingDialog }
  );
  
  const userPricing = profileData?.success && profileData?.data?.pricing 
    ? profileData.data.pricing 
    : null;
  
  // Use ChatContext for real-time room data instead of REST API
  const {
    rooms: contextRooms,
    connected: chatConnected,
    reconnecting: chatReconnecting,
    loading: roomsLoading,
    isUserOnline,
    getUnreadCount,
    isUserTyping: isUserTypingInRoom,
    refreshRooms,
  } = useChatContext();

  // Rooms are now managed by ChatContext - no REST API calls needed!
  const rooms = contextRooms;
  const loadingRooms = roomsLoading;
  const roomsError = null; // Errors handled by ChatContext

  // Find selected chat data to get roomId
  const selectedChatData = rooms.find((room) => room.id === selectedChat);
  
  // Use roomId for API calls and WebSocket (not the MongoDB _id)
  const roomIdForApi = selectedChatData?.roomId || selectedChat;

  const {
    data: messagesData,
    isLoading: loadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useGetRoomMessagesQuery(
    { roomId: roomIdForApi || "", query: { limit: 50 } },
    { 
      skip: !roomIdForApi || !roomIdForApi.trim(),
      // Don't refetch if we already have data for this room
      refetchOnMountOrArgChange: true,
    }
  );

  const [markRoomAsReadMutation] = useMarkRoomAsReadMutation();
  const [sendMessageMutation, { isLoading: sending }] =
    useSendMessageMutation();
  const [createRoomMutation] = useCreateRoomMutation();

  // WebSocket hook for real-time chat
  const {
    socket,
    connected: socketConnected,
    sendMessage: sendSocketMessage,
    joinRoom: joinSocketRoom,
    leaveRoom: leaveSocketRoom,
    setTyping,
  } = useChatSocket();

  // Local state for real-time messages (merged with API messages)
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  
  // Track lastMessage updates per room (from WebSocket)
  const [roomLastMessages, setRoomLastMessages] = useState<Map<string, ChatMessage>>(new Map());
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Debug: Log sidebar state changes
  useEffect(() => {
    console.log("[MessagesPage] Sidebar state changed:", isSidebarOpen);
  }, [isSidebarOpen]);

  // Rooms are provided by ChatContext - no transformation needed!
  // Old REST API approach with useMemo has been removed

  const messages = useMemo(() => {
    console.log("[MessagesPage] Processing messagesData:", messagesData);
    console.log(
      "[MessagesPage] messagesData type:",
      typeof messagesData,

      "isArray:",
      Array.isArray(messagesData)
    );

    // transformResponse should already extract the array, so messagesData should be ChatMessage[]
    if (!messagesData) {
      console.log("[MessagesPage] No messagesData, returning empty array");
      return [];
    }

    // transformResponse should return ChatMessage[], so this should be an array
    let messagesArray: ChatMessage[] = [];

    if (Array.isArray(messagesData)) {
      console.log(
        "[MessagesPage] messagesData is array (expected), length:",
        messagesData.length
      );
      messagesArray = messagesData;
    } else {
      // Fallback: if transformResponse didn't work, try to extract manually
      console.warn(
        "[MessagesPage] messagesData is not an array (unexpected), trying to extract:",
        messagesData
      );
      const messagesResponse = messagesData as
        | MessagesResponse
        | {
            data?: ChatMessage[];
            items?: ChatMessage[];
            messages?: ChatMessage[];
          };

      if (Array.isArray(messagesResponse.messages)) {
        messagesArray = messagesResponse.messages;
      } else if (Array.isArray(messagesResponse.data)) {
        messagesArray = messagesResponse.data;
      } else if (Array.isArray(messagesResponse.items)) {
        messagesArray = messagesResponse.items;
      } else {
        console.error(
          "[MessagesPage] Could not extract messages array from:",
          messagesResponse
        );
        return [];
      }
    }

    console.log(
      "[MessagesPage] Final messagesArray length:",
      messagesArray.length
    );
    if (messagesArray.length > 0) {
      console.log("[MessagesPage] First message:", messagesArray[0]);
      console.log(
        "[MessagesPage] Last message:",
        messagesArray[messagesArray.length - 1]
      );
    }

    // Create a copy of the array before sorting (RTK Query returns frozen arrays)
    // Sort messages by createdAt (oldest first)
    const sorted = [...messagesArray].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });

    console.log("[MessagesPage] Sorted messages length:", sorted.length);
    
    // Merge with real-time messages for the selected chat
    if (selectedChat) {
      const roomRealtimeMessages = realtimeMessages.filter(
        (msg) => msg.roomId === selectedChat
      );
      
      // Merge and deduplicate by message ID
      const messageMap = new Map<string, ChatMessage>();
      
      // Add API messages first (from database)
      sorted.forEach((msg) => {
        messageMap.set(msg.id, msg);
      });
      
      // Add/update with real-time messages
      // The Map will automatically deduplicate by message.id
      // API messages are added first, so real-time messages will only be added if they don't exist
      // This prevents duplicates - if API has the message, it's already in the map
      roomRealtimeMessages.forEach((msg) => {
        // Only add if message doesn't exist in API messages (Map already has it from sorted.forEach above)
        // This prevents duplicates when API refetches after WebSocket delivers
        if (!messageMap.has(msg.id)) {
          messageMap.set(msg.id, msg);
        }
        // If message already exists in map (from API), don't add it again - this prevents duplicates
      });
      
      // Convert back to array and sort
      const merged = Array.from(messageMap.values()).sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
      
      messagesRef.current = merged;
      return merged;
    }
    
    messagesRef.current = sorted;
    return sorted;
  }, [messagesData, realtimeMessages, selectedChat]);

  // Log messages data for debugging (moved after messages definition to avoid hoisting issue)
  // Note: selectedChatData is defined later, so we'll add another useEffect after it
  useEffect(() => {
    if (selectedChat) {
      console.log("[MessagesPage] Selected chat:", selectedChat);
      console.log("[MessagesPage] Messages data:", messagesData);
      console.log(
        "[MessagesPage] Messages data type:",
        typeof messagesData,
        "isArray:",
        Array.isArray(messagesData)
      );
      console.log("[MessagesPage] Loading messages:", loadingMessages);
      console.log("[MessagesPage] Messages error:", messagesError);
      console.log(
        "[MessagesPage] Processed messages array length:",
        messages.length
      );
    } else {
      console.log("[MessagesPage] No chat selected");
    }
  }, [selectedChat, messagesData, loadingMessages, messagesError, messages]);

  // WebSocket event listeners for real-time messages
  useEffect(() => {
    if (!socket || !socketConnected) {
      console.log("[MessagesPage] Socket not connected, skipping event listeners");
      return;
    }

    console.log("[MessagesPage] Setting up WebSocket event listeners");

    const handleNewMessage = (data: { message: ChatMessage }) => {
      console.log("[MessagesPage] Received newMessage via WebSocket:", data.message);
      const newMessage = data.message;
      
      // Skip if this is a message we just sent (it will be handled by messageDelivered)
      const currentUserId = userId || user?.id || fallbackUserId;
      if (currentUserId && newMessage.senderId === currentUserId) {
        console.log("[MessagesPage] Skipping newMessage for our own message, will be handled by messageDelivered");
        return;
      }
      
      // Update lastMessage for this room
      if (newMessage.roomId) {
        setRoomLastMessages((prev) => {
          const updated = new Map(prev);
          updated.set(newMessage.roomId, newMessage);
          return updated;
        });
      }
      
      // Only add if it's for the currently selected chat (match old code pattern)
      if (selectedChat && newMessage.roomId === selectedChat) {
        setRealtimeMessages((prev) => {
          // Check if message already exists (avoid duplicates)
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (exists) {
            console.log("[MessagesPage] Message already exists, updating:", newMessage.id);
            return prev.map((msg) => (msg.id === newMessage.id ? newMessage : msg));
          }
          console.log("[MessagesPage] Adding new real-time message:", newMessage.id);
          return [...prev, newMessage];
        });
      }
    };

    const handleMessageDelivered = (data: { tempId?: string; message: ChatMessage }) => {
      console.log("[MessagesPage] Received messageDelivered via WebSocket:", data);
      const deliveredMessage = data.message;
      
      // Remove from sending set
      if (data.tempId) {
        sendingPricingRef.current.delete(data.tempId);
      }
      
      // Update lastMessage for this room
      if (deliveredMessage.roomId) {
        setRoomLastMessages((prev) => {
          const updated = new Map(prev);
          // Preserve metadata in lastMessage too
          const messageWithMetadata = {
            ...deliveredMessage,
            metadata: deliveredMessage.metadata || prev.get(deliveredMessage.roomId)?.metadata,
          };
          updated.set(deliveredMessage.roomId, messageWithMetadata);
          return updated;
        });
      }
      
      // Only add to realtimeMessages if it's for the selected chat
      // Check if message already exists in current API messages to prevent duplicates
      if (selectedChat && deliveredMessage.roomId === selectedChat) {
        // Check current API messages to see if this message already exists
        // If it does, don't add to realtimeMessages - it will be shown from API messages
        const existsInApi = messagesData && Array.isArray(messagesData) 
          ? messagesData.some((msg: ChatMessage) => msg.id === deliveredMessage.id)
          : false;
        
        if (existsInApi) {
          console.log("[MessagesPage] Message already exists in API messages, skipping realtimeMessages to prevent duplicate");
          return;
        }
        
        setRealtimeMessages((prev) => {
          // Check if message already exists in realtimeMessages to prevent duplicates
          const exists = prev.some((msg) => msg.id === deliveredMessage.id);
          if (exists) {
            // Update existing message, preserving metadata
            return prev.map((msg) => {
              if (msg.id === deliveredMessage.id) {
                return {
                  ...deliveredMessage,
                  metadata: deliveredMessage.metadata && Object.keys(deliveredMessage.metadata).length > 0
                    ? deliveredMessage.metadata
                    : msg.metadata,
                };
              }
              return msg;
            });
          }
          // Add new message - merge logic will deduplicate with API messages
          return [...prev, deliveredMessage];
        });
      }
    };

    const handleRoomMessage = (data: { message: ChatMessage }) => {
      console.log("[MessagesPage] Received roomMessage via WebSocket:", data.message);
      const roomMessage = data.message;
      
      // Skip if this is a message we just sent (it will be handled by messageDelivered)
      const currentUserId = userId || user?.id || fallbackUserId;
      if (currentUserId && roomMessage.senderId === currentUserId) {
        console.log("[MessagesPage] Skipping roomMessage for our own message, will be handled by messageDelivered");
        return;
      }
      
      // Room messages are handled the same as newMessage (for messages from others)
      handleNewMessage(data);
    };

    // Register event listeners
    socket.on("newMessage", handleNewMessage);
    socket.on("messageDelivered", handleMessageDelivered);
    socket.on("roomMessage", handleRoomMessage);

    console.log("[MessagesPage] WebSocket event listeners registered");

    // Cleanup
    return () => {
      console.log("[MessagesPage] Cleaning up WebSocket event listeners");
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDelivered", handleMessageDelivered);
      socket.off("roomMessage", handleRoomMessage);
    };
  }, [socket, socketConnected, selectedChat, refetchMessages, refreshRooms]);

  // Join/leave room via WebSocket when chat selection changes
  useEffect(() => {
    if (!socket || !socketConnected) {
      console.log("[MessagesPage] Socket not connected, cannot join room");
      return;
    }

    if (selectedChat) {
      // Find the room to get the roomId
      const room = rooms.find((r) => r.id === selectedChat);
      if (room && room.roomId) {
        console.log("[MessagesPage] Joining room via WebSocket:", room.roomId, "(room.id:", selectedChat, ")");
        joinSocketRoom(room.roomId);
      } else {
        console.error("[MessagesPage] Cannot join room: roomId not found for selected chat:", selectedChat);
      }
      
      // Clear real-time messages for other rooms when switching chats
      setRealtimeMessages((prev) => 
        prev.filter((msg) => msg.roomId === selectedChat)
      );
    }

    // Cleanup: leave room when component unmounts or chat changes
    return () => {
      if (selectedChat && socket && socketConnected) {
        const room = rooms.find((r) => r.id === selectedChat);
        if (room && room.roomId) {
          console.log("[MessagesPage] Leaving room via WebSocket:", room.roomId);
          leaveSocketRoom(room.roomId);
        }
      }
    };
  }, [selectedChat, socket, socketConnected, joinSocketRoom, leaveSocketRoom, rooms]);

  const loading = loadingRooms || loadingMessages;
  const messagesLoading = loadingMessages;
  // Errors are now handled by ChatContext - no need for apiError processing
  const apiError = null;

  // Local state for UI
  const [localError, setLocalError] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [invalidUserIds, setInvalidUserIds] = useState<Set<string>>(new Set());
  const [participantNames, setParticipantNames] = useState<Map<string, string>>(
    new Map()
  );

  // Combined error state
  const error: string | null = apiError || localError;
  const setError = setLocalError;

  // Validate MongoDB ObjectId format (24 hex characters)
  const isValidMongoObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Helper to safely extract participant ID (handles both strings and objects)
  // ChatContext rooms now have participants as string[] already, or as objects with populated userId
  const extractParticipantId = (
    participant: string | Participant | null | undefined
  ): string | null => {
    // Handle null/undefined
    if (participant === null || participant === undefined) {
      return null;
    }

    // Handle string directly - this is the normal case now with ChatContext
    if (typeof participant === "string") {
      // Validate it's not the object string representation
      if (participant === "[object Object]" || participant.trim() === "") {
        return null;
      }
      return participant;
    }

    // Handle objects
    if (participant && typeof participant === "object") {
      // First check if this is a RoomParticipant object with a userId field
      if ('userId' in participant && participant.userId) {
        const userIdValue = participant.userId;
        
        // If userId is an object (populated), get the _id from it
        if (typeof userIdValue === 'object' && userIdValue !== null) {
          const userIdObj = userIdValue as any;
          const id = userIdObj._id || userIdObj.id;
          if (id && typeof id === 'string') {
            return id;
          }
        }
        
        // If userId is a string, return it
        if (typeof userIdValue === 'string') {
          if (userIdValue === "[object Object]" || userIdValue.trim() === "") {
            return null;
          }
          return userIdValue;
        }
      }
      
      // Try to get id or _id property directly
      const id = participant.id || participant._id;

      if (id !== null && id !== undefined) {
        // If id is a string, validate and return
        if (typeof id === "string") {
          if (id === "[object Object]" || id.trim() === "") {
            return null;
          }
          return id;
        }
        // If id is a number, convert to string
        if (typeof id === "number" && !isNaN(id)) {
          return String(id);
        }
        // If id is another object, try to extract from it (nested)
        if (typeof id === "object" && id !== null) {
          const nestedObj = id as {
            id?: string | number;
            _id?: string | number;
          };
          const nestedId = nestedObj.id || nestedObj._id;
          if (
            nestedId &&
            typeof nestedId === "string" &&
            nestedId !== "[object Object]"
          ) {
            return nestedId;
          }
          if (nestedId && typeof nestedId === "number" && !isNaN(nestedId)) {
            return String(nestedId);
          }
        }
      }

      // If we can't extract a valid ID from the object, return null
      // DO NOT convert object to string as it becomes [object Object]
      return null;
    }

    // Handle numbers
    if (typeof participant === "number" && !isNaN(participant)) {
      return String(participant);
    }

    // Handle booleans
    if (typeof participant === "boolean") {
      return null; // Booleans don't make sense as IDs
    }

    // Last resort: try to convert to string, but validate it's not [object Object]
    // This should only happen for primitives
    try {
      // Only convert if it's not an object
      if (typeof participant !== "object") {
        const str = String(participant);
        if (str === "[object Object]" || str.trim() === "") {
          return null;
        }
        return str;
      }
      // If it's an object and we got here, we couldn't extract an ID
      return null;
    } catch {
      return null;
    }
  };

  // Create room function
  const createRoomWithUser = useCallback(
    async (targetUserId: string) => {
      if (!currentUserId) {
        console.error("Cannot create room: user not loaded");
        throw new Error("User not loaded. Please log in.");
      }

      // Validate MongoDB ObjectId format
      if (!isValidMongoObjectId(targetUserId)) {
        const errorMsg = `Invalid user ID format. The user ID "${targetUserId}" is not a valid MongoDB ObjectId. Please use a valid user ID (24-character hex string).`;
        console.error(errorMsg);
        setInvalidUserIds((prev) => new Set(prev).add(targetUserId));
        router.replace("/chat");
        throw new Error(errorMsg);
      }

      // Check if this ID was already marked as invalid
      if (invalidUserIds.has(targetUserId)) {
        console.log("Skipping invalid userId:", targetUserId);
        router.replace("/chat");
        return;
      }

      if (processingUserId === targetUserId) {
        console.log("Already processing this userId, skipping...");
        return;
      }

      setProcessingUserId(targetUserId);
      console.log(
        "[createRoomWithUser] Creating room with targetUserId:",
        targetUserId,
        "current user:",
        currentUserId
      );
      console.log(
        "[createRoomWithUser] Current user ID type:",
        typeof currentUserId,
        "value:",
        currentUserId
      );
      console.log(
        "[createRoomWithUser] Target user ID type:",
        typeof targetUserId,
        "value:",
        targetUserId
      );

      // Ensure both IDs are strings and valid
      if (!currentUserId || typeof currentUserId !== "string") {
        const errorMsg = "Current user ID is invalid. Please log in again.";
        console.error(
          "[createRoomWithUser]",
          errorMsg,
          "currentUserId:",
          currentUserId
        );
        setProcessingUserId(null);
        throw new Error(errorMsg);
      }

      if (!targetUserId || typeof targetUserId !== "string") {
        const errorMsg = "Target user ID is invalid.";
        console.error(
          "[createRoomWithUser]",
          errorMsg,
          "targetUserId:",
          targetUserId
        );
        setProcessingUserId(null);
        throw new Error(errorMsg);
      }

      // Ensure IDs are trimmed and not empty
      const cleanCurrentUserId = currentUserId.trim();
      const cleanTargetUserId = targetUserId.trim();

      if (!cleanCurrentUserId || !cleanTargetUserId) {
        const errorMsg = "User IDs cannot be empty.";
        console.error("[createRoomWithUser]", errorMsg);
        setProcessingUserId(null);
        throw new Error(errorMsg);
      }

      if (cleanCurrentUserId === cleanTargetUserId) {
        const errorMsg = "Cannot create a room with yourself.";
        console.error("[createRoomWithUser]", errorMsg);
        setProcessingUserId(null);
        throw new Error(errorMsg);
      }

      try {
        const participants = [cleanCurrentUserId, cleanTargetUserId];

        // Check if room already exists before trying to create
        console.log(
          "[createRoomWithUser] Checking for existing room with participants:",
          participants
        );
        const existingRoom = rooms.find((room) => {
          if (!room.participants || room.type !== "direct") return false;

          // Extract participant IDs - participants might be objects with userId field
          const participantIds = room.participants
            .map((p) => extractParticipantId(p))
            .filter((id): id is string => id !== null);

          const hasBothParticipants =
            participantIds.includes(cleanTargetUserId) &&
            participantIds.includes(cleanCurrentUserId);

          if (hasBothParticipants) {
            console.log(
              "[createRoomWithUser] Found existing room:",
              room.id || room.roomId,
              "participantIds:",
              participantIds
            );
          }

          return hasBothParticipants;
        });

        if (existingRoom) {
          const roomId =
            existingRoom.roomId ||
            existingRoom.id ||
            (existingRoom as { _id?: string })._id;
          console.log(
            "[createRoomWithUser] Room already exists, using existing room:",
            roomId
          );
          if (roomId) {
            setSelectedChat(roomId);
            router.replace("/chat");
            setProcessingUserId(null);
            return; // Exit early, no need to create
          }
        }

        console.log(
          "[createRoomWithUser] No existing room found, calling createRoomMutation with:",
          {
            type: "direct",
            participants: participants,
          }
        );

        let result;
        try {
          result = await createRoomMutation({
            type: "direct",
            participants: participants, // Use cleaned IDs
          }).unwrap();
        } catch (mutationError: any) {
          // Check if it's a duplicate key error
          const mutationErrorMsg =
            mutationError?.data?.message || mutationError?.message || "";
          if (
            mutationErrorMsg.includes("E11000") ||
            mutationErrorMsg.includes("duplicate key")
          ) {
            console.log(
              "[createRoomWithUser] Caught duplicate key error during mutation, refetching rooms..."
            );

            // Refetch to get the latest rooms including the existing one
            await refreshRooms();
            // refreshRooms updates the ChatContext, so just use the rooms from context
            const freshRooms = rooms;

            console.log(
              "[createRoomWithUser] Searching in",
              freshRooms.length,
              "rooms for existing room with participants:",
              [currentUserId, targetUserId]
            );

            // Find the existing room in fresh data
            const existingRoom = freshRooms.find((room) => {
              if (!room.participants || room.type !== "direct") return false;

              const participantIds = room.participants
                .map((p) => extractParticipantId(p))
                .filter((id): id is string => id !== null);

              const hasBothParticipants =
                participantIds.includes(targetUserId) &&
                participantIds.includes(currentUserId);
              console.log(
                "[createRoomWithUser] Checking room:",
                room.roomId || room.id,
                "participantIds:",
                participantIds,
                "hasBoth:",
                hasBothParticipants
              );
              return hasBothParticipants;
            });

            if (existingRoom) {
              const roomId =
                existingRoom.roomId ||
                existingRoom.id ||
                (existingRoom as { _id?: string })._id;
              console.log(
                "[createRoomWithUser] Found existing room after refetch:",
                roomId
              );
              if (roomId) {
                setSelectedChat(roomId);
                router.replace("/chat");
                setProcessingUserId(null);
                return;
              }
            }

            // If still not found after refetch, show error
            console.error(
              "[createRoomWithUser] Could not find existing room even after refetch"
            );
            setError("Unable to open chat. Please try again.");
            setProcessingUserId(null);
            return;
          }

          // If it's not a duplicate error, re-throw it
          throw mutationError;
        }

        console.log(
          "[createRoomWithUser] Room created successfully, raw result:",
          result
        );
        console.log(
          "[createRoomWithUser] Result type:",
          typeof result,
          "isArray:",
          Array.isArray(result)
        );

        if (!result) {
          console.error(
            "[createRoomWithUser] No result returned from createRoomMutation"
          );
          throw new Error("Room creation failed: No response from server");
        }

        // transformResponse should already extract the room data, so result should be ChatRoom
        // But handle both cases: direct ChatRoom or wrapped in { data: ChatRoom }
        let roomData:
          | ChatRoom
          | { roomId?: string; id?: string; _id?: string }
          | null = null;

        if (result && typeof result === "object") {
          const resultObj = result as unknown as Record<string, unknown>;

          // Check if result is already a ChatRoom (has roomId or id)
          if (
            "roomId" in resultObj ||
            "id" in resultObj ||
            "_id" in resultObj
          ) {
            roomData = resultObj as unknown as ChatRoom;
            console.log(
              "[createRoomWithUser] Result is ChatRoom object:",
              roomData
            );
          } else if (
            "data" in resultObj &&
            resultObj.data &&
            typeof resultObj.data === "object"
          ) {
            // Result is wrapped in { data: {...} }
            roomData = resultObj.data as unknown as ChatRoom;
            console.log(
              "[createRoomWithUser] Result has data property:",
              roomData
            );
          } else {
            console.warn(
              "[createRoomWithUser] Unexpected result structure:",
              result
            );
            roomData = resultObj as any;
          }
        }

        if (!roomData) {
          console.error(
            "[createRoomWithUser] Could not extract room data from result:",
            result
          );
          throw new Error("Room creation failed: Invalid response format");
        }

        // Extract roomId - API might return roomId, id, or _id
        const roomId =
          (roomData as ChatRoom).roomId ||
          (roomData as ChatRoom).id ||
          (roomData as any)._id ||
          (roomData as any).id;

        console.log(
          "[createRoomWithUser] Extracted roomId:",
          roomId,
          "from roomData:",
          roomData
        );

        if (!roomId || typeof roomId !== "string") {
          console.error(
            "[createRoomWithUser] No valid roomId found in response:",
            roomData
          );
          throw new Error("Room creation failed: No room ID in response");
        }

        console.log(
          "[createRoomWithUser] Setting selected chat to roomId:",
          roomId
        );
        setSelectedChat(roomId);
        router.replace("/chat");

        // Wait a bit then refetch rooms to get the new room
        setTimeout(() => {
          refreshRooms();
        }, 500);

        setProcessingUserId(null);
        console.log(
          "[createRoomWithUser] Room creation completed successfully"
        );
      } catch (err: unknown) {
        console.error("[createRoomWithUser] Error creating room:", err);
        console.error("[createRoomWithUser] Error type:", typeof err);
        console.error(
          "[createRoomWithUser] Error details:",
          JSON.stringify(err, null, 2)
        );

        const errorMsg =
          err &&
          typeof err === "object" &&
          "data" in err &&
          err.data &&
          typeof err.data === "object" &&
          "message" in err.data
            ? String(err.data.message)
            : err && typeof err === "object" && "message" in err
            ? String(err.message)
            : err &&
              typeof err === "object" &&
              "error" in err &&
              typeof err.error === "object" &&
              err.error &&
              "data" in err.error &&
              err.error.data &&
              typeof err.error.data === "object" &&
              "message" in err.error.data
            ? String(err.error.data.message)
            : "An error occurred while creating the chat room.";

        console.error(
          "[createRoomWithUser] Extracted error message:",
          errorMsg
        );

        // Check if error is about invalid MongoDB ObjectId
        if (
          errorMsg.toLowerCase().includes("mongodb") ||
          errorMsg.toLowerCase().includes("objectid") ||
          errorMsg.toLowerCase().includes("invalid")
        ) {
          setInvalidUserIds((prev) => new Set(prev).add(targetUserId));
          setError(errorMsg);
          router.replace("/chat");
        } else {
          setError(errorMsg);
        }

        setProcessingUserId(null);
        throw new Error(errorMsg);
      }
    },
    [
      currentUserId,
      processingUserId,
      invalidUserIds,
      router,
      createRoomMutation,
      refreshRooms,
      rooms,
    ]
  );

  // Rooms and participant data come from ChatContext - no separate fetching needed

  // Handle userId query parameter - find or create room with that user
  // Use a ref to track the last processed userId to prevent unnecessary runs
  const lastProcessedUserId = useRef<string | null>(null);
  
  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    const name = searchParams.get("name");
    const currentUserId = userId || user?.id || fallbackUserId;
    
    // If the userId hasn't changed, don't process again
    if (targetUserId && lastProcessedUserId.current === targetUserId && hasProcessedQueryParams.current) {
      return;
    }

    // Only process query params if there's a userId parameter and we haven't processed it yet
    // This prevents the effect from running on every room click
    if (!targetUserId) {
      // No query params, reset the flag so we can process new ones if they appear
      // But only reset if we're not currently processing (to avoid race conditions)
      if (!processingUserId) {
        hasProcessedQueryParams.current = false;
      }
      // Early return - don't do anything if no userId param
      return;
    }

    // If we've already processed this query param, don't process again
    if (hasProcessedQueryParams.current) {
      return;
    }

    // Only proceed if we actually have a targetUserId (not empty string)
    if (!targetUserId || targetUserId.trim() === '') {
      return;
    }

    console.log(
      "Query params check - targetUserId:",
      targetUserId,
      "name:",
      name,
      "loading:",
      loading,
      "rooms.length:",
      rooms.length,
      "currentUserId:",
      currentUserId,
      "authLoading:",
      authLoading,
      "processingUserId:",
      processingUserId
    );

    if (name) {
      setProfileName(name);
    }

    // Skip if this userId was already marked as invalid
    if (targetUserId && invalidUserIds.has(targetUserId)) {
      console.log("Skipping invalid userId:", targetUserId);
      // Only replace URL if there are actually query params to clear
      if (searchParams.toString()) {
        router.replace("/chat", { scroll: false });
      }
      hasProcessedQueryParams.current = true;
      lastProcessedUserId.current = targetUserId;
      return;
    }

    // Only process if we have userId, user is loaded, rooms are loaded, and not already processing
    if (
      targetUserId &&
      currentUserId &&
      !loading &&
      !authLoading &&
      !processingUserId
    ) {
      console.log("Processing userId:", targetUserId, "Current rooms:", rooms);

      // Validate MongoDB ObjectId format before processing
      if (!isValidMongoObjectId(targetUserId)) {
        console.error("Invalid MongoDB ObjectId format:", targetUserId);
        setInvalidUserIds((prev) => new Set(prev).add(targetUserId));
        setError(
          `Invalid user ID format. The user ID "${targetUserId}" is not a valid MongoDB ObjectId. Please use a valid user ID (24-character hex string).`
        );
        // Clear query params to prevent retries (only if there are query params)
        if (searchParams.toString()) {
          router.replace("/chat", { scroll: false });
        }
        hasProcessedQueryParams.current = true;
        lastProcessedUserId.current = targetUserId;
        return;
      }

      // Find existing direct message room with this user
      const existingRoom = rooms.find((room) => {
        if (!room.participants || room.type !== "direct") return false;

        // Extract participant IDs safely
        const participantIds = room.participants
          .map((p) => extractParticipantId(p))
          .filter((id): id is string => id !== null);
        const hasBothParticipants =
          participantIds.includes(targetUserId) &&
          participantIds.includes(currentUserId);
        console.log(
          "Checking room:",
          room.id,
          "type:",
          room.type,
          "participants:",
          room.participants,
          "participantIds:",
          participantIds,
          "hasBoth:",
          hasBothParticipants
        );
        return hasBothParticipants;
      });

      if (existingRoom) {
        console.log("Found existing room:", existingRoom.id);
        setSelectedChat(existingRoom.id);
        // Mark as processed before navigation to prevent re-running
        hasProcessedQueryParams.current = true;
        lastProcessedUserId.current = targetUserId;
        // Remove query parameter from URL (only if there are query params)
        if (searchParams.toString()) {
          router.replace("/chat", { scroll: false });
        }
      } else {
        console.log("No existing room found, creating new one...");
        // Mark as processed to prevent re-running during room creation
        hasProcessedQueryParams.current = true;
        lastProcessedUserId.current = targetUserId;
        // If no existing room, create one
        createRoomWithUser(targetUserId);
      }
    } else {
      console.log(
        "Skipping processing - targetUserId:",
        targetUserId,
        "currentUserId:",
        currentUserId,
        "loading:",
        loading,
        "authLoading:",
        authLoading,
        "processingUserId:",
        processingUserId
      );
    }
  }, [
    rooms,
    searchParams,
    userId,
    user?.id,
    fallbackUserId,
    router,
    loading,
    authLoading,
    invalidUserIds,
    processingUserId,
  ]);

  useEffect(() => {
    if (selectedChat) {
      console.log("Selected chat changed, marking room as read:", selectedChat);
      markRoomAsReadMutation(selectedChat).catch((err) => {
        console.error("Error marking room as read:", err);
      });
    }
  }, [selectedChat, markRoomAsReadMutation]);

  // Fetch participant names from /profiles/user/{userId} endpoint
  const fetchParticipantName = async (
    participantId: string | Participant
  ): Promise<string | null> => {
    const normalizedId = extractParticipantId(participantId);

    if (
      !normalizedId ||
      typeof normalizedId !== "string" ||
      normalizedId === "[object Object]"
    ) {
      return null;
    }

    if (participantNames.has(normalizedId)) {
      return participantNames.get(normalizedId) || null;
    }

    // Fetch from /profiles/user/{userId} endpoint
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "https://be-aphrodite-8wrp.onrender.com"
        }/profiles/user/${normalizedId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const profile = data.success ? data.data : data;

        if (profile) {
          // Check if name is in nested user object first
          const user = profile.user;
          const name =
            user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`.trim()
              : user?.firstName || user?.lastName
              ? user.firstName || user.lastName
              : user?.userName
              ? user.userName
              : profile.firstName && profile.lastName
              ? `${profile.firstName} ${profile.lastName}`.trim()
              : profile.firstName ||
                profile.lastName ||
                profile.username ||
                profile.userName ||
                profile.stageName ||
                null;

          // Extract avatar from media array (get first non-"string" entry)
          let avatar: string | null = null;
          if (
            profile.media &&
            Array.isArray(profile.media) &&
            profile.media.length > 0
          ) {
            const validMedia = profile.media.find(
              (url: string) => url !== "string" && url.startsWith("http")
            );
            if (validMedia) {
              avatar = validMedia;
            }
          }

          if (name) {
            setParticipantNames((prev) => {
              const newMap = new Map(prev);
              newMap.set(normalizedId, name);
              return newMap;
            });
          }

          if (avatar) {
            setParticipantAvatars((prev) => {
              const newMap = new Map(prev);
              newMap.set(normalizedId, avatar);
              return newMap;
            });
          }

          return name;
        }
      }
    } catch (err) {
      console.error("Error fetching participant profile:", err);
    }

    return null;
  };

  const sendMessage = async (
    e?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent
  ) => {
    // Prevent form submission and page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const currentUserId = userId || user?.id || fallbackUserId;
    if (!messageInput.trim() || !selectedChat || sending || !currentUserId)
      return;

    // Get the selected room to find the receiver ID
    const room = rooms.find((r) => r.id === selectedChat);
    if (!room) {
      console.error("Room not found for selectedChat:", selectedChat, "available rooms:", rooms.map(r => ({ id: r.id, roomId: r.roomId })));
      return;
    }
    
    // Ensure room has a valid roomId
    if (!room.roomId || typeof room.roomId !== 'string') {
      console.error("Room found but has invalid roomId:", room);
      return;
    }

    // For direct messages, find the other participant (not the current user)
    // For group messages, we might need to handle differently based on API requirements
    let receiverId: string | undefined;
    if (room.type === "direct" && room.participants) {
      const otherParticipant = room.participants.find((p) => {
        const pId = extractParticipantId(p);
        return pId && pId !== currentUserId;
      });
      receiverId = otherParticipant
        ? extractParticipantId(otherParticipant) || undefined
        : undefined;
    }

    // Validate receiverId is provided (required by API)
    if (!receiverId || receiverId.trim() === "") {
      console.error("Receiver ID not found for direct message");
      return;
    }

    const messageContent = messageInput.trim();
    const tempId = `temp_${Date.now()}`;
    
    // Ensure currentUserId is a string (not null)
    if (!currentUserId || typeof currentUserId !== "string") {
      console.error("[MessagesPage] Cannot send message: invalid currentUserId");
      return;
    }
    
    // Clear input immediately for better UX
    setMessageInput("");

    // Try WebSocket first if connected, otherwise fallback to REST API
    // Wait for WebSocket response instead of showing optimistic message
    if (socketConnected && socket) {
      try {
        console.log("[MessagesPage] Sending message via WebSocket, waiting for messageDelivered");
        sendSocketMessage({
          receiverId: receiverId,
          roomId: selectedChat,
          content: messageContent,
          type: "text",
          tempId: tempId,
        });
        
        // WebSocket will emit messageDelivered event, which will add the message to UI
        // Refetch rooms after a delay to update last message
        setTimeout(() => {
          refreshRooms();
        }, 1000);
      } catch (err) {
        console.error("[MessagesPage] Error sending via WebSocket, falling back to REST API:", err);
        // Fallback to REST API
        sendViaRestAPI();
      }
    } else {
      console.log("[MessagesPage] WebSocket not connected, using REST API");
      // Fallback to REST API
      sendViaRestAPI();
    }

    async function sendViaRestAPI() {
      // receiverId is already validated above, but TypeScript needs this check
      if (!receiverId) {
        console.error("[MessagesPage] Cannot send via REST API: receiverId is undefined");
      return;
    }

    try {
      const result = await sendMessageMutation({
          receiverId: receiverId,
          content: messageContent,
        type: "text",
          tempId: tempId,
      }).unwrap();

        if (result && receiverId && selectedChat && currentUserId) {
        // transformResponse already extracted the data, so result is the message object
          // Ensure senderId and receiverId are strings (not null)
          const sentMessage: ChatMessage = {
          ...result,
            senderId: (result.senderId && typeof result.senderId === "string") ? result.senderId : currentUserId,
            receiverId: (result.receiverId && typeof result.receiverId === "string") ? result.receiverId : receiverId,
            roomId: (result.roomId && typeof result.roomId === "string") ? result.roomId : selectedChat,
          };

          console.log("[MessagesPage] Message sent successfully via REST API:", sentMessage);
          
          // Add message to real-time messages (no optimistic message, just add the real one)
          setRealtimeMessages((prev) => {
            // Check if message already exists to prevent duplicates
            const exists = prev.some((msg) => msg.id === sentMessage.id);
            if (exists) {
              return prev;
            }
            return [...prev, sentMessage];
          });
          
          // Update room's lastMessage with the real message
          if (selectedChat) {
            setRoomLastMessages((prev) => {
              const updated = new Map(prev);
              updated.set(selectedChat, sentMessage);
              return updated;
            });
          }

        // RTK Query will automatically refetch messages and rooms due to invalidatesTags
        refreshRooms();
      }
    } catch (err: unknown) {
        console.error("[MessagesPage] Error sending message via REST API:", err);
        
      const errorMsg =
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data
          ? String(err.data.message)
          : err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Failed to send message";
        console.error("[MessagesPage] Failed to send message:", errorMsg);
        setError(errorMsg);
      }
    }
  };

  const handleBackClick = () => {
    setSelectedChat(null);
  };

  const handleMediaClick = (
    type: "video" | "image",
    src: string,
    duration?: string
  ) => {
    setModalContent({ type, src, duration });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const handleSharePricing = () => {
    setShowPricingDialog(true);
  };

  const closePricingDialog = () => {
    setShowPricingDialog(false);
    setSelectedPlan(null);
    setCustomPrice("");
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
  };

  const handleSendPricing = async () => {
    if (!selectedPlan || !selectedChat) return;
    
    const currentUserId = userId || user?.id || fallbackUserId;
    if (!currentUserId) return;
    
    // Prevent multiple rapid clicks or if already sending
    if (sending) {
      console.log("[handleSendPricing] Already sending, skipping");
      return;
    }
    
    // Check if we're already processing a pricing send
    const isProcessing = Array.from(sendingPricingRef.current).length > 0;
    if (isProcessing) {
      console.log("[handleSendPricing] Already processing a pricing send, skipping");
      return;
    }
    
    // Get the selected room to find the receiver ID
    const room = rooms.find((r) => r.id === selectedChat);
    if (!room) return;
    
    // Find the receiver ID
    let receiverId: string | undefined;
    if (room.type === "direct" && room.participants) {
      const otherParticipant = room.participants.find((p) => {
        const pId = extractParticipantId(p);
        return pId && pId !== currentUserId;
      });
      receiverId = otherParticipant
        ? extractParticipantId(otherParticipant) || undefined
        : undefined;
    }
    
    if (!receiverId) return;
    
    // Format the pricing message based on selected plan
    let pricingContent = "";
    let pricingData: any = null;
    
    if (selectedPlan === "custom-price" && customPrice) {
      // Send custom price as a single pricing card
      pricingContent = `💰 Custom Pricing: ${Number(customPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} APH`;
      pricingData = { 
        type: "custom", 
        amount: customPrice,
        currency: "APH"
      };
    } else if (userPricing && selectedPlan !== "custom-price") {
      // Get the selected plan's pricing
      const plan = selectedPlan as "shortTime" | "overnight" | "weekend";
      const pricing = userPricing[plan];
      
      if (pricing && (pricing.incall || pricing.outcall)) {
        const planName = plan === "shortTime" ? "Short Time" : plan === "overnight" ? "Overnight" : "Weekend";
        const incall = pricing.incall ? Number(pricing.incall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---";
        const outcall = pricing.outcall ? Number(pricing.outcall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---";
        const currency = pricing.currency || "APH";
        
        // Format content with pricing details so it can be parsed
        pricingContent = `💰 ${planName} Pricing\nIncall: ${incall} ${currency}\nOutcall: ${outcall} ${currency}`;
        
        pricingData = {
          type: plan,
          incall: pricing.incall,
          outcall: pricing.outcall,
          currency: currency
        };
      } else {
        // If selected plan has no pricing, send all available plans
        const plans: any[] = [];
        
        if (userPricing.shortTime && (userPricing.shortTime.incall || userPricing.shortTime.outcall)) {
          plans.push({
            type: "shortTime",
            incall: userPricing.shortTime.incall,
            outcall: userPricing.shortTime.outcall,
            currency: userPricing.shortTime.currency || "APH"
          });
        }
        
        if (userPricing.overnight && (userPricing.overnight.incall || userPricing.overnight.outcall)) {
          plans.push({
            type: "overnight",
            incall: userPricing.overnight.incall,
            outcall: userPricing.overnight.outcall,
            currency: userPricing.overnight.currency || "APH"
          });
        }
        
        if (userPricing.weekend && (userPricing.weekend.incall || userPricing.weekend.outcall)) {
          plans.push({
            type: "weekend",
            incall: userPricing.weekend.incall,
            outcall: userPricing.weekend.outcall,
            currency: userPricing.weekend.currency || "APH"
          });
        }
        
        if (plans.length > 0) {
          pricingContent = "💰 My Pricing Plans";
          pricingData = {
            allPlans: plans,
            type: plans[0].type,
            incall: plans[0].incall,
            outcall: plans[0].outcall,
            currency: plans[0].currency
          };
        }
      }
    }
    
    if (!pricingData) {
      console.error("No pricing data to send");
      return;
    }
    
    // Generate unique tempId with timestamp and random component to prevent duplicates
    const tempId = `temp_pricing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if we're already sending this exact message (prevent duplicate sends)
    if (sendingPricingRef.current.has(tempId)) {
      console.log("[handleSendPricing] Already sending this message, skipping duplicate");
      return;
    }
    
    // Add to sending set immediately to prevent duplicate sends
    sendingPricingRef.current.add(tempId);
    
    // Close dialog immediately for better UX
      closePricingDialog();
    setCustomPrice("");
    
    // Try WebSocket first if connected, otherwise fallback to REST API
    if (socketConnected && socket) {
      try {
        console.log("[handleSendPricing] Sending via WebSocket, waiting for messageDelivered");
        sendSocketMessage({
          receiverId: receiverId,
          roomId: selectedChat,
          content: pricingContent,
          type: "text",
          tempId: tempId,
          metadata: pricingData ? { pricing: pricingData } : undefined,
        });
        // WebSocket will emit messageDelivered event, which will add the message to UI
      } catch (err) {
        console.error("Error sending via WebSocket, falling back to REST API:", err);
        sendingPricingRef.current.delete(tempId);
        // Fallback to REST API
        sendViaRestAPI();
      }
    } else {
      console.log("[handleSendPricing] WebSocket not connected, using REST API");
      // Fallback to REST API
      sendViaRestAPI();
    }

    async function sendViaRestAPI() {
      try {
        const result = await sendMessageMutation({
          receiverId: receiverId!,
          content: pricingContent,
          type: "text",
          tempId: tempId,
          metadata: pricingData ? { pricing: pricingData } : undefined,
        }).unwrap();
        
        // Remove from sending set
        sendingPricingRef.current.delete(tempId);
        
        if (result && receiverId && selectedChat && currentUserId) {
          // Preserve metadata from the original message
          const sentMessage: ChatMessage = {
            ...result,
            senderId: (result.senderId && typeof result.senderId === "string") ? result.senderId : currentUserId,
            receiverId: (result.receiverId && typeof result.receiverId === "string") ? result.receiverId : receiverId,
            roomId: (result.roomId && typeof result.roomId === "string") ? result.roomId : selectedChat,
            // Preserve metadata - use result metadata if available, otherwise use original
            metadata: result.metadata && Object.keys(result.metadata).length > 0 
              ? result.metadata 
              : (pricingData ? { pricing: pricingData } : undefined),
          };
          
          // Add message to real-time messages (no optimistic message, just add the real one)
          setRealtimeMessages((prev) => {
            // Check if message already exists to prevent duplicates
            const exists = prev.some((msg) => msg.id === sentMessage.id);
            if (exists) {
              return prev;
            }
            return [...prev, sentMessage];
          });
          
          if (selectedChat) {
            setRoomLastMessages((prev) => {
              const updated = new Map(prev);
              updated.set(selectedChat, sentMessage);
              return updated;
            });
          }
          
          refreshRooms();
        }
      } catch (err) {
        console.error("Error sending pricing message via REST API:", err);
        sendingPricingRef.current.delete(tempId);
        const errorMsg =
          err &&
          typeof err === "object" &&
          "data" in err &&
          err.data &&
          typeof err.data === "object" &&
          "message" in err.data
            ? String(err.data.message)
            : err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Failed to send pricing message";
        setError(errorMsg);
      }
    }
  };

  const handleStartNewChat = async () => {
    const targetUserId = newChatUserId.trim();
    const currentUserId = userId || user?.id || fallbackUserId;

    console.log(
      "[handleStartNewChat] Called with userId:",
      targetUserId,
      "currentUserId:",
      currentUserId,
      "authLoading:",
      authLoading,
      "isAuthenticated:",
      isAuthenticated,
      "fallbackUserId:",
      fallbackUserId
    );

    if (!targetUserId) {
      console.error("[handleStartNewChat] No userId provided");
      setError("Please enter a user ID");
      return;
    }

    if (authLoading) {
      console.log("[handleStartNewChat] Auth still loading, waiting...");
      setError("Please wait for authentication to complete");
      return;
    }

    if (!isAuthenticated || !currentUserId) {
      console.error(
        "[handleStartNewChat] User not authenticated or not loaded"
      );
      setError("Please log in to start a chat");
      return;
    }

    if (processingUserId === targetUserId) {
      console.log("[handleStartNewChat] Already processing this userId");
      return;
    }

    // Check if room already exists before creating
    const existingRoom = rooms.find((room) => {
      if (!room.participants || room.type !== "direct") return false;

      const participantIds = room.participants
        .map((p) => extractParticipantId(p))
        .filter((id): id is string => id !== null);

      const hasBothParticipants =
        participantIds.includes(targetUserId) &&
        participantIds.includes(currentUserId);
      return hasBothParticipants;
    });

    if (existingRoom) {
      console.log("[handleStartNewChat] Room already exists:", existingRoom.id);
      setSelectedChat(existingRoom.id);
      setShowNewChatDialog(false);
      setNewChatUserId("");
      setError(null);
      return;
    }

    console.log(
      "[handleStartNewChat] Starting new chat with userId:",
      targetUserId,
      "current user:",
      currentUserId
    );
    setError(null); // Clear any previous errors
    setShowNewChatDialog(false); // Close dialog while processing

    // Use the existing createRoomWithUser function
    try {
      await createRoomWithUser(targetUserId);
      setNewChatUserId("");
      console.log("[handleStartNewChat] Chat started successfully");
    } catch (err) {
      console.error("[handleStartNewChat] Error starting chat:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to start chat. Please try again.";
      setError(errorMessage);
      setShowNewChatDialog(true); // Reopen dialog on error so user can see the error and try again
    }
  };

  // Get the other participant's user ID for profile navigation
  const getOtherParticipantId = useCallback((): string | null => {
    if (!selectedChatData || !currentUserId) {
      return null;
    }

    // For direct messages, find the other participant
    if (selectedChatData.type === "direct" && selectedChatData.participants) {
      const otherParticipant = selectedChatData.participants.find((p) => {
        const pId = extractParticipantId(p);
        return pId && pId !== currentUserId;
      });
      
      if (otherParticipant) {
        const otherParticipantId = extractParticipantId(otherParticipant);
        if (otherParticipantId && typeof otherParticipantId === "string") {
          return otherParticipantId;
        }
      }
    }

    return null;
  }, [selectedChatData, currentUserId]);

  const handleViewProfile = useCallback(() => {
    const otherParticipantUserId = getOtherParticipantId();
    if (!otherParticipantUserId) {
      console.error("[MessagesPage] Cannot view profile: other participant ID not found");
      return;
    }

    // If we have a preloaded profile ID, navigate immediately
    if (preloadedProfileId) {
      router.push(`/profile/${preloadedProfileId}`);
      return;
    }

    // Fallback: navigate with userId if profile ID not preloaded
    router.push(`/profile/${otherParticipantUserId}`);
  }, [getOtherParticipantId, router, preloadedProfileId]);

  // Preload profile ID when a room is selected
  useEffect(() => {
    const otherParticipantUserId = getOtherParticipantId();
    
    // Reset preloaded profile ID when room changes
    setPreloadedProfileId(null);
    
    // Only preload for direct messages
    if (!otherParticipantUserId || !selectedChatData || selectedChatData.type !== "direct") {
      return;
    }

    // Fetch profile in the background
    const preloadProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://be-aphrodite-8wrp.onrender.com"}/profiles/user/${otherParticipantUserId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const profileId = data?.data?.id || data?.id;
          
          if (profileId) {
            console.log("[MessagesPage] Preloaded profile ID:", profileId);
            setPreloadedProfileId(profileId);
          }
        }
      } catch (error) {
        console.error("[MessagesPage] Error preloading profile:", error);
        // Silently fail - we'll use userId as fallback
      }
    };

    preloadProfile();
  }, [selectedChat, getOtherParticipantId, selectedChatData]);

  // Log participant information for debugging (after selectedChatData is defined)
  useEffect(() => {
    if (selectedChat && selectedChatData) {
      const currentUserId = userId || user?.id || fallbackUserId;
      console.log("[MessagesPage] Selected room data:", selectedChatData);
      console.log(
        "[MessagesPage] Current user ID:",
        currentUserId,
        "type:",
        typeof currentUserId
      );
      console.log(
        "[MessagesPage] Room participants:",
        selectedChatData.participants
      );

      // Check if current user is in participants
      if (selectedChatData.participants) {
        const participantIds = selectedChatData.participants
          .map((p) => extractParticipantId(p))
          .filter((id): id is string => id !== null);
        const isParticipant =
          currentUserId && participantIds.includes(currentUserId);
        console.log(
          "[MessagesPage] Is current user a participant?",
          isParticipant,
          "participantIds:",
          participantIds,
          "currentUserId:",
          currentUserId
        );

        if (!isParticipant && currentUserId) {
          console.warn(
            "[MessagesPage] WARNING: Current user is NOT a participant in this room!"
          );
          console.warn(
            '[MessagesPage] This will cause "User is not a participant in this room" error when fetching messages.'
          );
        }
      }
    }
  }, [selectedChat, selectedChatData, userId, user?.id, fallbackUserId]);

  // Helper functions for data transformation
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === "group") {
      return room.name || "Group Chat";
    }

    // For direct messages, find the other participant's name
    const currentUserId = userId || user?.id || fallbackUserId;
    if (room.participants && room.participants.length === 2 && currentUserId) {
      // Find the other participant (not the current user)
      const otherParticipant = room.participants.find((p) => {
        const pId = extractParticipantId(p);
        return pId && pId !== currentUserId;
      });

      // Check if participant.userId is populated (will be an object with name, userName, etc.)
      if (otherParticipant && typeof otherParticipant === "object") {
        // Check if userId is populated with user data
        if (otherParticipant.userId && typeof otherParticipant.userId === "object") {
          const userData = otherParticipant.userId as any;
          const displayName = userData.name || userData.userName || userData.email;
          if (displayName) {
            console.log("[getRoomDisplayName] Using populated user data:", displayName);
            return displayName;
          }
        }
      }

      // Debug logging
      if (otherParticipant && typeof otherParticipant === "object") {
        console.log(
          "Found otherParticipant object:",
          otherParticipant,
          "keys:",
          Object.keys(otherParticipant)
        );
      }

      const otherParticipantId = otherParticipant
        ? extractParticipantId(otherParticipant)
        : null;

      // Debug logging
      if (
        otherParticipantId === "[object Object]" ||
        (otherParticipantId && typeof otherParticipantId !== "string")
      ) {
        console.error("Invalid otherParticipantId extracted:", {
          otherParticipant,
          otherParticipantId,
          type: typeof otherParticipantId,
          roomParticipants: room.participants,
        });
      }

      // Validate otherParticipantId is a valid string before using it
      if (
        otherParticipantId &&
        typeof otherParticipantId === "string" &&
        otherParticipantId !== "[object Object]" &&
        otherParticipantId.trim() !== ""
      ) {
        // Check if we have the name cached
        const cachedName = participantNames.get(otherParticipantId);
        if (cachedName) {
          return cachedName;
        }

        // If we have profileName from query params (for newly created rooms), use it
        if (profileName) {
          // Also cache it for future use
          setParticipantNames((prev) => {
            const newMap = new Map(prev);
            newMap.set(otherParticipantId, profileName);
            return newMap;
          });
          return profileName;
        }

        // Try to fetch the name if not cached (async, will update later)
        if (!participantNames.has(otherParticipantId)) {
          // Double-check before calling API
          const safeId = extractParticipantId(otherParticipantId);
          if (
            safeId &&
            typeof safeId === "string" &&
            safeId !== "[object Object]"
          ) {
            fetchParticipantName(safeId).catch((err) => {
              console.error("Error fetching participant name:", err);
            });
          }
        }

        // Fallback: Show last 8 characters of userId
        return `User ${otherParticipantId.slice(-8)}`;
      } else if (otherParticipantId) {
        // Log warning if we got an invalid ID
        console.warn(
          "Invalid otherParticipantId extracted:",
          otherParticipantId,
          "type:",
          typeof otherParticipantId,
          "from participant:",
          otherParticipant
        );
      }
    }

    return "Direct Message";
  };

  const getLastMessagePreview = (room: ChatRoom) => {
    // Always use lastMessage from the room data (from API)
    // Don't use messages array as it's only for the selected room
    const message = room.lastMessage;
    
    // Check if we have a valid message with content
    if (!message || typeof message !== "object" || !("content" in message)) {
      return "No messages yet";
    }
    
    // Check if content exists and is not empty
    if (!message.content || message.content.trim() === "") {
      return "No messages yet";
    }

    // Handle different message types
    if (message.type === "text") {
      return message.content.length > 50
        ? `${message.content.substring(0, 50)}...`
        : message.content;
    } else if (message.type === "image") {
      return "📷 Image";
    } else if (message.type === "file") {
      return "📎 File";
    } else if (message.type === "video") {
      return "🎥 Video";
    } else if (message.type === "audio") {
      return "🎵 Audio";
    }
    return "Message";
  };

  // Convert API ChatMessage to UI Message format
  const convertToUIMessage = (apiMessage: ChatMessage): Message => {
    const currentUserId = userId || user?.id || fallbackUserId;

    // Normalize IDs to strings for comparison - handle both ObjectId and string formats
    const normalizeId = (
      id: string | { _id?: string; id?: string } | null | undefined
    ): string => {
      if (!id) return "";
      // If it's already a string, return it trimmed
      if (typeof id === "string") return id.trim();
      // If it's an object with _id or id property, extract it
      if (typeof id === "object" && id !== null) {
        return String(id._id || id.id || "").trim();
      }
      // Otherwise convert to string
      return String(id).trim();
    };

    const senderIdStr = normalizeId(apiMessage.senderId);
    const currentUserIdStr = normalizeId(currentUserId);

    // Compare normalized IDs
    const isOwn =
      senderIdStr !== "" &&
      currentUserIdStr !== "" &&
      senderIdStr === currentUserIdStr;

    // Debug logging for message conversion
    console.log("convertToUIMessage:", {
      apiMessageSenderId: apiMessage.senderId,
      senderIdStr,
      currentUserId,
      currentUserIdStr,
      isOwn,
      messageContent: apiMessage.content?.substring(0, 20),
    });

    // Check if message has pricing metadata
    const pricingMetadata = apiMessage.metadata?.pricing as {
      type?: string;
      incall?: number;
      outcall?: number;
      currency?: string;
      amount?: string;
      allPlans?: Array<{
        type: string;
        incall?: number;
        outcall?: number;
        currency?: string;
      }>;
    } | undefined;
    
    // Also check if content suggests it's a pricing message (fallback detection)
    const content = apiMessage.content || "";
    const isPricingContent = 
      content.includes("💰") || 
      content.includes("My Pricing Plans") ||
      content.includes("Short Time Pricing") ||
      content.includes("Overnight Pricing") ||
      content.includes("Weekend Pricing") ||
      content.includes("Custom Pricing");
    
    // Determine message type - if it has pricing metadata OR pricing content pattern, it's a pricing message
    let messageType: "text" | "audio" | "video" | "image" | "pricing" = apiMessage.type as "text" | "audio" | "video" | "image" | "pricing";
    if (pricingMetadata || isPricingContent) {
      messageType = "pricing";
    }

    return {
      id: apiMessage.id,
      sender: isOwn ? "me" : "other",
      type: messageType,
      content: apiMessage.content,
      timestamp: formatTime(apiMessage.createdAt),
      duration: apiMessage.metadata?.duration as string | undefined,
      videoThumbnail:
        (apiMessage.metadata?.imageUrl as string) ||
        apiMessage.attachments?.[0],
      pricing: pricingMetadata ? {
        shortTime: pricingMetadata.type === "shortTime" ? {
          incall: pricingMetadata.incall?.toString() || "",
          outcall: pricingMetadata.outcall?.toString() || "",
        } : undefined,
        overnight: pricingMetadata.type === "overnight" ? {
          incall: pricingMetadata.incall?.toString() || "",
          outcall: pricingMetadata.outcall?.toString() || "",
        } : undefined,
        weekend: pricingMetadata.type === "weekend" ? {
          incall: pricingMetadata.incall?.toString() || "",
          outcall: pricingMetadata.outcall?.toString() || "",
        } : undefined,
      } : undefined,
      pricingMetadata: pricingMetadata || (isPricingContent ? {
        // If no metadata but content suggests pricing, create a basic metadata structure
        type: content.includes("Short Time") ? "shortTime" : 
              content.includes("Overnight") ? "overnight" :
              content.includes("Weekend") ? "weekend" : 
              content.includes("Custom") ? "custom" : "all",
        // Try to parse pricing from content if it's a single plan message
        ...(content.includes("Incall:") && content.includes("Outcall:") ? {
          incall: parseFloat(content.match(/Incall:\s*([\d,]+\.?\d*)/)?.[1]?.replace(/,/g, '') || '0'),
          outcall: parseFloat(content.match(/Outcall:\s*([\d,]+\.?\d*)/)?.[1]?.replace(/,/g, '') || '0'),
          currency: content.match(/(APH|USD|NGN)/)?.[1] || "APH",
        } : {}),
      } : undefined),
    };
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.sender === "me";

    // Check if message is a pricing message (by type or content)
    const isPricingMessage = message.type === "pricing" || 
      message.content?.includes("💰") ||
      message.content?.includes("My Pricing Plans") ||
      message.content?.includes("Short Time Pricing") ||
      message.content?.includes("Overnight Pricing") ||
      message.content?.includes("Weekend Pricing");

    // Check if message has pricing metadata
    if (isPricingMessage && message.pricingMetadata) {
      const pricing = message.pricingMetadata;
      const currency = pricing.currency || "APH";
      
      // If allPlans exists, render all pricing plans
      if (pricing.allPlans && pricing.allPlans.length > 0) {
      return (
        <div className="space-y-3">
            {pricing.allPlans.map((plan, index) => {
              const planName = plan.type === "shortTime" ? "Short Time" : plan.type === "overnight" ? "Overnight" : "Weekend";
              const incall = plan.incall ? Number(plan.incall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---";
              const outcall = plan.outcall ? Number(plan.outcall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---";
              const buttonText = plan.type === "shortTime" ? "Book short time" : plan.type === "overnight" ? "Book overnight" : "Book weekend";
              
              return (
                <div key={index} className="bg-gray-800 rounded-[20px] p-4 w-[317px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Incall</span>
                      <div className="flex items-center gap-1">
                        <Wallet className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-semibold text-[20px]">
                          {incall} {plan.currency || currency}
                </span>
                      </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Outcall</span>
                      <div className="flex items-center gap-1">
                        <Wallet className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-semibold text-[20px]">
                          {outcall} {plan.currency || currency}
                </span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-[#FA266D] text-white py-2 px-4 rounded-[30px] text-[20px] font-medium mt-4">
                    {buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        );
      }
      
      // Render based on pricing type (single plan or custom)
      if (pricing.type === "custom" && pricing.amount) {
        // Custom pricing
        return (
          <div className="bg-gray-800 rounded-[20px] p-4 w-[317px] flex flex-col">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Custom Price</span>
                <div className="flex items-center gap-1">
                  <Wallet className="h-5 w-5 text-yellow-400" />
                  <span className="text-white font-semibold text-[20px]">
                    {Number(pricing.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full bg-[#FA266D] text-white py-2 px-4 rounded-[30px] text-[20px] font-medium">
              Book now
            </button>
          </div>
        );
      } else if (pricing.type === "shortTime" || pricing.type === "overnight" || pricing.type === "weekend") {
        // Single pricing plan
        const planName = pricing.type === "shortTime" ? "Short Time" : pricing.type === "overnight" ? "Overnight" : "Weekend";
        const incall = pricing.incall ? Number(pricing.incall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---";
        const outcall = pricing.outcall ? Number(pricing.outcall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---";
        const buttonText = pricing.type === "shortTime" ? "Book short time" : pricing.type === "overnight" ? "Book overnight" : "Book weekend";
        
        return (
          <div className="bg-gray-800 rounded-[20px] p-4 w-[317px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Incall</span>
                <div className="flex items-center gap-1">
                  <Wallet className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-semibold text-[20px]">
                    {incall} {currency}
                </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Outcall</span>
                <div className="flex items-center gap-1">
                  <Wallet className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-semibold text-[20px]">
                    {outcall} {currency}
                </span>
              </div>
            </div>
            </div>
            <button className="w-full bg-[#FA266D] text-white py-2 px-4 rounded-[30px] text-[20px] font-medium mt-4">
              {buttonText}
            </button>
          </div>
        );
      }
    }
    
    // Fallback: if message type is pricing but no metadata, try to render from content or pricing object
    if (isPricingMessage && !message.pricingMetadata && message.pricing) {
      const cards = [];
      
      if (message.pricing.shortTime) {
        cards.push({
          name: "Short Time",
          buttonText: "Book short time",
          ...message.pricing.shortTime,
        });
      }
      
      if (message.pricing.overnight) {
        cards.push({
          name: "Overnight",
          buttonText: "Book overnight",
          ...message.pricing.overnight,
        });
      }
      
      if (message.pricing.weekend) {
        cards.push({
          name: "Weekend",
          buttonText: "Book weekend",
          ...message.pricing.weekend,
        });
      }
      
      return (
        <div className="space-y-3">
          {cards.map((card, index) => (
            <div key={index} className="bg-gray-800 rounded-[20px] p-4 w-[317px] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white text-[20px]">Incall</span>
                  <div className="flex items-center gap-1">
                    <Wallet className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-semibold text-[20px]">
                      {Number(card.incall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} APH
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white text-[20px]">Outcall</span>
                  <div className="flex items-center gap-1">
                    <Wallet className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-semibold text-[20px]">
                      {Number(card.outcall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} APH
                    </span>
                  </div>
                </div>
              </div>
              <button className="w-full bg-[#FA266D] text-white py-2 px-4 rounded-[30px] text-[20px] font-medium mt-4">
                {card.buttonText}
              </button>
            </div>
          ))}
        </div>
      );
    }

    if (message.type === "audio") {
      return (
        <div
          className={`flex items-center gap-3 rounded-lg p-3 max-w-xs ${
            isOwnMessage ? "bg-[#FA266D]" : "bg-white"
          }`}
        >
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isOwnMessage ? "bg-white/20" : "bg-gray-200"
            }`}
          >
            <Play
              className={`h-4 w-4 ${
                isOwnMessage ? "text-white" : "text-gray-600"
              }`}
            />
          </button>
          <div className="flex-1">
            <div
              className={`w-32 h-2 rounded-full ${
                isOwnMessage ? "bg-white/30" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`flex justify-between text-xs mt-1 ${
                isOwnMessage ? "text-white/80" : "text-gray-500"
              }`}
            >
              <span>{message.duration}</span>
              <span>01:25</span>
            </div>
          </div>
          {isOwnMessage && (
            <div className="flex items-center gap-1">
              <CheckCheck className="h-3 w-3 text-white" />
              <span className="text-xs text-white/80">Sent</span>
            </div>
          )}
        </div>
      );
    }

    if (message.type === "video") {
      return (
        <div
          className={`rounded-lg p-2 max-w-xs ${
            isOwnMessage ? "bg-[#FA266D]/10" : "bg-white"
          }`}
        >
          <div
            className="relative cursor-pointer"
            onClick={() =>
              handleMediaClick(
                "video",
                message.videoThumbnail || "",
                message.duration
              )
            }
          >
            <div className="w-48 h-32 bg-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-400 transition-colors">
              <Play className="h-8 w-8 text-gray-600" />
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {message.duration}
            </div>
          </div>
          <div
            className={`flex items-center justify-between mt-2 ${
              isOwnMessage ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`text-xs ${
                isOwnMessage ? "text-white/80" : "text-gray-500"
              }`}
            >
              {message.timestamp}
            </span>
            {isOwnMessage && <CheckCheck className="h-3 w-3 text-white" />}
          </div>
        </div>
      );
    }

    if (message.type === "image") {
      return (
        <div
          className={`rounded-lg p-2 max-w-xs ${
            isOwnMessage ? "bg-[#FA266D]/10" : "bg-white"
          }`}
        >
          <div
            className="relative cursor-pointer"
            onClick={() =>
              handleMediaClick("image", message.videoThumbnail || "")
            }
          >
            <img
              src={message.videoThumbnail || "/api/placeholder/200/150"}
              alt="Message image"
              className="w-48 h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
            />
          </div>
          <div
            className={`flex items-center justify-between mt-2 ${
              isOwnMessage ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`text-xs ${
                isOwnMessage ? "text-white/80" : "text-gray-500"
              }`}
            >
              {message.timestamp}
            </span>
            {isOwnMessage && <CheckCheck className="h-3 w-3 text-white" />}
          </div>
        </div>
      );
    }

    // Final check: if message content suggests pricing, parse and render as card
    if (isPricingMessage) {
      const content = message.content || "";
      
      // Try to parse pricing from content like "Short Time Pricing Incall: 50,000.00 APH Outcall: 80,000.00 APH"
      const incallMatch = content.match(/Incall:\s*([\d,]+\.?\d*)/i);
      const outcallMatch = content.match(/Outcall:\s*([\d,]+\.?\d*)/i);
      const currencyMatch = content.match(/(APH|USD|NGN)/i);
      
      if (incallMatch || outcallMatch) {
        const incall = incallMatch ? parseFloat(incallMatch[1].replace(/,/g, '')) : null;
        const outcall = outcallMatch ? parseFloat(outcallMatch[1].replace(/,/g, '')) : null;
        const currency = currencyMatch ? currencyMatch[1] : "APH";
        const planType = content.includes("Short Time") ? "shortTime" : 
                        content.includes("Overnight") ? "overnight" :
                        content.includes("Weekend") ? "weekend" : "custom";
        const buttonText = planType === "shortTime" ? "Book short time" : 
                          planType === "overnight" ? "Book overnight" : 
                          planType === "weekend" ? "Book weekend" : "Book now";
        
        return (
          <div className="bg-gray-800 rounded-[20px] p-4 w-[317px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Incall</span>
                <div className="flex items-center gap-1">
                  <Wallet className="h-5 w-5 text-yellow-400" />
                  <span className="text-white font-semibold text-[20px]">
                    {incall ? Number(incall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---"} {currency}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Outcall</span>
                <div className="flex items-center gap-1">
                  <Wallet className="h-5 w-5 text-yellow-400" />
                  <span className="text-white font-semibold text-[20px]">
                    {outcall ? Number(outcall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---"} {currency}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full bg-[#FA266D] text-white py-2 px-4 rounded-[30px] text-[20px] font-medium mt-4">
              {buttonText}
            </button>
          </div>
        );
      }
      
      // If it's "My Pricing Plans" but no parseable data, show a placeholder card
      if (content.includes("My Pricing Plans") || content.includes("💰")) {
        return (
          <div className="bg-gray-800 rounded-[20px] p-4 w-[317px] flex flex-col items-center justify-center min-h-[180px]">
            <Wallet className="h-12 w-12 text-yellow-400 mb-2" />
            <span className="text-white text-[18px] font-semibold">Pricing Plans</span>
            <span className="text-white/60 text-sm mt-1">Available pricing information</span>
          </div>
        );
      }
    }

    return (
      <div
        className={`rounded-lg p-3 max-w-xs ${
          isOwnMessage ? "bg-[#FA266D] text-white" : "bg-white text-black"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <div
          className={`flex items-center justify-end gap-1 mt-1 ${
            isOwnMessage ? "text-white/80" : "text-gray-500"
          }`}
        >
          <span className="text-xs">{message.timestamp}</span>
          {isOwnMessage && <CheckCheck className="h-3 w-3 text-white" />}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-[#1F1B2C] overflow-hidden">
      {/* Left Sidebar - Chat List */}
      {isSidebarOpen && (
      <div className="w-[360px] bg-[#1F1B2C] border-r border-white/10 flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white text-xl font-semibold">Messages</h1>
            <div className="flex items-center gap-3">
              {/* WebSocket Connection Status */}
              <ConnectionStatus />
              {/* <button
                onClick={() => setShowNewChatDialog(true)}
                className="bg-[#FA266D] hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                New Chat
              </button> */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("[MessagesPage] Hamburger menu clicked, closing sidebar");
                  setIsSidebarOpen(false);
                }}
                className="text-[#FA266D] hover:text-pink-400 transition-colors cursor-pointer p-1 z-10 relative"
                aria-label="Close sidebar"
                type="button"
                style={{ pointerEvents: 'auto' }}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center bg-white/10 rounded-lg px-4 py-2">
              <Search className="h-4 w-4 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search for chats"
                className="bg-transparent text-white placeholder-gray-400 focus:outline-none flex-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Chat List - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {error ? (
            <div className="p-4 text-center">
              <p className="text-red-400 mb-2">{error}</p>
              <button
                onClick={() => refreshRooms()}
                className="px-4 py-2 bg-[#FA266D] text-white rounded-lg hover:bg-pink-600"
              >
                Retry
              </button>
            </div>
          ) : !Array.isArray(rooms) || rooms.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>No conversations yet</p>
              <p className="text-sm">
                Start a new conversation to begin chatting
              </p>
            </div>
          ) : (
            rooms
              .filter((room) => room.id)
              .map((room) => (
                <div
                  key={room.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (room.id) {
                        setSelectedChat(room.id);
                      }
                    }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(
                      "Chat clicked, room ID:",
                      room.id,
                      "full room:",
                      room
                    );
                    if (room.id) {
                      setSelectedChat(room.id);
                    } else {
                      console.error("Room has no ID:", room);
                    }
                  }}
                  className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                    selectedChat === room.id ? "bg-white/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center relative overflow-hidden">
                      {(() => {
                        const otherParticipant = room.participants.find((p) => {
                          const pId = extractParticipantId(p);
                          return pId && pId !== currentUserId;
                        });
                        const otherParticipantId = otherParticipant
                          ? extractParticipantId(otherParticipant)
                          : null;
                        const avatar =
                          otherParticipantId &&
                          typeof otherParticipantId === "string"
                            ? participantAvatars.get(otherParticipantId)
                            : null;

                        if (avatar) {
                          return (
                            <img
                              src={avatar}
                              alt={getRoomDisplayName(room)}
                              className="w-full h-full object-cover"
                            />
                          );
                        }

                        return (
                          <span className="text-gray-600 font-semibold text-sm">
                            {getRoomDisplayName(room).charAt(0).toUpperCase()}
                          </span>
                        );
                      })()}
                      {/* Online status could be added here if available */}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-medium text-sm truncate">
                          {getRoomDisplayName(room)}
                        </h3>
                        <div className="flex items-center gap-2">
                          {room.lastMessage && (
                            <span className="text-gray-400 text-xs">
                              {formatTime(room.lastMessage.createdAt)}
                            </span>
                          )}
                          <Check className="h-3 w-3 text-[#FA266D]" />
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs truncate">
                        {getLastMessagePreview(room)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      )}

      {/* Right Section - Chat Area */}
      <div className="flex-1 bg-[#1F1B2C] flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#1F1B2C] border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-white hover:text-gray-300"
                    aria-label="Open sidebar"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={handleBackClick}
                  className="text-white hover:text-gray-300"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center relative">
                  <span className="text-gray-600 font-semibold text-sm">
                    {selectedChatData
                      ? getRoomDisplayName(selectedChatData)
                          .charAt(0)
                          .toUpperCase()
                      : "?"}
                  </span>
                  {/* Online status could be added here if available */}
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {selectedChatData
                      ? getRoomDisplayName(selectedChatData)
                      : "Unknown"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {selectedChatData?.type === "group"
                      ? "Group Chat"
                      : "Direct Message"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-white hover:text-gray-300">
                  <Video className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleViewProfile}
                  disabled={!getOtherParticipantId()}
                  className="bg-[#FA266D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E91E63] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  View Profile
                </button>
                <button className="text-white hover:text-gray-300">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA266D]"></div>
                </div>
              ) : messagesError ? (
                <div className="flex items-center justify-center h-64 text-red-400">
                  <div className="text-center max-w-md">
                    <p className="text-lg mb-2 font-semibold">
                      Error loading messages
                    </p>
                    <p className="text-sm mb-4">
                      {"data" in messagesError &&
                      messagesError.data &&
                      typeof messagesError.data === "object" &&
                      "message" in messagesError.data
                        ? String(messagesError.data.message)
                        : "message" in messagesError
                        ? String(messagesError.message)
                        : "Failed to load messages"}
                    </p>
                    {messagesError &&
                      typeof messagesError === "object" &&
                      "message" in messagesError &&
                      String(messagesError.message).includes(
                        "not a participant"
                      ) && (
                        <p className="text-xs text-yellow-400 mb-4">
                          This might happen if the room was created with a
                          different account. Try creating a new chat.
                        </p>
                      )}
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          console.log(
                            "[MessagesPage] Retrying messages fetch for room:",
                            selectedChat
                          );
                          refetchMessages();
                        }}
                        className="px-4 py-2 bg-[#FA266D] text-white rounded-lg hover:bg-pink-600"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() => {
                          console.log(
                            "[MessagesPage] Clearing selected chat due to error"
                          );
                          setSelectedChat(null);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              ) : !Array.isArray(messages) || messages.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <p className="text-lg mb-2">No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((apiMessage, index) => {
                  const message = convertToUIMessage(apiMessage);
                  const isOwnMessage = message.sender === "me";

                  // Use a unique key: prefer message.id, fallback to index + timestamp
                  const uniqueKey =
                    apiMessage.id ||
                    message.id ||
                    `msg-${index}-${apiMessage.createdAt || Date.now()}`;

                  // Debug: Log message alignment
                  console.log("Rendering message:", {
                    id: message.id,
                    apiMessageId: apiMessage.id,
                    uniqueKey,
                    sender: message.sender,
                    isOwnMessage,
                    content: message.content?.substring(0, 20),
                    alignment: isOwnMessage ? "right" : "left",
                  });

                  return (
                    <div
                      key={uniqueKey}
                      className={`flex w-full mb-3 ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          isOwnMessage ? "ml-auto" : "mr-auto"
                        }`}
                      >
                        {renderMessage(message)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="bg-[#1F1B2C]  p-4">
              <div className="space-y-3">
                {/* Input Field */}

                <input
                  type="text"
                  placeholder="Write message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      sendMessage(e);
                    }
                  }}
                  className="bg-transparent text-white placeholder-gray-400 focus:outline-none flex-1 text-base rounded-[32px] border border-white/10 py-[18px] pl-[24px] w-full"
                  disabled={sending}
                />

                {/* Bottom Row */}
                <div className="flex items-center justify-end gap-3">
                  {/* Action Buttons */}
                  <button
                    onClick={handleSharePricing}
                    className="text-[#FA266D] hover:text-pink-400 flex items-center gap-2 text-sm"
                  >
                    <MapPin className="h-4 w-4" />
                    Share Pricing Plan
                  </button>
                  <button className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Image className="h-5 w-5 text-white" />
                  </button>
                  <button className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Mic className="h-5 w-5 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      sendMessage(e);
                    }}
                    disabled={!messageInput.trim() || sending}
                    className="bg-[#FA266D] text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-pink-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">Send</span>
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center relative">
            {!isSidebarOpen && (
              <div className="absolute top-4 left-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="text-white hover:text-gray-300"
                  aria-label="Open sidebar"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            )}
            <div className="text-center">
              {/* Inbox Icon with Glow Effect */}
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto relative">
                  {/* Glow circles */}
                  <div className="absolute inset-0 rounded-full bg-[#FA266D]/20 animate-pulse"></div>
                  <div
                    className="absolute inset-2 rounded-full bg-[#FA266D]/30 animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="absolute inset-4 rounded-full bg-[#FA266D]/40 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>

                  {/* Inbox Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Inbox className="h-12 w-12 text-[#FA266D]" />
                  </div>
                </div>
              </div>

              <h2 className="text-white text-xl font-semibold mb-2">
                Continue chatting
              </h2>
              <p className="text-gray-400 text-sm">
                Click on any chats to continue chatting with them.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Media Modal */}
      {modalContent && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {modalContent.type === "video" ? (
              <div className="relative">
                <video
                  src={modalContent.src}
                  controls
                  className="w-full h-auto max-h-[80vh]"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
                {modalContent.duration && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded">
                    {modalContent.duration}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={modalContent.src}
                  alt="Full size image"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing Plan Dialog */}
      {showPricingDialog && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={closePricingDialog}
        >
          <div
            className="relative max-w-[706px] w-full mx-4 bg-black/90 rounded-[24px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePricingDialog}
              className="absolute top-4 right-4 z-10 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="p-8 text-center">
              <h2 className="text-white text-[40px] font-bold mb-2">
                Select Plan
              </h2>
              <p className="text-[16px] font-medium mb-8">
                Select the plan you will like to share with the client below.
              </p>

              {/* 2x2 + 1 Grid Layout */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Plan 1 - Short Time */}
                <div
                  onClick={() => handlePlanSelect("shortTime")}
                  className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                    selectedPlan === "shortTime"
                      ? "border-[#FA266D] bg-[#FA266D]/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-white text-[20px]">
                      Incall
                    </p>
                    <p className="text-[16px] font-medium text-white">
                      {userPricing?.shortTime?.incall 
                        ? `${Number(userPricing.shortTime.incall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${userPricing.shortTime.currency || 'APH'}`
                        : "---"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white text-[20px]">
                      Outcall
                    </p>
                    <p className="text-[16px] font-medium text-white">
                      {userPricing?.shortTime?.outcall 
                        ? `${Number(userPricing.shortTime.outcall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${userPricing.shortTime.currency || 'APH'}`
                        : "---"}
                    </p>
                  </div>

                  <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                    <span className="text-[24px] font-bold">Short Time</span>
                  </button>
                </div>

                {/* Plan 2 - Overnight */}
                <div
                  onClick={() => handlePlanSelect("overnight")}
                  className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                    selectedPlan === "overnight"
                      ? "border-[#FA266D] bg-[#FA266D]/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-white text-[20px]">
                      Incall
                    </p>
                    <p className="text-[16px] font-medium text-white">
                      {userPricing?.overnight?.incall 
                        ? `${Number(userPricing.overnight.incall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${userPricing.overnight.currency || 'APH'}`
                        : "---"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white text-[20px]">
                      Outcall
                    </p>
                    <p className="text-[16px] font-medium text-white">
                      {userPricing?.overnight?.outcall 
                        ? `${Number(userPricing.overnight.outcall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${userPricing.overnight.currency || 'APH'}`
                        : "---"}
                    </p>
                  </div>

                  <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                    <span className="text-[24px] font-bold">Overnight</span>
                  </button>
                </div>

                {/* Plan 3 - Weekend */}
                <div
                  onClick={() => handlePlanSelect("weekend")}
                  className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                    selectedPlan === "weekend"
                      ? "border-[#FA266D] bg-[#FA266D]/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-white text-[20px]">
                      Incall
                    </p>
                    <p className="text-[16px] font-medium text-white">
                      {userPricing?.weekend?.incall 
                        ? `${Number(userPricing.weekend.incall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${userPricing.weekend.currency || 'APH'}`
                        : "---"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white text-[20px]">
                      Outcall
                    </p>
                    <p className="text-[16px] font-medium text-white">
                      {userPricing?.weekend?.outcall 
                        ? `${Number(userPricing.weekend.outcall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${userPricing.weekend.currency || 'APH'}`
                        : "---"}
                    </p>
                  </div>

                  <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                    <span className="text-[24px] font-bold">Weekend</span>
                  </button>
                </div>

                {/* Plan 4 - Custom Price */}
                <div
                  onClick={() => handlePlanSelect("custom-price")}
                  className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                    selectedPlan === "custom-price"
                      ? "border-[#FA266D] bg-[#FA266D]/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  {/* input price */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    {/* Briefcase inside input */}
                    <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />

                    <input
                      type="number"
                      placeholder="Input price here"
                      value={customPrice}
                      onChange={(e) => {
                        setCustomPrice(e.target.value);
                        if (e.target.value) {
                          handlePlanSelect("custom-price");
                        }
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                    <span className="text-[24px] font-bold">Custom Price</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                {/* <button
                  onClick={closePricingDialog}
                  className="flex-1 bg-white/10 text-white py-3 rounded-[40px] font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button> */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSendPricing();
                  }}
                  disabled={!selectedPlan || (selectedPlan === "custom-price" && !customPrice.trim()) || loadingProfile || sending || Array.from(sendingPricingRef.current).length > 0}
                  className={`flex-1 py-3 rounded-[40px] font-semibold transition-colors cursor-pointer ${
                    selectedPlan && (selectedPlan !== "custom-price" || customPrice.trim()) && !loadingProfile && !sending && Array.from(sendingPricingRef.current).length === 0
                      ? "bg-[#FA266D] text-white hover:bg-pink-600"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loadingProfile ? "Loading..." : sending || Array.from(sendingPricingRef.current).length > 0 ? "Sending..." : "Send Pricing"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Dialog */}
      {showNewChatDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1F1B2C] rounded-lg p-6 w-full max-w-md mx-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-semibold">
                Start New Conversation
              </h2>
              <button
                onClick={() => {
                  setShowNewChatDialog(false);
                  setNewChatUserId("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {authLoading && (
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 mb-4">
                <p className="text-blue-400 text-sm">
                  Loading user information...
                </p>
              </div>
            )}

            {!authLoading && !isAuthenticated && (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-sm">
                  Please log in to start a chat
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {processingUserId && (
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <p className="text-blue-400 text-sm">Creating chat room...</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={newChatUserId}
                  onChange={(e) => {
                    setNewChatUserId(e.target.value);
                    setError(null); // Clear error when typing
                  }}
                  placeholder="Enter user ID to start chatting"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA266D]"
                  onKeyPress={(e) => {
                    if (
                      e.key === "Enter" &&
                      newChatUserId.trim() &&
                      !processingUserId
                    ) {
                      e.preventDefault();
                      handleStartNewChat();
                    }
                  }}
                  autoFocus
                />
                <p className="text-gray-400 text-xs mt-2">
                  Enter the user ID of the person you want to chat with
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNewChatDialog(false);
                    setNewChatUserId("");
                  }}
                  className="flex-1 bg-white/10 text-white py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(
                      "Start Chat button clicked, userId:",
                      newChatUserId.trim()
                    );
                    handleStartNewChat();
                  }}
                  disabled={
                    !newChatUserId.trim() ||
                    processingUserId === newChatUserId.trim() ||
                    authLoading ||
                    !isAuthenticated
                  }
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    newChatUserId.trim() &&
                    processingUserId !== newChatUserId.trim() &&
                    !authLoading &&
                    isAuthenticated
                      ? "bg-[#FA266D] text-white hover:bg-pink-600 cursor-pointer"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {authLoading
                    ? "Loading..."
                    : processingUserId === newChatUserId.trim()
                    ? "Starting..."
                    : "Start Chat"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
