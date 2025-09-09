"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import { useState, useRef } from "react";
import { ArrowLeft, Mail } from "lucide-react";

export default function EmailVerificationPage() {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [email] = useState("uchennahanson@gmail.com");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join("");
    if (otpString.length === 5) {
      // Handle verification logic
      console.log("Verifying OTP:", otpString);
      // Redirect to next step
      window.location.href = "/details";
    }
  };

  const handleResend = () => {
    // Handle resend logic
    console.log("Resending code to:", email);
  };

  const handleBack = () => {
    // Go back to previous step
    window.history.back();
  };

  const isOtpComplete = otp.every(digit => digit !== "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <AuthCard
        title="Verify Your Email"
        description={`Enter the verification code we've sent to ${email}`}
      >
        <div className="space-y-8">
          {/* Email Display */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <Mail className="w-4 h-4 text-white/60" />
              <span className="text-white font-medium">{email}</span>
            </div>
          </div>

          {/* OTP Input Fields */}
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-xl font-bold bg-transparent border-2 border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
                placeholder=""
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={!isOtpComplete}
            fullWidth
            size="lg"
            className="bg-gradient-to-r from-yellow-500 to-purple-600 hover:from-yellow-600 hover:to-purple-700 text-white font-semibold"
          >
            Verify Code
          </Button>

          {/* Resend Code Option */}
          <div className="text-center">
            <p className="text-white/60 text-sm">
              Didn&apos;t receive the code?{" "}
              <button 
                onClick={handleResend}
                className="text-white hover:text-pink-400 font-medium underline"
              >
                Resend code
              </button>
            </p>
          </div>

          {/* Back Navigation */}
          <div className="flex justify-start">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to email</span>
            </button>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}

