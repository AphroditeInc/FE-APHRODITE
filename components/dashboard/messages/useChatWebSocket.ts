"use client";

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ChatMessage } from "@/lib/types";

type UseChatWebSocketParams = {
  socket: any;
  socketConnected: boolean;
  selectedChat: string | null;
  setRealtimeMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  setRoomLastMessages: Dispatch<SetStateAction<Map<string, ChatMessage>>>;
  joinSocketRoom: (roomId: string) => void;
  leaveSocketRoom: (roomId: string) => void;
};

export function useChatWebSocket({
  socket,
  socketConnected,
  selectedChat,
  setRealtimeMessages,
  setRoomLastMessages,
  joinSocketRoom,
  leaveSocketRoom,
}: UseChatWebSocketParams) {
  useEffect(() => {
    if (!socket || !socketConnected) {
      return;
    }

    const handleNewMessage = (data: { message: ChatMessage }) => {
      const newMessage = data.message;

      if (newMessage.roomId) {
        setRoomLastMessages(prev => {
          const updated = new Map(prev);
          updated.set(newMessage.roomId as string, newMessage);
          return updated;
        });
      }

      if (selectedChat && newMessage.roomId === selectedChat) {
        setRealtimeMessages(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) {
            return prev.map(msg => (msg.id === newMessage.id ? newMessage : msg));
          }
          return [...prev, newMessage];
        });
      }
    };

    const handleMessageDelivered = (data: { tempId?: string; message: ChatMessage }) => {
      const deliveredMessage = data.message;

      if (deliveredMessage.roomId) {
        setRoomLastMessages(prev => {
          const updated = new Map(prev);
          updated.set(deliveredMessage.roomId as string, deliveredMessage);
          return updated;
        });
      }

      if (data.tempId) {
        setRealtimeMessages(prev => {
          const filtered = prev.filter(msg => msg.tempId !== data.tempId);
          return [...filtered, deliveredMessage];
        });
      } else {
        setRealtimeMessages(prev => {
          const exists = prev.some(msg => msg.id === deliveredMessage.id);
          if (exists) {
            return prev.map(msg => (msg.id === deliveredMessage.id ? deliveredMessage : msg));
          }
          return [...prev, deliveredMessage];
        });
      }
    };

    const handleRoomMessage = (data: { message: ChatMessage }) => {
      handleNewMessage(data);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDelivered", handleMessageDelivered);
    socket.on("roomMessage", handleRoomMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDelivered", handleMessageDelivered);
      socket.off("roomMessage", handleRoomMessage);
    };
  }, [socket, socketConnected, selectedChat, setRealtimeMessages, setRoomLastMessages]);

  useEffect(() => {
    if (!socket || !socketConnected) {
      return;
    }

    if (selectedChat) {
      joinSocketRoom(selectedChat);

      setRealtimeMessages(prev =>
        prev.filter(msg => msg.roomId === selectedChat)
      );
    }

    return () => {
      if (selectedChat && socket && socketConnected) {
        leaveSocketRoom(selectedChat);
      }
    };
  }, [socket, socketConnected, selectedChat, joinSocketRoom, leaveSocketRoom, setRealtimeMessages]);
}
