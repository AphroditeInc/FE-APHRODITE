"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  useGetUserRoomsQuery,
} from "@/app/api/apiSlice";
import type { ChatRoom, ChatMessage } from "@/lib/types";

type Participant =
  | string
  | {
      id?: string;
      _id?: string;
      userId?: string | { id?: string | number; _id?: string | number };
      firstName?: string;
      lastName?: string;
      username?: string;
      userName?: string;
      name?: string;
      stageName?: string;
      media?: string[];
      [key: string]: unknown;
    };

type UseMessagesRoomsParams = {
  currentUserId: string | null;
  authLoading: boolean;
};

type UseMessagesRoomsResult = {
  rooms: ChatRoom[];
  loadingRooms: boolean;
  roomsError: unknown;
  refetchRooms: () => void;
  participantNames: Map<string, string>;
  participantAvatars: Map<string, string>;
  setParticipantNames: Dispatch<SetStateAction<Map<string, string>>>;
  setParticipantAvatars: Dispatch<SetStateAction<Map<string, string>>>;
  roomLastMessages: Map<string, ChatMessage>;
  setRoomLastMessages: Dispatch<SetStateAction<Map<string, ChatMessage>>>;
};

const extractParticipantId = (participant: Participant | null | undefined): string | null => {
  if (participant === null || participant === undefined) {
    return null;
  }

  if (typeof participant === "string") {
    if (participant === "[object Object]" || participant.trim() === "") {
      return null;
    }
    return participant;
  }

  if (typeof participant === "number" && !isNaN(participant)) {
    return String(participant);
  }

  if (typeof participant === "boolean") {
    return null;
  }

  if (participant && typeof participant === "object") {
    if ("userId" in participant && participant.userId) {
      const userIdValue = participant.userId;

      if (typeof userIdValue === "object" && userIdValue !== null) {
        const userIdObj = userIdValue as { id?: string | number; _id?: string | number };
        const id = userIdObj._id || userIdObj.id;
        if (typeof id === "string" && id.trim() !== "" && id !== "[object Object]") {
          return id;
        }
        if (typeof id === "number" && !isNaN(id)) {
          return String(id);
        }
      }

      if (typeof userIdValue === "string") {
        if (userIdValue === "[object Object]" || userIdValue.trim() === "") {
          return null;
        }
        return userIdValue;
      }
    }

    const directId = (participant as { id?: unknown; _id?: unknown }).id ?? (participant as { id?: unknown; _id?: unknown })._id;
    if (typeof directId === "string") {
      if (directId === "[object Object]" || directId.trim() === "") {
        return null;
      }
      return directId;
    }
    if (typeof directId === "number" && !isNaN(directId)) {
      return String(directId);
    }
    if (directId && typeof directId === "object") {
      const nested = directId as { id?: string | number; _id?: string | number };
      const nestedId = nested.id ?? nested._id;
      if (typeof nestedId === "string" && nestedId.trim() !== "" && nestedId !== "[object Object]") {
        return nestedId;
      }
      if (typeof nestedId === "number" && !isNaN(nestedId)) {
        return String(nestedId);
      }
    }
  }

  try {
    if (typeof participant !== "object") {
      const str = String(participant);
      if (str === "[object Object]" || str.trim() === "") {
        return null;
      }
      return str;
    }
  } catch {
    return null;
  }

  return null;
};

