"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, MapPin, Heart, Check } from "lucide-react";
import { useListProfilesQuery } from "@/feature/profile/profileApiSlice";
import type { EnrichedProfile } from "@/lib/types/auth.types";
import { ProfileListSkeleton } from "@/components/ui/Skeleton";


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
  const router = useRouter();
  const [selectedUserType, setSelectedUserType] = useState<'hunk' | 'diva'>('diva'); // Default to 'diva'
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  
  // Fetch profiles from API with type filter (API requires 'type' parameter)
  const { data: profilesResponse, isLoading, error, refetch } = useListProfilesQuery({
    type: selectedUserType, // Always pass type: 'diva' or 'hunk'
    limit: 50, // Adjust as needed
  });

  // Debug logging
  useEffect(() => {
    console.log('=== OverviewPage Debug ===');
    console.log('selectedUserType:', selectedUserType);
    console.log('isLoading:', isLoading);
    console.log('error:', error);
    console.log('profilesResponse:', profilesResponse);
  }, [selectedUserType, isLoading, error, profilesResponse]);

  // Map API response to display format
  const profiles = useMemo(() => {
    if (!profilesResponse) {
      return [];
    }
    
    // RTK Query returns the response directly
    // API response format: { success: true, items: [...] } - items is at top level!
    let profilesList: EnrichedProfile[] = [];
    
    try {
      // Check if response has success and items fields (actual API response format)
      if (profilesResponse && typeof profilesResponse === 'object' && 'success' in profilesResponse) {
        const response = profilesResponse as { success: boolean; items?: unknown; data?: unknown };
        
        // Check for top-level 'items' field first (actual API structure)
        if (response.success && 'items' in response && Array.isArray(response.items)) {
          profilesList = response.items as EnrichedProfile[];
        }
        // Fallback: Check if data is an array (direct array response)
        else if (response.success && response.data && Array.isArray(response.data)) {
          profilesList = response.data as EnrichedProfile[];
        } 
        // Fallback: Check if data has items property (nested paginated response)
        else if (response.success && response.data && typeof response.data === 'object' && 'items' in response.data) {
          const paginatedData = response.data as { items: EnrichedProfile[] };
          profilesList = Array.isArray(paginatedData.items) ? paginatedData.items : [];
        }
      } 
      // If response is directly an array (fallback)
      else if (Array.isArray(profilesResponse)) {
        profilesList = profilesResponse as EnrichedProfile[];
      }
      // If response has items directly (another fallback)
      else if (profilesResponse && typeof profilesResponse === 'object' && 'items' in profilesResponse) {
        const items = (profilesResponse as { items: unknown }).items;
        if (Array.isArray(items)) {
          profilesList = items as EnrichedProfile[];
        }
      }
      // If response.data exists directly (another fallback)
      else if (profilesResponse && typeof profilesResponse === 'object' && 'data' in profilesResponse) {
        const data = (profilesResponse as { data: unknown }).data;
        if (Array.isArray(data)) {
          profilesList = data as EnrichedProfile[];
        }
      }
    } catch (err) {
      console.error('Error parsing profiles response:', err);
      return [];
    }
    
    return profilesList.map((profile: EnrichedProfile) => {
      // Get first media item or use placeholder
      const profileImage = profile.media && profile.media.length > 0 
        ? profile.media[0] 
        : '/images/intimate-couple.svg';
      
      // Get services as array of strings
      const services = profile.services 
        ? (Array.isArray(profile.services) 
            ? profile.services.map(s => typeof s === 'string' ? s : (s.name || s.id || ''))
            : [])
        : [];
      
      return {
        id: profile.id,
        name: profile.user?.userName || profile.user?.firstName || 'Unknown',
        location: profile.city && profile.state 
          ? `${profile.city}, ${profile.state}` 
          : profile.city || profile.state || 'Location not specified',
        rating: profile.reviews?.stats?.averageRating || 0,
        image: profileImage,
        isOnline: false, // API doesn't provide this yet
        isLiked: likedProfiles.has(profile.id),
        services: services.filter((s): s is string => s !== ''),
        age: undefined, // Calculate from dob if available
        bio: profile.bio || '',
        gender: profile.gender,
        ethnicity: profile.ethnicity,
        sexualOrientation: profile.sexualOrientation,
        bustSize: profile.bustSize,
        nationality: profile.nationality,
        bodyBuild: profile.bodyBuild,
        looks: profile.looks,
        smoker: profile.smoker ? 'Yes' : 'No',
        education: profile.education,
        state: profile.state,
        occupation: profile.occupation,
        country: profile.nationality,
        city: profile.city,
        joinedDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : undefined,
        followers: profile.followersCount || 0,
        following: 0, // API doesn't provide this yet
        lastSeen: undefined, // API doesn't provide this yet
      };
    });
  }, [profilesResponse, likedProfiles]);

  const handleLike = (profileId: string) => {
    setLikedProfiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(profileId)) {
        newSet.delete(profileId);
      } else {
        newSet.add(profileId);
      }
      return newSet;
    });
  };

  const handleCardClick = (profileId: string) => {
    router.push(`/profile/${profileId}`);
  };

  return (
    <div className="h-full bg-[#1F1B2C] overflow-y-auto">
      {/* Top Rated Divas/Hunks Section */}
      <section className="py-8">
        {/* Header with Filters */}
        <div className="px-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-[#FA266D]">
              Top Rated Divas/Hunks
            </h1>
            
            {/* User Type Filter */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUserType('diva')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedUserType === 'diva' || selectedUserType === undefined
                    ? 'bg-[#FA266D] text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Divas
              </button>
              <button
                onClick={() => setSelectedUserType('hunk')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedUserType === 'hunk'
                    ? 'bg-[#FA266D] text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Hunks
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="px-8 py-12">
            <ProfileListSkeleton count={6} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="px-8 py-12 text-center">
            <div className="text-red-500">Error loading profiles. Please try again.</div>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-[#FA266D] text-white rounded-lg hover:bg-[#E91E63] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && profiles.length === 0 && (
          <div className="px-8 py-12 text-center">
            <div className="text-white/60">No profiles found.</div>
          </div>
        )}

        {/* Profile Cards Horizontal Scroll Slider */}
        {!isLoading && !error && profiles.length > 0 && (
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
                          style={{ backgroundImage: `url(${profile.image || getRandomBackgroundImage(index)})` }}
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
                          {profile.services && profile.services.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {profile.services.slice(0, 5).map((service, serviceIndex) => (
                                <span
                                  key={serviceIndex}
                                  className="px-2 py-1 border border-white text-white text-xs rounded-full"
                                >
                                  {service}
                                </span>
                              ))}
                              {profile.services.length > 5 && (
                                <span className="px-2 py-1 text-white text-xs">
                                  +{profile.services.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
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
        {!isLoading && !error && profiles.length > 0 && (
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
                  style={{ backgroundImage: `url(${profile.image || getRandomBackgroundImage(index)})` }}
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
                  {profile.services && profile.services.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.services.slice(0, 5).map((service, serviceIndex) => (
                        <span
                          key={serviceIndex}
                          className="px-2 py-1 border border-white text-white text-xs rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                      {profile.services.length > 5 && (
                        <span className="px-2 py-1 text-white text-xs">
                          +{profile.services.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
