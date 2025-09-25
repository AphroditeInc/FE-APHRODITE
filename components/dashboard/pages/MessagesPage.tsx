"use client";

import { Search, Menu, Check, Inbox, ArrowLeft, Video, MoreVertical, Play, MapPin, Image, Mic, Send, CheckCheck } from "lucide-react";
import { useState } from "react";

interface Chat {
  id: string;
  name: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  avatarBg: string;
  isRead: boolean;
  isOnline: boolean;
}

interface Message {
  id: string;
  sender: 'me' | 'other';
  type: 'text' | 'audio' | 'video' | 'pricing';
  content: string;
  timestamp: string;
  duration?: string;
  videoThumbnail?: string;
  pricing?: {
    shortTime: { incall: string; outcall: string };
    overnight: { incall: string; outcall: string };
  };
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "Jakob Saris",
    username: "@jakob01",
    lastMessage: "You: Sure! let me tell you about w...",
    timestamp: "01:25",
    avatar: "J",
    avatarBg: "bg-orange-500",
    isRead: true,
    isOnline: false
  },
  {
    id: "2", 
    name: "Jared",
    username: "@jared01",
    lastMessage: "Check me out 🥰, let me know if you like what you see",
    timestamp: "12:25",
    avatar: "J",
    avatarBg: "bg-white",
    isRead: true,
    isOnline: true
  },
  {
    id: "3",
    name: "Jared",
    lastMessage: "You: Sure! let me tell you about w...",
    timestamp: "01:25",
    avatar: "J",
    avatarBg: "bg-white",
    isRead: true,
    isOnline: false
  },
  {
    id: "4",
    name: "Jared",
    lastMessage: "You: Sure! let me tell you about w...",
    timestamp: "01:25",
    avatar: "J",
    avatarBg: "bg-white",
    isRead: true,
    isOnline: false
  },
  {
    id: "5",
    name: "Jared",
    lastMessage: "You: Sure! let me tell you about w...",
    timestamp: "01:25",
    avatar: "J",
    avatarBg: "bg-white",
    isRead: true,
    isOnline: false
  },
  {
    id: "6",
    name: "Jared",
    lastMessage: "You: Sure! let me tell you about w...",
    timestamp: "01:25",
    avatar: "J",
    avatarBg: "bg-white",
    isRead: true,
    isOnline: false
  },
  {
    id: "7",
    name: "Jared",
    lastMessage: "You: Sure! let me tell you about w...",
    timestamp: "01:25",
    avatar: "J",
    avatarBg: "bg-white",
    isRead: true,
    isOnline: false
  },
  {
    id: "8",
    name: "Jared",
    lastMessage: "You: Sure! let me tell you about w...",
    timestamp: "01:25",
    avatar: "J",
    avatarBg: "bg-white",
    isRead: true,
    isOnline: false
  },
  {
    id: "9",
    name: "Jared",
    lastMessage: "You: Sure! let me tell you about w...",
    timestamp: "01:25",
    avatar: "J",
    avatarBg: "bg-white",
    isRead: true,
    isOnline: false
  },
  {
    id: "10",
    name: "Jared",
    lastMessage: "You: Sure! let me tell you about w...",
    timestamp: "01:25",
    avatar: "J",
    avatarBg: "bg-white",
    isRead: true,
    isOnline: false
  }
];

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "me",
    type: "audio",
    content: "Audio message",
    timestamp: "12:25",
    duration: "02:12"
  },
  {
    id: "2",
    sender: "me",
    type: "text",
    content: "I like what I'm seeing already baby 🥰",
    timestamp: "12:25"
  },
  {
    id: "3",
    sender: "me",
    type: "text",
    content: "Can't wait to hit that coochie 🍆🍑 What's your rate for ST and overnight dear 😉",
    timestamp: "12:25"
  },
  {
    id: "4",
    sender: "other",
    type: "video",
    content: "Video message",
    timestamp: "12:25",
    duration: "00:25",
    videoThumbnail: "/api/placeholder/200/150"
  },
  {
    id: "5",
    sender: "other",
    type: "text",
    content: "Check me out 🥰, let me know if you like what you see Trust me, I will do you well 😈💋",
    timestamp: "12:25"
  },
  {
    id: "6",
    sender: "other",
    type: "pricing",
    content: "Pricing options",
    timestamp: "12:25",
    pricing: {
      shortTime: { incall: "50,000.00 APH", outcall: "70,000.00 APH" },
      overnight: { incall: "70,000.00 APH", outcall: "100,000.00 APH" }
    }
  },
  {
    id: "7",
    sender: "other",
    type: "text",
    content: "Let me know the one you want before you proceed to pay",
    timestamp: "12:25"
  }
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>("2");
  const [messageInput, setMessageInput] = useState("");

  const handleBackClick = () => {
    setSelectedChat(null);
  };

  const selectedChatData = mockChats.find(chat => chat.id === selectedChat);

  const renderMessage = (message: Message) => {
    if (message.type === 'pricing' && message.pricing) {
      return (
        <div className="space-y-3">
          {/* Short Time Card */}
          <div className="bg-gray-800 rounded-lg p-4 max-w-xs">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Incall</span>
                <span className="text-white font-semibold">50,000.00 APH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Outcall</span>
                <span className="text-white font-semibold">70,000.00 APH</span>
              </div>
              <button className="w-full bg-[#FA266D] text-white py-2 px-4 rounded-lg text-sm font-medium">
                Book short time
              </button>
            </div>
          </div>
          
          {/* Overnight Card */}
          <div className="bg-gray-800 rounded-lg p-4 max-w-xs">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Incall</span>
                <span className="text-white font-semibold">70,000.00 APH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Outcall</span>
                <span className="text-white font-semibold">100,000.00 APH</span>
              </div>
              <button className="w-full bg-[#FA266D] text-white py-2 px-4 rounded-lg text-sm font-medium">
                Book overnight
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'audio') {
      return (
        <div className="flex items-center gap-3 bg-white rounded-lg p-3 max-w-xs">
          <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <Play className="h-4 w-4 text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="w-32 h-2 bg-gray-300 rounded-full"></div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{message.duration}</span>
              <span>01:25</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CheckCheck className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-gray-500">Sent</span>
          </div>
        </div>
      );
    }

    if (message.type === 'video') {
      return (
        <div className="bg-white rounded-lg p-2 max-w-xs">
          <div className="relative">
            <div className="w-48 h-32 bg-gray-300 rounded-lg flex items-center justify-center">
              <Play className="h-8 w-8 text-gray-600" />
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {message.duration}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{message.timestamp}</span>
            <CheckCheck className="h-3 w-3 text-blue-500" />
          </div>
        </div>
      );
    }

    return (
      <div className={`rounded-lg p-3 max-w-xs ${
        message.sender === 'me' 
          ? 'bg-white text-gray-800' 
          : 'bg-[#FA266D] text-white'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 ${
          message.sender === 'me' ? 'text-gray-500' : 'text-pink-100'
        }`}>
          <span className="text-xs">{message.timestamp}</span>
          {message.sender === 'me' && <CheckCheck className="h-3 w-3" />}
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
            <button className="text-[#FA266D] hover:text-pink-400 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
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
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                selectedChat === chat.id ? 'bg-white/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={`w-12 h-12 ${chat.avatarBg} rounded-full flex items-center justify-center relative`}>
                  <span className="text-gray-800 font-semibold text-sm">{chat.avatar}</span>
                  {chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1F1B2C]"></div>
                  )}
                </div>
                
                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-medium text-sm truncate">{chat.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">{chat.timestamp}</span>
                      <Check className="h-3 w-3 text-[#FA266D]" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs truncate">{chat.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
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
                <div className={`w-10 h-10 ${selectedChatData?.avatarBg} rounded-full flex items-center justify-center relative`}>
                  <span className="text-gray-800 font-semibold text-sm">{selectedChatData?.avatar}</span>
                  {selectedChatData?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1F1B2C]"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium">{selectedChatData?.name}</h3>
                  <p className="text-gray-400 text-sm">{selectedChatData?.username}</p>
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
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-start' : 'justify-end'}`}
                >
                  {renderMessage(message)}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-[#1F1B2C] border-t border-white/10 p-4">
              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  Share Pricing Plan
                </button>
                <div className="flex-1 flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
                  <input
                    type="text"
                    placeholder="Write message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="bg-transparent text-white placeholder-gray-400 focus:outline-none flex-1"
                  />
                  <button className="text-gray-400 hover:text-white">
                    <Image className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-white">
                    <Mic className="h-5 w-5" />
                  </button>
                  <button className="bg-[#FA266D] text-white p-2 rounded-lg">
                    <Send className="h-4 w-4" />
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
                  <div className="absolute inset-2 rounded-full bg-[#FA266D]/30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute inset-4 rounded-full bg-[#FA266D]/40 animate-pulse" style={{ animationDelay: '1s' }}></div>
                  
                  {/* Inbox Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Inbox className="h-12 w-12 text-[#FA266D]" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-white text-xl font-semibold mb-2">Continue chatting</h2>
              <p className="text-gray-400 text-sm">Click on any chats to continue chatting with them.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
