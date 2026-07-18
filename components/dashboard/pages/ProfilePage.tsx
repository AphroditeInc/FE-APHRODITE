"use client";

import { Edit, ArrowLeft, Info, Coins, ThumbsUp, ThumbsDown, Plus, Pencil, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEnrichedProfile } from "@/lib/hooks/useEnrichedProfile";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProfilePageSkeleton } from "@/components/ui/Skeleton";
import { ProfileHeader } from "@/components/dashboard/profile/ProfileHeader";
import { ProfileMediaHero } from "@/components/dashboard/profile/ProfileMediaHero";
import { ProfileAboutGrid } from "@/components/dashboard/profile/ProfileAboutGrid";
import { ProfileMediaGrid } from "@/components/dashboard/profile/ProfileMediaGrid";
import { ProfileEditModal } from "@/components/dashboard/profile/ProfileEditModal";
import { ProfileMediaUploadModal } from "@/components/dashboard/profile/ProfileMediaUploadModal";
import { ProfileServicesModal } from "@/components/dashboard/profile/ProfileServicesModal";
import { ProfilePricingEditModal } from "@/components/dashboard/profile/ProfilePricingEditModal";
import CustomPricingModal from "@/components/dashboard/modals/CustomPricingModal";

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    name: "Raven Dan",
    initials: "RD",
    avatarColor: "bg-[#30B0B0]",
    rating: 4,
    timestamp: "2 months ago",
    text: "This girl is the best escort I've been with on here, she takes her time to make sure you are satisfied. Her blowjob is so sloppy and deep.I really had a nice time with her. I'm definitely going to fuck her big boobs again",
    replies: [
      {
        id: 1,
        name: "Bustyline",
        initials: "DA",
        avatarColor: "bg-blue-600",
        timestamp: "2 months ago",
        text: "Thanks for the kind words Raven! It was a nice experience with you pookie😊",
        isServiceProvider: true
      }
    ]
  },
  {
    id: 2,
    name: "Shegzzy",
    initials: "SG", 
    avatarColor: "bg-green-400",
    rating: 5,
    timestamp: "2 weeks ago",
    text: "Beautiful, sweet and naughty. She's the most polite and respectful sexy babe ever. Pussy so clean and tight. I'm definitely coming back for more. She dash me sweet videos sef.",
    replies: []
  }
];

