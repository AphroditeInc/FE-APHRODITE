"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import CustomDropdown from "@/components/CustomDropdown";
import DatePicker from "@/components/DatePicker";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  useCompleteBasicDetailsMutation, 
  useRegisterWithEmailMutation, 
  useUpdateUserMutation, 
  useUpdateAuthProfileMutation 
} from "@/feature/authentication/authApiSlice";
import { useCreateProfileMutation } from "@/feature/profile/profileApiSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCredentials, selectCurrentUser } from "@/feature/authentication/authSlice";
import {
  User,
  Lock,
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  PenTool,
  Mail,
  MarsStroke,
  EyeOff,
  Eye,
} from "lucide-react";

function DetailsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const [completeBasicDetails, { isLoading: isCompletingBasic }] = useCompleteBasicDetailsMutation();
  const [registerWithEmail, { isLoading: isRegisteringEmail }] = useRegisterWithEmailMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateAuthProfileMutation();
  const [createProfile, { isLoading: isCreatingProfile }] = useCreateProfileMutation();
  const [error, setError] = useState<string | null>(null);
  const isLoading = isCompletingBasic || isRegisteringEmail || isUpdatingUser || isUpdatingProfile || isCreatingProfile;
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // Get user type and userId from URL parameters
  useEffect(() => {
    const userTypeParam = searchParams.get("userType");
    const userIdParam = searchParams.get("userId");
    if (userTypeParam) {
      setUserType(userTypeParam);
    }
    if (userIdParam) {
      setUserId(userIdParam);
    }
  }, [searchParams]);

  // Also try to get userId from context user
  useEffect(() => {
    if (user?.id && !userId) {
      setUserId(user.id);
    }
  }, [user, userId]);

  // Check for autofill values
  useEffect(() => {
    const checkAutofill = () => {
      if (
        passwordRef.current &&
        passwordRef.current.value !== formData.password
      ) {
        setFormData((prev) => ({
          ...prev,
          password: passwordRef.current?.value || "",
        }));
      }
      if (
        confirmPasswordRef.current &&
        confirmPasswordRef.current.value !== formData.confirmPassword
      ) {
        setFormData((prev) => ({
          ...prev,
          confirmPassword: confirmPasswordRef.current?.value || "",
        }));
      }
    };

    checkAutofill();
    const timeout = setTimeout(checkAutofill, 100);

    return () => clearTimeout(timeout);
  }, []);

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    age: "",
    dateOfBirth: "",
    email: "",
    firstName: "",
    lastName: "",
    username: "",
    gender: "",

    // Step 2: Location & Security
    country: "",
    state: "",
    city: "",
    password: "",
    confirmPassword: "",

    // Step 3: Personal Details (optional)
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
    { value: "Nigeria", label: "Nigeria" },
    { value: "United States", label: "United States" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Canada", label: "Canada" },
  ];

  const stateOptions = [
    { value: "", label: "State" },
    { value: "Lagos", label: "Lagos" },
    { value: "Abuja", label: "Abuja" },
    { value: "Kano", label: "Kano" },
    { value: "California", label: "California" },
    { value: "New York", label: "New York" },
  ];

  const cityOptions = [
    { value: "", label: "City" },
    { value: "Victoria Island", label: "Victoria Island" },
    { value: "Ikeja", label: "Ikeja" },
    { value: "Lekki", label: "Lekki" },
    { value: "Los Angeles", label: "Los Angeles" },
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


  const handleSubmit = async () => {
    const finalUserId = userId || user?.id;
    setError(null);

    try {
      // Check if this is phone registration (has userId) or email registration (no userId)
      if (finalUserId) {
        // Phone Registration Path: Complete basic details
        const basicDetailsPayload = {
          is18: formData.age === "Yes",
          dob: formData.dateOfBirth,
          username: formData.username + Math.random().toString(36).substr(2, 5), // Add random suffix to ensure uniqueness
          gender: formData.gender,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          password: formData.password,
        };

        console.log("Sending basic details payload:", basicDetailsPayload);
        const result = await completeBasicDetails({ userId: finalUserId, ...basicDetailsPayload }).unwrap();
        console.log("Basic details response:", result);

        if (result && result.data) {
          const data = result.data;
          // Handle different response formats
          const tokens = data.tokens || data;
          const userData = data.user || data.data?.user;
          
          if (tokens && (tokens.accessToken || tokens.access_token)) {
            dispatch(setCredentials({
              access_token: tokens.accessToken || tokens.access_token,
              refresh_token: tokens.refreshToken || tokens.refresh_token,
              user: userData,
              uid: userData?.id || data.uid || data.userId,
            }));
          }
          
          console.log("Basic details completed successfully, user is now authenticated");
          
          if (currentStep === 3) {
            // Create profile with bio, education, occupation, maritalStatus
            const currentUserId = userData?.id || data.uid || data.userId || finalUserId;
            
            if (currentUserId && (formData.bio || formData.educationLevel || formData.occupation || formData.maritalStatus)) {
              try {
                const profilePayload = {
                  userId: currentUserId,
                  bio: formData.bio || "",
                  education: formData.educationLevel || "",
                  occupation: formData.occupation || "",
                  maritalStatus: formData.maritalStatus || "",
                };
                
                console.log("Creating profile with:", profilePayload);
                await createProfile(profilePayload).unwrap();
                console.log("Profile created successfully");
              } catch (error: unknown) {
                console.error("Profile creation error:", error);
                const errorMessage = (error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data)
                  ? String(error.data.message)
                  : (error && typeof error === 'object' && 'message' in error)
                    ? String(error.message)
                    : 'Failed to create profile';
                setError(errorMessage);
                return; // Don't proceed if profile creation fails
              }
            }
            
            // Move to step 4 (profile details)
            setCurrentStep(4);
          } else if (currentStep === 4) {
            // Handle profile update with firstName, lastName, email
            const profileUpdatePayload = {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
            };

            console.log("Updating profile with:", profileUpdatePayload);
            try {
              await updateProfile(profileUpdatePayload).unwrap();
              console.log("Profile updated successfully");
              // Profile updated successfully, redirect to dashboard
              router.push("/dashboard");
            } catch (error: unknown) {
              console.error("Profile update error:", error);
              const errorMessage = (error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data)
                ? String(error.data.message)
                : (error && typeof error === 'object' && 'message' in error)
                  ? String(error.message)
                  : 'Profile update failed';
              setError(errorMessage);
            }
          }
        }
      } else {
        // Email Registration Path: Register with email and password
        const emailRegistrationPayload = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userType: userType as "client" | "rider" | "diva" | "hunk",
          countryCode: "+1", // Default country code for email registration
          number: "0000000000", // Placeholder number for email registration
        };

        const result = await registerWithEmail(emailRegistrationPayload).unwrap();

        if (result && result.data) {
          const newUserId = result.data.user.id;

          if (currentStep === 2) {
            // Move to step 3 (personal details - optional)
            setCurrentStep(3);
          } else if (currentStep === 3) {
            // Create profile with bio, education, occupation, maritalStatus
            if (newUserId && (formData.educationLevel || formData.occupation || formData.maritalStatus || formData.bio)) {
              try {
                const profilePayload = {
                  userId: newUserId,
                  bio: formData.bio || "",
                  education: formData.educationLevel || "",
                  occupation: formData.occupation || "",
                  maritalStatus: formData.maritalStatus || "",
                };

                console.log("Creating profile with:", profilePayload);
                await createProfile(profilePayload).unwrap();
                console.log("Profile created successfully");
              } catch (error: unknown) {
                console.error("Profile creation error:", error);
                const errorMessage = (error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data)
                  ? String(error.data.message)
                  : (error && typeof error === 'object' && 'message' in error)
                    ? String(error.message)
                    : 'Failed to create profile';
                setError(errorMessage);
                return; // Don't proceed if profile creation fails
              }
            }
            
            // Redirect to dashboard
            router.push("/dashboard");
          }
        }
      }
    } catch (error: unknown) {
      console.error("Failed to complete registration:", error);
      const errorMessage = (error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data)
        ? String(error.data.message)
        : (error && typeof error === 'object' && 'message' in error)
          ? String(error.message)
          : 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  // Check if this is phone registration (has userId) or email registration (no userId)
  const isPhoneRegistration = userId || user?.id;
  
  const isStep1Valid = isPhoneRegistration
    ? // Phone registration: basic details only
      formData.age === "Yes" &&
      formData.dateOfBirth &&
      formData.username &&
      formData.gender
    : // Email registration: personal details
      formData.firstName &&
      formData.lastName &&
      userType;

  const isStep2Valid =
    formData.country &&
    formData.state &&
    formData.city &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  // Step 3 is optional personal details - always valid since it's optional
  const isStep3Valid = true;

  // Step 4 is profile details (only for phone registration)
  const isStep4Valid = isPhoneRegistration
    ? formData.firstName &&
      formData.lastName &&
      formData.email
    : true; // Email registration doesn't have step 4


  const renderStep1 = () => (
    <div className="space-y-6">
      {isPhoneRegistration ? (
        // Phone Registration: Basic Details
        <>
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
        </>
      ) : (
        // Email Registration: Personal Details
        <>
          {/* First Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="First Name"
              required
            />
          </div>

          {/* Last Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Last Name"
              required
            />
          </div>

          {/* User Type */}
          <CustomDropdown
            value={userType}
            onChange={(value) => setUserType(value)}
            options={[
              { value: "client", label: "Client" },
              { value: "rider", label: "Rider" },
              { value: "diva", label: "Diva" },
              { value: "hunk", label: "Hunk" },
            ]}
            placeholder="Select User Type"
            icon={<User className="h-5 w-5" />}
          />
        </>
      )}
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
          required
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
              ? formData.password === formData.confirmPassword
                ? "border-green-500"
                : "border-red-500"
              : "border-white/20"
          }`}
          placeholder="Confirm Password"
          autoComplete="new-password"
          required
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
        {formData.confirmPassword && formData.password === formData.confirmPassword && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
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

    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Personal Details (Optional) */}
      {/* Education Level */}
      <CustomDropdown
        value={formData.educationLevel}
        onChange={(value) => handleInputChange("educationLevel", value)}
        options={educationOptions}
        placeholder="Education Level (Optional)"
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
          placeholder="Occupation (Optional)"
        />
      </div>

      {/* Marital Status */}
      <CustomDropdown
        value={formData.maritalStatus}
        onChange={(value) => handleInputChange("maritalStatus", value)}
        options={maritalStatusOptions}
        placeholder="Marital Status (Optional)"
        icon={<Heart className="h-5 w-5" />}
      />

      {/* Bio */}
      <div className="relative">
        <PenTool className="absolute left-4 top-4 text-white/60 h-5 w-5" />
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          rows={3}
          className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/20 rounded-[24px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
          placeholder="Write a short bio about yourself (Optional)"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Profile Details (firstName, lastName, email) - Only for phone registration */}
      {/* First Name */}
      <div className="relative">
        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="First Name"
          required
        />
      </div>

      {/* Last Name */}
      <div className="relative">
        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="Last Name"
          required
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="Email Address"
          required
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
        return "Personal Details (Optional)";
      case 4:
        return "Profile Details";
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
        return "Share more about yourself to help us personalize your experience. (Optional)";
      case 4:
        return "Complete your profile with your personal information.";
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
        return "Finish Setup";
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
      case 4:
        return isStep4Valid;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <AuthCard title={getStepTitle()} description={getStepDescription()}>
        <div className="space-y-8">
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

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
            {currentStep === 4 && renderStep4()}
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
              onClick={
                currentStep === 3 || currentStep === 4
                  ? handleSubmit 
                  : handleNext
              }
              disabled={!canProceed() || isLoading}
              className={`${currentStep === 1 ? "w-full" : "w-[70%]"} ${
                currentStep === 3 || currentStep === 4
                  ? "bg-gradient-to-r from-pink-500 to-pink-600"
                  : ""
              }`}
            >
              {isLoading ? "Submitting..." : getButtonText()}
            </Button>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <DetailsForm />
    </Suspense>
  );
}
