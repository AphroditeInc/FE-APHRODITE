"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import CustomDropdown from "@/components/CustomDropdown";
import DatePicker from "@/components/DatePicker";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Lock,
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  PenTool,
  ChevronDown,
  MarsStroke,
  EyeOff,
  Eye,
} from "lucide-react";

function DetailsForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<string>("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  
  // Get user type from URL parameters
  useEffect(() => {
    const userTypeParam = searchParams.get('userType');
    if (userTypeParam) {
      setUserType(userTypeParam);
    }
  }, [searchParams]);

  // Check for autofill values
  useEffect(() => {
    const checkAutofill = () => {
      if (passwordRef.current && passwordRef.current.value !== formData.password) {
        setFormData(prev => ({ ...prev, password: passwordRef.current?.value || "" }));
      }
      if (confirmPasswordRef.current && confirmPasswordRef.current.value !== formData.confirmPassword) {
        setFormData(prev => ({ ...prev, confirmPassword: confirmPasswordRef.current?.value || "" }));
      }
    };

    // Check immediately and after a delay for autofill
    checkAutofill();
    const timeout = setTimeout(checkAutofill, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    age: "",
    dateOfBirth: "",
    username: "",
    gender: "",

    // Step 2: Location & Security
    country: "",
    state: "",
    city: "",
    password: "",
    confirmPassword: "",

    // Step 3: Personal Details
    educationLevel: "",
    occupation: "",
    maritalStatus: "",
    bio: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Dropdown options
  const genderOptions = [
    { value: "", label: "Select Gender" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const countryOptions = [
    { value: "", label: "Select Country" },
    { value: "nigeria", label: "Nigeria" },
    { value: "usa", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "canada", label: "Canada" },
  ];

  const stateOptions = [
    { value: "", label: "State" },
    { value: "lagos", label: "Lagos" },
    { value: "abuja", label: "Abuja" },
    { value: "kano", label: "Kano" },
  ];

  const cityOptions = [
    { value: "", label: "City" },
    { value: "victoria-island", label: "Victoria Island" },
    { value: "ikeja", label: "Ikeja" },
    { value: "lekki", label: "Lekki" },
  ];

  const educationOptions = [
    { value: "", label: "Education Level" },
    { value: "high-school", label: "High School" },
    { value: "bachelors", label: "Bachelor's Degree" },
    { value: "masters", label: "Master's Degree" },
    { value: "phd", label: "PhD" },
  ];

  const maritalStatusOptions = [
    { value: "", label: "Marital Status" },
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
  ];



  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Handle final submission
    console.log("Form submitted:", formData);
    
    if (userType === "client" || userType === "aphroRyder") {
      // For clients and riders, redirect to dashboard or main app
      window.location.href = "/";
    } else {
      // For divas/hunks, proceed to ID verification
      window.location.href = "/id-verification";
    }
  };

  const isStep1Valid =
    formData.age === "Yes" && // Must be "Yes" to proceed
    formData.dateOfBirth &&
    formData.username &&
    formData.gender;
  const isStep2Valid =
    formData.country &&
    formData.state &&
    formData.city &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;
  const isStep3Valid =
    formData.educationLevel &&
    formData.occupation &&
    formData.maritalStatus &&
    formData.bio;

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Age Confirmation */}
      <div>
        <label className="block text-white/40 text-sm font-medium mb-3">
          Are you up to 18 years old yet?{" "}
          <span className="text-pink-500">*</span>
        </label>
        <div className="flex gap-4 w-full">
          {["Yes", "No"].map((option) => (
            <label key={option} className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="age"
                value={option}
                checked={formData.age === option}
                onChange={(e) => handleInputChange("age", e.target.value)}
                className="sr-only"
              />
              <div
                className={`flex items-center justify-between w-full py-3 px-4 rounded-[40px] border-2 transition-all duration-200 ${
                  formData.age === option
                    ? option === "No"
                      ? "border-red-500"
                      : "border-pink-500"
                    : "border-white/20"
                }`}
              >
                <span className="text-white font-medium">{option}</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    formData.age === option
                      ? option === "No"
                        ? "bg-red-500"
                        : "bg-pink-500"
                      : "border-2 border-white/30"
                  }`}
                >
                  {formData.age === option && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
        {/* {formData.age === "No" && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">
              Sorry, you must be at least 18 years old to proceed.
            </p>
          </div>
        )} */}
      </div>

      {/* Date of Birth */}
      <DatePicker
        value={formData.dateOfBirth}
        onChange={(value) => handleInputChange("dateOfBirth", value)}
        placeholder="Date of Birth"
      />

      {/* Username */}
      <div className="relative">
        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
        <input
          type="text"
          value={formData.username}
          onChange={(e) => handleInputChange("username", e.target.value)}
          className="w-full pl-12 pr-12 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="Username"
        />
        {formData.username && formData.username.length >= 3 && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Gender Selection */}
      <CustomDropdown
        value={formData.gender}
        onChange={(value) => handleInputChange("gender", value)}
        options={genderOptions}
        placeholder="Select Gender"
        icon={<MarsStroke className="h-5 w-5" />}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Country Selection */}
      <CustomDropdown
        value={formData.country}
        onChange={(value) => handleInputChange("country", value)}
        options={countryOptions}
        placeholder="Select Country"
        icon={<MapPin className="h-5 w-5" />}
      />

      {/* State & City */}
      <div className="grid grid-cols-2 gap-4">
        <CustomDropdown
          value={formData.state}
          onChange={(value) => handleInputChange("state", value)}
          options={stateOptions}
          placeholder="State"
          icon={<MapPin className="h-5 w-5" />}
        />
        <CustomDropdown
          value={formData.city}
          onChange={(value) => handleInputChange("city", value)}
          options={cityOptions}
          placeholder="City"
          icon={<MapPin className="h-5 w-5" />}
        />
      </div>

      {/* Suggested Password Button */}
      {/* <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSuggestedPassword}
          className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-[20px] text-white/80 hover:text-white transition-all duration-200"
        >
          <Key className="h-4 w-4" />
          <span className="text-sm">Use Suggested Password</span>
        </button>
      </div> */}

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
        <input
          ref={passwordRef}
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          className={`w-full pl-12 pr-12 py-3 bg-transparent border rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ${
            formData.password && formData.password.trim() !== "" 
              ? "border-pink-500" 
              : "border-white/20"
          }`}
          placeholder="Create Password"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
        <input
          ref={confirmPasswordRef}
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          className={`w-full pl-12 pr-12 py-3 bg-transparent border rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ${
            formData.confirmPassword && formData.confirmPassword.trim() !== "" 
              ? "border-pink-500" 
              : "border-white/20"
          }`}
          placeholder="Confirm Password"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
        >
          {showConfirmPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Education Level */}
      <CustomDropdown
        value={formData.educationLevel}
        onChange={(value) => handleInputChange("educationLevel", value)}
        options={educationOptions}
        placeholder="Education Level"
        icon={<GraduationCap className="h-5 w-5" />}
      />

      {/* Occupation */}
      <div className="relative">
        <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
        <input
          type="text"
          value={formData.occupation}
          onChange={(e) => handleInputChange("occupation", e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="Occupation"
        />
      </div>

      {/* Marital Status */}
      <CustomDropdown
        value={formData.maritalStatus}
        onChange={(value) => handleInputChange("maritalStatus", value)}
        options={maritalStatusOptions}
        placeholder="Marital Status"
        icon={<Heart className="h-5 w-5" />}
      />

      {/* Bio */}
      <div className="relative">
        <PenTool className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          rows={1}
          className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/20 rounded-[24px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
          placeholder="Write bio"
        />
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Basic Details";
      case 2:
        return "Location & Security";
      case 3:
        return "Personal Details";
      default:
        return "Basic Details";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Input basic details in all the fields provided below. We'll like to get to know you better.";
      case 2:
        return "Tell us where you're located and set up your account security.";
      case 3:
        return "Share more about yourself to help us personalize your experience.";
      default:
        return "Input basic details in all the fields provided below. We'll like to get to know you better.";
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 1:
        return "Continue";
      case 2:
        return "Continue";
      case 3:
        return (userType === "client" || userType === "aphroRyder") ? "Finish Setup" : "Proceed to ID Verification";
      default:
        return "Continue";
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <AuthCard title={getStepTitle()} description={getStepDescription()}>
        <div className="space-y-8">
          {/* Progress Indicator */}
          <div className="flex gap-5">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1 w-full rounded-full transition-all duration-300 ${
                  step <= currentStep ? "bg-pink-500" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Form Content */}
          <div className="min-h-[300px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentStep > 1 && (
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="w-[30%]"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              disabled={!canProceed()}
              className={`${currentStep === 1 ? "w-full" : "w-[70%]"} ${
                currentStep === 3
                  ? "bg-gradient-to-r from-pink-500 to-pink-600"
                  : ""
              }`}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <DetailsForm />
    </Suspense>
  );
}
