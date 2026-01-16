"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, MapPin, Heart, Check, Calendar, Coins, Wallet } from "lucide-react";
import { useListProfilesQuery } from "@/feature/profile/profileApiSlice";
import { useAuth, useEnrichedProfile } from "@/lib/hooks";
import { useGetWalletBalanceQuery, useListOrdersQuery } from "@/app/api/apiSlice";
import type { EnrichedProfile } from "@/lib/types/auth.types";
import type { Order } from "@/lib/types/order.types";
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


export default function ProviderDashboardPage() {
  const router = useRouter();
  const [selectedUserType, setSelectedUserType] = useState<'hunk' | 'diva'>('diva'); // Default to 'diva'
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const { user: authUser } = useAuth();
  const { profile: enrichedProfile } = useEnrichedProfile(authUser?.id || null);
  const { data: walletBalanceData, isLoading: isWalletLoading } = useGetWalletBalanceQuery(undefined, {
    skip: !authUser,
  });
  const { data: ordersData, isLoading: isOrdersLoading } = useListOrdersQuery(
    { role: 'provider', status: 'completed', limit: 100 },
    { skip: !authUser }
  );
  
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

  const walletBalance = useMemo(() => {
    if (walletBalanceData?.success && walletBalanceData.data) {
      return walletBalanceData.data as { balance?: number; currency?: string };
    }
    return null;
  }, [walletBalanceData]);

  const bookingStats = useMemo(() => {
    const orders: Order[] = ordersData?.data ?? [];

    const totalBookings = orders.length;
    const totalEarnings = orders.reduce((sum, order) => {
      const amount = typeof order.totalAmount === "number" ? order.totalAmount : 0;
      return sum + amount;
    }, 0);

    return { totalBookings, totalEarnings };
  }, [ordersData]);

  const averageRating = enrichedProfile?.reviews?.stats?.averageRating ?? 0;

  const heroProfileImage = useMemo(() => {
    if (!enrichedProfile?.media || !Array.isArray(enrichedProfile.media)) {
      return getRandomBackgroundImage(0);
    }
    const validMedia = enrichedProfile.media.filter(
      (url) =>
        typeof url === 'string' &&
        url.trim() !== '' &&
        url !== 'string'
    );
    if (validMedia.length > 0) {
      return validMedia[0];
    }
    return getRandomBackgroundImage(0);
  }, [enrichedProfile]);

  const heroName = useMemo(() => {
    if (enrichedProfile?.user?.userName) return enrichedProfile.user.userName;
    if (enrichedProfile?.user?.firstName || enrichedProfile?.user?.lastName) {
      return `${enrichedProfile.user.firstName || ''} ${enrichedProfile.user.lastName || ''}`.trim() || 'Your Profile';
    }
    if (authUser?.firstName || authUser?.lastName) {
      return `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || 'Your Profile';
    }
    return 'Your Profile';
  }, [enrichedProfile, authUser]);

  const heroLocation = useMemo(() => {
    if (enrichedProfile?.city && enrichedProfile?.state) {
      return `${enrichedProfile.city}, ${enrichedProfile.state}`;
    }
    if (enrichedProfile?.city || enrichedProfile?.state) {
      return enrichedProfile.city || enrichedProfile.state || '';
    }
    return 'Location not set';
  }, [enrichedProfile]);

  const heroJoinedDate = useMemo(() => {
    const sourceDate = enrichedProfile?.createdAt || authUser?.createdAt;
    if (!sourceDate) return '';
    const date = new Date(sourceDate);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [enrichedProfile, authUser]);

  const profiles = useMemo(() => {
    if (!profilesResponse) {
      return [];
    }
    
    let profilesList: EnrichedProfile[] = [];
    
    try {
      if (profilesResponse && typeof profilesResponse === 'object' && 'success' in profilesResponse) {
        const response = profilesResponse as { success: boolean; items?: unknown; data?: unknown };
        
        if (response.success && 'items' in response && Array.isArray(response.items)) {
          profilesList = response.items as EnrichedProfile[];
        } else if (response.success && response.data && Array.isArray(response.data)) {
          profilesList = response.data as EnrichedProfile[];
        } else if (response.success && response.data && typeof response.data === 'object' && 'items' in response.data) {
          const paginatedData = response.data as { items: EnrichedProfile[] };
          profilesList = Array.isArray(paginatedData.items) ? paginatedData.items : [];
        }
      } else if (Array.isArray(profilesResponse)) {
        profilesList = profilesResponse as EnrichedProfile[];
      } else if (profilesResponse && typeof profilesResponse === 'object' && 'items' in profilesResponse) {
        const items = (profilesResponse as { items: unknown }).items;
        if (Array.isArray(items)) {
          profilesList = items as EnrichedProfile[];
        }
      } else if (profilesResponse && typeof profilesResponse === 'object' && 'data' in profilesResponse) {
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
      const profileImage = profile.media && profile.media.length > 0 
        ? profile.media[0] 
        : '/images/intimate-couple.svg';
      
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
        isOnline: false,
        isLiked: likedProfiles.has(profile.id),
        services: services.filter((s): s is string => s !== ''),
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
      <section className="py-8">
          <div className="px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <div
                  className="relative  w-full mx-auto pt-[60%] bg-cover bg-center rounded-[24px] overflow-hidden"
                  style={{ backgroundImage: `url(${heroProfileImage})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </div>
                <div className="pt-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        {heroName}
                      </h2>
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#FA266D]" />
                      <span>{heroLocation}</span>
                    </div>
                    {heroJoinedDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-white/60" />
                        <span>Joined {heroJoinedDate}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => router.push("/profile")}
                    className="mt-2 w-full md:w-auto px-8 py-3 rounded-full bg-[#FA266D] hover:bg-[#e01f60] text-white font-semibold text-sm md:text-base transition-colors"
                  >
                    Go to Profile
                  </button>
                </div>
              </div>
              <div className="bg-[#2A243E] rounded-[24px] pt-6 px-6  flex flex-col justify-between">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-white/60">Total Bookings</p>
                        <p className="text-2xl font-bold text-white">
                          {isOrdersLoading ? '...' : bookingStats.totalBookings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white/60">Average Rating</p>
                        <p className="text-2xl font-bold text-white">
                          {averageRating.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Coins className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white/60">Total Amount Earned</p>
                        <p className="text-2xl font-bold text-white">
                          {isOrdersLoading
                            ? '...'
                            : `${bookingStats.totalEarnings.toLocaleString('en-US')} APH`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-sm text-white/60">Wallet Balance</p>
                        <p className="text-2xl font-bold text-white">
                          {isWalletLoading
                            ? '...'
                            : `${Number(walletBalance?.balance || 0).toLocaleString('en-US')} ${walletBalance?.currency || 'APH'}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>
      <section className="px-8 pb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-[#FA266D] mb-2">
              Explore All Divas/Hunks
            </h2>
          </div>
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
        {!isLoading && !error && profiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-[0px]:gap-4 min-[640px]:gap-6">
            {profiles.map((profile, index) => (
              <div key={profile.id} className="w-full min-w-[280px]">
                <div 
                  className="relative overflow-hidden group cursor-pointer aspect-[4/5] rounded-[20px] min-h-[350px]"
                  onClick={() => handleCardClick(profile.id)}
                >
                  <div className="relative w-full h-full">
                    <div 
                      className="w-full h-full rounded-[20px] overflow-hidden relative bg-cover bg-center"
                      style={{ backgroundImage: `url(${profile.image || getRandomBackgroundImage(index)})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    
                    <div className="absolute text-white bottom-4 left-4 right-4 rounded-2xl bg-white/[0.06] backdrop-blur-[40px] p-4">
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
