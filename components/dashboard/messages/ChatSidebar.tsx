"use client";

import { Search, Menu, Check } from "lucide-react";
import type { ChatRoom } from "@/lib/types";
import {
  ChatListSkeleton,
  ChatListItemSkeleton,
} from "@/components/ui/Skeleton";

type ChatSidebarProps = {
  rooms: ChatRoom[];
  loadingRooms: boolean;
  error: string | null;
  onRetry: () => void;
  selectedChatId: string | null;
  onSelectChat: (roomId: string) => void;
  participantNames: Map<string, string>;
  participantAvatars: Map<string, string>;
  currentUserId: string | null;
  extractParticipantId: (participant: any) => string | null;
  onCloseSidebar: () => void;
};

export function ChatSidebar({
  rooms,
  loadingRooms,
  error,
  onRetry,
  selectedChatId,
  onSelectChat,
  participantNames,
  participantAvatars,
  currentUserId,
  extractParticipantId,
  onCloseSidebar,
}: ChatSidebarProps) {
  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === "group") {
      return room.name || "Group Chat";
    }

    if (!currentUserId) {
      return "Direct Message";
    }

    if (room.participants && room.participants.length === 2) {
      const otherParticipant = room.participants.find(p => {
        const pId = extractParticipantId(p);
        return pId && pId !== currentUserId;
      });

      const otherParticipantId = otherParticipant
        ? extractParticipantId(otherParticipant)
        : null;

      if (
        otherParticipantId &&
        typeof otherParticipantId === "string" &&
        otherParticipantId !== "[object Object]" &&
        otherParticipantId.trim() !== ""
      ) {
        const cachedName = participantNames.get(otherParticipantId);
        if (cachedName) {
          return cachedName;
        }

        return `User ${otherParticipantId.slice(-8)}`;
      }
    }

    return "Direct Message";
  };

  const getLastMessagePreview = (room: ChatRoom) => {
    const message = room.lastMessage;

    if (!message || typeof message !== "object" || !("content" in message)) {
      return "No messages yet";
    }

    if (!message.content || message.content.trim() === "") {
      return "No messages yet";
    }

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

  return (
    <div className="w-full md:w-[360px] bg-[#1F1B2C] border-r border-white/10 flex flex-col h-full">
      <div className="p-6 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-xl font-semibold">Messages</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onCloseSidebar();
              }}
              className="text-[#FA266D] hover:text-pink-400 transition-colors cursor-pointer p-1 z-10 relative"
              aria-label="Close sidebar"
              type="button"
              style={{ pointerEvents: "auto" }}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

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

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loadingRooms ? (
          <div className="p-4">
            <ChatListSkeleton />
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={onRetry}
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
            .filter(room => room.id)
            .map(room => {
              const currentUserIdForRoom = currentUserId;

              if (room.type === "direct" && currentUserIdForRoom) {
                const otherParticipant = room.participants.find(p => {
                  const pId = extractParticipantId(p);
                  return pId && pId !== currentUserIdForRoom;
                });
                const otherParticipantId = otherParticipant
                  ? extractParticipantId(otherParticipant)
                  : null;

                const hasDisplayName =
                  otherParticipantId &&
                  typeof otherParticipantId === "string" &&
                  participantNames.has(otherParticipantId);

                if (!hasDisplayName) {
                  return <ChatListItemSkeleton key={room.id} />;
                }
              }

              return (
                <div
                  key={room.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (room.id) {
                        onSelectChat(room.id);
                      }
                    }
                  }}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (room.id) {
                      onSelectChat(room.id);
                    }
                  }}
                  className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                    selectedChatId === room.id ? "bg-white/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center relative overflow-hidden">
                      {(() => {
                        const otherParticipant = room.participants.find(p => {
                          const pId = extractParticipantId(p);
                          return pId && pId !== currentUserIdForRoom;
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
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-medium text-sm truncate">
                          {getRoomDisplayName(room)}
                        </h3>
                        <div className="flex items-center gap-2">
                          {room.lastMessage && (
                            <span className="text-gray-400 text-xs">
                              {room.lastMessage.createdAt
                                ? new Date(
                                    room.lastMessage.createdAt
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
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
              );
            })
        )}
      </div>
    </div>
  );
}
