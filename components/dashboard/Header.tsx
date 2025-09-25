"use client";

import { Search, Filter, MessageCircle, Bell, LogOut, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    // Redirect to home page
    router.push('/');
  };

  return (
    <nav className="bg-[#2A243E]  h-[80px] px-6 py-4">
      <div className="flex  mx-auto items-center justify-between">
        {/* Search Bar */}
        <div className="flex items-center gap-4 pl-[80px]">
          <div className="relative">
            <div className="flex items-center bg-white/10 rounded-lg px-4 py-2 min-w-[400px]">
              <Search className="h-5 w-5 text-[#FA266D] mr-3" />
              <input
                type="text"
                placeholder="Search for anything here..."
                className="bg-transparent text-white placeholder-gray-400 focus:outline-none flex-1"
              />
              <button className="ml-3 text-[#FA266D] hover:text-pink-400 transition-colors">
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Red Dot Indicator */}
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4 pr-[80px]">
          {/* Message Icon */}
          <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
            <MessageCircle className="h-5 w-5 text-[#FA266D]" />
          </button>

          {/* Notification Bell */}
          <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
            <Bell className="h-5 w-5 text-[#FA266D]" />
          </button>

          {/* Balance Display */}
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
            <Wallet className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-medium">6000.00 APH</span>
          </div>

          {/* User Profile and Logout */}
          <div className="flex items-center gap-3">
            {/* Profile Picture */}
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-gray-800 font-bold text-sm">U</span>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[#FA266D] hover:text-pink-400 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
