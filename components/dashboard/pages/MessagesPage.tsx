"use client";

import { Inbox, Menu } from "lucide-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, useChatSocket } from "@/lib/hooks";
import { useEnrichedProfile } from "@/lib/hooks/useEnrichedProfile";
import {
  useGetRoomMessagesQuery,
  useMarkRoomAsReadMutation,
  useSendMessageMutation,
  useCreateRoomMutation,
} from "@/app/api/apiSlice";
import type { ChatRoom, ChatMessage } from "@/lib/types";
import { MediaModal } from "@/components/dashboard/messages/MediaModal";
import {
  PricingPlanDialog,
  type PricingPlan,
} from "@/components/dashboard/messages/PricingPlanDialog";
import { NewChatDialog } from "@/components/dashboard/messages/NewChatDialog";
import { ChatMessagesSection } from "@/components/dashboard/messages/ChatMessagesSection";
import { ChatSidebar } from "@/components/dashboard/messages/ChatSidebar";
import { ChatHeader } from "@/components/dashboard/messages/ChatHeader";
import { useMessagesRooms } from "@/components/dashboard/messages/useMessagesRooms";
import { useChatWebSocket } from "@/components/dashboard/messages/useChatWebSocket";
import { CheckoutModal } from "@/components/dashboard/messages/CheckoutModal";

interface Participant {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  firstName?: string;
  username?: string;
  [key: string]: unknown;
}