export function ProviderProfilePage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { profile, loading, error, refetch } = useEnrichedProfile(authUser?.id || null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [isCustomPricingModalOpen, setIsCustomPricingModalOpen] = useState(false);
  const [isEditPricingModalOpen, setIsEditPricingModalOpen] = useState(false);
  const [editingPricingType, setEditingPricingType] = useState<'shortTime' | 'overnight' | 'weekend' | null>(null);
  const [currentFormStep, setCurrentFormStep] = useState(1);
  const [activeTab, setActiveTab] = useState("About");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Auto-rotate media carousel every 5 seconds
  useEffect(() => {
    if (profile?.media && Array.isArray(profile.media) && profile.media.length > 1) {
      const mediaLength = profile.media.length;
      const interval = setInterval(() => {
        setCurrentMediaIndex((prevIndex) => {
          // Cycle to next media item, or back to 0 if at the end
          return (prevIndex + 1) % mediaLength;
        });
      }, 5000); // 5 seconds

      return () => clearInterval(interval);
    } else {
      // Reset to 0 if there's only one or no media items
      setCurrentMediaIndex(0);
    }
  }, [profile?.media]);

  // Reset media index when profile changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [profile?.id]);
  const handlePrimaryActionClick = () => {
    if (activeTab === "Media") {
      setIsMediaModalOpen(true);
    } else if (activeTab === "Services") {
      setIsServicesModalOpen(true);
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleReplyToReview = (reviewId: string) => {
    setReplyingTo(reviewId);
    setReplyText("");
  };

  const handleSubmitReply = () => {
    if (replyingTo && replyText.trim()) {
      console.log("Submitting reply to review:", replyingTo, replyText);
      // TODO: Implement actual reply submission logic
      setReplyingTo(null);
      setReplyText("");
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  // Loading state
  if (loading) {
    return <ProfilePageSkeleton />;
  }

  // Error state
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

  // No profile data
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#1F1B2C] flex items-center justify-center">
        <div className="text-white text-xl">No profile data available</div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#1F1B2C]">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <button
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/dashboard");
            }
          }}
          className="flex items-center gap-2 text-white hover:text-pink-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Back</span>
        </button>
        {activeTab !== "Reviews" && (
          <button
            onClick={handlePrimaryActionClick}
            className="hover:bg-pink-600 text-white px-3 sm:px-4 py-2 rounded-full flex items-center gap-1 sm:gap-2 border-[1px] border-white/10 text-sm sm:text-base cursor-pointer"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">
              {activeTab === "Media"
                ? "Add Media"
                : activeTab === "Services"
                ? "Edit Services"
                : "Edit Profile"}
            </span>
            <span className="sm:hidden">
              {activeTab === "Media"
                ? "Add"
                : activeTab === "Services"
                ? "Edit"
                : "Edit"}
            </span>
          </button>
        )}
      </div>

      {/* Main Profile Section */}
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

      {/* Navigation Tabs */}
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
            onClick={() => setActiveTab("Services")}
            className={`pb-3 sm:pb-4 px-1 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap cursor-pointer ${
              activeTab === "Services" 
                ? "text-[#FA266D] border-b-2 border-[#FA266D]" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Services
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
          <button 
            onClick={() => setActiveTab("Reviews")}
            className={`pb-3 sm:pb-4 px-1 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap cursor-pointer ${
              activeTab === "Reviews" 
                ? "text-[#FA266D] border-b-2 border-[#FA266D]" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Reviews
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 pb-4 sm:pb-6">
        {activeTab === "About" && <ProfileAboutGrid profile={profile} authUser={authUser} />}

        {activeTab === "Services" && (
          <div className="space-y-8">
            {/* Services Grid */}
            {/* Map services from profile.services array (from API response: data.services) */}
            {profile && profile.services && Array.isArray(profile.services) && profile.services.length > 0 ? (
            <div className="flex flex-wrap gap-3">
                {profile.services
                  .map(service => typeof service === 'string' ? service : (service.name || service.id || ''))
                  .filter((s): s is string => s !== '')
                  .map((serviceName, index) => (
                    <div
                      key={`${serviceName}-${index}`}
                  className="inline-flex px-4 py-2 border border-white/30 text-white text-sm rounded-full hover:border-pink-500 hover:text-pink-500 transition-colors whitespace-nowrap"
                >
                      {serviceName}
                    </div>
              ))}
            </div>
            ) : (
              <div className="text-white/60 text-center py-8">
                No services added yet. Click "Edit Services" to add services.
              </div>
            )}

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-[#FA266D]">Pricing</h3>
                  <Info className="w-5 h-5 text-white/60" />
                </div>
                <button
                  onClick={() => setIsCustomPricingModalOpen(true)}
                  className="h-[48px] rounded-[30px]  px-6 py-3 flex items-center gap-4 text-white transition-colors border-[1px] border-[#FFFFFF1A] cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#FA266D]" />
                  <span className="text-[#FA266D] font-normal text-[14px] sm:text-base">Add Custom Pricing</span>
                </button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Short Time Card */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="bg-[#FA266D] text-white text-[24px] font-bold py-2 px-4 rounded-lg mb-4 flex items-center justify-between relative">
                    <div className="flex-1"></div>
                    <span className="flex-1 text-center whitespace-nowrap">Short Time</span>
                    <button
                      onClick={() => {
                        setEditingPricingType("shortTime");
                        setIsEditPricingModalOpen(true);
                      }}
                      className="flex-1 flex justify-end cursor-pointer"
                    >
                      <Pencil className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Incall</span>
                      {profile?.pricing?.shortTime?.incall ? (
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-semibold">
                            {Number(profile.pricing.shortTime.incall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} APH
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/60">---</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Outcall</span>
                      {profile?.pricing?.shortTime?.outcall ? (
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-semibold">
                            {Number(profile.pricing.shortTime.outcall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} APH
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/60">---</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overnight Card */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="bg-[#FA266D] text-white text-[24px] font-bold py-2 px-4 rounded-lg mb-4 flex items-center justify-between relative">
                    <div className="flex-1"></div>
                    <span className="flex-1 text-center">Overnight</span>
                    <button
                      onClick={() => {
                        setEditingPricingType("overnight");
                        setIsEditPricingModalOpen(true);
                      }}
                      className="flex-1 flex justify-end cursor-pointer"
                    >
                      <Pencil className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Incall</span>
                      {profile?.pricing?.overnight?.incall ? (
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-semibold">
                            {Number(profile.pricing.overnight.incall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} APH
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/60">---</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Outcall</span>
                      {profile?.pricing?.overnight?.outcall ? (
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-semibold">
                            {Number(profile.pricing.overnight.outcall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} APH
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/60">---</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Weekend Card */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="bg-[#FA266D] text-white text-[24px] font-bold py-2 px-4 rounded-lg mb-4 flex items-center justify-between relative">
                    <div className="flex-1"></div>
                    <span className="flex-1 text-center">Weekend</span>
                    <button
                      onClick={() => {
                        setEditingPricingType("weekend");
                        setIsEditPricingModalOpen(true);
                      }}
                      className="flex-1 flex justify-end cursor-pointer"
                    >
                      <Pencil className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Incall</span>
                      {profile?.pricing?.weekend?.incall ? (
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-semibold">
                            {Number(profile.pricing.weekend.incall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} APH
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/60">---</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Outcall</span>
                      {profile?.pricing?.weekend?.outcall ? (
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-semibold">
                            {Number(profile.pricing.weekend.outcall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} APH
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/60">---</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Pricing Categories */}
              {profile?.pricing?.customCategories && profile.pricing.customCategories.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-pink-500 mb-4">Custom Pricing</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    {profile.pricing.customCategories.map((category: any, index: number) => (
                      <div key={index} className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg p-6 border border-white/10">
                        <div className="text-white text-[20px] font-bold mb-2">
                          {category.categoryName}
                        </div>
                        <div className="text-white/80 text-sm mb-4">{category.duration}</div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-white">Incall</span>
                            {category.incall ? (
                              <div className="flex items-center gap-1">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                <span className="text-white font-semibold">
                                  {Number(category.incall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} APH
                                </span>
                              </div>
                            ) : (
                              <span className="text-white/60">---</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white">Outcall</span>
                            {category.outcall ? (
                              <div className="flex items-center gap-1">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                <span className="text-white font-semibold">
                                  {Number(category.outcall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} APH
                                </span>
                              </div>
                            ) : (
                              <span className="text-white/60">---</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Media" && <ProfileMediaGrid profile={profile} />}

        {activeTab === "Reviews" && (
          <div className="space-y-8">
            {/* Existing Reviews */}
            <div className="space-y-6">
              {mockReviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 ${review.avatarColor} rounded-full flex items-center justify-center text-white font-semibold text-lg`}>
                      {review.initials}
                    </div>
                    
                    {/* Review Content */}
                    <div className="flex-1 space-y-3">
                      {/* Name */}
                      <h4 className="text-[#E05090] font-semibold text-lg">{review.name}</h4>
                      
                      {/* Rating and Timestamp */}
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-[#FFC000] fill-current' : 'text-gray-400'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[#A0A0A0] text-sm">{review.timestamp}</span>
                      </div>
                      
                      {/* Review Text */}
                      <p className="text-white text-sm leading-relaxed">{review.text}</p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleReplyToReview(review.id.toString())}
                          className="text-pink-500 hover:text-pink-400 transition-colors text-sm font-medium cursor-pointer"
                        >
                          Write a reply
                        </button>
                        <button className="flex items-center gap-2 text-white hover:text-white/80 transition-colors cursor-pointer">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 text-white hover:text-white/80 transition-colors cursor-pointer">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                        <button className="text-[#E05050] hover:text-[#E05050]/80 transition-colors text-sm cursor-pointer">
                          Report
                        </button>
                      </div>

                      {/* Replies */}
                      {review.replies && review.replies.length > 0 && (
                        <div className="ml-4 space-y-4 pt-4 border-l-2 border-white/10 pl-4">
                          {review.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3">
                              <div className={`w-8 h-8 ${reply.avatarColor} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                                {reply.initials}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-[#E05090] font-semibold text-sm">{reply.name}</h5>
                                  {reply.isServiceProvider && (
                                    <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                                      Service Provider
                                    </span>
                                  )}
                                  <span className="text-[#A0A0A0] text-xs">{reply.timestamp}</span>
                                </div>
                                <p className="text-white text-sm leading-relaxed">{reply.text}</p>
                                <div className="flex items-center gap-4">
                                  <button className="flex items-center gap-1 text-white hover:text-white/80 transition-colors cursor-pointer">
                                    <ThumbsUp className="w-3 h-3" />
                                  </button>
                                  <button className="flex items-center gap-1 text-white hover:text-white/80 transition-colors cursor-pointer">
                                    <ThumbsDown className="w-3 h-3" />
                                  </button>
                                  <button className="text-[#E05050] hover:text-[#E05050]/80 transition-colors text-xs cursor-pointer">
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyingTo === review.id.toString() && (
                        <div className="ml-4 mt-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {profile?.user?.firstName?.[0] || 'U'}
                            </div>
                            <span className="text-white text-sm">Replying to {review.name}</span>
                          </div>
                          <div className="space-y-3">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Write your reply to ${review.name}...`}
                              className="w-full bg-transparent border border-[#FFFFFF1A] rounded-[32px] px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pink-500 transition-colors resize-none min-h-[80px]"
                            />
                            <div className="flex items-center gap-3">
                              <button
                                onClick={handleSubmitReply}
                                disabled={!replyText.trim()}
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Reply
                              </button>
                              <button
                                onClick={handleCancelReply}
                                className="px-4 py-2 text-white/60 hover:text-white transition-colors text-sm cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Reviews */}
            {/* <div className="text-left">
              <button className="flex items-center gap-2 text-pink-500 hover:text-pink-400 transition-colors cursor-pointer">
                <span>Show more reviews</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div> */}
          </div>
        )}
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
      <ProfileServicesModal
        open={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
        profileId={String(profile.id)}
        existingServices={profile.services}
        onUpdated={refetch}
      />

      <ProfilePricingEditModal
        open={isEditPricingModalOpen}
        onClose={() => {
          setIsEditPricingModalOpen(false);
          setEditingPricingType(null);
        }}
        profileId={String(profile.id)}
        pricingType={editingPricingType}
        currentPricing={profile.pricing}
        onUpdated={refetch}
      />

      <CustomPricingModal
        isOpen={isCustomPricingModalOpen}
        onClose={() => setIsCustomPricingModalOpen(false)}
        profileId={String(profile.id)}
      />

    </div>
  );
}

export default ProviderProfilePage;
