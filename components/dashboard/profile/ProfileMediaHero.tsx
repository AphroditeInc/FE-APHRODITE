"use client";

import { Play } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

type ProfileMediaHeroProps = {
  profile: any;
  currentMediaIndex: number;
  setCurrentMediaIndex: Dispatch<SetStateAction<number>>;
};

export function ProfileMediaHero({
  profile,
  currentMediaIndex,
  setCurrentMediaIndex,
}: ProfileMediaHeroProps) {
  return (
    <div className="lg:w-1/3">
      <div className="relative">
        {profile?.media && Array.isArray(profile.media) && profile.media.length > 0 ? (
          <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-700 rounded-xl sm:rounded-2xl overflow-hidden relative">
            {(() => {
              const currentMedia = profile.media[currentMediaIndex] || profile.media[0];
              const isVideo = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(currentMedia);

              return isVideo ? (
                <video
                  src={currentMedia}
                  className="w-full h-full object-cover"
                  controls
                  key={currentMediaIndex}
                />
              ) : (
                <img
                  src={currentMedia}
                  alt={`Profile media ${currentMediaIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                  key={currentMediaIndex}
                />
              );
            })()}

            {profile.media.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                {currentMediaIndex + 1} / {profile.media.length}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-700 rounded-xl sm:rounded-2xl overflow-hidden">
            <img
              src="/images/intimate-couple.svg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {profile?.media && Array.isArray(profile.media) && profile.media.length > 1 && (
        <div className="flex justify-center gap-2 mt-3 sm:mt-4">
          {profile.media.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentMediaIndex(index)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all cursor-pointer ${
                index === currentMediaIndex
                  ? "bg-pink-500 w-6 sm:w-8"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to media ${index + 1}`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
}

