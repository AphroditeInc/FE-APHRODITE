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
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";
import { 
  useGetRoomMessagesQuery, 
  useMarkRoomAsReadMutation, 
  useSendMessageMutation,
  useCreateRoomMutation,
  useGetUserRoomsQuery
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
    shortTime: { incall: string; outcall: string };
    overnight: { incall: string; outcall: string };
  };
}

export default function MessagesPage() {
  const { user, userId, isLoading: authLoading, isAuthenticated, tokens } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Fallback: Try to get user ID from localStorage if not in context
  const [fallbackUserId, setFallbackUserId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId && !user?.id && isAuthenticated) {
      // Try to get user from localStorage as fallback
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.id) {
            console.log('Found user ID in localStorage:', parsedUser.id);
            setFallbackUserId(parsedUser.id);
          }
        }
      } catch (err) {
        console.error('Error reading user from localStorage:', err);
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
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState("");
  
  // RTK Query hooks
  const currentUserId = userId || user?.id || fallbackUserId;
  // Use getUserRooms instead of getConversations to get all rooms (matches Swagger: /chat/rooms returns 3, /chat/conversations returns 2)
  const { data: roomsData, isLoading: loadingRooms, error: roomsError, refetch: refetchRooms } = useGetUserRoomsQuery(
    { limit: 50, offset: 0 },
    { skip: !currentUserId || authLoading }
  );
  
  const { data: messagesData, isLoading: loadingMessages, error: messagesError, refetch: refetchMessages } = useGetRoomMessagesQuery(
    { roomId: selectedChat || '', query: { limit: 50 } },
    { skip: !selectedChat || !selectedChat.trim() }
  );
  
  const [markRoomAsReadMutation] = useMarkRoomAsReadMutation();
  const [sendMessageMutation, { isLoading: sending }] = useSendMessageMutation();
  const [createRoomMutation] = useCreateRoomMutation();

  // Convert API data to component state
  // According to Swagger: GET /chat/rooms returns { success: true, data: [...] }
  // Each room has participants as array of objects with userId property
  const rooms = useMemo(() => {
    if (!roomsData) {
      console.log('[MessagesPage] No roomsData yet');
      return [];
    }
    
    console.log('[MessagesPage] roomsData:', roomsData);
    console.log('[MessagesPage] roomsData type:', typeof roomsData, 'isArray:', Array.isArray(roomsData));
    
    // transformResponse should already extract the array, so roomsData should be ChatRoom[]
    let roomsArray: ChatRoom[] = [];
    
    if (Array.isArray(roomsData)) {
      console.log('[MessagesPage] roomsData is array (expected), length:', roomsData.length);
      roomsArray = roomsData;
    } else {
      console.warn('[MessagesPage] roomsData is not an array (unexpected):', roomsData);
      return [];
    }
    
    // Transform rooms to match ChatRoom type
    // According to Swagger, participants is an array of objects: [{ userId: "...", ... }, ...]
    const transformedRooms = roomsArray.map((room: any) => {
      const roomId = room.roomId || room._id || room.id;
      if (!roomId) {
        console.warn('[MessagesPage] Room missing roomId:', room);
        return null;
      }
      
      // Extract participant IDs from objects with userId property
      const participants: string[] = [];
      if (room.participants && Array.isArray(room.participants)) {
        room.participants.forEach((p: any) => {
          // Handle both formats: object with userId, or string
          const participantId = typeof p === 'string' 
            ? p 
            : (p.userId || p._id || p.id);
          if (participantId && typeof participantId === 'string' && !participants.includes(participantId)) {
            participants.push(participantId);
          }
        });
      }
      
      // Transform lastMessage if present
      let lastMessage: ChatMessage | undefined;
      if (room.lastMessage) {
        // lastMessage might be a string ID or an object
        if (typeof room.lastMessage === 'string') {
          // If it's just an ID, we can't create a full ChatMessage
          // We'll need to fetch it separately or skip it
          console.log('[MessagesPage] Room has lastMessage as ID only:', room.lastMessage);
        } else if (typeof room.lastMessage === 'object' && room.lastMessage !== null) {
          const msg = room.lastMessage;
          const messageId = msg._id || msg.id;
          if (messageId && typeof messageId === 'string') {
            lastMessage = {
              id: messageId,
              senderId: msg.senderId,
              receiverId: msg.receiverId,
              roomId: msg.roomId || roomId,
              content: msg.content || '',
              type: (msg.type || 'text') as ChatMessage['type'],
              status: (msg.status || 'sent') as ChatMessage['status'],
              createdAt: msg.createdAt || new Date().toISOString(),
              updatedAt: msg.updatedAt || new Date().toISOString(),
              metadata: msg.metadata,
              attachments: msg.attachments || [],
              readAt: msg.readAt,
              deliveredAt: msg.deliveredAt,
              replyTo: msg.replyTo,
            };
          }
        }
      }
      
      const chatRoom: ChatRoom = {
        id: roomId,
        roomId: roomId,
        type: (room.type || 'direct') as ChatRoom['type'],
        participants: participants,
        createdAt: room.createdAt || new Date().toISOString(),
        updatedAt: room.updatedAt || new Date().toISOString(),
        lastMessage: lastMessage,
        unreadCount: room.unreadCount || 0,
      };
      
      return chatRoom;
    }).filter((room): room is ChatRoom => room !== null);
    
    console.log('[MessagesPage] Transformed', transformedRooms.length, 'rooms from', roomsArray.length, 'raw rooms');
    return transformedRooms;
  }, [roomsData]);

  const messages = useMemo(() => {
    console.log('[MessagesPage] Processing messagesData:', messagesData);
    console.log('[MessagesPage] messagesData type:', typeof messagesData, 'isArray:', Array.isArray(messagesData));
    
    // transformResponse should already extract the array, so messagesData should be ChatMessage[]
    if (!messagesData) {
      console.log('[MessagesPage] No messagesData, returning empty array');
      return [];
    }
    
    // transformResponse should return ChatMessage[], so this should be an array
    let messagesArray: ChatMessage[] = [];
    
    if (Array.isArray(messagesData)) {
      console.log('[MessagesPage] messagesData is array (expected), length:', messagesData.length);
      messagesArray = messagesData;
    } else {
      // Fallback: if transformResponse didn't work, try to extract manually
      console.warn('[MessagesPage] messagesData is not an array (unexpected), trying to extract:', messagesData);
      const messagesResponse = messagesData as MessagesResponse | { data?: ChatMessage[]; items?: ChatMessage[]; messages?: ChatMessage[] };
      
      if (Array.isArray(messagesResponse.messages)) {
        messagesArray = messagesResponse.messages;
      } else if (Array.isArray(messagesResponse.data)) {
        messagesArray = messagesResponse.data;
      } else if (Array.isArray(messagesResponse.items)) {
        messagesArray = messagesResponse.items;
      } else {
        console.error('[MessagesPage] Could not extract messages array from:', messagesResponse);
        return [];
      }
    }
    
    console.log('[MessagesPage] Final messagesArray length:', messagesArray.length);
    if (messagesArray.length > 0) {
      console.log('[MessagesPage] First message:', messagesArray[0]);
      console.log('[MessagesPage] Last message:', messagesArray[messagesArray.length - 1]);
    }
    
    // Create a copy of the array before sorting (RTK Query returns frozen arrays)
    // Sort messages by createdAt (oldest first)
    const sorted = [...messagesArray].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
    
    console.log('[MessagesPage] Sorted messages length:', sorted.length);
    return sorted;
  }, [messagesData]);
  
  // Log messages data for debugging (moved after messages definition to avoid hoisting issue)
  // Note: selectedChatData is defined later, so we'll add another useEffect after it
  useEffect(() => {
    if (selectedChat) {
      console.log('[MessagesPage] Selected chat:', selectedChat);
      console.log('[MessagesPage] Messages data:', messagesData);
      console.log('[MessagesPage] Messages data type:', typeof messagesData, 'isArray:', Array.isArray(messagesData));
      console.log('[MessagesPage] Loading messages:', loadingMessages);
      console.log('[MessagesPage] Messages error:', messagesError);
      console.log('[MessagesPage] Processed messages array length:', messages.length);
    } else {
      console.log('[MessagesPage] No chat selected');
    }
  }, [selectedChat, messagesData, loadingMessages, messagesError, messages]);

  const loading = loadingRooms || loadingMessages;
  const messagesLoading = loadingMessages;
  const apiError = roomsError 
    ? ('data' in roomsError && roomsError.data && typeof roomsError.data === 'object' && 'message' in roomsError.data 
        ? String(roomsError.data.message)
        : 'message' in roomsError 
          ? String(roomsError.message)
          : 'Failed to fetch conversations')
    : null;
  
  // Local state for UI
  const [localError, setLocalError] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [invalidUserIds, setInvalidUserIds] = useState<Set<string>>(new Set());
  const [participantNames, setParticipantNames] = useState<Map<string, string>>(new Map());
  
  // Combined error state
  const error: string | null = apiError || localError;
  const setError = setLocalError;

  // Validate MongoDB ObjectId format (24 hex characters)
  const isValidMongoObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Helper to safely extract participant ID (handles both strings and objects)
  const extractParticipantId = (participant: string | Participant | null | undefined): string | null => {
    // Handle null/undefined
    if (participant === null || participant === undefined) {
      return null;
    }

    // Handle string directly
    if (typeof participant === 'string') {
      // Validate it's not the object string representation
      if (participant === '[object Object]' || participant.trim() === '') {
        return null;
      }
      return participant;
    }

    // Handle objects - NEVER convert to string directly as it becomes [object Object]
    if (participant && typeof participant === 'object') {
      // Try to get id or _id property
      const id = participant.id || participant._id;
      
      if (id !== null && id !== undefined) {
        // If id is a string, validate and return
        if (typeof id === 'string') {
          if (id === '[object Object]' || id.trim() === '') {
            return null;
          }
          return id;
        }
        // If id is a number, convert to string
        if (typeof id === 'number' && !isNaN(id)) {
          return String(id);
        }
        // If id is another object, try to extract from it (nested)
        if (typeof id === 'object' && id !== null) {
          const nestedObj = id as { id?: string | number; _id?: string | number };
          const nestedId = nestedObj.id || nestedObj._id;
          if (nestedId && typeof nestedId === 'string' && nestedId !== '[object Object]') {
            return nestedId;
          }
          if (nestedId && typeof nestedId === 'number' && !isNaN(nestedId)) {
            return String(nestedId);
          }
        }
      }
      
      // If we can't extract a valid ID from the object, return null
      // DO NOT convert object to string as it becomes [object Object]
      return null;
    }

    // Handle numbers
    if (typeof participant === 'number' && !isNaN(participant)) {
      return String(participant);
    }

    // Handle booleans
    if (typeof participant === 'boolean') {
      return null; // Booleans don't make sense as IDs
    }

    // Last resort: try to convert to string, but validate it's not [object Object]
    // This should only happen for primitives
    try {
      // Only convert if it's not an object
      if (typeof participant !== 'object') {
        const str = String(participant);
        if (str === '[object Object]' || str.trim() === '') {
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
  const createRoomWithUser = useCallback(async (targetUserId: string) => {
    if (!currentUserId) {
      console.error('Cannot create room: user not loaded');
      throw new Error('User not loaded. Please log in.');
    }

    // Validate MongoDB ObjectId format
    if (!isValidMongoObjectId(targetUserId)) {
      const errorMsg = `Invalid user ID format. The user ID "${targetUserId}" is not a valid MongoDB ObjectId. Please use a valid user ID (24-character hex string).`;
      console.error(errorMsg);
      setInvalidUserIds(prev => new Set(prev).add(targetUserId));
      router.replace('/chat');
      throw new Error(errorMsg);
    }

    // Check if this ID was already marked as invalid
    if (invalidUserIds.has(targetUserId)) {
      console.log('Skipping invalid userId:', targetUserId);
      router.replace('/chat');
      return;
    }

    if (processingUserId === targetUserId) {
      console.log('Already processing this userId, skipping...');
      return;
    }

    setProcessingUserId(targetUserId);
    console.log('[createRoomWithUser] Creating room with targetUserId:', targetUserId, 'current user:', currentUserId);
    console.log('[createRoomWithUser] Current user ID type:', typeof currentUserId, 'value:', currentUserId);
    console.log('[createRoomWithUser] Target user ID type:', typeof targetUserId, 'value:', targetUserId);

    // Ensure both IDs are strings and valid
    if (!currentUserId || typeof currentUserId !== 'string') {
      const errorMsg = 'Current user ID is invalid. Please log in again.';
      console.error('[createRoomWithUser]', errorMsg, 'currentUserId:', currentUserId);
      setProcessingUserId(null);
      throw new Error(errorMsg);
    }

    if (!targetUserId || typeof targetUserId !== 'string') {
      const errorMsg = 'Target user ID is invalid.';
      console.error('[createRoomWithUser]', errorMsg, 'targetUserId:', targetUserId);
      setProcessingUserId(null);
      throw new Error(errorMsg);
    }

    // Ensure IDs are trimmed and not empty
    const cleanCurrentUserId = currentUserId.trim();
    const cleanTargetUserId = targetUserId.trim();

    if (!cleanCurrentUserId || !cleanTargetUserId) {
      const errorMsg = 'User IDs cannot be empty.';
      console.error('[createRoomWithUser]', errorMsg);
      setProcessingUserId(null);
      throw new Error(errorMsg);
    }

    if (cleanCurrentUserId === cleanTargetUserId) {
      const errorMsg = 'Cannot create a room with yourself.';
      console.error('[createRoomWithUser]', errorMsg);
      setProcessingUserId(null);
      throw new Error(errorMsg);
    }

    try {
      const participants = [cleanCurrentUserId, cleanTargetUserId];
      console.log('[createRoomWithUser] Calling createRoomMutation with:', {
        type: 'direct',
        participants: participants
      });
      
      const result = await createRoomMutation({
        type: 'direct',
        participants: participants, // Use cleaned IDs
      }).unwrap();

      console.log('[createRoomWithUser] Room created successfully, raw result:', result);
      console.log('[createRoomWithUser] Result type:', typeof result, 'isArray:', Array.isArray(result));
      
      if (!result) {
        console.error('[createRoomWithUser] No result returned from createRoomMutation');
        throw new Error('Room creation failed: No response from server');
      }
      
      // transformResponse should already extract the room data, so result should be ChatRoom
      // But handle both cases: direct ChatRoom or wrapped in { data: ChatRoom }
      let roomData: ChatRoom | { roomId?: string; id?: string; _id?: string } | null = null;
      
      if (result && typeof result === 'object') {
        const resultObj = result as unknown as Record<string, unknown>;
        
        // Check if result is already a ChatRoom (has roomId or id)
        if ('roomId' in resultObj || 'id' in resultObj || '_id' in resultObj) {
          roomData = resultObj as unknown as ChatRoom;
          console.log('[createRoomWithUser] Result is ChatRoom object:', roomData);
        } else if ('data' in resultObj && resultObj.data && typeof resultObj.data === 'object') {
          // Result is wrapped in { data: {...} }
          roomData = resultObj.data as unknown as ChatRoom;
          console.log('[createRoomWithUser] Result has data property:', roomData);
      } else {
          console.warn('[createRoomWithUser] Unexpected result structure:', result);
          roomData = resultObj as any;
        }
      }
      
      if (!roomData) {
        console.error('[createRoomWithUser] Could not extract room data from result:', result);
        throw new Error('Room creation failed: Invalid response format');
      }
      
      // Extract roomId - API might return roomId, id, or _id
      const roomId = (roomData as ChatRoom).roomId || (roomData as ChatRoom).id || (roomData as any)._id || (roomData as any).id;
      
      console.log('[createRoomWithUser] Extracted roomId:', roomId, 'from roomData:', roomData);
      
      if (!roomId || typeof roomId !== 'string') {
        console.error('[createRoomWithUser] No valid roomId found in response:', roomData);
        throw new Error('Room creation failed: No room ID in response');
      }
      
      console.log('[createRoomWithUser] Setting selected chat to roomId:', roomId);
      setSelectedChat(roomId);
      router.replace('/chat');
      
      // Wait a bit then refetch rooms to get the new room
      setTimeout(() => {
        refetchRooms();
      }, 500);
      
      setProcessingUserId(null);
      console.log('[createRoomWithUser] Room creation completed successfully');
    } catch (err: unknown) {
      console.error('[createRoomWithUser] Error creating room:', err);
      console.error('[createRoomWithUser] Error type:', typeof err);
      console.error('[createRoomWithUser] Error details:', JSON.stringify(err, null, 2));
      
      const errorMsg = (err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data)
        ? String(err.data.message)
        : (err && typeof err === 'object' && 'message' in err)
          ? String(err.message)
          : (err && typeof err === 'object' && 'error' in err && typeof err.error === 'object' && err.error && 'data' in err.error && err.error.data && typeof err.error.data === 'object' && 'message' in err.error.data)
            ? String(err.error.data.message)
            : 'An error occurred while creating the chat room.';
      
      console.error('[createRoomWithUser] Extracted error message:', errorMsg);
      
      // Check if error is about invalid MongoDB ObjectId
      if (errorMsg.toLowerCase().includes('mongodb') || errorMsg.toLowerCase().includes('objectid') || errorMsg.toLowerCase().includes('invalid')) {
        setInvalidUserIds(prev => new Set(prev).add(targetUserId));
        setError(errorMsg);
        router.replace('/chat');
      } else {
        setError(errorMsg);
      }
      
      setProcessingUserId(null);
      throw new Error(errorMsg);
    }
  }, [currentUserId, processingUserId, invalidUserIds, router, createRoomMutation, refetchRooms]);

  // Extract participant names from rooms data
  // Note: /chat/rooms doesn't include user names, so we'll need to fetch them separately
  // This effect is kept for backward compatibility but won't extract names from rooms
  useEffect(() => {
    if (roomsData && Array.isArray(roomsData)) {
      // Rooms from /chat/rooms don't have sender/receiver info
      // We'll need to fetch participant names separately using their userIds
      console.log('[MessagesPage] Rooms data loaded, participant names will be fetched separately');
    }
  }, [roomsData]);

  // Handle userId query parameter - find or create room with that user
  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    const name = searchParams.get('name');
    const currentUserId = userId || user?.id || fallbackUserId;
    
    console.log('Query params check - targetUserId:', targetUserId, 'name:', name, 'loading:', loading, 'rooms.length:', rooms.length, 'currentUserId:', currentUserId, 'authLoading:', authLoading, 'processingUserId:', processingUserId);
    
    if (name) {
      setProfileName(name);
    }

    // Skip if this userId was already marked as invalid
    if (targetUserId && invalidUserIds.has(targetUserId)) {
      console.log('Skipping invalid userId:', targetUserId);
      router.replace('/chat');
      return;
    }

    // Only process if we have userId, user is loaded, rooms are loaded, and not already processing
    if (targetUserId && currentUserId && !loading && !authLoading && !processingUserId) {
      console.log('Processing userId:', targetUserId, 'Current rooms:', rooms);
      
      // Validate MongoDB ObjectId format before processing
      if (!isValidMongoObjectId(targetUserId)) {
        console.error('Invalid MongoDB ObjectId format:', targetUserId);
        setInvalidUserIds(prev => new Set(prev).add(targetUserId));
        setError(`Invalid user ID format. The user ID "${targetUserId}" is not a valid MongoDB ObjectId. Please use a valid user ID (24-character hex string).`);
        // Clear query params to prevent retries
        router.replace('/chat');
        return;
      }
      
      // Find existing direct message room with this user
      const existingRoom = rooms.find(room => {
        if (!room.participants || room.type !== 'direct') return false;
        
        // Extract participant IDs safely
        const participantIds = room.participants
          .map(p => extractParticipantId(p))
          .filter((id): id is string => id !== null);
        const hasBothParticipants = participantIds.includes(targetUserId) && participantIds.includes(currentUserId);
        console.log('Checking room:', room.id, 'type:', room.type, 'participants:', room.participants, 'participantIds:', participantIds, 'hasBoth:', hasBothParticipants);
        return hasBothParticipants;
      });

      if (existingRoom) {
        console.log('Found existing room:', existingRoom.id);
        setSelectedChat(existingRoom.id);
        // Remove query parameter from URL
        router.replace('/chat');
      } else {
        console.log('No existing room found, creating new one...');
        // If no existing room, create one
        createRoomWithUser(targetUserId);
      }
    } else {
      console.log('Skipping processing - targetUserId:', targetUserId, 'currentUserId:', currentUserId, 'loading:', loading, 'authLoading:', authLoading, 'processingUserId:', processingUserId);
    }
  }, [rooms, searchParams, userId, user?.id, fallbackUserId, router, loading, authLoading, processingUserId, invalidUserIds, createRoomWithUser]);

  useEffect(() => {
    if (selectedChat) {
      console.log('Selected chat changed, marking room as read:', selectedChat);
      markRoomAsReadMutation(selectedChat).catch(err => {
        console.error('Error marking room as read:', err);
      });
    }
  }, [selectedChat, markRoomAsReadMutation]);

  // Fetch participant names for a user ID (using apiService for now, can be moved to RTK Query later)
  const fetchParticipantName = async (participantId: string | Participant): Promise<string | null> => {
    const normalizedId = extractParticipantId(participantId);

    if (!normalizedId || typeof normalizedId !== 'string' || normalizedId === '[object Object]') {
      console.error('Invalid participant ID:', participantId, 'type:', typeof participantId, 'normalized:', normalizedId);
      return null;
    }

    if (participantNames.has(normalizedId)) {
      return participantNames.get(normalizedId) || null;
    }

    if (normalizedId === currentUserId) {
      return null;
    }

    // Note: This still uses apiService for user profile fetching
    // Can be moved to RTK Query if a user profile API slice is created
    try {
      const response = await apiService.getUserProfile(normalizedId);
      if (response.success && response.data) {
        const name = response.data.firstName && response.data.lastName
          ? `${response.data.firstName} ${response.data.lastName}`
          : response.data.firstName || response.data.username || response.data.email || null;
        
        if (name) {
          setParticipantNames(prev => {
            const newMap = new Map(prev);
            newMap.set(normalizedId, name);
            return newMap;
          });
          return name;
        }
      }
    } catch (err) {
      console.error('Error fetching participant name:', err);
    }
    return null;
  };

  const sendMessage = async (e?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent) => {
    // Prevent form submission and page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const currentUserId = userId || user?.id || fallbackUserId;
    if (!messageInput.trim() || !selectedChat || sending || !currentUserId) return;

    // Get the selected room to find the receiver ID
    const room = rooms.find(r => r.id === selectedChat);
    if (!room) {
      console.error('Room not found');
      return;
    }

    // For direct messages, find the other participant (not the current user)
    // For group messages, we might need to handle differently based on API requirements
    let receiverId: string | undefined;
    if (room.type === 'direct' && room.participants) {
      const otherParticipant = room.participants.find(p => {
        const pId = extractParticipantId(p);
        return pId && pId !== currentUserId;
      });
      receiverId = otherParticipant ? extractParticipantId(otherParticipant) || undefined : undefined;
    }

    // Validate receiverId is provided (required by API)
    if (!receiverId || receiverId.trim() === '') {
      console.error('Receiver ID not found for direct message');
      return;
    }

    try {
      const result = await sendMessageMutation({
        receiverId: receiverId, // TypeScript now knows receiverId is defined (string, not undefined)
        content: messageInput.trim(),
        type: 'text',
        tempId: `temp_${Date.now()}`,
      }).unwrap();

      if (result) {
        // transformResponse already extracted the data, so result is the message object
        const sentMessage = {
          ...result,
          senderId: currentUserId, // Ensure senderId is set correctly
        };
        
        console.log('Message sent successfully:', sentMessage);
        setMessageInput('');
        
        // RTK Query will automatically refetch messages and rooms due to invalidatesTags
        // But we can also manually refetch to ensure immediate update
        refetchMessages();
        refetchRooms();
      }
    } catch (err: unknown) {
      console.error('Error sending message:', err);
      const errorMsg = (err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data)
        ? String(err.data.message)
        : (err && typeof err === 'object' && 'message' in err)
          ? String(err.message)
          : 'Failed to send message';
      console.error('Failed to send message:', errorMsg);
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
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
  };

  const handleSendPricing = () => {
    if (selectedPlan) {
      // Handle sending the selected pricing plan
      console.log("Sending pricing plan:", selectedPlan);
      closePricingDialog();
    }
  };

  const handleStartNewChat = async () => {
    const targetUserId = newChatUserId.trim();
    const currentUserId = userId || user?.id || fallbackUserId;
    
    console.log('[handleStartNewChat] Called with userId:', targetUserId, 'currentUserId:', currentUserId, 'authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'fallbackUserId:', fallbackUserId);
    
    if (!targetUserId) {
      console.error('[handleStartNewChat] No userId provided');
      setError('Please enter a user ID');
      return;
    }

    if (authLoading) {
      console.log('[handleStartNewChat] Auth still loading, waiting...');
      setError('Please wait for authentication to complete');
      return;
    }

    if (!isAuthenticated || !currentUserId) {
      console.error('[handleStartNewChat] User not authenticated or not loaded');
      setError('Please log in to start a chat');
      return;
    }

    if (processingUserId === targetUserId) {
      console.log('[handleStartNewChat] Already processing this userId');
      return;
    }

    // Check if room already exists before creating
    const existingRoom = rooms.find(room => {
      if (!room.participants || room.type !== 'direct') return false;
      
      const participantIds = room.participants
        .map(p => extractParticipantId(p))
        .filter((id): id is string => id !== null);
      
      const hasBothParticipants = participantIds.includes(targetUserId) && participantIds.includes(currentUserId);
      return hasBothParticipants;
    });

    if (existingRoom) {
      console.log('[handleStartNewChat] Room already exists:', existingRoom.id);
      setSelectedChat(existingRoom.id);
      setShowNewChatDialog(false);
      setNewChatUserId("");
      setError(null);
      return;
    }

    console.log('[handleStartNewChat] Starting new chat with userId:', targetUserId, 'current user:', currentUserId);
    setError(null); // Clear any previous errors
    setShowNewChatDialog(false); // Close dialog while processing
    
    // Use the existing createRoomWithUser function
    try {
      await createRoomWithUser(targetUserId);
      setNewChatUserId("");
      console.log('[handleStartNewChat] Chat started successfully');
    } catch (err) {
      console.error('[handleStartNewChat] Error starting chat:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start chat. Please try again.';
      setError(errorMessage);
      setShowNewChatDialog(true); // Reopen dialog on error so user can see the error and try again
    }
  };

  const selectedChatData = rooms.find((room) => room.id === selectedChat);
  
  // Log participant information for debugging (after selectedChatData is defined)
  useEffect(() => {
    if (selectedChat && selectedChatData) {
      const currentUserId = userId || user?.id || fallbackUserId;
      console.log('[MessagesPage] Selected room data:', selectedChatData);
      console.log('[MessagesPage] Current user ID:', currentUserId, 'type:', typeof currentUserId);
      console.log('[MessagesPage] Room participants:', selectedChatData.participants);
      
      // Check if current user is in participants
      if (selectedChatData.participants) {
        const participantIds = selectedChatData.participants
          .map(p => extractParticipantId(p))
          .filter((id): id is string => id !== null);
        const isParticipant = currentUserId && participantIds.includes(currentUserId);
        console.log('[MessagesPage] Is current user a participant?', isParticipant, 'participantIds:', participantIds, 'currentUserId:', currentUserId);
        
        if (!isParticipant && currentUserId) {
          console.warn('[MessagesPage] WARNING: Current user is NOT a participant in this room!');
          console.warn('[MessagesPage] This will cause "User is not a participant in this room" error when fetching messages.');
        }
      }
    }
  }, [selectedChat, selectedChatData, userId, user?.id, fallbackUserId]);
  
  // Helper functions for data transformation
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'group') {
      return room.name || 'Group Chat';
    }
    
    // For direct messages, find the other participant's name
    const currentUserId = userId || user?.id || fallbackUserId;
    if (room.participants && room.participants.length === 2 && currentUserId) {
      // Find the other participant (not the current user)
      const otherParticipant = room.participants.find(p => {
        const pId = extractParticipantId(p);
        return pId && pId !== currentUserId;
      });
      
      // Debug logging
      if (otherParticipant && typeof otherParticipant === 'object') {
        console.log('Found otherParticipant object:', otherParticipant, 'keys:', Object.keys(otherParticipant));
      }
      
      const otherParticipantId = otherParticipant ? extractParticipantId(otherParticipant) : null;
      
      // Debug logging
      if (otherParticipantId === '[object Object]' || (otherParticipantId && typeof otherParticipantId !== 'string')) {
        console.error('Invalid otherParticipantId extracted:', {
          otherParticipant,
          otherParticipantId,
          type: typeof otherParticipantId,
          roomParticipants: room.participants
        });
      }
      
      // Validate otherParticipantId is a valid string before using it
      if (otherParticipantId && typeof otherParticipantId === 'string' && otherParticipantId !== '[object Object]' && otherParticipantId.trim() !== '') {
        // Check if we have the name cached
        const cachedName = participantNames.get(otherParticipantId);
        if (cachedName) {
          return cachedName;
        }
        
        // If we have profileName from query params (for newly created rooms), use it
        if (profileName) {
          // Also cache it for future use
          setParticipantNames(prev => {
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
          if (safeId && typeof safeId === 'string' && safeId !== '[object Object]') {
            fetchParticipantName(safeId).catch(err => {
              console.error('Error fetching participant name:', err);
            });
          }
        }
      } else if (otherParticipantId) {
        // Log warning if we got an invalid ID
        console.warn('Invalid otherParticipantId extracted:', otherParticipantId, 'type:', typeof otherParticipantId, 'from participant:', otherParticipant);
      }
    }
    
    return 'Direct Message';
  };

  const getLastMessagePreview = (room: ChatRoom) => {
    if (!room.lastMessage) return 'No messages yet';
    
    const message = room.lastMessage;
    if (message.type === 'text') {
      return message.content.length > 50 
        ? `${message.content.substring(0, 50)}...` 
        : message.content;
    } else if (message.type === 'image') {
      return '📷 Image';
    } else if (message.type === 'file') {
      return '📎 File';
    } else if (message.type === 'video') {
      return '🎥 Video';
    } else if (message.type === 'audio') {
      return '🎵 Audio';
    }
    return 'Message';
  };

  // Convert API ChatMessage to UI Message format
  const convertToUIMessage = (apiMessage: ChatMessage): Message => {
    const currentUserId = userId || user?.id || fallbackUserId;
    
    // Normalize IDs to strings for comparison - handle both ObjectId and string formats
    const normalizeId = (id: string | { _id?: string; id?: string } | null | undefined): string => {
      if (!id) return '';
      // If it's already a string, return it trimmed
      if (typeof id === 'string') return id.trim();
      // If it's an object with _id or id property, extract it
      if (typeof id === 'object' && id !== null) {
        return String(id._id || id.id || '').trim();
      }
      // Otherwise convert to string
      return String(id).trim();
    };
    
    const senderIdStr = normalizeId(apiMessage.senderId);
    const currentUserIdStr = normalizeId(currentUserId);
    
    // Compare normalized IDs
    const isOwn = senderIdStr !== '' && currentUserIdStr !== '' && senderIdStr === currentUserIdStr;
    
    // Debug logging for message conversion
    console.log('convertToUIMessage:', {
      apiMessageSenderId: apiMessage.senderId,
      senderIdStr,
      currentUserId,
      currentUserIdStr,
      isOwn,
      messageContent: apiMessage.content?.substring(0, 20)
    });
    
    return {
      id: apiMessage.id,
      sender: isOwn ? "me" : "other",
      type: apiMessage.type as "text" | "audio" | "video" | "image" | "pricing",
      content: apiMessage.content,
      timestamp: formatTime(apiMessage.createdAt),
      duration: apiMessage.metadata?.duration as string | undefined,
      videoThumbnail: (apiMessage.metadata?.imageUrl as string) || apiMessage.attachments?.[0],
    };
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.sender === "me";
    
    if (message.type === "pricing" && message.pricing) {
      return (
        <div className="space-y-3">
          {/* Short Time Card */}
          <div className="bg-gray-800 rounded-[20px] p-4 w-[317px] h-[180px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Incall</span>
                <span className="text-white font-semibold text-[20px]">
                  50,000.00 APH
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Outcall</span>
                <span className="text-white font-semibold text-[20px]">
                  70,000.00 APH
                </span>
              </div>
            </div>
            <button className="w-full bg-[#FA266D] text-white py-2 px-4 rounded-[30px] text-[20px] font-medium">
              Book short time
            </button>
          </div>

          {/* Overnight Card */}
          <div className="bg-gray-800 rounded-[20px] p-4 w-[317px] h-[180px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Incall</span>
                <span className="text-white font-semibold text-[20px]">
                  70,000.00 APH
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Outcall</span>
                <span className="text-white font-semibold text-[20px]">
                  100,000.00 APH
                </span>
              </div>
            </div>
            <button className="w-full bg-[#FA266D] text-white py-2 px-4 rounded-[30px] text-[20px] font-medium">
              Book overnight
            </button>
          </div>
        </div>
      );
    }

    if (message.type === "audio") {
      return (
        <div className={`flex items-center gap-3 rounded-lg p-3 max-w-xs ${
          isOwnMessage ? "bg-white" : "bg-[#FA266D]"
        }`}>
          <button className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isOwnMessage ? "bg-gray-200" : "bg-white/20"
          }`}>
            <Play className={`h-4 w-4 ${isOwnMessage ? "text-gray-600" : "text-white"}`} />
          </button>
          <div className="flex-1">
            <div className={`w-32 h-2 rounded-full ${
              isOwnMessage ? "bg-gray-300" : "bg-white/30"
            }`}></div>
            <div className={`flex justify-between text-xs mt-1 ${
              isOwnMessage ? "text-gray-500" : "text-white/80"
            }`}>
              <span>{message.duration}</span>
              <span>01:25</span>
            </div>
          </div>
          {isOwnMessage && (
          <div className="flex items-center gap-1">
            <CheckCheck className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-gray-500">Sent</span>
          </div>
          )}
        </div>
      );
    }

    if (message.type === "video") {
      return (
        <div className={`rounded-lg p-2 max-w-xs ${
          isOwnMessage ? "bg-white" : "bg-[#FA266D]/10"
        }`}>
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
          <div className={`flex items-center justify-between mt-2 ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}>
            <span className={`text-xs ${
              isOwnMessage ? "text-gray-500" : "text-white/80"
            }`}>{message.timestamp}</span>
            {isOwnMessage && <CheckCheck className="h-3 w-3 text-blue-500" />}
          </div>
        </div>
      );
    }

    if (message.type === "image") {
      return (
        <div className={`rounded-lg p-2 max-w-xs ${
          isOwnMessage ? "bg-white" : "bg-[#FA266D]/10"
        }`}>
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
          <div className={`flex items-center justify-between mt-2 ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}>
            <span className={`text-xs ${
              isOwnMessage ? "text-gray-500" : "text-white/80"
            }`}>{message.timestamp}</span>
            {isOwnMessage && <CheckCheck className="h-3 w-3 text-blue-500" />}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`rounded-lg p-3 max-w-xs ${
          isOwnMessage
            ? "bg-white text-gray-800"
            : "bg-[#FA266D] text-white"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <div
          className={`flex items-center justify-end gap-1 mt-1 ${
            isOwnMessage ? "text-gray-500" : "text-pink-100"
          }`}
        >
          <span className="text-xs">{message.timestamp}</span>
          {isOwnMessage && <CheckCheck className="h-3 w-3" />}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-[#1F1B2C] overflow-hidden">
      {/* Left Sidebar - Chat List */}
      <div className="w-[360px] bg-[#1F1B2C] border-r border-white/10 flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white text-xl font-semibold">Messages</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewChatDialog(true)}
                className="bg-[#FA266D] hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                New Chat
              </button>
            <button className="text-[#FA266D] hover:text-pink-400 transition-colors">
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
          {loading && (!Array.isArray(rooms) || rooms.length > 0) ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA266D]"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-red-400 mb-2">{error}</p>
              <button
                onClick={() => refetchRooms()}
                className="px-4 py-2 bg-[#FA266D] text-white rounded-lg hover:bg-pink-600"
              >
                Retry
              </button>
            </div>
          ) : !Array.isArray(rooms) || rooms.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>No conversations yet</p>
              <p className="text-sm">Start a new conversation to begin chatting</p>
            </div>
          ) : (
            rooms.filter(room => room.id).map((room) => (
              <div
                key={room.id}
                onClick={() => {
                  console.log('Chat clicked, room ID:', room.id, 'full room:', room);
                  if (room.id) {
                    setSelectedChat(room.id);
                  } else {
                    console.error('Room has no ID:', room);
                  }
                }}
                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                  selectedChat === room.id ? "bg-white/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center relative">
                    <span className="text-gray-600 font-semibold text-sm">
                      {getRoomDisplayName(room).charAt(0).toUpperCase()}
                    </span>
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
                    {room.unreadCount && room.unreadCount > 0 && (
                      <div className="flex justify-end mt-1">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {room.unreadCount > 99 ? '99+' : room.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Section - Chat Area */}
      <div className="flex-1 bg-[#1F1B2C] flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#1F1B2C] border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackClick}
                  className="text-white hover:text-gray-300"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center relative">
                  <span className="text-gray-600 font-semibold text-sm">
                    {selectedChatData ? getRoomDisplayName(selectedChatData).charAt(0).toUpperCase() : '?'}
                  </span>
                  {/* Online status could be added here if available */}
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {selectedChatData ? getRoomDisplayName(selectedChatData) : 'Unknown'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {selectedChatData?.type === 'group' ? 'Group Chat' : 'Direct Message'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-white hover:text-gray-300">
                  <Video className="h-5 w-5" />
                </button>
                <button className="bg-[#FA266D] text-white px-4 py-2 rounded-lg text-sm font-medium">
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
                    <p className="text-lg mb-2 font-semibold">Error loading messages</p>
                    <p className="text-sm mb-4">
                      {('data' in messagesError && messagesError.data && typeof messagesError.data === 'object' && 'message' in messagesError.data)
                        ? String(messagesError.data.message)
                        : ('message' in messagesError ? String(messagesError.message) : 'Failed to load messages')}
                    </p>
                    {messagesError && typeof messagesError === 'object' && 'message' in messagesError && String(messagesError.message).includes('not a participant') && (
                      <p className="text-xs text-yellow-400 mb-4">
                        This might happen if the room was created with a different account. Try creating a new chat.
                      </p>
                    )}
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          console.log('[MessagesPage] Retrying messages fetch for room:', selectedChat);
                          refetchMessages();
                        }}
                        className="px-4 py-2 bg-[#FA266D] text-white rounded-lg hover:bg-pink-600"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() => {
                          console.log('[MessagesPage] Clearing selected chat due to error');
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
                  const uniqueKey = apiMessage.id || message.id || `msg-${index}-${apiMessage.createdAt || Date.now()}`;
                  
                  // Debug: Log message alignment
                  console.log('Rendering message:', {
                    id: message.id,
                    apiMessageId: apiMessage.id,
                    uniqueKey,
                    sender: message.sender,
                    isOwnMessage,
                    content: message.content?.substring(0, 20),
                    alignment: isOwnMessage ? 'right' : 'left'
                  });
                  
                  return (
                    <div
                      key={uniqueKey}
                      className={`flex w-full mb-3 ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className={`max-w-[70%] ${isOwnMessage ? "ml-auto" : "mr-auto"}`}>
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
                    if (e.key === 'Enter' && !e.shiftKey) {
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
          <div className="flex-1 flex items-center justify-center">
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
                {/* Plan 1 - Short Time Incall */}
                <div
                  onClick={() => handlePlanSelect("short-time")}
                  className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                    selectedPlan === "short-time"
                      ? "border-[#FA266D] bg-[#FA266D]/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  {/* <div className="flex items-center justify-between mb-2">
                    {selectedPlan === "short-incall" && (
                      <div className="w-6 h-6 bg-[#FA266D] rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div> */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-white text-[20px]">
                      Incall
                    </p>
                    <p className="text-[16px] font-medium text-white">
                      50,000.00 APH
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white text-[20px]">
                      Outcall
                    </p>
                    <p className="text-[16px] font-medium text-white">
                      70,000.00 APH
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
                  {/* <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg">
                      Short Time
                    </h3>
                    {selectedPlan === "short-outcall" && (
                      <div className="w-6 h-6 bg-[#FA266D] rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div> */}

                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-white text-[20px]">
                      Incall
                    </p>
                    <p className="text-[16px] font-medium text-white">
                      50,000.00 APH
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white text-[20px]">
                      Outcall
                    </p>
                    <p className="text-[16px] font-medium text-white">
                      70,000.00 APH
                    </p>
                  </div>

                  <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                    <span className="text-[24px] font-bold">Overnight</span>
                  </button>
                </div>

                {/* Plan 3 - Overnight Incall */}
                <div
                  onClick={() => handlePlanSelect("weekend")}
                  className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                    selectedPlan === "weekend"
                      ? "border-[#FA266D] bg-[#FA266D]/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  {/* <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg">
                      Overnight
                    </h3>
                    {selectedPlan === "overnight-incall" && (
                      <div className="w-6 h-6 bg-[#FA266D] rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div> */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-white text-[20px]">
                      Incall
                    </p>
                    <p className="text-[16px] font-medium text-white">---</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white text-[20px]">
                      Outcall
                    </p>
                    <p className="text-[16px] font-medium text-white">
                      70,000.00 APH
                    </p>
                  </div>

                  <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                    <span className="text-[24px] font-bold">Weekend</span>
                  </button>
                </div>

                {/* Plan 4 - Overnight Outcall */}
                <div
                  onClick={() => handlePlanSelect("custom-price")}
                  className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                    selectedPlan === "custom-price"
                      ? "border-[#FA266D] bg-[#FA266D]/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  {/* input price */}
                  <div className="relative">
                    {/* Briefcase inside input */}
                    <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />

                    <input
                      type="number"
                      placeholder="Input price here"
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
                  onClick={handleSendPricing}
                  disabled={!selectedPlan}
                  className={`flex-1 py-3 rounded-[40px] font-semibold transition-colors ${
                    selectedPlan
                      ? "bg-[#FA266D] text-white hover:bg-pink-600"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Send Pricing
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
              <h2 className="text-white text-xl font-semibold">Start New Conversation</h2>
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
                <p className="text-blue-400 text-sm">Loading user information...</p>
              </div>
            )}

            {!authLoading && !isAuthenticated && (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-sm">Please log in to start a chat</p>
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
                    if (e.key === 'Enter' && newChatUserId.trim() && !processingUserId) {
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
                    console.log('Start Chat button clicked, userId:', newChatUserId.trim());
                    handleStartNewChat();
                  }}
                  disabled={!newChatUserId.trim() || processingUserId === newChatUserId.trim() || authLoading || !isAuthenticated}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    newChatUserId.trim() && processingUserId !== newChatUserId.trim() && !authLoading && isAuthenticated
                      ? "bg-[#FA266D] text-white hover:bg-pink-600 cursor-pointer"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {authLoading ? "Loading..." : processingUserId === newChatUserId.trim() ? "Starting..." : "Start Chat"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}