"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import Image from "next/image";
import { useState } from "react";
import apple from "../../../public/icons/apple.svg";
import facebook from "../../../public/icons/facebook.svg";
import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: "",
    countryCode: "+234", // Default to Nigeria
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [phoneValid, setPhoneValid] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "phone") {
      // Basic phone validation (10-15 digits)
      const phoneRegex = /^\d{10,15}$/;
      setPhoneValid(phoneRegex.test(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic
    console.log("Signup attempt:", formData);
    router.push("/otp");
  };

  return (
    <AuthCard
      title="Welcome to Aphrodite"
      description="By tapping ‘Create Account’ or ‘Sign in’, you agree to our Terms & Conditions."
      // backgroundImage="/images/slidersimage/firstimg.svg"
      // showSlider={true}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Phone number input with country code */}
        <div className="relative">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-[20px] w-[20px] z-10" />
            <span className="absolute left-12 top-1/2 transform -translate-y-1/2 text-white/60 text-sm font-medium">
              {formData.countryCode} -
            </span>
            <input
              type="tel"
              placeholder=""
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className={`w-full pl-24 pr-4 py-3 bg-transparent border ${
                phoneValid
                  ? "border-green-500"
                  : "border-white/10"
              } rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent  transition-all duration-200`}
            />
          </div>
          
          {/* Country code selector - moved below for better UX */}
          {/* <div className="mt-2 flex justify-center">
            <select
              value={formData.countryCode}
              onChange={(e) => handleInputChange("countryCode", e.target.value)}
              className="bg-transparent text-white/60 text-sm border border-white/10 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="+234">🇳🇬 Nigeria (+234)</option>
              <option value="+1">🇺🇸 USA (+1)</option>
              <option value="+44">🇬🇧 UK (+44)</option>
              <option value="+91">🇮🇳 India (+91)</option>
              <option value="+86">🇨🇳 China (+86)</option>
            </select>
          </div> */}
        </div>

        <Button type="submit" className="w-full">
          Create Account
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
