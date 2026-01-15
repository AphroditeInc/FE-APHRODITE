"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useUpdateProfileMutation } from "@/feature/profile/profileApiSlice";

type ProfileEditModalProps = {
  open: boolean;
  onClose: () => void;
  profile: any;
  authUser: any;
  onUpdated: () => Promise<void> | void;
};

export function ProfileEditModal({
  open,
  onClose,
  profile,
  authUser,
  onUpdated,
}: ProfileEditModalProps) {
  const [currentFormStep, setCurrentFormStep] = useState(1);
  const [formData, setFormData] = useState({
    location: "Rumuokoro, Port Harcourt",
    ethnicity: "",
    sexualOrientation: "Bisexual",
    bustSize: "Medium C-cup",
    gender: "",
    nationality: "",
    bodyBuild: "Chubby",
    looks: "Sexy",
    smoker: "Yes",
    education: "Bachelors",
    state: "Lagos",
    occupation: "Yoga Instructor",
    country: "Nigeria",
    city: "Lekki",
    bio: "",
  });

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  useEffect(() => {
    if (open && profile) {
      setFormData(prev => ({
        ...prev,
        ethnicity: profile.ethnicity || prev.ethnicity,
        sexualOrientation: profile.sexualOrientation || prev.sexualOrientation,
        bustSize: profile.bustSize || prev.bustSize,
        gender: profile.gender || prev.gender,
        nationality: profile.nationality || prev.nationality,
        bodyBuild: profile.bodyBuild || prev.bodyBuild,
        looks: profile.looks || prev.looks,
        smoker: profile.smoker === true ? "Yes" : profile.smoker === false ? "No" : prev.smoker,
        education: profile.education || prev.education,
        state: profile.state || authUser?.state || prev.state,
        occupation: profile.occupation || prev.occupation,
        country: authUser?.country || prev.country,
        city: profile.city || authUser?.city || prev.city,
        bio: profile.bio || prev.bio,
      }));
      setCurrentFormStep(1);
    }
  }, [open, profile, authUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    setCurrentFormStep(2);
  };

  const handleSubmit = async () => {
    const profileId = profile?.id || null;

    if (!profileId) {
      alert("Profile ID not found. Please ensure your profile is created first.");
      return;
    }

    try {
      const smokerValue =
        formData.smoker === "Yes" ? true : formData.smoker === "No" ? false : undefined;

      const mediaUrls =
        profile?.media && Array.isArray(profile.media) ? profile.media : [];

      const serviceIds =
        profile?.services && Array.isArray(profile.services)
          ? profile.services
              .map((service: any) =>
                typeof service === "string" ? service : service.id || service.name || ""
              )
              .filter((s: string) => s !== "")
          : [];

      const updatePayload: Record<string, unknown> = {
        gender: formData.gender || undefined,
        sexualOrientation: formData.sexualOrientation || undefined,
        bodyBuild: formData.bodyBuild || undefined,
        bustSize: formData.bustSize || undefined,
        nationality: formData.nationality || undefined,
        ethnicity: formData.ethnicity || undefined,
        state: formData.state || undefined,
        city: formData.city || undefined,
        smoker: smokerValue,
        looks: formData.looks || undefined,
        bio: formData.bio || undefined,
        education: formData.education || undefined,
        occupation: formData.occupation || undefined,
        maritalStatus: profile?.maritalStatus || undefined,
        media: mediaUrls,
        services: serviceIds,
      };

      const cleanedPayload = Object.fromEntries(
        Object.entries(updatePayload).filter(([, value]) => value !== undefined)
      );

      const result = await updateProfile({
        id: profileId,
        data: cleanedPayload,
      }).unwrap();

      if (result) {
        await onUpdated();
        setCurrentFormStep(1);
        onClose();
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Unknown error occurred during profile update.";
      alert(`Error updating profile: ${errorMessage}`);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>

        {currentFormStep === 1 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => handleInputChange("location", e.target.value)}
                    className="w-full px-3 sm:px-4 h-12 sm:h-14 border border-[#807E7E] text-[#807E7E] rounded-[24px] sm:rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:text-[#807E7E] text-sm sm:text-base"
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ethnicity</label>
                  <select
                    value={formData.ethnicity}
                    onChange={e => handleInputChange("ethnicity", e.target.value)}
                    className="w-full px-3 sm:px-4 h-12 sm:h-14 border border-[#807E7E] text-[#807E7E] rounded-[24px] sm:rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
                  >
                    <option value="" className="text-[#807E7E]">
                      Select your ethnic group
                    </option>
                    <option value="Black African" className="text-[#807E7E]">
                      Black African
                    </option>
                    <option value="White" className="text-[#807E7E]">
                      White
                    </option>
                    <option value="Asian" className="text-[#807E7E]">
                      Asian
                    </option>
                    <option value="Hispanic" className="text-[#807E7E]">
                      Hispanic
                    </option>
                    <option value="Mixed" className="text-[#807E7E]">
                      Mixed
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexual Orientation
                  </label>
                  <select
                    value={formData.sexualOrientation}
                    onChange={e => handleInputChange("sexualOrientation", e.target.value)}
                    className="w-full px-4 h-14 border border-[#807E7E] text-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="Bisexual" className="text-[#807E7E]">
                      Bisexual
                    </option>
                    <option value="Straight" className="text-[#807E7E]">
                      Straight
                    </option>
                    <option value="Gay" className="text-[#807E7E]">
                      Gay
                    </option>
                    <option value="Lesbian" className="text-[#807E7E]">
                      Lesbian
                    </option>
                    <option value="Pansexual" className="text-[#807E7E]">
                      Pansexual
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bust Size</label>
                  <select
                    value={formData.bustSize}
                    onChange={e => handleInputChange("bustSize", e.target.value)}
                    className="w-full px-4 h-14 border border-[#807E7E] text-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="Small A-cup" className="text-[#807E7E]">
                      Small A-cup
                    </option>
                    <option value="Medium B-cup" className="text-[#807E7E]">
                      Medium B-cup
                    </option>
                    <option value="Medium C-cup" className="text-[#807E7E]">
                      Medium C-cup
                    </option>
                    <option value="Large D-cup" className="text-[#807E7E]">
                      Large D-cup
                    </option>
                    <option value="Extra Large DD-cup" className="text-[#807E7E]">
                      Extra Large DD-cup
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => handleInputChange("gender", e.target.value)}
                    className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white text-[#807E7E]"
                  >
                    <option value="" className="text-[#807E7E]">
                      Select Gender
                    </option>
                    <option value="Female" className="text-[#807E7E]">
                      Female
                    </option>
                    <option value="Male" className="text-[#807E7E]">
                      Male
                    </option>
                    <option value="Non-binary" className="text-[#807E7E]">
                      Non-binary
                    </option>
                    <option value="Transgender" className="text-[#807E7E]">
                      Transgender
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                  <select
                    value={formData.nationality}
                    onChange={e => handleInputChange("nationality", e.target.value)}
                    className="w-full px-4 h-14 border border-[#807E7E] text-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="" className="text-[#807E7E]">
                      Select nationality
                    </option>
                    <option value="Ghana" className="text-[#807E7E]">
                      Ghana
                    </option>
                    <option value="Nigeria" className="text-[#807E7E]">
                      Nigeria
                    </option>
                    <option value="South Africa" className="text-[#807E7E]">
                      South Africa
                    </option>
                    <option value="Kenya" className="text-[#807E7E]">
                      Kenya
                    </option>
                    <option value="Other" className="text-[#807E7E]">
                      Other
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body Build</label>
                  <select
                    value={formData.bodyBuild}
                    onChange={e => handleInputChange("bodyBuild", e.target.value)}
                    className="w-full px-4 h-14 border border-[#807E7E] text-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="Slim" className="text-[#807E7E]">
                      Slim
                    </option>
                    <option value="Athletic" className="text-[#807E7E]">
                      Athletic
                    </option>
                    <option value="Average" className="text-[#807E7E]">
                      Average
                    </option>
                    <option value="Chubby" className="text-[#807E7E]">
                      Chubby
                    </option>
                    <option value="Curvy" className="text-[#807E7E]">
                      Curvy
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Looks</label>
                  <select
                    value={formData.looks}
                    onChange={e => handleInputChange("looks", e.target.value)}
                    className="w-full px-4 h-14 border border-[#807E7E] text-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="Cute" className="text-[#807E7E]">
                      Cute
                    </option>
                    <option value="Beautiful" className="text-[#807E7E]">
                      Beautiful
                    </option>
                    <option value="Sexy" className="text-[#807E7E]">
                      Sexy
                    </option>
                    <option value="Attractive" className="text-[#807E7E]">
                      Attractive
                    </option>
                    <option value="Gorgeous" className="text-[#807E7E]">
                      Gorgeous
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                onClick={onClose}
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

        {currentFormStep === 2 && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Smoker</label>
                  <select
                    value={formData.smoker}
                    onChange={e => handleInputChange("smoker", e.target.value)}
                    className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] text-[#807E7E] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="Yes" className="text-[#807E7E]">
                      Yes
                    </option>
                    <option value="No" className="text-[#807E7E]">
                      No
                    </option>
                    <option value="Occasionally" className="text-[#807E7E]">
                      Occasionally
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                  <select
                    value={formData.education}
                    onChange={e => handleInputChange("education", e.target.value)}
                    className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] text-[#807E7E] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="High School" className="text-[#807E7E]">
                      High School
                    </option>
                    <option value="Bachelors" className="text-[#807E7E]">
                      Bachelors
                    </option>
                    <option value="Masters" className="text-[#807E7E]">
                      Masters
                    </option>
                    <option value="PhD" className="text-[#807E7E]">
                      PhD
                    </option>
                    <option value="Other" className="text-[#807E7E]">
                      Other
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    value={formData.state}
                    onChange={e => handleInputChange("state", e.target.value)}
                    className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] text-[#807E7E] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="Lagos" className="text-[#807E7E]">
                      Lagos
                    </option>
                    <option value="Abuja" className="text-[#807E7E]">
                      Abuja
                    </option>
                    <option value="Rivers" className="text-[#807E7E]">
                      Rivers
                    </option>
                    <option value="Kano" className="text-[#807E7E]">
                      Kano
                    </option>
                    <option value="Other" className="text-[#807E7E]">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={e => handleInputChange("occupation", e.target.value)}
                    className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent text-[#807E7E] placeholder:text-[#807E7E]"
                    placeholder="Enter occupation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select
                    value={formData.country}
                    onChange={e => handleInputChange("country", e.target.value)}
                    className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="Nigeria" className="text-[#807E7E]">
                      Nigeria
                    </option>
                    <option value="Ghana" className="text-[#807E7E]">
                      Ghana
                    </option>
                    <option value="South Africa" className="text-[#807E7E]">
                      South Africa
                    </option>
                    <option value="Kenya" className="text-[#807E7E]">
                      Kenya
                    </option>
                    <option value="Other" className="text-[#807E7E]">
                      Other
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => handleInputChange("city", e.target.value)}
                    className="w-full px-4 h-14 border border-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent text-[#807E7E] placeholder:text-[#807E7E]"
                    placeholder="Enter city"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={e => handleInputChange("bio", e.target.value)}
                placeholder="Start writing here"
                rows={4}
                className="w-full px-4 pt-3 h-[138px] border border-[#807E7E] rounded-[32px] focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-[#807E7E] placeholder:text-[#807E7E]"
              />
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={() => setCurrentFormStep(1)}
                className="px-6 py-3 text-pink-500 font-medium hover:text-pink-600 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUpdatingProfile}
                className="px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isUpdatingProfile ? "Updating..." : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

