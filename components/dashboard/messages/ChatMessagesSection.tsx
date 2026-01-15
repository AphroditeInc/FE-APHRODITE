"use client";

import {
  CheckCheck,
  Image,
  MapPin,
  Mic,
  Play,
  Send,
} from "lucide-react";
import type { ChatMessage } from "@/lib/types";

type MessageSender = "me" | "other";
type MessageType = "text" | "audio" | "video" | "image" | "pricing";

type UIMessage = {
  id: string;
  sender: MessageSender;
  type: MessageType;
  content: string;
  timestamp: string;
  duration?: string;
  videoThumbnail?: string;
  pricing?: {
    shortTime: { incall: string; outcall: string };
    overnight: { incall: string; outcall: string };
  };
};

type ChatMessagesSectionProps = {
  messages: ChatMessage[];
  messagesLoading: boolean;
  messagesError: any;
  selectedChat: string | null;
  onRetry: () => void;
  onClearSelectedChat: () => void;
  currentUserId: string | null;
  messageInput: string;
  onChangeMessageInput: (value: string) => void;
  onSendMessage: (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => void;
  sending: boolean;
  canSharePricing: boolean;
  onSharePricing: () => void;
  onMediaClick: (type: "video" | "image", src: string, duration?: string) => void;
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export function ChatMessagesSection({
  messages,
  messagesLoading,
  messagesError,
  selectedChat,
  onRetry,
  onClearSelectedChat,
  currentUserId,
  messageInput,
  onChangeMessageInput,
  onSendMessage,
  sending,
  canSharePricing,
  onSharePricing,
  onMediaClick,
}: ChatMessagesSectionProps) {
  const convertToUIMessage = (apiMessage: ChatMessage): UIMessage => {
    const normalizeId = (
      id: string | { _id?: string; id?: string } | null | undefined
    ): string => {
      if (!id) return "";
      if (typeof id === "string") return id.trim();
      if (typeof id === "object" && id !== null) {
        return String(id._id || id.id || "").trim();
      }
      return String(id).trim();
    };

    const senderIdStr = normalizeId(apiMessage.senderId);
    const currentUserIdStr = normalizeId(currentUserId);

    const isOwn =
      senderIdStr !== "" &&
      currentUserIdStr !== "" &&
      senderIdStr === currentUserIdStr;

    let messageType: MessageType =
      apiMessage.type as MessageType;

    if (
      apiMessage.metadata &&
      typeof apiMessage.metadata === "object" &&
      (apiMessage.metadata as Record<string, unknown>).messageType === "pricing"
    ) {
      messageType = "pricing";
    }

    let pricingData: UIMessage["pricing"] | undefined;

    if (messageType === "pricing") {
      const meta = apiMessage.metadata as
        | {
            pricing?: {
              shortTime?: { incall?: string; outcall?: string };
              overnight?: { incall?: string; outcall?: string };
            };
          }
        | undefined;

      const metaPricing = meta?.pricing;

      pricingData = {
        shortTime: {
          incall:
            metaPricing?.shortTime?.incall ?? "50,000.00 APH",
          outcall:
            metaPricing?.shortTime?.outcall ?? "70,000.00 APH",
        },
        overnight: {
          incall:
            metaPricing?.overnight?.incall ?? "70,000.00 APH",
          outcall:
            metaPricing?.overnight?.outcall ?? "100,000.00 APH",
        },
      };
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
      pricing: pricingData,
    };
  };

  const renderMessage = (message: UIMessage) => {
    const isOwnMessage = message.sender === "me";

    if (message.type === "pricing") {
      const pricing = message.pricing || {
        shortTime: {
          incall: "50,000.00 APH",
          outcall: "70,000.00 APH",
        },
        overnight: {
          incall: "70,000.00 APH",
          outcall: "100,000.00 APH",
        },
      };

      return (
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-[20px] p-4 w-[317px] h-[180px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Incall</span>
                <span className="text-white font-semibold text-[20px]">
                  {pricing.shortTime.incall}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Outcall</span>
                <span className="text-white font-semibold text-[20px]">
                  {pricing.shortTime.outcall}
                </span>
              </div>
            </div>
            <button className="w-full bg-[#FA266D] text-white py-2 px-4 rounded-[30px] text-[20px] font-medium">
              Book short time
            </button>
          </div>

          <div className="bg-gray-800 rounded-[20px] p-4 w-[317px] h-[180px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Incall</span>
                <span className="text-white font-semibold text-[20px]">
                  {pricing.overnight.incall}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[20px]">Outcall</span>
                <span className="text-white font-semibold text-[20px]">
                  {pricing.overnight.outcall}
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
        <div
          className={`flex items-center gap-3 rounded-lg p-3 max-w-xs ${
            isOwnMessage ? "bg-white" : "bg-[#FA266D]"
          }`}
        >
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isOwnMessage ? "bg-gray-200" : "bg-white/20"
            }`}
          >
            <Play
              className={`h-4 w-4 ${
                isOwnMessage ? "text-gray-600" : "text-white"
              }`}
            />
          </button>
          <div className="flex-1">
            <div
              className={`w-32 h-2 rounded-full ${
                isOwnMessage ? "bg-gray-300" : "bg-white/30"
              }`}
            ></div>
            <div
              className={`flex justify-between text-xs mt-1 ${
                isOwnMessage ? "text-gray-500" : "text-white/80"
              }`}
            >
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
        <div
          className={`rounded-lg p-2 max-w-xs ${
            isOwnMessage ? "bg-white" : "bg-[#FA266D]/10"
          }`}
        >
          <div
            className="relative cursor-pointer"
            onClick={() =>
              onMediaClick(
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
                isOwnMessage ? "text-gray-500" : "text-white/80"
              }`}
            >
              {message.timestamp}
            </span>
            {isOwnMessage && <CheckCheck className="h-3 w-3 text-blue-500" />}
          </div>
        </div>
      );
    }

    if (message.type === "image") {
      return (
        <div
          className={`rounded-lg p-2 max-w-xs ${
            isOwnMessage ? "bg-white" : "bg-[#FA266D]/10"
          }`}
        >
          <div
            className="relative cursor-pointer"
            onClick={() =>
              onMediaClick("image", message.videoThumbnail || "")
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
                isOwnMessage ? "text-gray-500" : "text-white/80"
              }`}
            >
              {message.timestamp}
            </span>
            {isOwnMessage && <CheckCheck className="h-3 w-3 text-blue-500" />}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`rounded-lg p-3 max-w-xs ${
          isOwnMessage ? "bg-white text-gray-800" : "bg-[#FA266D] text-white"
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
    <>
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
                String(messagesError.message).includes("not a participant") && (
                  <p className="text-xs text-yellow-400 mb-4">
                    This might happen if the room was created with a different
                    account. Try creating a new chat.
                  </p>
                )}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-[#FA266D] text-white rounded-lg hover:bg-pink-600"
                >
                  Retry
                </button>
                <button
                  onClick={onClearSelectedChat}
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

            const uniqueKey =
              apiMessage.id ||
              message.id ||
              `msg-${index}-${apiMessage.createdAt || Date.now()}`;

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

      <div className="bg-[#1F1B2C]  p-4">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Write message..."
            value={messageInput}
            onChange={(e) => onChangeMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                onSendMessage(e);
              }
            }}
            className="bg-transparent text-white placeholder-gray-400 focus:outline-none flex-1 text-base rounded-[32px] border border-white/10 py-[18px] pl-[24px] w-full"
            disabled={sending}
          />

          <div className="flex items-center justify-end gap-3">
            {canSharePricing && (
              <button
                onClick={onSharePricing}
                className="text-[#FA266D] hover:text-pink-400 flex items-center gap-2 text-sm"
              >
                <MapPin className="h-4 w-4" />
                Share Pricing Plan
              </button>
            )}
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
                onSendMessage(e);
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
  );
}

