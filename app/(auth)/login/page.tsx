"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import Image from "next/image";
import { useState } from "react";
import apple from "../../../public/icons/apple.svg";
import facebook from "../../../public/icons/facebook.svg";
import { Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/feature/authentication/authApiSlice";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials, logOut } from "@/feature/authentication/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading, error: loginError }] = useLoginMutation();
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    countryCode: "+1",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Clear any existing tokens before attempting login
      console.log('[LoginPage] Clearing existing tokens before login attempt');
      dispatch(logOut());
      
      // Small delay to ensure tokens are cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let loginData;
      if (loginMethod === 'email') {
        console.log('[LoginPage] Attempting email login for:', formData.email);
        loginData = { email: formData.email, password: formData.password };
      } else {
        // For phone login, we need to send both phone number and country code with password
        const phoneWithCode = `${formData.countryCode}${formData.phone}`;
        console.log('[LoginPage] Attempting phone login for:', phoneWithCode);
        loginData = { email: phoneWithCode, password: formData.password };
      }

      const result = await login(loginData).unwrap();
      
      if (result && result.data) {
        const data = result.data;
        // Handle different response formats
        const tokens = data.tokens || data;
        const user = data.user || data.data?.user;
        
        dispatch(setCredentials({
          access_token: tokens.accessToken || tokens.access_token,
          refresh_token: tokens.refreshToken || tokens.refresh_token,
          user: user,
          uid: user?.id || data.uid || data.userId,
        }));
        
        console.log('[LoginPage] Login successful');
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.error("Login failed:", error);
      const errorMessage = (error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data)
        ? String(error.data.message)
        : (error && typeof error === 'object' && 'message' in error)
          ? String(error.message)
          : 'Login failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      description="Sign in to your account to continue your journey with Aphrodite."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {(error || loginError) && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm font-urbanist">
            {error || (loginError as any)?.data?.message || 'Login failed. Please try again.'}
          </div>
        )}

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

        {/* Login Method Toggle */}
        <div className="flex bg-white/5 rounded-[40px] p-1">
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2 px-4 rounded-[40px] text-sm font-medium transition-all duration-200 ${
              loginMethod === 'email'
                ? 'bg-pink-600 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 py-2 px-4 rounded-[40px] text-sm font-medium transition-all duration-200 ${
              loginMethod === 'phone'
                ? 'bg-pink-600 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Phone
          </button>
        </div>

        {/* Email/Phone input */}
        {loginMethod === 'email' ? (
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
        ) : (
          <div className="flex gap-2">
            <select
              value={formData.countryCode}
              onChange={(e) => handleInputChange("countryCode", e.target.value)}
              className="w-[120px] px-4 py-3 bg-transparent border border-white/10 rounded-[40px] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="+1">+1</option>
              <option value="+234">+234</option>
              <option value="+44">+44</option>
              <option value="+91">+91</option>
              <option value="+86">+86</option>
            </select>
            <div className="relative flex-1">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/10 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>
        )}

        {/* Password input - show for both email and phone login */}
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
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