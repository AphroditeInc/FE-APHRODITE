"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import CustomDropdown from "@/components/CustomDropdown";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import apple from "../../../public/icons/apple.svg";
import facebook from "../../../public/icons/facebook.svg";
import { Phone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/lib/context/ApiContext";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerUser, isLoading, error } = useApi();
  const [userType, setUserType] = useState<string>("");

  const [formData, setFormData] = useState({
    phone: "",
    countryCode: "+1", // Default to USA
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [phoneValid, setPhoneValid] = useState(false);

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneValid || !userType) {
      return;
    }

    try {
      const response = await registerUser({
        userType: userType as "client" | "rider" | "diva" | "hunk",
        countryCode: formData.countryCode,
        phoneNumber: formData.phone,
      });

      if (response.success && response.data) {
        console.log('Registration successful, user data:', response.data);
        console.log('Navigating with userId:', response.data.id);
        router.push(
          `/otp?userType=${userType}&phone=${formData.countryCode}${formData.phone}&userId=${response.data.id}`
        );
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <AuthCard
      title="Welcome to Aphrodite"
      description="By tapping ‘Create Account’ or ‘Sign in’, you agree to our Terms & Conditions."
      // backgroundImage="/images/slidersimage/firstimg.svg"
      // showSlider={true}
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

        {/* Phone number input */}
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

        <Button
          type="submit"
          className="w-full"
          disabled={!phoneValid || isLoading}
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
