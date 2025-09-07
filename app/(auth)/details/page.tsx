"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import { useState } from "react";
import {
  Calendar,
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

export default function DetailsPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    // Redirect to next step
    window.location.href = "/id-verification";
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
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          className="w-full pl-12 pr-12 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          placeholder="Date of Birth"
        />
        <ChevronDown
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            const div = (e.target as HTMLElement).closest("div");
            const input = div
              ? (div.querySelector("input") as HTMLInputElement)
              : null;
            if (input && input.showPicker) {
              input.showPicker();
            }
          }}
        />
      </div>

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
      <div className="relative">
        <MarsStroke className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />

        <select
          value={formData.gender}
          onChange={(e) => handleInputChange("gender", e.target.value)}
          className="w-full pl-12 pr-12 py-3 bg-transparent border border-white/20 rounded-[40px] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
        >
          <option value="" className="bg-gray-800 text-white">
            Select Gender
          </option>
          <option value="male" className="bg-gray-800 text-white">
            Male
          </option>
          <option value="female" className="bg-gray-800 text-white">
            Female
          </option>
          <option value="other" className="bg-gray-800 text-white">
            Other
          </option>
        </select>
        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 pointer-events-none" />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Country Selection */}
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
        <select
          value={formData.country}
          onChange={(e) => handleInputChange("country", e.target.value)}
          className="w-full pl-12 pr-12 py-3 bg-transparent border border-white/20 rounded-[40px] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
        >
          <option value="" className="bg-gray-800 text-white">
            Select Country
          </option>
          <option value="nigeria" className="bg-gray-800 text-white">
            Nigeria
          </option>
          <option value="usa" className="bg-gray-800 text-white">
            United States
          </option>
          <option value="uk" className="bg-gray-800 text-white">
            United Kingdom
          </option>
          <option value="canada" className="bg-gray-800 text-white">
            Canada
          </option>
        </select>
        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 pointer-events-none" />
      </div>

      {/* State & City */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
          <select
            value={formData.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-transparent border border-white/20 rounded-[40px] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
          >
            <option value="" className="bg-gray-800 text-white">
              State
            </option>
            <option value="lagos" className="bg-gray-800 text-white">
              Lagos
            </option>
            <option value="abuja" className="bg-gray-800 text-white">
              Abuja
            </option>
            <option value="kano" className="bg-gray-800 text-white">
              Kano
            </option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 pointer-events-none" />
        </div>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
          <select
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-transparent border border-white/20 rounded-[40px] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
          >
            <option value="" className="bg-gray-800 text-white">
              City
            </option>
            <option value="victoria-island" className="bg-gray-800 text-white">
              Victoria Island
            </option>
            <option value="ikeja" className="bg-gray-800 text-white">
              Ikeja
            </option>
            <option value="lekki" className="bg-gray-800 text-white">
              Lekki
            </option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 pointer-events-none" />
        </div>
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
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          className={`w-full pl-12 pr-12 py-3 border border-white/20 rounded-[40px] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 -webkit-appearance-none ${
            formData.password
              ? "bg-transparent text-white"
              : "bg-transparent text-white"
          }`}
          placeholder="Create Password"
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
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          className={`w-full pl-12 pr-12 py-3 border border-white/20 rounded-[40px] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ${
            formData.confirmPassword
              ? "bg-transparent text-white"
              : "bg-transparent text-white"
          }`}
          placeholder="Confirm Password"
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
      <div className="relative">
        <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
        <select
          value={formData.educationLevel}
          onChange={(e) => handleInputChange("educationLevel", e.target.value)}
          className="w-full pl-12 pr-12 py-3 bg-transparent border border-white/20 rounded-[40px] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
        >
          <option value="" className="bg-gray-800 text-white">
            Education Level
          </option>
          <option value="high-school" className="bg-gray-800 text-white">
            High School
          </option>
          <option value="bachelors" className="bg-gray-800 text-white">
            Bachelor&apos;s Degree
          </option>
          <option value="masters" className="bg-gray-800 text-white">
            Master&apos;s Degree
          </option>
          <option value="phd" className="bg-gray-800 text-white">
            PhD
          </option>
        </select>
        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 pointer-events-none" />
      </div>

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
      <div className="relative">
        <Heart className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
        <select
          value={formData.maritalStatus}
          onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
          className="w-full pl-12 pr-12 py-3 bg-transparent border border-white/20 rounded-[40px] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
        >
          <option value="" className="bg-gray-800 text-white">
            Marital Status
          </option>
          <option value="single" className="bg-gray-800 text-white">
            Single
          </option>
          <option value="married" className="bg-gray-800 text-white">
            Married
          </option>
          <option value="divorced" className="bg-gray-800 text-white">
            Divorced
          </option>
          <option value="widowed" className="bg-gray-800 text-white">
            Widowed
          </option>
        </select>
        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 pointer-events-none" />
      </div>

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
        return "Proceed to ID Verification";
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
                className="flex-1"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              disabled={!canProceed()}
              className={`flex-1 ${
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
