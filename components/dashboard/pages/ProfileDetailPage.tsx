"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Star, Check, Users, Calendar as CalendarIcon, Heart, BookOpen, MessageCircle, UserPlus, Info, Coins, Play, ThumbsUp, ThumbsDown, ChevronDown, Plus } from "lucide-react";
import { type Profile } from "@/lib/data/profiles";
import { useGetProfileByIdQuery, useCreateReviewMutation } from "@/feature/profile/profileApiSlice";
import type { EnrichedProfile } from "@/lib/types/auth.types";
import { ProfileDetailSkeleton } from "@/components/ui/Skeleton";
import CustomPricingModal from "../modals/CustomPricingModal";
import { PricingPlanDialog, type PricingPlan } from "@/components/dashboard/messages/PricingPlanDialog";
import { CheckoutModal } from "@/components/dashboard/messages/CheckoutModal";

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
  const [isCustomPricingModalOpen, setIsCustomPricingModalOpen] = useState(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(null);
  const [customPrice, setCustomPrice] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<"short-time" | "overnight" | "weekend" | "custom-price">("short-time");
  const [checkoutAmounts, setCheckoutAmounts] = useState<{ incall: string; outcall: string }>({
    incall: "0",
    outcall: "0",
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [createReview] = useCreateReviewMutation();

  // Fetch profile from API
  const { data: profileResponse, isLoading, error } = useGetProfileByIdQuery(profileId, {
    skip: !profileId,
  });

  // Extract EnrichedProfile from response
  const enrichedProfile = useMemo<EnrichedProfile | null>(() => {
    if (!profileResponse) return null;

    console.log('[ProfileDetailPage] Raw profileResponse:', profileResponse);

    // Handle API response structure: { success: true, data: EnrichedProfile } or direct EnrichedProfile
    if (profileResponse && typeof profileResponse === 'object') {
      if ('success' in profileResponse && profileResponse.success && 'data' in profileResponse) {
        console.log('[ProfileDetailPage] Found nested data structure, user field:', (profileResponse.data as any)?.user);
        return profileResponse.data as EnrichedProfile;
      } else if ('id' in profileResponse) {
        console.log('[ProfileDetailPage] Found direct profile structure, user field:', (profileResponse as any)?.user);
        return profileResponse as EnrichedProfile;
      }
    }

    return null;
  }, [profileResponse]);

  // Map EnrichedProfile to Profile type
  const profile = useMemo<Profile | null>(() => {
    if (!enrichedProfile) return null;

    console.log('[ProfileDetailPage] Mapping enrichedProfile to profile:', {
      enrichedProfile,
      gender: enrichedProfile.gender,
      ethnicity: enrichedProfile.ethnicity,
      sexualOrientation: enrichedProfile.sexualOrientation,
      bodyBuild: enrichedProfile.bodyBuild,
      looks: enrichedProfile.looks,
    });

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
          className="flex items-center gap-2 text-white hover:text-[#FA266D] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        {/* No Edit Profile button */}
      </div>

      {/* Main Profile Section */}
      <div className="px-4 sm:px-8 lg:px-12 pb-6">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Profile Image/Media */}
          <div className="lg:w-1/2">
            <div className="relative">
              {/* Display media from profileMedia array */}
              {profileMedia && Array.isArray(profileMedia) && profileMedia.length > 0 ? (
                <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-700 rounded-xl sm:rounded-2xl overflow-hidden relative">
                  {/* Show current media item based on currentImageIndex */}
                  {(() => {
                    const currentMedia = profileMedia[currentImageIndex] || profileMedia[0];
                    const isVideo = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(currentMedia);
                    
                    return isVideo ? (
                      <video 
                        src={currentMedia} 
                        className="w-full h-full object-cover"
                        controls
                        key={currentImageIndex} // Key to force re-render on change
                      />
                    ) : (
                      <img 
                        src={currentMedia} 
                        alt={`Profile media ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-500"
                        key={currentImageIndex} // Key to force re-render on change
                      />
                    );
                  })()}
                  
                  {/* Media count badge */}
                  {profileMedia.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {currentImageIndex + 1} / {profileMedia.length}
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
            {/* Image carousel dots - show if there are multiple media items */}
            {profileMedia && Array.isArray(profileMedia) && profileMedia.length > 1 && (
              <div className="flex justify-center gap-2 mt-3 sm:mt-4">
                {profileMedia.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all cursor-pointer ${
                      index === currentImageIndex 
                        ? 'bg-[#FA266D] w-6 sm:w-8' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to media ${index + 1}`}
                  ></button>
                ))}
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="lg:w-2/3 space-y-3 sm:space-y-4">
            {/* Name with verification */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  {profile.name}
                </h1>
                {enrichedProfile?.isVerified ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                ) : (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 whitespace-nowrap">
                    Not verified
                  </span>
                )}
              </div>
              <button 
                onClick={handleLike}
                className="transition-colors"
              >
                <Heart 
                  className={`w-6 h-6 ${
                    isLiked ? 'text-[#FA266D] fill-current' : 'text-gray-400'
                  }`} 
                />
              </button>
            </div>
            
            {/* Location and Rating */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {/* Location */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  <MapPin className="w-[17.75px] h-[20.5px] text-[#FA266D] fill-[#FA266D]" />
                  <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-black"></div>
                </div>
                <span className="text-[#FFFFFF99] text-sm sm:text-base font-normal truncate max-w-[180px] sm:max-w-xs">
                  {profile.location}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-[11.41px] h-[10.9px] ${i < Math.floor(profile.rating || 0) ? 'text-[#FFDC18] fill-[#FFDC18]' : 'text-[#FFDC18]'}`} 
                    />
                  ))}
                </div>
                <span className="text-white italic font-normal text-sm sm:text-base">
                  {profile.rating ? profile.rating.toFixed(1) : '0.0'}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2 sm:space-y-3 text-white">
              <p className="text-base sm:text-lg">{profile.bio || 'No bio available'}</p>
            </div>

            {/* Joined Date */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-[24px] h-[24px] sm:w-5 sm:h-5 text-[#FFFFFF99]" />
              <span className="text-[#FFFFFF99] font-medium text-[15px] sm:text-base">
                Joined {profile.joinedDate || 'Unknown'}
              </span>
            </div>

            {/* Followers/Following */}
            <div className="flex items-center gap-2">
              <Users className="w-[24px] h-[24px] sm:w-5 sm:h-5 text-[#FFFFFF99]" />
              <span className="text-white text-[15px] font-black sm:text-base">{profile.followers || 0} <span className="text-[#FFFFFF99] font-medium text-[15px] sm:text-base">Followers</span></span>
              <span className="text-white/60 text-sm sm:text-base">•</span>
              <span className="text-white text-[15px] font-black sm:text-base">{profile.following || 0} <span className="text-[#FFFFFF99] font-medium text-[15px] sm:text-base">Following</span></span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              {/* Book Now Button */}
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setCustomPrice("");
                  setShowPricingDialog(true);
                }}
                className="w-full h-[56px] rounded-[30px] bg-[#FA266D] hover:bg-[#E91E63] text-white font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Book Now
              </button>
              
              {/* Chat and Follow Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    // Get the actual user ID from enrichedProfile (not profile ID)
                    console.log('[ProfileDetailPage] Chat button clicked, enrichedProfile:', enrichedProfile);
                    const targetUserId = enrichedProfile?.user?.id || enrichedProfile?.userId;
                    console.log('[ProfileDetailPage] Target userId:', targetUserId);
                    if (!targetUserId) {
                      console.error('User ID not available for chat. EnrichedProfile:', enrichedProfile);
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
                  className="flex-1 h-[56px] rounded-[30px] border border-[#FFFFFF1A]  hover:bg-white/20 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                  disabled={!enrichedProfile?.user?.id}
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat
                </button>
                <button className="flex-1 h-[56px] rounded-[30px] border border-[#FFFFFF1A]  hover:bg-white/20 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
                  <UserPlus className="w-5 h-5" />
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-0 sm:px-8 lg:px-12 pb-4">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max px-4 sm:px-0 space-x-6 sm:space-x-8 border-b border-white/20">
            <button
              onClick={() => setActiveTab("About")}
              className={`pb-3 sm:pb-4 px-1 text-sm sm:text-base font-semibold transition-colors ${
                activeTab === "About"
                  ? "text-[#FA266D] border-b-2 border-[#FA266D]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab("Services")}
              className={`pb-3 sm:pb-4 px-1 text-sm sm:text-base font-semibold transition-colors ${
                activeTab === "Services"
                  ? "text-[#FA266D] border-b-2 border-[#FA266D]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab("Media")}
              className={`pb-3 sm:pb-4 px-1 text-sm sm:text-base font-semibold transition-colors ${
                activeTab === "Media"
                  ? "text-[#FA266D] border-b-2 border-[#FA266D]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Media
            </button>
            <button
              onClick={() => setActiveTab("Reviews")}
              className={`pb-3 sm:pb-4 px-1 text-sm sm:text-base font-semibold transition-colors ${
                activeTab === "Reviews"
                  ? "text-[#FA266D] border-b-2 border-[#FA266D]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab("Posts")}
              className={`pb-3 sm:pb-4 px-1 text-sm sm:text-base font-semibold transition-colors ${
                activeTab === "Posts"
                  ? "text-[#FA266D] border-b-2 border-[#FA266D]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Posts
            </button>
          </div>
        </div>
      </div>

      <PricingPlanDialog
        open={showPricingDialog}
        selectedPlan={selectedPlan}
        onSelectPlan={setSelectedPlan}
        customPrice={customPrice}
        onChangeCustomPrice={setCustomPrice}
        onSend={() => {
          if (!selectedPlan || !enrichedProfile?.pricing) {
            return;
          }

          const pricing = enrichedProfile.pricing;

          if (selectedPlan === "short-time" && pricing.shortTime) {
            const incall =
              pricing.shortTime.incall !== undefined && pricing.shortTime.incall !== null
                ? String(pricing.shortTime.incall)
                : "0";
            const outcall =
              pricing.shortTime.outcall !== undefined && pricing.shortTime.outcall !== null
                ? String(pricing.shortTime.outcall)
                : "0";
            setCheckoutPlan("short-time");
            setCheckoutAmounts({ incall, outcall });
          } else if (selectedPlan === "overnight" && pricing.overnight) {
            const incall =
              pricing.overnight.incall !== undefined && pricing.overnight.incall !== null
                ? String(pricing.overnight.incall)
                : "0";
            const outcall =
              pricing.overnight.outcall !== undefined && pricing.overnight.outcall !== null
                ? String(pricing.overnight.outcall)
                : "0";
            setCheckoutPlan("overnight");
            setCheckoutAmounts({ incall, outcall });
          } else if (selectedPlan === "weekend" && pricing.weekend) {
            const incall =
              pricing.weekend.incall !== undefined && pricing.weekend.incall !== null
                ? String(pricing.weekend.incall)
                : "0";
            const outcall =
              pricing.weekend.outcall !== undefined && pricing.weekend.outcall !== null
                ? String(pricing.weekend.outcall)
                : "0";
            setCheckoutPlan("weekend");
            setCheckoutAmounts({ incall, outcall });
          } else if (selectedPlan === "custom-price" && customPrice) {
            setCheckoutPlan("custom-price");
            setCheckoutAmounts({ incall: customPrice, outcall: customPrice });
          } else {
            return;
          }

          setShowPricingDialog(false);
          setShowCheckout(true);
        }}
        onClose={() => setShowPricingDialog(false)}
        submitLabel="Book"
        showCustomPrice={false}
        pricing={
          enrichedProfile?.pricing
            ? {
                shortTime: {
                  incall:
                    enrichedProfile.pricing.shortTime?.incall !== undefined
                      ? String(enrichedProfile.pricing.shortTime.incall)
                      : undefined,
                  outcall:
                    enrichedProfile.pricing.shortTime?.outcall !== undefined
                      ? String(enrichedProfile.pricing.shortTime.outcall)
                      : undefined,
                },
                overnight: {
                  incall:
                    enrichedProfile.pricing.overnight?.incall !== undefined
                      ? String(enrichedProfile.pricing.overnight.incall)
                      : undefined,
                  outcall:
                    enrichedProfile.pricing.overnight?.outcall !== undefined
                      ? String(enrichedProfile.pricing.overnight.outcall)
                      : undefined,
                },
                weekend: {
                  incall:
                    enrichedProfile.pricing.weekend?.incall !== undefined
                      ? String(enrichedProfile.pricing.weekend.incall)
                      : undefined,
                  outcall:
                    enrichedProfile.pricing.weekend?.outcall !== undefined
                      ? String(enrichedProfile.pricing.weekend.outcall)
                      : undefined,
                },
              }
            : null
        }
      />

      {/* Tab Content */}
      <div className="px-4 sm:px-8 lg:px-12 pb-8">
        {activeTab === "About" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Gender</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.gender || 'Not specified'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Sexual Orientation</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.sexualOrientation || 'Not specified'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Looks</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.looks || 'Not specified'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Education</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.education || 'Not specified'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">City</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.city || 'Not specified'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Ethnicity</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.ethnicity || 'Not specified'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Body Build</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.bodyBuild || 'Not specified'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Smoker</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.smoker || 'Not specified'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Country</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.country || 'Not specified'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Last Seen</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.lastSeen || 'Not available'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Nationality</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.nationality || 'Not specified'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Bust Size</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.bustSize || 'Not specified'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Occupation</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.occupation || 'Not specified'}</p>
            </div>
            <div className="pt-3">
              <p className="text-[#FA266D] pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">State</p>
              <p className="text-white text-xs sm:text-sm break-words">{profile.state || 'Not specified'}</p>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-[#FA266D]">Pricing</h3>
                  <Info className="w-5 h-5 text-white/60" />
                </div>
                
                {/* Add Custom Pricing Button */}
                <button
                  onClick={() => setIsCustomPricingModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#FA266D] text-[#FA266D] hover:bg-[#FA266D] hover:text-white transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Custom Pricing</span>
                </button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Short Time Card */}
                  {enrichedProfile.pricing.shortTime && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="bg-[#FA266D] text-white font-semibold py-2 px-4 rounded-lg text-center mb-4">
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
                  <div className="bg-[#FA266D] text-white font-semibold py-2 px-4 rounded-lg text-center mb-4">
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
                  <div className="bg-[#FA266D] text-white font-semibold py-2 px-4 rounded-lg text-center mb-4">
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

              {/* Custom Categories Section */}
              {enrichedProfile.pricing.customCategories && enrichedProfile.pricing.customCategories.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xl font-semibold text-white mb-4">Custom Pricing Categories</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    {enrichedProfile.pricing.customCategories.map((category, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <div className="bg-gradient-to-r from-[#FA266D] to-purple-500 text-white font-semibold py-2 px-4 rounded-lg text-center mb-2">
                          {category.categoryName}
                        </div>
                        <div className="text-center text-white/60 text-sm mb-4">{category.duration}</div>
                        <div className="space-y-3">
                          {category.incall !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-white">Incall</span>
                              <div className="flex items-center gap-1">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                <span className="text-white font-semibold">
                                  {typeof category.incall === 'number' 
                                    ? category.incall.toLocaleString() 
                                    : category.incall} APH
                                </span>
                              </div>
                            </div>
                          )}
                          {category.outcall !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-white">Outcall</span>
                              <div className="flex items-center gap-1">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                <span className="text-white font-semibold">
                                  {typeof category.outcall === 'number' 
                                    ? category.outcall.toLocaleString() 
                                    : category.outcall} APH
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    <div className={`w-12 h-12 bg-[#FA266D] rounded-full flex items-center justify-center text-white font-semibold text-lg`}>
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
              <button className="flex items-center gap-2 text-[#FA266D] hover:text-[#FA266D] transition-colors">
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
                  className="w-full h-14 bg-transparent border border-[#FFFFFF1A] rounded-[32px] px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-[#FA266D] transition-colors resize-none"
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

              {/* Feedback */}
              {reviewError && (
                <p className="text-red-400 text-sm">{reviewError}</p>
              )}
              {reviewSuccess && (
                <p className="text-green-400 text-sm">Review submitted successfully!</p>
              )}

              {/* Submit Button */}
              <button
                disabled={reviewRating === 0 || reviewSubmitting}
                onClick={async () => {
                  if (reviewRating === 0) {
                    setReviewError("Please select a star rating before submitting.");
                    return;
                  }
                  setReviewError(null);
                  setReviewSuccess(false);
                  setReviewSubmitting(true);
                  try {
                    await createReview({
                      profileId,
                      rating: reviewRating,
                      comment: reviewText.trim() || undefined,
                    }).unwrap();
                    setReviewSuccess(true);
                    setReviewText("");
                    setReviewRating(0);
                  } catch (err: unknown) {
                    const msg = (err as { data?: { message?: string } })?.data?.message;
                    setReviewError(msg || "Failed to submit review. Please try again.");
                  } finally {
                    setReviewSubmitting(false);
                  }
                }}
                className="text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  width: '200px',
                  height: '56px',
                  borderRadius: '40px',
                  paddingTop: '13px',
                  paddingRight: '24px',
                  paddingBottom: '13px',
                  paddingLeft: '24px',
                  backgroundColor: '#FA266D'
                }}
              >
                {reviewSubmitting ? "Submitting…" : "Submit review"}
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

      {/* Custom Pricing Modal */}
      <CustomPricingModal
        isOpen={isCustomPricingModalOpen}
        onClose={() => setIsCustomPricingModalOpen(false)}
        profileId={profileId}
      />

      {showCheckout && enrichedProfile && (
        <CheckoutModal
          open={showCheckout}
          plan={checkoutPlan}
          amounts={checkoutAmounts}
          providerUserId={enrichedProfile.user?.id || enrichedProfile.userId || ""}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
