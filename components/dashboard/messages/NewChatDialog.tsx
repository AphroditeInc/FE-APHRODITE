"use client";

import { X } from "lucide-react";

type NewChatDialogProps = {
  open: boolean;
  authLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  processingUserId: string | null;
  newChatUserId: string;
  onChangeUserId: (value: string) => void;
  onStartChat: () => void;
  onClose: () => void;
};

export function NewChatDialog({
  open,
  authLoading,
  isAuthenticated,
  error,
  processingUserId,
  newChatUserId,
  onChangeUserId,
  onStartChat,
  onClose,
}: NewChatDialogProps) {
  if (!open) return null;

  const canStartChat =
    newChatUserId.trim() &&
    processingUserId !== newChatUserId.trim() &&
    !authLoading &&
    isAuthenticated;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1F1B2C] rounded-lg p-6 w-full max-w-md mx-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-semibold">
            Start New Conversation
          </h2>
          <button
            onClick={onClose}
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
            <label className="block text-gray-300 text-sm mb-2">User ID</label>
            <input
              type="text"
              value={newChatUserId}
              onChange={e => onChangeUserId(e.target.value)}
              placeholder="Enter user ID to start chatting"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA266D]"
              onKeyPress={e => {
                if (e.key === "Enter" && newChatUserId.trim() && !processingUserId) {
                  e.preventDefault();
                  onStartChat();
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
              onClick={onClose}
              className="flex-1 bg-white/10 text-white py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onStartChat();
              }}
              disabled={!canStartChat}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                canStartChat
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
  );
}

