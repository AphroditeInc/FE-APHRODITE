"use client";

import { User, Mail, Phone, MapPin, Calendar, Edit, ArrowLeft, Star, Check, Users, Calendar as CalendarIcon, X, Heart, BookOpen, MessageCircle, UserPlus, Info, Coins, Play, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useEnrichedProfile } from "@/lib/hooks/useEnrichedProfile";
import { useAuth } from "@/lib/hooks/useAuth";

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

// Available services
const availableServices = [
  "Domination (Receiving)", "Lap Dance", "Belly Dance", "Tango", "Pole Fitness", "Being Filmed",
  "Salsa", "Bachata", "Girlfriend Experience", "Sex Toys", "Role Play & Fantasies", "Erotic Massage",
  "Erotic Spanking", "MMF 3somes", "Dinner Dates", "French Kissing", "Smoking Fetish", "Missionary", "69", "Doggy"
];

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { profile, loading, error, refetch } = useEnrichedProfile(authUser?.id || null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [currentFormStep, setCurrentFormStep] = useState(1);
  const [activeTab, setActiveTab] = useState("About");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Lap Dance", "Belly Dance", "Tango", "Being Filmed", 
    "Girlfriend Experience", "Role Play & Fantasies", "French Kissing", "Doggy"
  ]);
  const [customServices, setCustomServices] = useState<string[]>(["BDSM", "Ride Till You Cum"]);
  const [customServiceInput, setCustomServiceInput] = useState("");
  const [formData, setFormData] = useState({
    // First form data
    location: "Rumuokoro, Port Harcourt",
    ethnicity: "",
    sexualOrientation: "Bisexual",
    bustSize: "Medium C-cup",
    gender: "",
    nationality: "",
    bodyBuild: "Chubby",
    looks: "Sexy",
    // Second form data
    smoker: "Yes",
    education: "Bachelors",
    state: "Lagos",
    occupation: "Yoga Instructor",
    country: "Nigeria",
    city: "Lekki",
    bio: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    setCurrentFormStep(2);
  };

  const handleSubmit = () => {
    // Handle form submission here
    console.log("Form submitted:", formData);
    setIsEditModalOpen(false);
    setCurrentFormStep(1);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setCurrentFormStep(1);
  };

  const handleCloseMediaModal = () => {
    setIsMediaModalOpen(false);
    setSelectedFiles([]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadMedia = () => {
    // Handle media upload here
    console.log("Uploading media:", selectedFiles);
    // TODO: Implement actual upload logic
    handleCloseMediaModal();
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

  const handleCloseServicesModal = () => {
    setIsServicesModalOpen(false);
  };

  const handleToggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleAddCustomService = () => {
    if (customServiceInput.trim() && !customServices.includes(customServiceInput.trim())) {
      setCustomServices(prev => [...prev, customServiceInput.trim()]);
      setCustomServiceInput("");
    }
  };

  const handleRemoveCustomService = (service: string) => {
    setCustomServices(prev => prev.filter(s => s !== service));
  };

  const handleSubmitServices = () => {
    console.log("Selected services:", selectedServices);
    console.log("Custom services:", customServices);
    // TODO: Implement actual services submission logic
    handleCloseServicesModal();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F1B2C] flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
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
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors"
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        <button className="flex items-center gap-2 text-white hover:text-pink-300 transition-colors">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Back</span>
        </button>
        {activeTab !== "Reviews" && (
        <button 
          onClick={() => {
            if (activeTab === "Media") {
              setIsMediaModalOpen(true);
            } else if (activeTab === "Services") {
              setIsServicesModalOpen(true);
            } else {
              setIsEditModalOpen(true);
            }
          }}
            className=" hover:bg-pink-600 text-white px-3 sm:px-4 py-2 rounded-full flex items-center gap-1 sm:gap-2  border-[1px] border-white/10  text-sm sm:text-base"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">
              {activeTab === "Media" ? "Add Media" : 
               activeTab === "Services" ? "Edit Services" : 
               "Edit Profile"}
            </span>
            <span className="sm:hidden">
              {activeTab === "Media" ? "Add" : 
               activeTab === "Services" ? "Edit" : 
               "Edit"}
            </span>
          </button>
        )}
      </div>

      {/* Main Profile Section */}
      <div className="px-4 sm:px-8 lg:px-12 pb-6">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Profile Image */}
          <div className="lg:w-1/3">
            <div className="relative">
              <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-700 rounded-xl sm:rounded-2xl overflow-hidden">
                <img 
                  src="/images/intimate-couple.svg" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
            </div>
              {/* Image carousel dots */}
              <div className="flex justify-center gap-2 mt-3 sm:mt-4">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/30 rounded-full"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/30 rounded-full"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
          <div className="lg:w-2/3 space-y-3 sm:space-y-4">
            {/* Name with verification */}
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                {profile?.user?.userName || authUser?.username}
              </h1>
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
            
     

            {/* Location */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
              <span className="text-white text-sm sm:text-base">
                {authUser?.city && authUser?.state ? `${authUser.city}, ${authUser.state}` : 
                 authUser?.city || authUser?.state }
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(profile?.reviews?.stats?.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                  />
                ))}
              </div>
              <span className="text-white font-semibold text-sm sm:text-base">
                {profile?.reviews?.stats?.averageRating ? profile.reviews.stats.averageRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-sm text-gray-400">
                ({profile?.reviews?.stats?.totalReviews || 0} reviews)
              </span>
            </div>

            {/* Bio */}
            <div className="space-y-2 sm:space-y-3 text-white">
              <p className="text-base sm:text-lg">{profile?.bio || 'No bio available'}</p>
              {profile?.education && profile.education !== 'Not specified' && (
                <p className="text-xs sm:text-sm text-pink-300">Education: {profile.education}</p>
              )}
              {profile?.occupation && profile.occupation !== 'Not specified' && (
                <p className="text-xs sm:text-sm text-pink-300">Occupation: {profile.occupation}</p>
              )}
            </div>

            {/* Joined Date */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
              <span className="text-white text-sm sm:text-base">
                Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
              </span>
            </div>

            {/* Followers/Following */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
              <span className="text-white text-sm sm:text-base">{profile?.followersCount || 0} Followers</span>
              <span className="text-white/60 text-sm sm:text-base">•</span>
              <span className="text-white text-sm sm:text-base">{profile?.reviews?.stats?.totalReviews || 0} Reviews</span>
            </div>
              </div>
            </div>
          </div>

      {/* Navigation Tabs */}
      <div className="px-4 sm:px-8 lg:px-12 pb-4 sm:pb-6">
        <div className="flex space-x-4 sm:space-x-8 border-b border-white/20 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab("About")}
            className={`pb-3 sm:pb-4 px-1 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === "About" 
                ? "text-pink-500 border-b-2 border-pink-500" 
                : "text-white/60 hover:text-white"
            }`}
          >
            About
          </button>
          <button 
            onClick={() => setActiveTab("Services")}
            className={`pb-3 sm:pb-4 px-1 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === "Services" 
                ? "text-pink-500 border-b-2 border-pink-500" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Services
          </button>
          <button 
            onClick={() => setActiveTab("Media")}
            className={`pb-3 sm:pb-4 px-1 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === "Media" 
                ? "text-pink-500 border-b-2 border-pink-500" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Media
          </button>
          <button 
            onClick={() => setActiveTab("Reviews")}
            className={`pb-3 sm:pb-4 px-1 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === "Reviews" 
                ? "text-pink-500 border-b-2 border-pink-500" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-8 lg:px-12 pb-4 sm:pb-6">
        {activeTab === "About" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Gender</p>
                <p className="text-white text-sm sm:text-base capitalize">{authUser?.gender}</p>
              </div>
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Sexual Orientation</p>
                <p className="text-white text-sm sm:text-base">Null</p>
              </div>
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Looks</p>
                <p className="text-white text-sm sm:text-base">Null</p>
              </div>
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Education</p>
                <p className="text-white text-sm sm:text-base">{profile?.education}</p>
              </div>
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">City</p>
                <p className="text-white text-sm sm:text-base">{authUser?.city }</p>
              </div>
            </div>

            {/* Middle Column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Ethnicity</p>
                <p className="text-white text-sm sm:text-base">Null</p>
              </div>
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Body Build</p>
                <p className="text-white text-sm sm:text-base">Null</p>
              </div>
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Smoker</p>
                <p className="text-white text-sm sm:text-base">{profile?.smoker ? 'Yes' : 'No'}</p>
              </div>
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Country</p>
                <p className="text-white text-sm sm:text-base">{authUser?.country}</p>
              </div>
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Last Seen</p>
                <p className="text-white text-sm sm:text-base">18 hours ago (null)</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Nationality</p>
                <p className="text-white text-sm sm:text-base">{authUser?.country}</p>
              </div>
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Bust Size</p>
                <p className="text-white text-sm sm:text-base">Null</p>
              </div>
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Occupation</p>
                <p className="text-white text-sm sm:text-base">{profile?.occupation}</p>
              </div>
              <div className="flex-col pt-2 sm:pt-3 justify-between">
                <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">State</p>
                <p className="text-white text-sm sm:text-base">{authUser?.state }</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Services" && (
          <div className="space-y-8">
            {/* Services Grid */}
            <div className="flex flex-wrap gap-3">
              {[
                "Domination (Receiving)", "Lap Dance", "Belly Dance", "Tango", "Pole Fitness", "Being Filmed",
                "Salsa", "Bachata", "Girlfriend Experience", "Sex Toys", "Role Play & Fantasies", "Erotic Massage",
                "Erotic Spanking", "MMF 3somes", "Dinner Dates", "French Kissing", "Smoking Fetish"
              ].map((service, index) => (
                <button
                  key={index}
                  className="inline-flex px-4 py-2 border border-white/30 text-white text-sm rounded-full hover:border-pink-500 hover:text-pink-500 transition-colors whitespace-nowrap"
                >
                  {service}
                </button>
              ))}
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-pink-500">Pricing</h3>
                <Info className="w-5 h-5 text-white/60" />
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Short Time Card */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg text-center mb-4">
                    Short Time
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Incall</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-semibold">50,000.00 APH</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Outcall</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-semibold">80,000.00 APH</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overnight Card */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg text-center mb-4">
                    Overnight
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Incall</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-semibold">50,000.00 APH</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Outcall</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-semibold">80,000.00 APH</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekend Card */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg text-center mb-4">
                    Weekend
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Incall</span>
                      <span className="text-white/60">---</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Outcall</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-semibold">80,000.00 APH</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Media" && (
          <div className="space-y-6">
            {/* Media Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-pink-500">Media</h3>
              <div className="text-white/60 text-sm">
                {profile?.media?.length || 0} {profile?.media?.length === 1 ? 'item' : 'items'}
              </div>
            </div>

            {/* Media Grid */}
            {profile?.media && profile.media.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.media.map((mediaUrl, index) => {
                  // Check if media is video based on file extension
                  const isVideo = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(mediaUrl);
                  
                  return (
                    <div key={index} className="relative group cursor-pointer">
                      <div 
                        className="aspect-square rounded-2xl overflow-hidden bg-cover bg-center bg-gray-700"
                        style={{ 
                          backgroundImage: mediaUrl ? `url(${mediaUrl})` : 'none'
                        }}
                      >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                        
                        {/* Play Button for Videos */}
                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                            </div>
                          </div>
                        )}

                        {/* Media Type Indicator */}
                        <div className="absolute top-2 right-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isVideo 
                              ? 'bg-red-500/80 text-white' 
                              : 'bg-blue-500/80 text-white'
                          }`}>
                            {isVideo ? 'VIDEO' : 'IMAGE'}
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
                <div className="text-white/40 text-sm">This user hasn&apos;t uploaded any media yet.</div>
              </div>
            )}
          </div>
        )}

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
                          className="text-pink-500 hover:text-pink-400 transition-colors text-sm font-medium"
                        >
                          Write a reply
                        </button>
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
                                  <button className="flex items-center gap-1 text-white hover:text-white/80 transition-colors">
                                    <ThumbsUp className="w-3 h-3" />
                                  </button>
                                  <button className="flex items-center gap-1 text-white hover:text-white/80 transition-colors">
                                    <ThumbsDown className="w-3 h-3" />
                                  </button>
                                  <button className="text-[#E05050] hover:text-[#E05050]/80 transition-colors text-xs">
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
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed"
                              >
                                Reply
                              </button>
                              <button
                                onClick={handleCancelReply}
                                className="px-4 py-2 text-white/60 hover:text-white transition-colors text-sm"
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
              <button className="flex items-center gap-2 text-pink-500 hover:text-pink-400 transition-colors">
                <span>Show more reviews</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div> */}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Edit Profile</h2>
              <button 
                onClick={handleCloseModal}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>

            {/* First Form */}
            {currentFormStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 sm:px-4 h-12 sm:h-14 border border-[#807E7E] text-[#807E7E] rounded-[24px] sm:rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:text-[#807E7E] text-sm sm:text-base"
                        placeholder="Enter location"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ethnicity</label>
                      <select
                        value={formData.ethnicity}
                        onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                        className="w-full px-3 sm:px-4 h-12 sm:h-14 border border-[#807E7E] text-[#807E7E] rounded-[24px] sm:rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
                      >
                        <option value="" className="text-[#807E7E]">Select your ethnic group</option>
                        <option value="Black African" className="text-[#807E7E]">Black African</option>
                        <option value="White" className="text-[#807E7E]">White</option>
                        <option value="Asian" className="text-[#807E7E]">Asian</option>
                        <option value="Hispanic" className="text-[#807E7E]">Hispanic</option>
                        <option value="Mixed" className="text-[#807E7E]">Mixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sexual Orientation</label>
                      <select
                        value={formData.sexualOrientation}
                        onChange={(e) => handleInputChange('sexualOrientation', e.target.value)}
                        className="w-full px-4 h-14 border border-[#807E7E] text-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="Bisexual" className="text-[#807E7E]">Bisexual</option>
                        <option value="Straight" className="text-[#807E7E]">Straight</option>
                        <option value="Gay" className="text-[#807E7E]">Gay</option>
                        <option value="Lesbian" className="text-[#807E7E]">Lesbian</option>
                        <option value="Pansexual" className="text-[#807E7E]">Pansexual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bust Size</label>
                      <select
                        value={formData.bustSize}
                        onChange={(e) => handleInputChange('bustSize', e.target.value)}
                        className="w-full px-4 h-14 border border-[#807E7E] text-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="Small A-cup" className="text-[#807E7E]">Small A-cup</option>
                        <option value="Medium B-cup" className="text-[#807E7E]">Medium B-cup</option>
                        <option value="Medium C-cup" className="text-[#807E7E]">Medium C-cup</option>
                        <option value="Large D-cup" className="text-[#807E7E]">Large D-cup</option>
                        <option value="Extra Large DD-cup" className="text-[#807E7E]">Extra Large DD-cup</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white text-[#807E7E]"
                      >
                        <option value="" className="text-[#807E7E]">Select Gender</option>
                        <option value="Female" className="text-[#807E7E]">Female</option>
                        <option value="Male" className="text-[#807E7E]">Male</option>
                        <option value="Non-binary" className="text-[#807E7E]">Non-binary</option>
                        <option value="Transgender" className="text-[#807E7E]">Transgender</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                      <select
                        value={formData.nationality}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                        className="w-full px-4 h-14 border border-[#807E7E] text-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="" className="text-[#807E7E]">Select nationality</option>
                        <option value="Ghana" className="text-[#807E7E]">Ghana</option>
                        <option value="Nigeria" className="text-[#807E7E]">Nigeria</option>
                        <option value="South Africa" className="text-[#807E7E]">South Africa</option>
                        <option value="Kenya" className="text-[#807E7E]">Kenya</option>
                        <option value="Other" className="text-[#807E7E]">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Body Build</label>
                      <select
                        value={formData.bodyBuild}
                        onChange={(e) => handleInputChange('bodyBuild', e.target.value)}
                        className="w-full px-4 h-14 border border-[#807E7E] text-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="Slim" className="text-[#807E7E]">Slim</option>
                        <option value="Athletic" className="text-[#807E7E]">Athletic</option>
                        <option value="Average" className="text-[#807E7E]">Average</option>
                        <option value="Chubby" className="text-[#807E7E]">Chubby</option>
                        <option value="Curvy" className="text-[#807E7E]">Curvy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Looks</label>
                      <select
                        value={formData.looks}
                        onChange={(e) => handleInputChange('looks', e.target.value)}
                        className="w-full px-4 h-14 border border-[#807E7E] text-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="Cute" className="text-[#807E7E]">Cute</option>
                        <option value="Beautiful" className="text-[#807E7E]">Beautiful</option>
                        <option value="Sexy" className="text-[#807E7E]">Sexy</option>
                        <option value="Attractive" className="text-[#807E7E]">Attractive</option>
                        <option value="Gorgeous" className="text-[#807E7E]">Gorgeous</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-pink-500 font-medium hover:text-pink-600 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContinue}
                    className="px-6 sm:px-8 py-2 sm:py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm sm:text-base"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Second Form */}
            {currentFormStep === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Smoker</label>
                      <select
                        value={formData.smoker}
                        onChange={(e) => handleInputChange('smoker', e.target.value)}
                        className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] text-[#807E7E] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="Yes" className="text-[#807E7E]">Yes</option>
                        <option value="No" className="text-[#807E7E]">No</option>
                        <option value="Occasionally" className="text-[#807E7E]">Occasionally</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                      <select
                        value={formData.education}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] text-[#807E7E] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="High School" className="text-[#807E7E]">High School</option>
                        <option value="Bachelors" className="text-[#807E7E]">Bachelors</option>
                        <option value="Masters" className="text-[#807E7E]">Masters</option>
                        <option value="PhD" className="text-[#807E7E]">PhD</option>
                        <option value="Other" className="text-[#807E7E]">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] text-[#807E7E] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="Lagos" className="text-[#807E7E]">Lagos</option>
                        <option value="Abuja" className="text-[#807E7E]">Abuja</option>
                        <option value="Rivers" className="text-[#807E7E]">Rivers</option>
                        <option value="Kano" className="text-[#807E7E]">Kano</option>
                        <option value="Other" className="text-[#807E7E]">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                        className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent text-[#807E7E] placeholder:text-[#807E7E]"
                        placeholder="Enter occupation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="Nigeria" className="text-[#807E7E]">Nigeria</option>
                        <option value="Ghana" className="text-[#807E7E]">Ghana</option>
                        <option value="South Africa" className="text-[#807E7E]">South Africa</option>
                        <option value="Kenya" className="text-[#807E7E]">Kenya</option>
                        <option value="Other" className="text-[#807E7E]">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent text-[#807E7E] placeholder:text-[#807E7E]"
                        placeholder="Enter city"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Start writing here"
                    rows={4}
                    className="w-full px-4 pt-3 h-[138px] border border-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-[#807E7E] placeholder:text-[#807E7E]"
                  />
              </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    onClick={() => setCurrentFormStep(1)}
                    className="px-6 py-3 text-pink-500 font-medium hover:text-pink-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Upload Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Add Media</h2>
              <button 
                onClick={handleCloseMediaModal}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>

            {/* File Upload Area */}
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="media-upload"
                />
                <label
                  htmlFor="media-upload"
                  className="cursor-pointer flex flex-col items-center space-y-4"
                >
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                    <Edit className="w-8 h-8 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Upload Media</p>
                    <p className="text-sm text-gray-500">Click to select images or videos</p>
                    <p className="text-xs text-gray-400 mt-1">Supports: JPG, PNG, MP4, MOV, etc.</p>
                  </div>
                </label>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Selected Files ({selectedFiles.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Play className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button
                  onClick={handleCloseMediaModal}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-pink-500 font-medium hover:text-pink-600 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadMedia}
                  disabled={selectedFiles.length === 0}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm sm:text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Services Modal */}
      {isServicesModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1F1B2C] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Services</h2>
              <button 
                onClick={handleCloseServicesModal}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>

            {/* Services Grid */}
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {availableServices.map((service) => (
                  <button
                    key={service}
                    onClick={() => handleToggleService(service)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedServices.includes(service)
                        ? 'bg-pink-500 text-white border-2 border-pink-500'
                        : 'bg-transparent text-white border-2 border-white/30 hover:border-white/50'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>

              {/* Custom Services Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Others</h3>
                
                {/* Custom Services Tags */}
                {customServices.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customServices.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-pink-500 text-white rounded-full text-sm"
                      >
                        <span>{service}</span>
                        <button
                          onClick={() => handleRemoveCustomService(service)}
                          className="hover:text-pink-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Custom Service Input */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={customServiceInput}
                    onChange={(e) => setCustomServiceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomService()}
                    placeholder="Type here"
                    className="flex-1 px-4 py-3 bg-transparent border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                  <button
                    onClick={handleAddCustomService}
                    disabled={!customServiceInput.trim()}
                    className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 mt-6 border-t border-white/10">
              <button
                onClick={handleCloseServicesModal}
                className="px-4 sm:px-6 py-2 sm:py-3 text-pink-500 font-medium hover:text-pink-400 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitServices}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm sm:text-base"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
