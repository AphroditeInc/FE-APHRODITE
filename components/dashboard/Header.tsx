"use client";

import { Search, Filter, MessageCircle, Bell, LogOut, Wallet, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthProfile, useEnrichedProfile } from "@/lib/hooks";
import { useMemo, useState, useEffect } from "react";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const { user, loading } = useAuthProfile();
  const { profile: enrichedProfile } = useEnrichedProfile(user?.id || null);
  const [imageError, setImageError] = useState(false);
  
  // Get profile picture from enriched profile media, or fallback to User icon
  const profilePicture = useMemo(() => {
    if (!enrichedProfile?.media || !Array.isArray(enrichedProfile.media)) {
      return null;
    }
    // Filter out placeholder values and get first valid image URL
    const validMedia = enrichedProfile.media.filter(
      (url) => typeof url === 'string' &&
               url.trim() !== '' &&
               url !== 'string' &&
               (url.startsWith('http://') || url.startsWith('https://'))
    );
    return validMedia.length > 0 ? validMedia[0] : null;
  }, [enrichedProfile]);
  
  // Reset image error when profile picture changes
  useEffect(() => {
    setImageError(false);
  }, [profilePicture]);

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    // Redirect to home page
    router.push('/');
  };

  return (
    <nav className="bg-[#2A243E] h-[60px] sm:h-[80px] px-3 sm:px-6 py-2 sm:py-4">
      <div className="flex mx-auto items-center justify-between">
        {/* Search Bar - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-4 pl-[80px]">
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

        {/* Mobile Menu Button and Search - Show on mobile */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Hamburger Menu Button - Only show if onMenuToggle is provided */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
            >
              <Menu className="h-5 w-5 text-[#FA266D]" />
            </button>
          )}
          
          <div className="flex items-center bg-white/10 rounded-lg px-3 py-2 min-w-[150px]">
            <Search className="h-4 w-4 text-[#FA266D] mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-white placeholder-gray-400 focus:outline-none flex-1 text-sm"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4 pr-0 sm:pr-[80px]">
          {/* Message Icon */}
          <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#FA266D]" />
          </button>

          {/* Notification Bell */}
          <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-[#FA266D]" />
          </button>

          {/* Balance Display - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-lg px-3 sm:px-4 py-2">
            <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
            <span className="text-white font-medium text-sm sm:text-base">6000.00 APH</span>
          </div>

          {/* User Profile and Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Info - Hidden on mobile */}
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-white text-sm font-medium">
                  {user.firstName} {user.lastName}
                </span>
              </div>
            )}
            
            {/* Profile Picture */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 transition-colors cursor-pointer overflow-hidden bg-white/10">
              {loading ? (
                <div className="w-full h-full animate-pulse bg-gray-700/50 rounded-full" />
              ) : profilePicture && !imageError ? (
                <img 
                  src={profilePicture} 
                  alt={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Profile'} 
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </div>
            
            {/* Logout Button - Hidden on mobile */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 text-[#FA266D] hover:text-pink-400 transition-colors"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium text-sm">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
