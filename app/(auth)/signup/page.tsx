"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import CustomDropdown from "@/components/CustomDropdown";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import apple from "../../../public/icons/apple.svg";
import facebook from "../../../public/icons/facebook.svg";
import { Phone, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRegisterUserMutation, useRegisterWithEmailMutation } from "@/feature/authentication/authApiSlice";
import { useState } from "react";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registerUser, { isLoading: isRegisteringUser }] = useRegisterUserMutation();
  const [registerWithEmail, { isLoading: isRegisteringEmail }] = useRegisterWithEmailMutation();
  const [error, setError] = useState<string | null>(null);
  const isLoading = isRegisteringUser || isRegisteringEmail;
  const [userType, setUserType] = useState<string>("");
  const [registrationMethod, setRegistrationMethod] = useState<"phone" | "email">("phone");

  const [formData, setFormData] = useState({
    phone: "",
    countryCode: "+1", // Default to USA
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const [phoneValid, setPhoneValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);

  // Get user type from URL parameters
  useEffect(() => {
    const userTypeParam = searchParams.get("userType");
    if (userTypeParam) {
      setUserType(userTypeParam);
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "phone") {
      // Basic phone validation (10-15 digits)
      const phoneRegex = /^\d{10,15}$/;
      setPhoneValid(phoneRegex.test(value));
    } else if (field === "email") {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValid(emailRegex.test(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userType) {
      return;
    }

    try {
      setError(null);
      
      if (registrationMethod === "phone") {
        // Phone registration validation
        if (!phoneValid) {
          return;
        }

        // Register the user with phone number
        const result = await registerUser({
          userType: userType as "client" | "rider" | "diva" | "hunk",
          countryCode: formData.countryCode,
          phoneNumber: formData.phone,
        }).unwrap();

        if (result && result.data) {
          console.log('Phone registration successful, user data:', result.data);
          
          // Go directly to details page to complete profile
          router.push(
            `/details?userType=${userType}&userId=${result.data.id}`
          );
        }
      } else {
        // Email registration validation
        if (!emailValid || !formData.firstName || !formData.lastName) {
          return;
        }

        // Register the user with email using the /auth/register endpoint
        const result = await registerWithEmail({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userType: userType as "client" | "rider" | "diva" | "hunk",
          countryCode: "+1", // Default country code for email registration
          number: "0000000000", // Placeholder number for email registration
        }).unwrap();

        if (result && result.data) {
          console.log('Email registration successful, user data:', result.data);
          
          // Go to details page to complete profile
          router.push(
            `/details?userType=${userType}&userId=${result.data.user.id}`
          );
        }
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      setError(error?.data?.message || error?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthCard
      title="Welcome to Aphrodite"
      description="By tapping 'Create Account' or 'Sign in', you agree to our Terms & Conditions."
      className="font-urbanist"
    >
      <form onSubmit={handleSubmit} className="space-y-6 font-urbanist">
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm font-urbanist">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-transparent border border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2"
          onClick={() => (window.location.href = "/auth/apple")}
        >
          <Image src={apple} alt="Apple" width={24} height={24} />
          <span className="text-white/60"> Sign up with Apple</span>
        </Button>

        <Button
          type="submit"
          className="w-full bg-transparent border border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2"
          onClick={() => (window.location.href = "/auth/facebook")}
        >
          <Image src={facebook} alt="Facebook" width={24} height={24} />
          <span className="text-white/60"> Sign up with Facebook</span>
        </Button>

        <div className="flex items-center gap-3">
          <hr className="flex-grow border-t border-white/10" />
          <span className="text-white/60">or</span>
          <hr className="flex-grow border-t border-white/10" />
        </div>

        {/* Registration Method Toggle */}
        <div className="flex bg-white/5 rounded-[40px] p-1">
          <button
            type="button"
            onClick={() => setRegistrationMethod("phone")}
            className={`flex-1 py-2 px-4 rounded-[40px] text-sm font-medium transition-all duration-200 ${
              registrationMethod === "phone"
                ? "bg-pink-500 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Phone className="h-4 w-4 inline mr-2" />
            Phone
          </button>
          <button
            type="button"
            onClick={() => setRegistrationMethod("email")}
            className={`flex-1 py-2 px-4 rounded-[40px] text-sm font-medium transition-all duration-200 ${
              registrationMethod === "email"
                ? "bg-pink-500 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Mail className="h-4 w-4 inline mr-2" />
            Email
          </button>
        </div>

        {registrationMethod === "phone" ? (
          /* Phone number input */
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Phone Number
            </label>
            <div className="flex gap-2">
              <CustomDropdown
                value={formData.countryCode}
                onChange={(value) => handleInputChange("countryCode", value)}
                options={[
                  { value: "+1", label: "+1" },
                  { value: "+234", label: "+234" },
                  { value: "+44", label: "+44" },
                  { value: "+91", label: "+91" },
                  { value: "+86", label: "+86" },
                ]}
                placeholder="+1"
                icon={<Phone className="h-5 w-5" />}
                className="w-[140px]"
              />
              <div className="relative flex-1">
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-4 py-3 bg-transparent border ${
                    phoneValid ? "border-green-500" : "border-white/10"
                  } rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200`}
                />
              </div>
            </div>
            {formData.phone && !phoneValid && (
              <p className="text-red-400 text-xs mt-1">
                Please enter a valid phone number (10-15 digits)
              </p>
            )}
          </div>
        ) : (
          /* Email registration fields */
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-transparent border ${
                    emailValid ? "border-green-500" : "border-white/10"
                  } rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200`}
                />
              </div>
              {formData.email && !emailValid && (
                <p className="text-red-400 text-xs mt-1">
                  Please enter a valid email address
                </p>
              )}
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Create password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={`w-full px-4 py-3 bg-transparent border ${
                  formData.confirmPassword && formData.password === formData.confirmPassword
                    ? "border-green-500"
                    : formData.confirmPassword
                    ? "border-red-500"
                    : "border-white/10"
                } rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200`}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={
            isLoading ||
            (registrationMethod === "phone" ? !phoneValid : !emailValid || !formData.firstName || !formData.lastName)
          }
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>

        <div className="text-center text-[16px]">
          <p className="text-sm text-white/60">
            Already have an account?{" "}
            <a href="/login" className="text-white hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}

export default function SignUpPage() {
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
      <SignUpForm />
    </Suspense>
  );
}
