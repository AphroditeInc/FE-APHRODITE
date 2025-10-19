"use client";

import { User, Mail, Phone, MapPin, Calendar, Edit, ArrowLeft, Star, Check, Users, Calendar as CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { useEnrichedProfile } from "@/lib/hooks/useEnrichedProfile";
import { useAuth } from "@/lib/hooks/useAuth";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { profile, loading, error, refetch } = useEnrichedProfile(authUser?.id || null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentFormStep, setCurrentFormStep] = useState(1);
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
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
        >
          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Edit Profile</span>
          <span className="sm:hidden">Edit</span>
        </button>
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
                {profile?.user?.firstName} {profile?.user?.lastName}
              </h1>
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
            
            {/* Username and User Type */}
            <div className="flex items-center gap-2">
              <span className="text-pink-300">@{profile?.user?.userName}</span>
              <span className="text-sm text-gray-400 capitalize">• {profile?.user?.userType}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
              <span className="text-white text-sm sm:text-base">Port-Harcourt</span>
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
          <button className="pb-3 sm:pb-4 px-1 text-pink-500 font-semibold border-b-2 border-pink-500 text-sm sm:text-base whitespace-nowrap">
            About
          </button>
          <button className="pb-3 sm:pb-4 px-1 text-white/60 hover:text-white transition-colors text-sm sm:text-base whitespace-nowrap">
            Services
          </button>
          <button className="pb-3 sm:pb-4 px-1 text-white/60 hover:text-white transition-colors text-sm sm:text-base whitespace-nowrap">
            Media
          </button>
          <button className="pb-3 sm:pb-4 px-1 text-white/60 hover:text-white transition-colors text-sm sm:text-base whitespace-nowrap">
            Reviews
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="px-4 sm:px-8 lg:px-12 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column */}
            <div className="space-y-3 sm:space-y-4">
            <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Gender</p>
              <p className="text-white text-sm sm:text-base">Female</p>
            </div>
            <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Sexual Orientation</p>
              <p className="text-white text-sm sm:text-base">Bisexual</p>
            </div>
            <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Looks</p>
              <p className="text-white text-sm sm:text-base">Sexy</p>
            </div>
            <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Education</p>
              <p className="text-white text-sm sm:text-base">Bachelors</p>
            </div>
            <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">City</p>
              <p className="text-white text-sm sm:text-base">Lekki</p>
                </div>
              </div>

          {/* Middle Column */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Email</p>
              <p className="text-white text-sm sm:text-base break-all">{authUser?.email || 'Not provided'}</p>
            </div>
            <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">User ID</p>
              <p className="text-white text-xs sm:text-sm break-all">{authUser?.id || 'Not available'}</p>
            </div>
            <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Member Since</p>
              <p className="text-white text-sm sm:text-base">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}</p>
            </div>
            <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Last Updated</p>
              <p className="text-white text-sm sm:text-base">{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</p>
            </div>
            <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Status</p>
              <p className="text-white text-sm sm:text-base">Active</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
              <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Nationality</p>
              <p className="text-white text-sm sm:text-base">Ghana</p>
            </div>
            <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Bust Size</p>
              <p className="text-white text-sm sm:text-base">Medium C - Cup</p>
            </div>
            <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Occupation</p>
              <p className="text-white text-sm sm:text-base">Front Desk Secretary</p>
            </div>
              <div className="flex-col pt-2 sm:pt-3 justify-between">
              <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">State</p>
              <p className="text-white text-sm sm:text-base">Lagos</p>
            </div>
          </div>
        </div>
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

    </div>
  );
}
