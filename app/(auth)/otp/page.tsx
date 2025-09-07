"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import Logo from "@/components/logo";
import { useState, useRef } from "react";
import success from "../../../public/icons/success.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OTPPage() {
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [showSuccess, setShowSuccess] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
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
        if (otpString.length === 4) {
            // Simulate verification process
            setTimeout(() => {
                setShowSuccess(true);
            }, 1000);
        }
    };

    const handleContinue = () => {
        // Redirect to next step or dashboard
       router.push("/details")
    };

    const isOtpComplete = otp.every(digit => digit !== "");

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            {!showSuccess ? (
                <AuthCard
                    title="Verify Phone"
                    description="We sent a code to the phone number you provided to verify that you're really you."
                >
                    <div className="space-y-8">
                        {/* OTP Input Fields */}
                        <div className="flex justify-center gap-4">
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
                                    className="w-16 h-16 text-center text-2xl font-bold bg-transparent border-2 border-white/10 rounded-[16px] text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
                                    placeholder="*"
                                />
                            ))}
                        </div>

                        {/* Verify Button */}
                        <Button
                            onClick={handleVerify}
                            disabled={!isOtpComplete}
                            className="mt-8 bg-pink-600 hover:bg-pink-700 text-white rounded-[40px] px-4 py-3 text-base w-full"
                        >
                            Verify
                        </Button>

                        {/* Resend Code Option */}
                        <div className="text-center">
                            <p className="text-white/60 text-sm">
                                Didn&apos;t receive the code?{" "}
                                <button className="text-pink-500 hover:text-pink-400 font-medium">
                                    Resend
                                </button>
                            </p>
                        </div>
                    </div>
                </AuthCard>
            ) : (
                /* Success Modal */
                <div className="relative bg-white/6 backdrop-blur-md rounded-[24px] w-[586px] py-[40px] mx-4 text-white border border-white/20 font-urbanist">
                    <div className="h-full flex flex-col justify-center w-[386px] mx-auto">
                        {/* Logo */}
                        <div className="flex justify-center items-center">
                            <Logo />
                        </div>

                        {/* Success Icon */}
                        <div className="flex justify-center mt-8 mb-6">
                            <Image src={success} alt="success" width={120} height={120} />


                        </div>

                        {/* Success Text */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-3">Verification Successful</h2>
                            <p className="text-white/60 text-base leading-relaxed">
                                Your phone number is verified—let&apos;s get started! You can now proceed to finish setting up your account.
                            </p>
                        </div>

                        {/* Continue Button */}
                        <Button
                            onClick={handleContinue}
                            fullWidth
                            className="bg-pink-600 hover:bg-pink-700"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
