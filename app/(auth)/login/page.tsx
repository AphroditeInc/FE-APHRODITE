"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import Image from "next/image";
import { useState } from "react";
import apple from "../../../public/icons/apple.svg";
import facebook from "../../../public/icons/facebook.svg";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", formData);
    router.push("/details");
  };

  return (
    <AuthCard
      title="Welcome Back"
      description="Sign in to your account to continue your journey with Aphrodite."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Button
          type="button"
          className="w-full bg-transparent border border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2"
          onClick={() => (window.location.href = "/auth/apple")}
        >
          <Image src={apple} alt="Apple" width={24} height={24} />
          <span className="text-white/60"> Sign in with Apple</span>
        </Button>

        <Button
          type="button"
          className="w-full bg-transparent border border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2"
          onClick={() => (window.location.href = "/auth/facebook")}
        >
          <Image src={facebook} alt="Facebook" width={24} height={24} />
          <span className="text-white/60"> Sign in with Facebook</span>
        </Button>

        <div className="flex items-center gap-3">
          <hr className="flex-grow border-t border-white/10" />
          <span className="text-white/60">or</span>
          <hr className="flex-grow border-t border-white/10" />
        </div>

        {/* Email input */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/10 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        {/* Password input */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-transparent border border-white/10 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
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

        {/* Remember me and Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-pink-500 focus:ring-pink-500 border-white/20 rounded bg-transparent"
            />
            <span className="ml-2 text-sm text-white/60">Remember me</span>
          </label>
          <a
            href="/forgot-password"
            className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <Button type="submit" className="w-full">
          Sign In
        </Button>

        <div className="text-center text-[16px]">
          <p className="text-sm text-white/60">
            Don&apos;t have an account?{" "}
            <a href="/user-type" className="text-pink-400 hover:text-pink-300 transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}