export function useMessagesRooms({
  currentUserId,
  authLoading,
}: UseMessagesRoomsParams): UseMessagesRoomsResult {
  const {
    data: roomsData,
    isLoading: loadingRooms,
    error: roomsError,
    refetch: refetchRooms,
  } = useGetUserRoomsQuery(
    { limit: 50, offset: 0 },
    { skip: !currentUserId || authLoading }
  );

  const [participantNames, setParticipantNames] = useState<Map<string, string>>(new Map());
  const [participantAvatars, setParticipantAvatars] = useState<Map<string, string>>(new Map());
  const [roomLastMessages, setRoomLastMessages] = useState<Map<string, ChatMessage>>(new Map());
  const [participantLoadingIds, setParticipantLoadingIds] = useState<Set<string>>(new Set());

  const rooms = useMemo(() => {
    if (!roomsData) {
      return [];
    }

    let roomsArray: ChatRoom[] = [];

    if (Array.isArray(roomsData)) {
      roomsArray = roomsData;
    } else {
      return [];
    }

    const transformedRooms = roomsArray
      .map((room: any) => {
        const roomId = room.roomId || room._id || room.id;
        if (!roomId) {
          return null;
        }

        const participants: string[] = [];
        const participantNamesFromRoom: Map<string, string> = new Map();

        if (room.participants && Array.isArray(room.participants)) {
          room.participants.forEach((p: any) => {
            const participantId = extractParticipantId(p);
            if (
              participantId &&
              typeof participantId === "string" &&
              !participants.includes(participantId)
            ) {
              participants.push(participantId);

              if (p && typeof p === "object") {
                const name =
                  (p.firstName && p.lastName
                    ? `${p.firstName} ${p.lastName}`.trim()
                    : p.firstName || p.lastName || p.username || p.name) ||
                  null;

                if (name && typeof name === "string") {
                  participantNamesFromRoom.set(participantId, name);
                }
              }
            }
          });
        }

        if (participantNamesFromRoom.size > 0) {
          setParticipantNames(prev => {
            const next = new Map(prev);
            participantNamesFromRoom.forEach((name, id) => {
              if (!next.has(id)) {
                next.set(id, name);
              }
            });
            return next;
          });
        }

        let lastMessage: ChatMessage | undefined;
        if (room.lastMessage) {
          if (typeof room.lastMessage === "object" && room.lastMessage !== null) {
            const msg = room.lastMessage;
            const messageId = msg._id || msg.id;
            if (messageId && typeof messageId === "string") {
              let senderId = "";
              if (typeof msg.senderId === "string") {
                senderId = msg.senderId;
              } else if (msg.senderId && typeof msg.senderId === "object") {
                const sender = msg.senderId as { id?: string | number; _id?: string | number };
                const id = sender._id ?? sender.id;
                if (typeof id === "string") {
                  senderId = id;
                } else if (typeof id === "number" && !isNaN(id)) {
                  senderId = String(id);
                }
              }

              let receiverId = "";
              if (typeof msg.receiverId === "string") {
                receiverId = msg.receiverId;
              } else if (msg.receiverId && typeof msg.receiverId === "object") {
                const receiver = msg.receiverId as { id?: string | number; _id?: string | number };
                const id = receiver._id ?? receiver.id;
                if (typeof id === "string") {
                  receiverId = id;
                } else if (typeof id === "number" && !isNaN(id)) {
                  receiverId = String(id);
                }
              }

              lastMessage = {
                id: messageId,
                senderId,
                receiverId,
                roomId: msg.roomId || roomId,
                content: msg.content || "",
                type: (msg.type || "text") as ChatMessage["type"],
                status: (msg.status || "sent") as ChatMessage["status"],
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

        const wsLastMessage = roomLastMessages.get(roomId);
        const finalLastMessage = wsLastMessage || lastMessage;

        const chatRoom: ChatRoom = {
          id: roomId,
          roomId: roomId,
          type: (room.type || "direct") as ChatRoom["type"],
          participants: participants,
          createdAt: room.createdAt || new Date().toISOString(),
          updatedAt: room.updatedAt || new Date().toISOString(),
          lastMessage: finalLastMessage,
          unreadCount: room.unreadCount || 0,
        };

        return chatRoom;
      })
      .filter((room): room is ChatRoom => room !== null);

    const deduplicatedRooms = transformedRooms.reduce((acc, room) => {
      const participantKey = [...room.participants].sort().join("_");

      const existingRoom = acc.find(r => {
        const existingKey = [...r.participants].sort().join("_");
        return existingKey === participantKey;
      });

      if (existingRoom) {
        const existingIndex = acc.indexOf(existingRoom);
        const existingDate = new Date(existingRoom.updatedAt).getTime();
        const newDate = new Date(room.updatedAt).getTime();

        if (newDate > existingDate) {
          acc[existingIndex] = room;
        }
      } else {
        acc.push(room);
      }

      return acc;
    }, [] as ChatRoom[]);

    return deduplicatedRooms;
  }, [roomsData, roomLastMessages]);

  useEffect(() => {
    if (!roomsData || !Array.isArray(roomsData)) return;

    const roomsNeedingLastMessage = roomsData
      .filter((room: any) => {
        const roomId = room.roomId || room._id || room.id;
        return room.lastMessage && typeof room.lastMessage === "string" && roomId;
      })
      .slice(0, 5);

    if (roomsNeedingLastMessage.length === 0) return;

    const fetchLastMessages = async () => {
      const promises = roomsNeedingLastMessage.map(async (room: any) => {
        const roomId = room.roomId || room._id || room.id;
        if (!roomId) return;

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://be-aphrodite-8wrp.onrender.com"}/chat/rooms/${roomId}/messages?limit=1`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const messages = data?.data || data || [];
            if (Array.isArray(messages) && messages.length > 0) {
              const lastMsg = messages[messages.length - 1];
              const normalizedMessage: ChatMessage = {
                id: lastMsg._id || lastMsg.id || "",
                senderId:
                  typeof lastMsg.senderId === "string"
                    ? lastMsg.senderId
                    : lastMsg.senderId?._id || lastMsg.senderId?.id || "",
                receiverId:
                  typeof lastMsg.receiverId === "string"
                    ? lastMsg.receiverId
                    : lastMsg.receiverId?._id || lastMsg.receiverId?.id || "",
                roomId: lastMsg.roomId || roomId,
                content: lastMsg.content || "",
                type: (lastMsg.type || "text") as ChatMessage["type"],
                status: (lastMsg.status || "sent") as ChatMessage["status"],
                createdAt: lastMsg.createdAt || new Date().toISOString(),
                updatedAt: lastMsg.updatedAt || new Date().toISOString(),
                metadata: lastMsg.metadata,
                attachments: lastMsg.attachments || [],
                readAt: lastMsg.readAt,
                deliveredAt: lastMsg.deliveredAt,
                replyTo: lastMsg.replyTo,
              };

              setRoomLastMessages(prev => {
                const updated = new Map(prev);
                updated.set(roomId, normalizedMessage);
                return updated;
              });
            }
          }
        } catch {
        }
      });

      await Promise.all(promises);
    };

    fetchLastMessages();
  }, [roomsData]);

  const fetchParticipantName = async (normalizedId: string): Promise<void> => {
    if (
      !normalizedId ||
      typeof normalizedId !== "string" ||
      normalizedId === "[object Object]"
    ) {
      return;
    }

    if (participantNames.has(normalizedId)) {
      return;
    }

    if (participantLoadingIds.has(normalizedId)) {
      return;
    }

    setParticipantLoadingIds(prev => {
      const next = new Set(prev);
      next.add(normalizedId);
      return next;
    });

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
          const user = profile.user;
          const name =
            (user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`.trim()
              : user?.firstName || user?.lastName) ||
            user?.userName ||
            (profile.firstName && profile.lastName
              ? `${profile.firstName} ${profile.lastName}`.trim()
              : profile.firstName ||
                profile.lastName ||
                profile.username ||
                profile.userName ||
                profile.stageName) ||
            null;

          let avatar: string | null = null;
          if (profile.media && Array.isArray(profile.media) && profile.media.length > 0) {
            const validMedia = profile.media.find(
              (url: string) => url !== "string" && url.startsWith("http")
            );
            if (validMedia) {
              avatar = validMedia;
            }
          }

          if (name) {
            setParticipantNames(prev => {
              const newMap = new Map(prev);
              newMap.set(normalizedId, name);
              return newMap;
            });
          }

          if (avatar) {
            setParticipantAvatars(prev => {
              const newMap = new Map(prev);
              newMap.set(normalizedId, avatar);
              return newMap;
            });
          }
        }
      } else if (response.status === 404) {
        const fallbackName =
          normalizedId && typeof normalizedId === "string"
            ? `User ${normalizedId.slice(-8)}`
            : null;

        if (fallbackName) {
          setParticipantNames(prev => {
            const newMap = new Map(prev);
            newMap.set(normalizedId, fallbackName);
            return newMap;
          });
        }
      }
    } catch {
    } finally {
      setParticipantLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(normalizedId);
        return next;
      });
    }
  };

  useEffect(() => {
    if (!currentUserId) return;
    if (!Array.isArray(rooms) || rooms.length === 0) return;

    const idsToFetch = new Set<string>();

    rooms.forEach(room => {
      if (!room.participants || room.type !== "direct") return;

      const otherParticipant = room.participants.find(p => {
        const pId = extractParticipantId(p as any);
        return pId && pId !== currentUserId;
      });

      const otherParticipantId = otherParticipant
        ? extractParticipantId(otherParticipant as any)
        : null;

      if (
        otherParticipantId &&
        typeof otherParticipantId === "string" &&
        otherParticipantId.trim() !== "" &&
        !participantNames.has(otherParticipantId)
      ) {
        idsToFetch.add(otherParticipantId);
      }
    });

    if (idsToFetch.size === 0) return;

    const fetchAll = async () => {
      await Promise.all(
        Array.from(idsToFetch).map(id => fetchParticipantName(id).catch(() => undefined))
      );
    };

    fetchAll();
  }, [rooms, currentUserId, participantNames]);

  return {
    rooms,
    loadingRooms,
    roomsError,
    refetchRooms,
    participantNames,
    participantAvatars,
    setParticipantNames,
    setParticipantAvatars,
    roomLastMessages,
    setRoomLastMessages,
  };
}
