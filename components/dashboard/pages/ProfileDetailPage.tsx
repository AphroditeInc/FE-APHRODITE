"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Star, Check, Users, Calendar as CalendarIcon, Heart, BookOpen, MessageCircle, UserPlus, Info, Coins, Play, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import { type Profile } from "@/lib/data/profiles";
import { useGetProfileByIdQuery } from "@/feature/profile/profileApiSlice";
import type { EnrichedProfile } from "@/lib/types/auth.types";
import { ProfileDetailSkeleton } from "@/components/ui/Skeleton";

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

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("About");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Fetch profile from API
  const { data: profileResponse, isLoading, error } = useGetProfileByIdQuery(profileId, {
    skip: !profileId,
  });

  // Extract EnrichedProfile from response
  const enrichedProfile = useMemo<EnrichedProfile | null>(() => {
    if (!profileResponse) return null;

    // Handle API response structure: { success: true, data: EnrichedProfile } or direct EnrichedProfile
    if (profileResponse && typeof profileResponse === 'object') {
      if ('success' in profileResponse && profileResponse.success && 'data' in profileResponse) {
        return profileResponse.data as EnrichedProfile;
      } else if ('id' in profileResponse) {
        return profileResponse as EnrichedProfile;
      }
    }

    return null;
  }, [profileResponse]);

  // Map EnrichedProfile to Profile type
  const profile = useMemo<Profile | null>(() => {
    if (!enrichedProfile) return null;

    // Get first valid media item or use placeholder
    // Filter out placeholder strings like "string" and empty strings
    // Only keep valid HTTP/HTTPS URLs
    const validMedia = enrichedProfile.media 
      ? enrichedProfile.media.filter(
          (url) => typeof url === 'string' && 
                   url.trim() !== '' && 
                   url !== 'string' && 
                   (url.startsWith('http://') || url.startsWith('https://'))
        )
      : [];
    const profileImage = validMedia.length > 0 
      ? validMedia[0] 
      : '/images/intimate-couple.svg';
    
    // Get services as array of strings from services field (NOT servicesExpanded)
    // Deduplicate services array
    const servicesArray = enrichedProfile.services 
      ? (Array.isArray(enrichedProfile.services) 
          ? enrichedProfile.services.map(s => typeof s === 'string' ? s : (s.name || s.id || ''))
          : [])
      : [];
    
    // Remove duplicates and filter out empty strings
    const uniqueServices = Array.from(new Set(servicesArray.filter((s): s is string => s !== '')));

    return {
      id: enrichedProfile.id,
      name: enrichedProfile.user?.userName || enrichedProfile.user?.firstName || 'Unknown',
      location: enrichedProfile.city && enrichedProfile.state 
        ? `${enrichedProfile.city}, ${enrichedProfile.state}` 
        : enrichedProfile.city || enrichedProfile.state || 'Location not specified',
      rating: enrichedProfile.reviews?.stats?.averageRating || 0,
      image: profileImage,
      isOnline: false, // API doesn't provide this yet
      isLiked: isLiked, // Use state for like status
      services: uniqueServices,
      age: undefined, // Calculate from dob if available
      bio: enrichedProfile.bio || '',
      gender: enrichedProfile.gender,
      ethnicity: enrichedProfile.ethnicity,
      sexualOrientation: enrichedProfile.sexualOrientation,
      bustSize: enrichedProfile.bustSize,
      nationality: enrichedProfile.nationality,
      bodyBuild: enrichedProfile.bodyBuild,
      looks: enrichedProfile.looks,
      smoker: enrichedProfile.smoker ? 'Yes' : 'No',
      education: enrichedProfile.education,
      state: enrichedProfile.state,
      occupation: enrichedProfile.occupation,
      country: enrichedProfile.nationality,
      city: enrichedProfile.city,
      joinedDate: enrichedProfile.createdAt ? new Date(enrichedProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : undefined,
      followers: enrichedProfile.followersCount || 0,
      following: 0, // API doesn't provide this yet
      lastSeen: undefined, // API doesn't provide this yet
    };
  }, [enrichedProfile]);

  // Get media array for carousel - only use valid URLs, no fallback to background images
  const profileMedia = useMemo(() => {
    if (!enrichedProfile?.media || !Array.isArray(enrichedProfile.media)) {
      return []; // Return empty array if no media
    }

    // Filter out placeholder strings like "string" and empty strings
    // Only keep valid HTTP/HTTPS URLs
    const validMedia = enrichedProfile.media.filter(
      (url) => typeof url === 'string' && 
               url.trim() !== '' && 
               url !== 'string' && 
               (url.startsWith('http://') || url.startsWith('https://'))
    );

    return validMedia; // Return empty array if no valid media
  }, [enrichedProfile]);

  // Get reviews from enriched profile
  const reviews = useMemo(() => {
    if (!enrichedProfile?.reviews?.items || !Array.isArray(enrichedProfile.reviews.items)) {
      return [];
    }
    return enrichedProfile.reviews.items;
  }, [enrichedProfile]);

  // Reset image index when media changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [profileMedia.length]);

  // Cycle through images every 3 seconds (only if there are multiple images)
  useEffect(() => {
    if (profileMedia.length <= 1) {
      return; // Don't cycle if 0 or 1 images
    }
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % profileMedia.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [profileMedia.length]);

  const handleBack = () => {
    router.back();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // Loading state
  if (isLoading) {
    return <ProfileDetailSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="h-full bg-[#1F1B2C] flex items-center justify-center">
        <div className="text-white text-xl">Error loading profile. Please try again.</div>
      </div>
    );
  }

  // Profile not found
  if (!profile) {
    return (
      <div className="h-full bg-[#1F1B2C] flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1F1B2C]">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-white hover:text-pink-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        {/* No Edit Profile button */}
      </div>

      {/* Main Profile Section */}
      <div className="px-12 pb-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Image */}
          <div className="lg:w-1/3">
            <div className="relative min-h-[500px]">
              <div 
                className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden bg-cover bg-center transition-all duration-1000"
                style={{ 
                  backgroundImage: profileMedia.length > 0 
                    ? `url(${profileMedia[currentImageIndex]})` 
                    : `url(/images/intimate-couple.svg)`,
                  backgroundColor: profileMedia.length === 0 ? '#2D2D2D' : 'transparent'
                }}
              >
                <div className="absolute inset-0  "></div>
              </div>
              {/* Image carousel dots - only show if there are multiple images */}
              {profileMedia.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                  {profileMedia.slice(0, Math.min(profileMedia.length, 10)).map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === (currentImageIndex % profileMedia.length) ? 'bg-pink-500' : 'bg-white/30'
                    }`}
                  ></div>
                ))}
              </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:w-2/3 flex flex-col">
            {/* Top Section - Profile Info */}
            <div className="space-y-3">
              {/* Name with verification */}
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-500" />
                <span className="text-white">{profile.location}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(profile.rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                    />
                  ))}
                </div>
                <span className="text-white font-semibold">{profile.rating}</span>
                <button 
                  onClick={handleLike}
                  className="transition-colors ml-2"
                >
                  <Heart 
                    className={`w-6 h-6 ${
                      profile.isLiked ? 'text-[#FA266D] fill-current' : 'text-gray-400'
                    }`} 
                  />
                </button>
              </div>

              {/* Bio */}
              <div className="space-y-2 text-white">
                <p className="text-lg">{profile.bio}</p>
                <p className="text-sm text-pink-300">NB: check my price and Tfare validates our appointment</p>
                <p className="text-sm">
                  Think silk sheets, whispered cravings, and nights that blur into morning. I don&apos;t offer moments. I offer experiences unforgettable, unfiltered, and all about you. Discretion is guaranteed. Satisfaction is not optional 💋
                </p>
                <p className="text-sm">
                  Touch Me with Your Eyes First. Then the Rest. I&apos;m naughty by Nature. Classy by Choice.
                </p>
              </div>

              {/* Joined Date and Followers/Following */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-pink-500" />
                  <span className="text-white">Joined {profile.joinedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-500" />
                  <span className="text-white">{profile.following} Following</span>
                  <span className="text-white/60">•</span>
                  <span className="text-white">{profile.followers} Followers</span>
                </div>
              </div>
            </div>

            {/* Bottom Section - Action Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              {/* Book Now Button */}
              <button className="w-full bg-[#FA266D] hover:bg-[#E91E63] text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <BookOpen className="w-5 h-5" />
                Book Now
              </button>
              
              {/* Chat and Follow Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    // Get the actual user ID from enrichedProfile (not profile ID)
                    const targetUserId = enrichedProfile?.user?.id;
                    if (!targetUserId) {
                      console.error('User ID not available for chat');
                      alert('Unable to start chat: User information not available');
                      return;
                    }
                    
                    // Pass userId (actual user ID, not profile ID) and profile name for better chat experience
                    const queryParams = new URLSearchParams({
                      userId: targetUserId,
                      name: profile.name || enrichedProfile?.user?.userName || 'User'
                    });
                    router.push(`/chat?${queryParams.toString()}`);
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  disabled={!enrichedProfile?.user?.id}
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat
                </button>
                <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <UserPlus className="w-5 h-5" />
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-12 pb-6">
        <div className="flex space-x-8 border-b border-white/20">
          <button 
            onClick={() => setActiveTab("About")}
            className={`pb-4 px-1 font-semibold transition-colors ${
              activeTab === "About" 
                ? "text-pink-500 border-b-2 border-pink-500" 
                : "text-white/60 hover:text-white"
            }`}
          >
            About
          </button>
          <button 
            onClick={() => setActiveTab("Services")}
            className={`pb-4 px-1 font-semibold transition-colors ${
              activeTab === "Services" 
                ? "text-pink-500 border-b-2 border-pink-500" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Services
          </button>
          <button 
            onClick={() => setActiveTab("Media")}
            className={`pb-4 px-1 font-semibold transition-colors ${
              activeTab === "Media" 
                ? "text-pink-500 border-b-2 border-pink-500" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Media
          </button>
          <button 
            onClick={() => setActiveTab("Reviews")}
            className={`pb-4 px-1 font-semibold transition-colors ${
              activeTab === "Reviews" 
                ? "text-pink-500 border-b-2 border-pink-500" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Reviews
          </button>
          <button 
            onClick={() => setActiveTab("Posts")}
            className={`pb-4 px-1 font-semibold transition-colors ${
              activeTab === "Posts" 
                ? "text-pink-500 border-b-2 border-pink-500" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Posts
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-12 pb-6">
        {activeTab === "About" && (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">Gender</p>
                <p className="text-white">{profile.gender}</p>
              </div>
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">Sexual Orientation</p>
                <p className="text-white">{profile.sexualOrientation}</p>
              </div>
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">Looks</p>
                <p className="text-white">{profile.looks}</p>
              </div>
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">Education</p>
                <p className="text-white">{profile.education}</p>
              </div>
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">City</p>
                <p className="text-white">{profile.city}</p>
              </div>
            </div>

            {/* Middle Column */}
            <div className="space-y-4">
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">Ethnicity</p>
                <p className="text-white">{profile.ethnicity}</p>
              </div>
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">Body Build</p>
                <p className="text-white">{profile.bodyBuild}</p>
              </div>
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">Smoker</p>
                <p className="text-white">{profile.smoker}</p>
              </div>
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">Country</p>
                <p className="text-white">{profile.country}</p>
              </div>
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">Last Seen</p>
                <p className="text-white">{profile.lastSeen}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">Nationality</p>
                <p className="text-white">{profile.nationality}</p>
              </div>
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">Bust Size</p>
                <p className="text-white">{profile.bustSize}</p>
              </div>
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">Occupation</p>
                <p className="text-white">{profile.occupation}</p>
              </div>
              <div className="flex-col pt-3 justify-between">
                <p className="text-pink-500 pb-4 font-semibold">State</p>
                <p className="text-white">{profile.state}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Services" && (
          <div className="space-y-8">
            {/* Services Grid - Use services from profile.services array (from API) */}
            {profile && profile.services && profile.services.length > 0 ? (
            <div className="flex flex-wrap gap-3">
                {profile.services.map((service, index) => (
                  <div
                    key={`${service}-${index}`}
                    className="inline-flex px-4 py-2 border border-white/30 text-white text-sm rounded-full whitespace-nowrap"
                >
                  {service}
                  </div>
              ))}
            </div>
            ) : (
              <div className="text-white/60 text-center py-8">
                No services available.
              </div>
            )}

            {/* Pricing Section - Use pricing from enrichedProfile.pricing */}
            {enrichedProfile?.pricing && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-pink-500">Pricing</h3>
                <Info className="w-5 h-5 text-white/60" />
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Short Time Card */}
                  {enrichedProfile.pricing.shortTime && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg text-center mb-4">
                    Short Time
                  </div>
                  <div className="space-y-3">
                        {enrichedProfile.pricing.shortTime.incall !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-white">Incall</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                              <span className="text-white font-semibold">
                                {typeof enrichedProfile.pricing.shortTime.incall === 'number' 
                                  ? enrichedProfile.pricing.shortTime.incall.toLocaleString() 
                                  : enrichedProfile.pricing.shortTime.incall} APH
                              </span>
                      </div>
                    </div>
                        )}
                        {enrichedProfile.pricing.shortTime.outcall !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-white">Outcall</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                              <span className="text-white font-semibold">
                                {typeof enrichedProfile.pricing.shortTime.outcall === 'number' 
                                  ? enrichedProfile.pricing.shortTime.outcall.toLocaleString() 
                                  : enrichedProfile.pricing.shortTime.outcall} APH
                              </span>
                      </div>
                    </div>
                        )}
                  </div>
                </div>
                  )}

                {/* Overnight Card */}
                  {enrichedProfile.pricing.overnight && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg text-center mb-4">
                    Overnight
                  </div>
                  <div className="space-y-3">
                        {enrichedProfile.pricing.overnight.incall !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-white">Incall</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                              <span className="text-white font-semibold">
                                {typeof enrichedProfile.pricing.overnight.incall === 'number' 
                                  ? enrichedProfile.pricing.overnight.incall.toLocaleString() 
                                  : enrichedProfile.pricing.overnight.incall} APH
                              </span>
                      </div>
                    </div>
                        )}
                        {enrichedProfile.pricing.overnight.outcall !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-white">Outcall</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                              <span className="text-white font-semibold">
                                {typeof enrichedProfile.pricing.overnight.outcall === 'number' 
                                  ? enrichedProfile.pricing.overnight.outcall.toLocaleString() 
                                  : enrichedProfile.pricing.overnight.outcall} APH
                              </span>
                      </div>
                    </div>
                        )}
                  </div>
                </div>
                  )}

                {/* Weekend Card */}
                  {enrichedProfile.pricing.weekend && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg text-center mb-4">
                    Weekend
                  </div>
                  <div className="space-y-3">
                        {enrichedProfile.pricing.weekend.incall !== undefined ? (
                          <div className="flex items-center justify-between">
                            <span className="text-white">Incall</span>
                            <div className="flex items-center gap-1">
                              <Coins className="w-4 h-4 text-yellow-400" />
                              <span className="text-white font-semibold">
                                {typeof enrichedProfile.pricing.weekend.incall === 'number' 
                                  ? enrichedProfile.pricing.weekend.incall.toLocaleString() 
                                  : enrichedProfile.pricing.weekend.incall} APH
                              </span>
                            </div>
                          </div>
                        ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-white">Incall</span>
                      <span className="text-white/60">---</span>
                    </div>
                        )}
                        {enrichedProfile.pricing.weekend.outcall !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-white">Outcall</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                              <span className="text-white font-semibold">
                                {typeof enrichedProfile.pricing.weekend.outcall === 'number' 
                                  ? enrichedProfile.pricing.weekend.outcall.toLocaleString() 
                                  : enrichedProfile.pricing.weekend.outcall} APH
                              </span>
                      </div>
                    </div>
                        )}
                  </div>
                </div>
                  )}
            </div>
              </div>
            )}
            {!enrichedProfile?.pricing && (
              <div className="text-white/60 text-center py-8">
                No pricing information available.
              </div>
            )}
          </div>
        )}

        {activeTab === "Media" && (
          <div className="space-y-6">
            {/* Media Grid - Use profileMedia from API */}
            {profileMedia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profileMedia.map((mediaUrl, index) => {
                  const isVideo = mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i);
                  return (
                    <div key={index} className="relative group cursor-pointer">
                      {isVideo ? (
                        <div className="aspect-square rounded-2xl overflow-hidden bg-black/20 flex items-center justify-center">
                          <video 
                            src={mediaUrl} 
                            className="w-full h-full object-cover"
                            controls
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
                </div>
                      ) : (
                        <div 
                          className="aspect-square rounded-2xl overflow-hidden bg-cover bg-center"
                          style={{ backgroundImage: `url(${mediaUrl})` }}
                        >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
                      )}
              </div>
                  );
                })}
                </div>
            ) : (
              <div className="text-white/60 text-center py-8">
                No media available.
              </div>
            )}
          </div>
        )}

        {activeTab === "Reviews" && (
          <div className="space-y-8">
            {/* Existing Reviews */}
            {reviews.length === 0 ? (
              <div className="text-white/60 text-center py-8">
                No reviews yet. Be the first to review!
              </div>
            ) : (
            <div className="space-y-6">
              {reviews.map((review) => {
                // Generate initials from userId or use default
                const reviewId = review.id || review.userId || '';
                const initials = reviewId 
                  ? reviewId.slice(0, 2).toUpperCase()
                  : 'AN';
                // Generate avatar color based on userId hash
                const hashColor = reviewId
                  ? `#${reviewId.slice(-6).padStart(6, '0').replace(/(.{2})/g, '$1')}`
                  : '#FA266D';
                const avatarColor = `bg-[${hashColor}]`;
                
                // Format timestamp
                const timestamp = review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })
                  : 'Recently';
                
                // Get reviewer name from userId or use anonymous
                const reviewerName = review.userId 
                  ? `User ${review.userId.slice(-4)}`
                  : 'Anonymous';

                return (
                <div key={review.id || reviewId} className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg`}>
                      {initials}
                    </div>
                    
                    {/* Review Content */}
                    <div className="flex-1 space-y-3">
                      {/* Name */}
                      <h4 className="text-[#E05090] font-semibold text-lg">{reviewerName}</h4>
                      
                      {/* Rating and Timestamp */}
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-[#FFC000] fill-current' : 'text-gray-400'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[#A0A0A0] text-sm">{timestamp}</span>
                      </div>
                      
                      {/* Review Text */}
                      <p className="text-white text-sm leading-relaxed">{review.comment || 'No comment provided'}</p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                        <button className="text-[#E05050] hover:text-[#E05050]/80 transition-colors text-sm">
                          Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            )}

            {/* Show More Reviews */}
            <div className="text-left">
              <button className="flex items-center gap-2 text-pink-500 hover:text-pink-400 transition-colors">
                <span>Show more reviews</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Write Review Section */}
            <div className="space-y-6">
              <h3 className="text-[#FA266D]" style={{ fontFamily: 'Urbanist', fontWeight: 600, fontSize: '18px', lineHeight: '100%', letterSpacing: '0%' }}>Write a review</h3>
              
              {/* Review Text Input */}
              <div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Describe your experience here (optional)"
                  className="w-full h-14 bg-transparent border border-[#FFFFFF1A] rounded-[32px] px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                  style={{  height: '56px' }}
                />
              </div>

              {/* Rating Section */}
              <div className="space-y-3">
                <h4 className="text-[#FA266D]" style={{ fontFamily: 'Urbanist', fontWeight: 600, fontSize: '18px', lineHeight: '100%', letterSpacing: '0%' }}>Rate {profile?.name}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setReviewRating(i + 1)}
                        className="transition-colors relative"
                        style={{ 
                          width: '27.501047134399414px', 
                          height: '26.49686050415039px',
                          top: '1.11px',
                          left: '2.25px'
                        }}
                      >
                        <Star 
                          className={`${i < reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-400 hover:text-yellow-400'}`}
                          style={{
                            width: '27.501047134399414px',
                            height: '26.49686050415039px',
                            opacity: 1
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-white font-semibold">{reviewRating}.0</span>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                className="text-white font-semibold transition-colors"
                style={{
                  width: '200px',
                  height: '56px',
                  top: '1529px',
                  left: '80px',
                  opacity: 1,
                  gap: '10px',
                  borderRadius: '40px',
                  paddingTop: '13px',
                  paddingRight: '24px',
                  paddingBottom: '13px',
                  paddingLeft: '24px',
                  backgroundColor: '#FA266D'
                }}
              >
                Submit review
              </button>
            </div>
          </div>
        )}

        {activeTab === "Posts" && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">Posts coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
