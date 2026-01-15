"use client";

import { ArrowLeft, Menu, MoreVertical, Video } from "lucide-react";
import type { ChatRoom } from "@/lib/types";

type ChatHeaderProps = {
  isSidebarOpen: boolean;
  onOpenSidebar: () => void;
  onBack: () => void;
  selectedChatData?: ChatRoom;
  getOtherParticipantId: () => string | null;
  participantAvatars: Map<string, string>;
  participantNames: Map<string, string>;
  onViewProfile: () => void;
};

export function ChatHeader({
  isSidebarOpen,
  onOpenSidebar,
  onBack,
  selectedChatData,
  getOtherParticipantId,
  participantAvatars,
  participantNames,
  onViewProfile,
}: ChatHeaderProps) {
  const otherParticipantId = getOtherParticipantId();
  const avatar =
    otherParticipantId && typeof otherParticipantId === "string"
      ? participantAvatars.get(otherParticipantId)
      : null;

  const getDisplayName = () => {
    if (!selectedChatData) {
      return "Unknown";
    }

    if (selectedChatData.type === "group") {
      return selectedChatData.name || "Group Chat";
    }

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

    return "Direct Message";
  };

  const displayName = getDisplayName();

  return (
    <div className="bg-[#1F1B2C] border-b border-white/10 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={onOpenSidebar}
            className="text-white hover:text-gray-300"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={onBack}
          className="text-white hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center relative overflow-hidden">
          {avatar ? (
            <img
              src={avatar}
              alt={
                selectedChatData ? displayName : "Chat avatar"
              }
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-semibold text-sm">
              {selectedChatData ? displayName.charAt(0).toUpperCase() : "?"}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-white font-medium">
            {selectedChatData ? displayName : "Unknown"}
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
          onClick={onViewProfile}
          disabled={!otherParticipantId}
          className="bg-[#FA266D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E91E63] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          View Profile
        </button>
        <button className="text-white hover:text-gray-300">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