export default function MessagesPage() {
  const {
    user,
    userId,
    isLoading: authLoading,
    isAuthenticated,
    isDiva,
    isHunk,
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
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(null);
  const [customPrice, setCustomPrice] = useState("");
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState("");
  const [preloadedProfileId, setPreloadedProfileId] = useState<string | null>(null);
  const hasProcessedQueryParams = useRef(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<"short-time" | "overnight" | "weekend" | "custom-price">("short-time");
  const [checkoutAmounts, setCheckoutAmounts] = useState<{ incall: string; outcall: string }>({
    incall: "50,000.00 APH",
    outcall: "70,000.00 APH",
  });

  const currentUserId = userId || user?.id || fallbackUserId;

  const { profile: currentProfile } = useEnrichedProfile(
    currentUserId || null
  );

  const formattedPricing = useMemo(
    () => {
      const pricing = currentProfile?.pricing as
        | {
            shortTime?: { incall?: number | null; outcall?: number | null };
            overnight?: { incall?: number | null; outcall?: number | null };
            weekend?: { incall?: number | null; outcall?: number | null };
          }
        | undefined;

      if (!pricing) {
        return null;
      }

      const formatValue = (value?: number | null) => {
        if (value === null || typeof value === "undefined") {
          return undefined;
        }
        const num = Number(value);
        if (!Number.isFinite(num)) {
          return undefined;
        }
        return `${num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} APH`;
      };

      return {
        shortTime:
          pricing.shortTime &&
          (pricing.shortTime.incall || pricing.shortTime.outcall)
            ? {
                incall: formatValue(pricing.shortTime.incall),
                outcall: formatValue(pricing.shortTime.outcall),
              }
            : undefined,
        overnight:
          pricing.overnight &&
          (pricing.overnight.incall || pricing.overnight.outcall)
            ? {
                incall: formatValue(pricing.overnight.incall),
                outcall: formatValue(pricing.overnight.outcall),
              }
            : undefined,
        weekend:
          pricing.weekend &&
          (pricing.weekend.incall || pricing.weekend.outcall)
            ? {
                incall: formatValue(pricing.weekend.incall),
                outcall: formatValue(pricing.weekend.outcall),
              }
            : undefined,
      };
    },
    [currentProfile?.pricing]
  );

  const {
    rooms,
    loadingRooms,
    roomsError,
    refetchRooms,
    participantNames,
    participantAvatars,
    setParticipantNames,
    setParticipantAvatars,
    setRoomLastMessages,
  } = useMessagesRooms({
    currentUserId,
    authLoading,
  });

  const {
    data: messagesData,
    isLoading: loadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useGetRoomMessagesQuery(
    { roomId: selectedChat || "", query: { limit: 50 } },
    { 
      skip: !selectedChat || !selectedChat.trim(),
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
  } = useChatSocket();

  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messages = useMemo(() => {
    if (!messagesData) {
      return [];
    }

    let messagesArray: ChatMessage[] = [];

    if (Array.isArray(messagesData)) {
      messagesArray = messagesData;
    } else {
      const messagesResponse = messagesData as {
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

    const sorted = [...messagesArray].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });

    if (selectedChat) {
      const roomRealtimeMessages = realtimeMessages.filter(
        (msg) => msg.roomId === selectedChat
      );

      const messageMap = new Map<string, ChatMessage>();

      sorted.forEach((msg) => {
        messageMap.set(msg.id, msg);
      });

      roomRealtimeMessages.forEach((msg) => {
        messageMap.set(msg.id, msg);
      });

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

  useChatWebSocket({
    socket,
    socketConnected,
    selectedChat,
    setRealtimeMessages,
    setRoomLastMessages,
    joinSocketRoom,
    leaveSocketRoom,
  });

  const loading = loadingRooms || loadingMessages;
  const messagesLoading = loadingMessages;
  const apiError =
    roomsError && typeof roomsError === "object"
      ? (() => {
          const err = roomsError as any;
          if (err?.data?.message) {
            return String(err.data.message);
          }
          if (err?.message) {
            return String(err.message);
          }
          return "Failed to fetch conversations";
        })()
      : null;

  // Local state for UI
  const [localError, setLocalError] = useState<string | null>(null);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [invalidUserIds, setInvalidUserIds] = useState<Set<string>>(new Set());

  // Combined error state
  const error: string | null = apiError || localError;
  const setError = setLocalError;

  // Validate MongoDB ObjectId format (24 hex characters)
  const isValidMongoObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Helper to safely extract participant ID (handles both strings and objects)
  const extractParticipantId = (
    participant: string | Participant | null | undefined
  ): string | null => {
    // Handle null/undefined
    if (participant === null || participant === undefined) {
      return null;
    }

    // Handle string directly
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
        router.replace("/chat");
        return;
      }

      if (processingUserId === targetUserId) {
        return;
      }

      setProcessingUserId(targetUserId);

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
        const existingRoom = rooms.find((room) => {
          if (!room.participants || room.type !== "direct") return false;

          const participantIds = room.participants
            .map((p) => extractParticipantId(p))
            .filter((id): id is string => id !== null);

          const hasBothParticipants =
            participantIds.includes(cleanTargetUserId) &&
            participantIds.includes(cleanCurrentUserId);

          return hasBothParticipants;
        });

        if (existingRoom) {
          const roomId =
            existingRoom.roomId ||
            existingRoom.id ||
            (existingRoom as { _id?: string })._id;
          if (roomId) {
            setSelectedChat(roomId);
            router.replace("/chat");
            setProcessingUserId(null);
            return; // Exit early, no need to create
          }
        }

        let result;
        try {
          result = await createRoomMutation({
            type: "direct",
            participants: participants, // Use cleaned IDs
          }).unwrap();
        } catch (mutationError: any) {
          const mutationErrorMsg =
            (mutationError as any)?.data?.message || (mutationError as any)?.message || "";
          if (
            mutationErrorMsg.includes("E11000") ||
            mutationErrorMsg.includes("duplicate key")
          ) {
            const refetchResult: any = await refetchRooms();
            const freshRooms: ChatRoom[] = (refetchResult && refetchResult.data) || rooms;

            const existingRoom = freshRooms.find((room: ChatRoom) => {
              if (!room.participants || room.type !== "direct") return false;

              const participantIds = room.participants
                .map((p: string | Participant) => extractParticipantId(p))
                .filter((id: string | null): id is string => id !== null);

              const hasBothParticipants =
                participantIds.includes(targetUserId) &&
                participantIds.includes(currentUserId);
              return hasBothParticipants;
            });

            if (existingRoom) {
              const roomId =
                existingRoom.roomId ||
                existingRoom.id ||
                (existingRoom as { _id?: string })._id;
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
          } else if (
            "data" in resultObj &&
            resultObj.data &&
            typeof resultObj.data === "object"
          ) {
            // Result is wrapped in { data: {...} }
            roomData = resultObj.data as unknown as ChatRoom;
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

        if (!roomId || typeof roomId !== "string") {
          console.error(
            "[createRoomWithUser] No valid roomId found in response:",
            roomData
          );
          throw new Error("Room creation failed: No room ID in response");
        }

        setSelectedChat(roomId);
        router.replace("/chat");

        // Wait a bit then refetch rooms to get the new room
        setTimeout(() => {
          refetchRooms();
        }, 500);

        setProcessingUserId(null);
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
      refetchRooms,
      rooms,
    ]
  );

  

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

    if (name && targetUserId) {
      setParticipantNames(prev => {
        const next = new Map(prev);
        next.set(targetUserId, name);
        return next;
      });
    }

    // Skip if this userId was already marked as invalid
    if (targetUserId && invalidUserIds.has(targetUserId)) {
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
        return hasBothParticipants;
      });

      if (existingRoom) {
        setSelectedChat(existingRoom.id);
        // Mark as processed before navigation to prevent re-running
        hasProcessedQueryParams.current = true;
        lastProcessedUserId.current = targetUserId;
        // Remove query parameter from URL (only if there are query params)
        if (searchParams.toString()) {
          router.replace("/chat", { scroll: false });
        }
      } else {
        // Mark as processed to prevent re-running during room creation
        hasProcessedQueryParams.current = true;
        lastProcessedUserId.current = targetUserId;
        // If no existing room, create one
        createRoomWithUser(targetUserId);
      }
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
      markRoomAsReadMutation(selectedChat).catch((err) => {
        console.error("Error marking room as read:", err);
      });
    }
  }, [selectedChat, markRoomAsReadMutation]);


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
      console.error("Room not found");
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
    
    // Create optimistic message for immediate UI update
    const optimisticMessage: ChatMessage = {
      id: tempId,
      senderId: currentUserId,
      receiverId: receiverId,
      roomId: selectedChat,
      content: messageContent,
      type: "text",
      status: "sending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tempId: tempId,
    };

    // Add optimistic message to real-time messages
    setRealtimeMessages((prev) => [...prev, optimisticMessage]);
    
    // Update room's lastMessage immediately for optimistic UI
    if (selectedChat) {
      setRoomLastMessages((prev) => {
        const updated = new Map(prev);
        updated.set(selectedChat, optimisticMessage);
        return updated;
      });
    }
    
    setMessageInput("");

    // Try WebSocket first if connected, otherwise fallback to REST API
    if (socketConnected && socket) {
      try {
        sendSocketMessage({
          receiverId: receiverId,
          roomId: selectedChat,
          content: messageContent,
          type: "text",
          tempId: tempId,
        });
        
        // WebSocket will handle the messageDelivered event to update the optimistic message
        // Only refetch rooms to update last message, not messages (we already have optimistic update)
        setTimeout(() => {
          refetchRooms();
        }, 1000);
      } catch (err) {
        console.error("[MessagesPage] Error sending via WebSocket, falling back to REST API:", err);
        // Fallback to REST API
        sendViaRestAPI();
      }
    } else {
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

          // Update optimistic message with real message
          setRealtimeMessages((prev) => 
            prev.map((msg) => 
              msg.tempId === tempId ? sentMessage : msg
            )
          );
          
          // Update room's lastMessage with the real message
          if (selectedChat) {
            setRoomLastMessages((prev) => {
              const updated = new Map(prev);
              updated.set(selectedChat, sentMessage);
              return updated;
            });
          }

          // RTK Query will automatically refetch messages and rooms due to invalidatesTags
          // Only refetch rooms, messages will be updated via invalidatesTags
          refetchRooms();
        }
      } catch (err: unknown) {
        console.error("[MessagesPage] Error sending message via REST API:", err);
        
        // Remove optimistic message on error
        setRealtimeMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
        
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
    if (!(isDiva || isHunk || user?.userType === "diva" || user?.userType === "hunk")) {
      return;
    }
    setShowPricingDialog(true);
  };

  const closePricingDialog = () => {
    setShowPricingDialog(false);
    setSelectedPlan(null);
    setCustomPrice("");
  };

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan);
  };

  const handleSendPricing = async () => {
    if (!selectedPlan) {
      return;
    }

    const currentUserId = userId || user?.id || fallbackUserId;
    if (!selectedChat || !currentUserId) {
      return;
    }

    const room = rooms.find((r) => r.id === selectedChat);
    if (!room || room.type !== "direct" || !room.participants) {
      return;
    }

    const otherParticipant = room.participants.find((p) => {
      const pId = extractParticipantId(p);
      return pId && pId !== currentUserId;
    });
    const receiverId = otherParticipant
      ? extractParticipantId(otherParticipant) || undefined
      : undefined;

    if (!receiverId || receiverId.trim() === "") {
      return;
    }

    const tempId = `pricing_${Date.now()}`;
    const now = new Date().toISOString();

    const pricingData = {
      shortTime:
        selectedPlan === "short-time"
          ? {
              incall:
                formattedPricing?.shortTime?.incall ??
                "50,000.00 APH",
              outcall:
                formattedPricing?.shortTime?.outcall ??
                "70,000.00 APH",
            }
          : undefined,
      overnight:
        selectedPlan === "overnight"
          ? {
              incall:
                formattedPricing?.overnight?.incall ??
                "70,000.00 APH",
              outcall:
                formattedPricing?.overnight?.outcall ??
                "100,000.00 APH",
            }
          : undefined,
      weekend:
        selectedPlan === "weekend"
          ? {
              incall:
                formattedPricing?.weekend?.incall ??
                "---",
              outcall:
                formattedPricing?.weekend?.outcall ??
                "70,000.00 APH",
            }
          : undefined,
      customPrice:
        selectedPlan === "custom-price" && customPrice
          ? {
              incall: `${customPrice} APH`,
              outcall: `${customPrice} APH`,
            }
          : undefined,
    };

    const optimisticMessage: ChatMessage = {
      id: tempId,
      senderId: currentUserId,
      receiverId,
      roomId: selectedChat,
      content: "Pricing plan",
      type: "text",
      status: "sending",
      createdAt: now,
      updatedAt: now,
      metadata: {
        messageType: "pricing",
        pricing: pricingData,
        selectedPlan,
      },
      tempId,
    };

    setRealtimeMessages((prev) => [...prev, optimisticMessage]);

    setRoomLastMessages((prev) => {
      const updated = new Map(prev);
      updated.set(selectedChat, optimisticMessage);
      return updated;
    });

    closePricingDialog();

    const sendMetadata = {
      messageType: "pricing",
      pricing: pricingData,
      selectedPlan,
    } as Record<string, unknown>;

    if (socketConnected && socket) {
      try {
        sendSocketMessage({
          receiverId,
          roomId: selectedChat,
          content: "Pricing plan",
          type: "text",
          tempId,
          metadata: sendMetadata,
        });

        setTimeout(() => {
          refetchRooms();
        }, 1000);
        return;
      } catch (err) {
        console.error(
          "[MessagesPage] Error sending pricing via WebSocket, falling back to REST API:",
          err
        );
      }
    }

    try {
      const result = await sendMessageMutation({
        receiverId,
        content: "Pricing plan",
        type: "text",
        tempId,
        metadata: sendMetadata,
      }).unwrap();

      if (result && receiverId && selectedChat && currentUserId) {
        const sentMessage: ChatMessage = {
          ...result,
          senderId:
            result.senderId && typeof result.senderId === "string"
              ? result.senderId
              : currentUserId,
          receiverId:
            result.receiverId && typeof result.receiverId === "string"
              ? result.receiverId
              : receiverId,
          roomId:
            result.roomId && typeof result.roomId === "string"
              ? result.roomId
              : selectedChat,
        };

        setRealtimeMessages((prev) =>
          prev.map((msg) => (msg.tempId === tempId ? sentMessage : msg))
        );

        setRoomLastMessages((prev) => {
          const updated = new Map(prev);
          updated.set(selectedChat, sentMessage);
          return updated;
        });

        refetchRooms();
      }
    } catch (err) {
      console.error(
        "[MessagesPage] Error sending pricing message via REST API:",
        err
      );
      setRealtimeMessages((prev) =>
        prev.filter((msg) => msg.tempId !== tempId)
      );
    }
  };

  const handleBookShortTime = (pricing: { incall: string; outcall: string }) => {
    setCheckoutPlan("short-time");
    setCheckoutAmounts(pricing);
    setShowCheckout(true);
  };

  const handleBookOvernight = (pricing: { incall: string; outcall: string }) => {
    setCheckoutPlan("overnight");
    setCheckoutAmounts(pricing);
    setShowCheckout(true);
  };

  const handleBookWeekend = (pricing: { incall: string; outcall: string }) => {
    setCheckoutPlan("weekend");
    setCheckoutAmounts(pricing);
    setShowCheckout(true);
  };

  const handleBookCustomPrice = (pricing: { incall: string; outcall: string }) => {
    setCheckoutPlan("custom-price");
    setCheckoutAmounts(pricing);
    setShowCheckout(true);
  };

  const handleStartNewChat = async () => {
    const targetUserId = newChatUserId.trim();
    const currentUserId = userId || user?.id || fallbackUserId;

    if (!targetUserId) {
      console.error("[handleStartNewChat] No userId provided");
      setError("Please enter a user ID");
      return;
    }

    if (authLoading) {
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
      setSelectedChat(existingRoom.id);
      setShowNewChatDialog(false);
      setNewChatUserId("");
      setError(null);
      return;
    }

    setError(null); // Clear any previous errors
    setShowNewChatDialog(false); // Close dialog while processing

    // Use the existing createRoomWithUser function
    try {
      await createRoomWithUser(targetUserId);
      setNewChatUserId("");
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

  const selectedChatData = rooms.find((room) => room.id === selectedChat);

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

  const handleViewProfile = useCallback(async () => {
    const otherParticipantUserId = getOtherParticipantId();
    if (!otherParticipantUserId) {
      console.error("[MessagesPage] Cannot view profile: other participant ID not found");
      return;
    }

    if (preloadedProfileId) {
      router.push(`/profile/${preloadedProfileId}`);
      return;
    }

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "https://be-aphrodite-8wrp.onrender.com"
        }/profiles/user/${otherParticipantUserId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const profileId = data?.data?.id || data?.id || null;

        if (profileId && typeof profileId === "string") {
          setPreloadedProfileId(profileId);
          router.push(`/profile/${profileId}`);
          return;
        }
      } else {
        console.error(
          "[MessagesPage] Failed to fetch participant profile for view profile, status:",
          response.status
        );
      }
    } catch (error) {
      console.error("[MessagesPage] Error fetching participant profile for view profile:", error);
    }

    console.error(
      "[MessagesPage] Could not resolve profile ID for participant:",
      otherParticipantUserId
    );
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

  // Convert API ChatMessage to UI Message format
  const handleSelectChat = (roomId: string) => {
    setSelectedChat(roomId);
  };

  return (
    <div className="flex flex-col md:flex-row bg-[#1F1B2C] h-full min-h-0">
      <div
        className={`${selectedChat ? "hidden md:block" : "block"} h-full`}
      >
        {isSidebarOpen && (
          <ChatSidebar
            rooms={rooms}
            loadingRooms={loadingRooms}
            error={error}
            onRetry={refetchRooms}
            selectedChatId={selectedChat}
            onSelectChat={handleSelectChat}
            participantNames={participantNames}
            participantAvatars={participantAvatars}
            currentUserId={userId || user?.id || fallbackUserId}
            extractParticipantId={extractParticipantId}
            onCloseSidebar={() => setIsSidebarOpen(false)}
          />
        )}
      </div>

      <div
        className={`flex-1 bg-[#1F1B2C] flex flex-col min-h-0 ${
          !selectedChat ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedChat ? (
          <>
            <ChatHeader
              isSidebarOpen={isSidebarOpen}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onBack={handleBackClick}
              selectedChatData={selectedChatData}
              getOtherParticipantId={getOtherParticipantId}
              participantAvatars={participantAvatars}
              participantNames={participantNames}
              onViewProfile={handleViewProfile}
            />

            <div className="flex-1 flex flex-col min-h-0">
              <ChatMessagesSection
                messages={messages}
                messagesLoading={messagesLoading}
                messagesError={messagesError}
                selectedChat={selectedChat}
                onRetry={() => {
                  refetchMessages();
                }}
                onClearSelectedChat={() => {
                  setSelectedChat(null);
                }}
                currentUserId={userId || user?.id || fallbackUserId}
                messageInput={messageInput}
                onChangeMessageInput={setMessageInput}
                onSendMessage={sendMessage}
                sending={sending}
                canSharePricing={
                  isDiva || isHunk || user?.userType === "diva" || user?.userType === "hunk"
                }
                onSharePricing={handleSharePricing}
                onMediaClick={handleMediaClick}
                onBookShortTime={handleBookShortTime}
                onBookOvernight={handleBookOvernight}
                onBookWeekend={handleBookWeekend}
                onBookCustomPrice={handleBookCustomPrice}
              />
            </div>
            {showCheckout && selectedChat && (
              <CheckoutModal
                open={showCheckout}
                plan={checkoutPlan}
                amounts={checkoutAmounts}
                providerUserId={getOtherParticipantId() || ""}
                roomId={selectedChat}
                onClose={() => setShowCheckout(false)}
              />
            )}
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

      <MediaModal content={modalContent} onClose={closeModal} />

      <PricingPlanDialog
        open={showPricingDialog}
        selectedPlan={selectedPlan}
        onSelectPlan={handlePlanSelect}
        customPrice={customPrice}
        onChangeCustomPrice={setCustomPrice}
        onSend={handleSendPricing}
        onClose={closePricingDialog}
        pricing={formattedPricing}
      />

      <NewChatDialog
        open={showNewChatDialog}
        authLoading={authLoading}
        isAuthenticated={isAuthenticated}
        error={error}
        processingUserId={processingUserId}
        newChatUserId={newChatUserId}
        onChangeUserId={(value) => {
          setNewChatUserId(value);
          setError(null);
        }}
        onStartChat={handleStartNewChat}
        onClose={() => {
          setShowNewChatDialog(false);
          setNewChatUserId("");
        }}
      />
    </div>
  );
}
