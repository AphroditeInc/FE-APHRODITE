"use client";

import { Play } from "lucide-react";

type ProfileMediaGridProps = {
  profile: any;
};

export function ProfileMediaGrid({ profile }: ProfileMediaGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-pink-500">Media</h3>
        <div className="text-white/60 text-sm">
          {profile?.media?.length || 0} {profile?.media?.length === 1 ? "item" : "items"}
        </div>
      </div>

      {profile && profile.media && Array.isArray(profile.media) && profile.media.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.media.map((mediaUrl: string, index: number) => {
            const isVideo = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(mediaUrl);

            return (
              <div key={index} className="relative group cursor-pointer">
                <div
                  className="aspect-square rounded-2xl overflow-hidden bg-cover bg-center bg-gray-700"
                  style={{
                    backgroundImage: mediaUrl ? `url(${mediaUrl})` : "none",
                  }}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>

                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                      </div>
                    </div>
                  )}

                  <div className="absolute top-2 right-2">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isVideo ? "bg-red-500/80 text-white" : "bg-blue-500/80 text-white"
                      }`}
                    >
                      {isVideo ? "VIDEO" : "IMAGE"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-white/60 text-lg mb-4">No media available</div>
          <div className="text-white/40 text-sm">
            This user hasn&apos;t uploaded any media yet.
          </div>
        </div>
      )}
    </div>
  );
}

