"use client";

import { MapPin, Star, Users, Calendar as CalendarIcon, Check } from "lucide-react";

type ProfileHeaderProps = {
  profile: any;
  authUser: any;
};

export function ProfileHeader({ profile, authUser }: ProfileHeaderProps) {
  return (
    <div className="lg:w-2/3 space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
          {profile?.user?.userName || authUser?.username}
        </h1>
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MapPin className="w-[17.75px] h-[20.5px] text-[#FA266D] fill-[#FA266D]" />
            <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-black"></div>
          </div>
          <span className="text-[#FFFFFF99] text-[16px] font-normal sm:text-base">
            {authUser?.city && authUser?.state
              ? `${authUser.city}, ${authUser.state}`
              : authUser?.city || authUser?.state}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-[11.41px] h-[10.9px] ${
                  i < Math.floor(profile?.reviews?.stats?.averageRating || 0)
                    ? "text-[#FFDC18] fill-[#FFDC18]"
                    : "text-[#FFDC18]"
                }`}
              />
            ))}
          </div>
          <span className="text-white italic font-normal text-[14px] sm:text-base">
            {profile?.reviews?.stats?.averageRating
              ? profile.reviews.stats.averageRating.toFixed(1)
              : "0.0"}
          </span>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3 text-white">
        <p className="text-base sm:text-lg">{profile?.bio || "No bio available"}</p>
      </div>

      <div className="flex items-center gap-2">
        <CalendarIcon className="w-[24px] h-[24px] sm:w-5 sm:h-5 text-[#FFFFFF99]" />
        <span className="text-[#FFFFFF99] font-medium text-[15px] sm:text-base">
          Joined{" "}
          {profile?.createdAt
            ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "Unknown"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Users className="w-[24px] h-[24px] sm:w-5 sm:h-5 text-[#FFFFFF99]" />
        <span className="text-white text-[15px] font-black sm:text-base">
          {profile?.followersCount || 0}{" "}
          <span className="text-[#FFFFFF99] font-medium text-[15px] sm:text-base">
            Followers
          </span>
        </span>
        <span className="text-white/60 text-sm sm:text-base">•</span>
        <span className="text-white text-[15px] font-black sm:text-base">
          0{" "}
          <span className="text-[#FFFFFF99] font-medium text-[15px] sm:text-base">
            Following
          </span>
        </span>
      </div>
    </div>
  );
}
