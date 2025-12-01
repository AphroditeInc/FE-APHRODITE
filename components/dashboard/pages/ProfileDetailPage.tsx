"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Star, Check, Users, Calendar as CalendarIcon, Heart, BookOpen, MessageCircle, UserPlus, Info, Coins, Play, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
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


// Mock reviews data
const mockReviews = [
  {
    id: 1,
    name: "Raven Dan",
    initials: "RD",
    avatarColor: "bg-[#30B0B0]",
    rating: 4,
    timestamp: "2 months ago",
    text: "This girl is the best escort I've been with on here, she takes her time to make sure you are satisfied. Her blowjob is so sloppy and deep.I really had a nice time with her. I'm definitely going to fuck her big boobs again"
  },
  {
    id: 2,
    name: "Shegzzy",
    initials: "SG", 
    avatarColor: "bg-green-400",
    rating: 5,
    timestamp: "2 weeks ago",
    text: "Beautiful, sweet and naughty. She's the most polite and respectful sexy babe ever. Pussy so clean and tight. I'm definitely coming back for more. She dash me sweet videos sef."
  }
];

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("About");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  useEffect(() => {
    const profileId = params.id as string;
    const foundProfile = mockProfiles.find(p => p.id === profileId);
    if (foundProfile) {
      setProfile(foundProfile);
      // Start with the profile's corresponding image
      setCurrentImageIndex(parseInt(profileId) - 1);
    }
  }, [params.id]);

  // Cycle through images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleLike = () => {
    if (profile) {
      setProfile({
        ...profile,
        isLiked: !profile.isLiked
      });
    }
  };

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
                style={{ backgroundImage: `url(${backgroundImages[currentImageIndex]})` }}
              >
                <div className="absolute inset-0  "></div>
              </div>
              {/* Image carousel dots */}
              <div className="flex justify-center gap-2 mt-4">
                {backgroundImages.slice(0, 4).map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === (currentImageIndex % 4) ? 'bg-pink-500' : 'bg-white/30'
                    }`}
                  ></div>
                ))}
              </div>
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
                    // Pass userId and profile name for better chat experience
                    const queryParams = new URLSearchParams({
                      userId: params.id as string,
                      name: profile.name || 'User'
                    });
                    router.push(`/chat?${queryParams.toString()}`);
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
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
            {/* Media Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Image 1 */}
              <div className="relative group cursor-pointer">
                <div className="aspect-square rounded-2xl overflow-hidden bg-cover bg-center"
                     style={{ backgroundImage: `url(/media/media.svg)` }}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
              </div>

              {/* Image 2 */}
              <div className="relative group cursor-pointer">
                <div className="aspect-square rounded-2xl overflow-hidden bg-cover bg-center"
                     style={{ backgroundImage: `url(/media/media2.svg)` }}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
              </div>

              {/* Image 3 */}
              <div className="relative group cursor-pointer">
                <div className="aspect-square rounded-2xl overflow-hidden bg-cover bg-center"
                     style={{ backgroundImage: `url(/media/media3.svg)` }}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
              </div>

              {/* Video 1 */}
              <div className="relative group cursor-pointer">
                <div className="aspect-square rounded-2xl overflow-hidden bg-cover bg-center"
                     style={{ backgroundImage: `url(/media/media.svg)` }}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Video 2 */}
              <div className="relative group cursor-pointer">
                <div className="aspect-square rounded-2xl overflow-hidden bg-cover bg-center"
                     style={{ backgroundImage: `url(/media/media2.svg)` }}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              ))}
            </div>

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
