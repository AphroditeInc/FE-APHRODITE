"use client";

import { ArrowLeft, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useEnrichedProfile } from "@/lib/hooks/useEnrichedProfile";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProfilePageSkeleton } from "@/components/ui/Skeleton";
import { ProfileHeader } from "@/components/dashboard/profile/ProfileHeader";
import { ProfileMediaHero } from "@/components/dashboard/profile/ProfileMediaHero";
import { ProfileAboutGrid } from "@/components/dashboard/profile/ProfileAboutGrid";
import { ProfileMediaGrid } from "@/components/dashboard/profile/ProfileMediaGrid";
import { ProfileEditModal } from "@/components/dashboard/profile/ProfileEditModal";
import { ProfileMediaUploadModal } from "@/components/dashboard/profile/ProfileMediaUploadModal";

export default function ClientProfilePage() {
  const { user: authUser } = useAuth();
  const { profile, loading, error, refetch } = useEnrichedProfile(authUser?.id || null);
  const [activeTab, setActiveTab] = useState<"About" | "Media">("About");
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  useEffect(() => {
    if (profile?.media && Array.isArray(profile.media) && profile.media.length > 1) {
      const mediaLength = profile.media.length;
      const interval = setInterval(() => {
        setCurrentMediaIndex(prevIndex => (prevIndex + 1) % mediaLength);
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setCurrentMediaIndex(0);
    }
  }, [profile?.media]);

  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [profile?.id]);

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1F1B2C] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error loading profile</div>
          <div className="text-white/80 mb-4">{error}</div>
          <button
            onClick={refetch}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#1F1B2C] flex items-center justify-center">
        <div className="text-white text-xl">No profile data available</div>
      </div>
    );
  }

  const handlePrimaryActionClick = () => {
    if (activeTab === "Media") {
      setIsMediaModalOpen(true);
    } else {
      setIsEditModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1B2C]">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <button className="flex items-center gap-2 text-white hover:text-pink-300 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Back</span>
        </button>
        <button
          onClick={handlePrimaryActionClick}
          className="hover:bg-pink-600 text-white px-3 sm:px-4 py-2 rounded-full flex items-center gap-1 sm:gap-2 border-[1px] border-white/10 text-sm sm:text-base cursor-pointer"
        >
          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">
            {activeTab === "Media" ? "Add Media" : "Edit Profile"}
          </span>
          <span className="sm:hidden">{activeTab === "Media" ? "Add" : "Edit"}</span>
        </button>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 pb-6">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <ProfileMediaHero
            profile={profile}
            currentMediaIndex={currentMediaIndex}
            setCurrentMediaIndex={setCurrentMediaIndex}
          />
          <ProfileHeader profile={profile} authUser={authUser} />
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 pb-4 sm:pb-6">
        <div className="flex space-x-4 sm:space-x-8 border-b border-white/20 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("About")}
            className={`pb-3 sm:pb-4 px-1 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap cursor-pointer ${
              activeTab === "About"
                ? "text-[#FA266D] border-b-2 border-[#FA266D]"
                : "text-white/60 hover:text-white"
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab("Media")}
            className={`pb-3 sm:pb-4 px-1 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap cursor-pointer ${
              activeTab === "Media"
                ? "text-[#FA266D] border-b-2 border-[#FA266D]"
                : "text-white/60 hover:text-white"
            }`}
          >
            Media
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 pb-4 sm:pb-6">
        {activeTab === "About" && <ProfileAboutGrid profile={profile} authUser={authUser} />}

        {activeTab === "Media" && <ProfileMediaGrid profile={profile} />}
      </div>

      <ProfileEditModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        authUser={authUser}
        onUpdated={refetch}
      />

      <ProfileMediaUploadModal
        open={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        profile={profile}
        authUser={authUser}
        onUpdated={refetch}
      />
    </div>
  );
}
