"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, always succeed
      setIsEmailSent(true);
    } catch (error) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  if (isEmailSent) {
    return (
      <AuthCard
        title="Check Your Email"
        description="We&apos;ve sent a password reset link to your email address."
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Email Sent Successfully
            </h3>
            <p className="text-white/60 text-sm">
              We&apos;ve sent a password reset link to{" "}
              <span className="text-pink-400 font-medium">{email}</span>
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              type="button" 
              className="w-full"
              onClick={() => setIsEmailSent(false)}
            >
              Send Another Email
            </Button>
            
            <Button 
              type="button" 
              className="w-full bg-transparent border border-white/10 text-white hover:bg-white/10"
              onClick={handleBackToLogin}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-white/40">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button 
                onClick={() => setIsEmailSent(false)}
                className="text-pink-400 hover:text-pink-300 transition-colors"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot Password?"
      description="No worries! Enter your email address and we&apos;ll send you a link to reset your password."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm font-urbanist">
            {error}
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/10 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-sm text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </div>

        <div className="text-center text-[16px]">
          <p className="text-sm text-white/60">
            Remember your password?{" "}
            <a href="/login" className="text-pink-400 hover:text-pink-300 transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
