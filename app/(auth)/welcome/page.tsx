"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { useState } from "react";

export default function WelcomePage() {
  const [formData, setFormData] = useState({
    signUpAsFreelancer: "",
    signUpAsClient: "",
    signUpAsInfluencer: "",
  });

  const backgroundImages = [
    "/images/slidersimage/firstimg.svg",
    "/images/slidersimage/secondimg.svg",
    "/images/slidersimage/thirdimg.svg",
    "/images/slidersimage/fourthimg.svg",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <AuthLayout
      title="Welcome to Aphrodite"
      description="Find your perfect match for any service or talent you need"
      backgroundImages={backgroundImages}
      showSlider={true}
      centered={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sign Up as Freelancer */}
        <div className="relative">
          <input
            type="text"
            placeholder="Sign Up as Freelancer"
            value={formData.signUpAsFreelancer}
            onChange={(e) =>
              handleInputChange("signUpAsFreelancer", e.target.value)
            }
            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent backdrop-blur-sm"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-6 h-6 border-2 border-white border-opacity-50 rounded"></div>
          </div>
        </div>

        {/* Sign Up as Client */}
        <div className="relative">
          <input
            type="text"
            placeholder="Sign Up as Client"
            value={formData.signUpAsClient}
            onChange={(e) =>
              handleInputChange("signUpAsClient", e.target.value)
            }
            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent backdrop-blur-sm"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-6 h-6 border-2 border-white border-opacity-50 rounded"></div>
          </div>
        </div>

        {/* Sign Up as Influencer */}
        <div className="relative">
          <input
            type="text"
            placeholder="Sign Up as Influencer"
            value={formData.signUpAsInfluencer}
            onChange={(e) =>
              handleInputChange("signUpAsInfluencer", e.target.value)
            }
            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent backdrop-blur-sm"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-6 h-6 border-2 border-white border-opacity-50 rounded"></div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent transition duration-200 font-medium mt-6"
        >
          Get Started
        </button>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-300 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-pink-400 hover:text-pink-300 underline"
            >
              Log in
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
