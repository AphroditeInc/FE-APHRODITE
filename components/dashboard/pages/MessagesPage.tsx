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
  receiverId: string;
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
  const shouldSkipQuery = !currentUserId || authLoading;
  
  console.log('[MessagesPage] Query state:', {
    currentUserId,
    userId,
    'user?.id': user?.id,
    fallbackUserId,
    authLoading,
    shouldSkipQuery,
    isAuthenticated
  });
  
  // Use getUserRooms instead of getConversations to get ALL rooms (including newly created ones without messages)
  const { data: roomsData, isLoading: loadingRooms, error: roomsError, refetch: refetchRooms } = useGetUserRoomsQuery(
    { limit: 50, offset: 0 },
    { skip: shouldSkipQuery }
  );
  
  console.log('[MessagesPage] Query result:', {
    roomsData,
    loadingRooms,
    roomsError,
    hasRoomsData: !!roomsData,
    roomsDataIsArray: Array.isArray(roomsData),
    roomsDataLength: Array.isArray(roomsData) ? roomsData.length : 'not array'
  });
  
  const { data: messagesData, isLoading: loadingMessages, refetch: refetchMessages } = useGetRoomMessagesQuery(
    { roomId: selectedChat || '', query: { limit: 50 } },
    { skip: !selectedChat }
  );
  
  const [markRoomAsReadMutation] = useMarkRoomAsReadMutation();
  const [sendMessageMutation, { isLoading: sending }] = useSendMessageMutation();
  const [createRoomMutation] = useCreateRoomMutation();

  // Convert API data to component state
  const rooms = useMemo(() => {
    if (!roomsData) {
      console.log('[MessagesPage] No roomsData yet');
      return [];
    }
    
    console.log('[MessagesPage] roomsData:', roomsData);
    
    // transformResponse should have extracted the data, so roomsData should be an array of ChatRoom[]
    // But we need to handle it as ConversationResponse for transformation
    let roomsArray: (ConversationResponse | ChatRoom)[] = [];
    
    if (Array.isArray(roomsData)) {
      roomsArray = roomsData;
    } else if (roomsData && typeof roomsData === 'object') {
      // Fallback: Check if it's ApiResponse format with 'data' field
      if ('data' in roomsData && Array.isArray((roomsData as { data: (ConversationResponse | ChatRoom)[] }).data)) {
        roomsArray = (roomsData as { data: (ConversationResponse | ChatRoom)[] }).data;
      } else if ('success' in roomsData && 'data' in roomsData && Array.isArray((roomsData as { success: boolean; data: (ConversationResponse | ChatRoom)[] }).data)) {
        roomsArray = (roomsData as { success: boolean; data: (ConversationResponse | ChatRoom)[] }).data;
      }
    }
    
    if (!Array.isArray(roomsArray)) {
      console.warn('[MessagesPage] roomsArray is not an array:', roomsArray);
      return [];
    }
    
    console.log('[MessagesPage] Processing', roomsArray.length, 'rooms');
    
    // Transform rooms to ChatRoom format
    // Handle both formats: conversations (with sender/receiver) and rooms (with participants array)
    const filteredRooms = roomsArray.map((conv: ConversationResponse | ChatRoom) => {
      console.log('[MessagesPage] Processing room item:', conv);
      
      // If it's already a ChatRoom, ensure it has an id property
      // RTK Query returns frozen objects, so we must create a new object
      if ('participants' in conv && Array.isArray(conv.participants) && 'type' in conv && (conv.type === 'direct' || conv.type === 'group')) {
        const room = conv as ChatRoom;
        // Extract id from various possible fields
        const roomId = room.id || room.roomId || (room as { _id?: string })._id || '';
        
        if (!roomId) {
          console.warn('[MessagesPage] ChatRoom has no id/roomId/_id, skipping:', room);
          return null;
        }
        
        // Create a new object (can't modify frozen RTK Query objects)
        const normalizedRoom: ChatRoom = {
          ...room,
          id: roomId,
          roomId: roomId,
        };
        
        console.log('[MessagesPage] Room already ChatRoom format, normalized:', normalizedRoom);
        return normalizedRoom;
      }
      
      // Otherwise, treat it as ConversationResponse and transform
      const convResponse = conv as ConversationResponse;
      // Try multiple ways to get the room ID
      const roomId = convResponse.roomId 
        || (convResponse as { _id?: string })._id 
        || (convResponse as { id?: string }).id
        || (conv as { roomId?: string; _id?: string; id?: string }).roomId
        || (conv as { roomId?: string; _id?: string; id?: string })._id
        || (conv as { roomId?: string; _id?: string; id?: string }).id;
      
      console.log('[MessagesPage] Extracted roomId:', roomId, 'from conv:', conv);
      if (!roomId) {
        console.warn('[MessagesPage] No roomId found, skipping room:', conv);
        return null;
      }

      const participants: string[] = [];
      
      // Handle conversations format (has sender/receiver)
      if (convResponse.sender && convResponse.sender._id) {
        participants.push(convResponse.sender._id);
      }
      if (convResponse.receiver && convResponse.receiver._id) {
        participants.push(convResponse.receiver._id);
      }
      
      // Handle room format (has participants array with userId)
      if (convResponse.participants && Array.isArray(convResponse.participants)) {
        convResponse.participants.forEach((p: string | ConversationParticipant) => {
          const participantId = typeof p === 'string' 
            ? p 
            : (p.userId || p._id || p.id);
          if (participantId && typeof participantId === 'string' && !participants.includes(participantId)) {
            participants.push(participantId);
          }
        });
      }

      let lastMessage: ChatMessage | undefined;
      if (convResponse.lastMessage) {
        const messageId = convResponse.lastMessage._id || convResponse.lastMessage.id;
        // Only create lastMessage if we have a valid id
        if (messageId && typeof messageId === 'string') {
          lastMessage = {
            id: messageId,
            senderId: convResponse.lastMessage.senderId,
            receiverId: convResponse.lastMessage.receiverId || '',
            roomId: convResponse.lastMessage.roomId || roomId,
            content: convResponse.lastMessage.content,
            type: convResponse.lastMessage.type as ChatMessage['type'],
            status: convResponse.lastMessage.status as ChatMessage['status'],
            createdAt: convResponse.lastMessage.createdAt,
            updatedAt: convResponse.lastMessage.updatedAt,
            metadata: convResponse.lastMessage.metadata,
            attachments: convResponse.lastMessage.attachments,
            readAt: convResponse.lastMessage.readAt,
            deliveredAt: convResponse.lastMessage.deliveredAt,
            replyTo: convResponse.lastMessage.replyTo,
          };
        }
      }

      const chatRoom: ChatRoom = {
        id: roomId,
        roomId: roomId,
        type: (convResponse.type as ChatRoom['type']) || 'direct',
        participants: participants,
        createdAt: convResponse.createdAt || new Date().toISOString(),
        updatedAt: convResponse.updatedAt || new Date().toISOString(),
        lastMessage: lastMessage,
        unreadCount: typeof convResponse.unreadCount === 'number' ? convResponse.unreadCount : 0,
      };
      
      console.log('[MessagesPage] Transformed room:', chatRoom);
      return chatRoom;
    }).filter((room): room is ChatRoom => {
      const isValid = Boolean(room !== null && typeof room.id === 'string' && room.id.trim() !== '');
      if (!isValid) {
        console.warn('[MessagesPage] Filtered out invalid room:', room);
      }
      return isValid;
    });
    
    console.log('[MessagesPage] Transformed', filteredRooms.length, 'rooms');
    console.log('[MessagesPage] Final rooms array:', filteredRooms);
    filteredRooms.forEach((room, index) => {
      console.log(`[MessagesPage] Room ${index}:`, { id: room.id, roomId: room.roomId, type: room.type, participants: room.participants });
    });
    return filteredRooms;
  }, [roomsData]);

  const messages = useMemo(() => {
    if (!messagesData) return [];
    
    // transformResponse should have extracted the data, so messagesData should be an array
    // But handle both cases for safety
    let messagesArray: ChatMessage[] = [];
    
    if (Array.isArray(messagesData)) {
      messagesArray = messagesData;
    } else if (messagesData && typeof messagesData === 'object') {
      // Fallback: Check if it's ApiResponse format with 'data' field
      if ('data' in messagesData && Array.isArray((messagesData as { data: ChatMessage[] }).data)) {
        messagesArray = (messagesData as { data: ChatMessage[] }).data;
      } else if ('success' in messagesData && 'data' in messagesData && Array.isArray((messagesData as { success: boolean; data: ChatMessage[] }).data)) {
        messagesArray = (messagesData as { success: boolean; data: ChatMessage[] }).data;
      } else {
        // Fallback to old structure
        const messagesResponse = messagesData as MessagesResponse;
        if (Array.isArray(messagesResponse.messages)) {
          messagesArray = messagesResponse.messages;
        } else if (Array.isArray(messagesResponse.data)) {
          messagesArray = messagesResponse.data;
        } else if (Array.isArray(messagesResponse.items)) {
          messagesArray = messagesResponse.items;
        }
      }
    }
    
    // Create a copy of the array before sorting (RTK Query returns frozen arrays)
    // Sort messages by createdAt (oldest first)
    return [...messagesArray].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
  }, [messagesData]);

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
    console.log('Creating room with targetUserId:', targetUserId, 'current user:', currentUserId);

    try {
      const result = await createRoomMutation({
        type: 'direct',
        participants: [currentUserId, targetUserId],
      }).unwrap();

      console.log('Room created successfully:', result);
      
      if (result) {
        // transformResponse should have extracted the data, so result should be the ChatRoom object directly
        // But handle both cases for safety
        let roomData: ChatRoom | null = null;
        
        if (result && typeof result === 'object') {
          if ('data' in result && result.data && typeof result.data === 'object') {
            // Fallback: if still wrapped in ApiResponse
            roomData = result.data as ChatRoom;
          } else if ('roomId' in result || 'id' in result || '_id' in result) {
            // Direct room object (from transformResponse)
            roomData = result as ChatRoom;
          }
        }
        
        if (roomData) {
          // Use roomId from the response (API returns roomId, not id)
          const roomId = roomData.roomId || roomData.id || (roomData as { _id?: string })._id;
          console.log('[createRoomWithUser] Room created, roomId:', roomId, 'roomData:', roomData);
          if (roomId) {
            setSelectedChat(roomId);
            router.replace('/chat');
            // Force immediate refetch - RTK Query should auto-refetch due to invalidatesTags
            // But we'll also manually refetch multiple times to ensure it updates
            console.log('[createRoomWithUser] Refetching rooms...');
            refetchRooms();
            // Also refetch after a short delay to ensure cache is updated
            setTimeout(() => {
              console.log('[createRoomWithUser] Delayed refetch...');
              refetchRooms();
            }, 500);
            setTimeout(() => {
              console.log('[createRoomWithUser] Final refetch...');
              refetchRooms();
            }, 1000);
          } else {
            console.error('[createRoomWithUser] No roomId found in response:', roomData);
          }
        } else {
          console.error('[createRoomWithUser] Invalid room data in response:', result);
        }
      }
      
      setProcessingUserId(null);
    } catch (err: unknown) {
      console.error('Error creating room:', err);
      const errorMsg = (err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data)
        ? String(err.data.message)
        : (err && typeof err === 'object' && 'message' in err)
          ? String(err.message)
          : 'An error occurred while creating the chat room.';
      
      // Check if error is about invalid MongoDB ObjectId
      if (errorMsg.includes('mongodb id') || errorMsg.includes('ObjectId')) {
        setInvalidUserIds(prev => new Set(prev).add(targetUserId));
        router.replace('/chat');
      }
      
      setProcessingUserId(null);
      throw new Error(errorMsg);
    }
  }, [currentUserId, processingUserId, invalidUserIds, router, createRoomMutation, refetchRooms]);

  // Extract participant names from rooms data
  useEffect(() => {
    if (roomsData && Array.isArray(roomsData)) {
      const namesToAdd = new Map<string, string>();
      roomsData.forEach((conv: ConversationResponse | ChatRoom) => {
        // If it's already a ChatRoom, skip (no sender/receiver info, names should come from participant data)
        if ('participants' in conv && Array.isArray(conv.participants) && 'type' in conv && (conv.type === 'direct' || conv.type === 'group')) {
          // For ChatRoom, we can't extract names here - they need to be fetched separately
          return;
        }
        
        // Otherwise, treat as ConversationResponse
        const convResponse = conv as ConversationResponse;
        // Handle conversations format (sender/receiver)
        if (convResponse.sender && convResponse.sender._id && convResponse.sender.name) {
          namesToAdd.set(convResponse.sender._id, convResponse.sender.name);
        }
        if (convResponse.receiver && convResponse.receiver._id && convResponse.receiver.name) {
          namesToAdd.set(convResponse.receiver._id, convResponse.receiver.name);
        }
        // Handle room format (participants array)
        if (convResponse.participants && Array.isArray(convResponse.participants)) {
          convResponse.participants.forEach((p: string | ConversationParticipant) => {
            const participantId = typeof p === 'string' ? p : (p.userId || p._id || p.id);
            const participantName = typeof p === 'object' && p !== null ? (p.name || p.firstName || p.username) : null;
            if (participantId && typeof participantId === 'string' && participantName && typeof participantName === 'string') {
              namesToAdd.set(participantId, participantName);
            }
          });
        }
      });
      
      if (namesToAdd.size > 0) {
        setParticipantNames(prev => {
          const newMap = new Map(prev);
          namesToAdd.forEach((name, id) => {
            newMap.set(id, name);
          });
          return newMap;
        });
      }
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

  // Mark room as read when selected
  // NOTE: Disabled because the API endpoint expects messageIds in the request body
  // The endpoint `/chat/rooms/{roomId}/read` requires a body with messageIds array
  // Uncomment and update if the API is fixed to accept just roomId or if we have messageIds
  /*
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      // If API requires messageIds, we would need to pass them:
      // const messageIds = messages.map(m => m.id);
      // markRoomAsReadMutation({ roomId: selectedChat, messageIds }).catch(err => {
      //   console.error('Error marking room as read:', err);
      // });
      
      // For now, disabled to avoid API errors
      console.log('Room selected:', selectedChat, '- Mark as read disabled');
    }
  }, [selectedChat, markRoomAsReadMutation, messages]);
  */

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

    if (!receiverId && room.type === 'direct') {
      console.error('Receiver ID not found for direct message');
      return;
    }

    try {
      const result = await sendMessageMutation({
        receiverId: receiverId,
        content: messageInput.trim(),
        type: 'text',
        tempId: `temp_${Date.now()}`,
      }).unwrap();

      if (result) {
        // transformResponse should have extracted the data, so result should be the ChatMessage object directly
        // But handle both cases for safety
        const messageData = (result && typeof result === 'object' && 'data' in result && result.data)
          ? result.data as ChatMessage
          : (result as ChatMessage);
        
        const sentMessage = {
          ...messageData,
          senderId: currentUserId, // Ensure senderId is set correctly
        };
        
        console.log('Message sent successfully:', sentMessage);
        setMessageInput('');
        
        // RTK Query will automatically refetch messages and rooms due to invalidatesTags
        // But we can also manually refetch to ensure immediate update
        setTimeout(() => {
          refetchMessages();
          refetchRooms();
        }, 300);
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
    
    console.log('handleStartNewChat called with userId:', targetUserId, 'currentUserId:', currentUserId, 'authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'fallbackUserId:', fallbackUserId);
    
    if (!targetUserId) {
      console.error('No userId provided');
      setError('Please enter a user ID');
      return;
    }

    if (authLoading) {
      console.log('Auth still loading, waiting...');
      setError('Please wait for authentication to complete');
      return;
    }

    if (!isAuthenticated || !currentUserId) {
      console.error('User not authenticated or not loaded');
      setError('Please log in to start a chat');
      return;
    }

    if (processingUserId === targetUserId) {
      console.log('Already processing this userId');
      return;
    }

    console.log('Starting new chat with userId:', targetUserId, 'current user:', currentUserId);
    setShowNewChatDialog(false);
    setError(null); // Clear any previous errors
    
    // Use the existing createRoomWithUser function
    try {
      await createRoomWithUser(targetUserId);
      setNewChatUserId("");
    } catch (err) {
      console.error('Error in handleStartNewChat:', err);
      setError('Failed to start chat. Please try again.');
      setShowNewChatDialog(true); // Reopen dialog on error
    }
  };

  const selectedChatData = rooms.find((room) => room.id === selectedChat);
  
  // Helper functions for data transformation
  const formatTime = (dateString: string | undefined | null) => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('[formatTime] Invalid date string:', dateString);
      return '';
    }
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
    const currentUserId = userId || user?.id || fallbackUserId;
    const isOwnMessage = message.senderId === currentUserId;
    const prefix = isOwnMessage ? 'You : ' : '';
    
    if (message.type === 'text') {
      const content = message.content || '';
      const preview = content.length > 30 
        ? `${content.substring(0, 30)}...` 
        : content;
      return `${prefix}${preview}`;
    } else if (message.type === 'image') {
      return `${prefix}📷 Image`;
    } else if (message.type === 'file') {
      return `${prefix}📎 File`;
    } else if (message.type === 'video') {
      return `${prefix}🎥 Video`;
    } else if (message.type === 'audio') {
      return `${prefix}🎵 Audio`;
    }
    return `${prefix}Message`;
  };
  
  // Get participant profile image URL (would need to fetch from user profile)
  const getParticipantImage = (room: ChatRoom): string | null => {
    // TODO: Fetch actual profile images from user profiles
    // For now, return null to show initials
    return null;
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
          {loadingRooms && (!Array.isArray(rooms) || rooms.length === 0) ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA266D]"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-red-400 mb-2">{error}</p>
              <button
                onClick={() => {
                  console.log('[MessagesPage] Manual refetch triggered');
                  refetchRooms();
                }}
                className="px-4 py-2 bg-[#FA266D] text-white rounded-lg hover:bg-pink-600"
              >
                Retry
              </button>
            </div>
          ) : !Array.isArray(rooms) || rooms.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>No conversations yet</p>
              <p className="text-sm">Start a new conversation to begin chatting</p>
              <p className="text-xs mt-2 text-gray-500">
                Debug: roomsData={roomsData ? JSON.stringify(roomsData).substring(0, 100) : 'null'}, 
                rooms.length={rooms.length}, 
                loadingRooms={String(loadingRooms)}
              </p>
            </div>
          ) : (
            rooms.filter(room => {
              const hasId = room && room.id && room.id.trim() !== '';
              if (!hasId) {
                console.warn('[MessagesPage] Filtering out room without id:', room);
              }
              return hasId;
            }).map((room) => {
              console.log('[MessagesPage] Rendering room:', room.id, room);
              return (
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
                  {getParticipantImage(room) ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={getParticipantImage(room)!}
                        alt={getRoomDisplayName(room)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-800 font-semibold text-sm">
                        {getRoomDisplayName(room).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-white font-semibold text-sm truncate">
                        {getRoomDisplayName(room)}
                      </h3>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {room.lastMessage?.createdAt ? (
                          <span className="text-gray-400 text-xs whitespace-nowrap">
                            {formatTime(room.lastMessage.createdAt)}
                          </span>
                        ) : room.createdAt ? (
                          <span className="text-gray-400 text-xs whitespace-nowrap">
                            {formatTime(room.createdAt)}
                          </span>
                        ) : null}
                        <CheckCheck className="h-3 w-3 text-gray-400" />
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
              );
            })
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
