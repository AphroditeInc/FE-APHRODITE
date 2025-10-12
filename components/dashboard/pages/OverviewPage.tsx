"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, MapPin, Heart, Check } from "lucide-react";
import { mockProfiles, type Profile } from "@/lib/data/profiles";


// Array of background images
const backgroundImages = [
  "/home/image.svg",
  "/home/image2.svg",
  "/home/image3.svg",
  "/home/image4.svg",
  "/home/image5.svg",
  "/home/image6.svg",
  "/home/image7.svg",
  "/home/image8.svg",
  "/home/image9.svg",
  "/home/image10.svg",
  "/home/image11.svg",
  "/home/image12.svg",
  "/home/image13.svg",
  "/home/image14.svg",
  "/home/image15.svg",
  "/home/image16.svg"
];

// Function to get random background image
const getRandomBackgroundImage = (index: number) => {
  return backgroundImages[index % backgroundImages.length];
};


export default function OverviewPage() {
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const router = useRouter();

  const handleLike = (profileId: string) => {
    setProfiles(prev => prev.map(profile => 
      profile.id === profileId 
        ? { ...profile, isLiked: !profile.isLiked }
        : profile
    ));
  };

  const handleCardClick = (profileId: string) => {
    router.push(`/profile/${profileId}`);
  };

  return (
    <div className="h-full bg-[#1F1B2C] overflow-y-auto">
      {/* Top Rated Divas/Hunks Section */}
      <section className="py-8">
        {/* Header */}
        <div className="px-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#FA266D]">
            Top Rated Divas/Hunks
          </h1>
        </div>

        {/* Profile Cards Horizontal Scroll Slider */}
        <div className="px-8 mb-12">
          <div className="relative">
            {/* Cards Container */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {profiles.map((profile, index) => (
                  <div key={profile.id} className="flex-shrink-0 w-80">
                    <div 
                      className="relative overflow-hidden group cursor-pointer aspect-[4/5] rounded-[20px]"
                      onClick={() => handleCardClick(profile.id)}
                    >
                      {/* Profile Image */}
                      <div className="relative w-full h-full">
                        <div 
                          className="w-full h-full rounded-[20px] overflow-hidden relative bg-cover bg-center"
                          style={{ backgroundImage: `url(${getRandomBackgroundImage(index)})` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                        
                        {/* Profile Info Overlay */}
                        <div className="absolute text-white bottom-4 left-4 right-4 rounded-2xl bg-white/[0.06] backdrop-blur-[40px] p-4">
                          {/* Name and Verification */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <h3 className="text-lg font-bold text-white mr-2">{profile.name}</h3>
                              <Check className="w-4 h-4 text-green-500" />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(profile.id);
                              }}
                              className="transition-colors"
                            >
                              <Heart 
                                className={`w-6 h-6 ${
                                  profile.isLiked ? 'text-[#FA266D] fill-current' : 'text-gray-400'
                                }`} 
                              />
                            </button>
                          </div>

                          {/* Location and Rating */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <span className="text-pink-500 mr-1">📍</span>
                              <p className="text-sm text-gray-200">{profile.location}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              <span className="text-sm font-medium text-gray-200">{profile.rating}</span>
                            </div>
                          </div>

                          {/* Service Tags */}
                          <div className="flex flex-wrap gap-1">
                            {profile.services.slice(0, 5).map((service, serviceIndex) => (
                              <span
                                key={serviceIndex}
                                className="px-2 py-1 border border-white text-white text-xs rounded-full"
                              >
                                {service}
                              </span>
                            ))}
                            <span className="px-2 py-1 text-white text-xs">
                              ...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore All Divas/Hunks Section */}
      <section className="px-8 pb-8">
        {/* Header */}
        <div className="text-left mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#FA266D] mb-4">
            Explore All Divas/Hunks
          </h2>
        </div>

        {/* Grid of Profile Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-[0px]:gap-4 min-[640px]:gap-6">
          {profiles.map((profile, index) => (
            <div key={profile.id} className="w-full min-w-[280px]">
              <div 
                className="relative overflow-hidden group cursor-pointer aspect-[4/5] rounded-[20px] min-h-[350px]"
                onClick={() => handleCardClick(profile.id)}
              >
              {/* Profile Image */}
              <div className="relative w-full h-full">
                <div 
                  className="w-full h-full rounded-[20px] overflow-hidden relative bg-cover bg-center"
                  style={{ backgroundImage: `url(${getRandomBackgroundImage(index)})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                
                {/* Profile Info Overlay */}
                <div className="absolute text-white bottom-4 left-4 right-4 rounded-2xl bg-white/[0.06] backdrop-blur-[40px] p-4">
                  {/* Name and Verification */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <h3 className="text-lg font-bold text-white mr-2">{profile.name}</h3>
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(profile.id);
                      }}
                      className="transition-colors"
                    >
                      <Heart 
                        className={`w-6 h-6 ${
                          profile.isLiked ? 'text-[#FA266D] fill-current' : 'text-gray-400'
                        }`} 
                      />
                    </button>
                  </div>

                  {/* Location and Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-pink-500 mr-1">📍</span>
                      <p className="text-sm text-gray-200">{profile.location}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-sm font-medium text-gray-200">{profile.rating}</span>
                    </div>
                  </div>

                  {/* Service Tags */}
                  <div className="flex flex-wrap gap-1">
                    {profile.services.slice(0, 5).map((service, serviceIndex) => (
                      <span
                        key={serviceIndex}
                        className="px-2 py-1 border border-white text-white text-xs rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                    <span className="px-2 py-1 text-white text-xs">
                      ...
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
