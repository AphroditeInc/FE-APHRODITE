"use client";

import Button from "@/components/button";
import { useState, useEffect } from "react";
import { Video, Upload, ArrowLeft } from "lucide-react";

export default function IDVerificationPage() {
  const [idVerificationCompleted, setIdVerificationCompleted] = useState(false);
  const [videoVerificationCompleted, setVideoVerificationCompleted] = useState(false);

  const handleVideoProof = () => {
    // Navigate to video verification page
    window.location.href = "/video-verify";
  };

  const handleGovernmentID = () => {
    // Navigate to ID verification page
    window.location.href = "/id-verify";
  };

  const handleSkip = () => {
    // Skip verification and go to next step
    console.log("Skipping verification");
    window.location.href = "/dashboard";
  };

  const handleBack = () => {
    // Go back to details page
    window.history.back();
  };

  // Check if coming back from completed verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      setIdVerificationCompleted(true);
    }
    if (urlParams.get('videoVerified') === 'true') {
      setVideoVerificationCompleted(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="relative bg-white/6 backdrop-blur-md rounded-[24px] w-[586px] py-[40px] mx-4 text-white border border-white/20 font-urbanist">
        <div className="h-full flex flex-col justify-center w-[486px] mx-auto">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <span className="text-pink-500 text-xl font-bold">Aphrodite</span>
          </div>

          {/* Title & Description */}
          <div className="text-center mb-8">
            <h1 className="text-[32px] font-bold mb-4 leading-[100%] tracking-[-0.02em]">
              Let&apos;s verify your Identity
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-md mx-auto">
              You are required to verify your identity before you can use the application for trust and security. Your information will be securely handled and will not be shared.
            </p>
          </div>



          {/* Verification Options */}
          <div className="space-y-6 mb-8">
                         {/* Video Proof Option */}
             <div className="bg-white/5 rounded-[20px] p-6 border border-white/10">
               <div className="mb-4">
                 <div className="flex items-center gap-2 mb-2">
                   <h3 className="text-white text-lg font-semibold">Video Proof</h3>
                   {videoVerificationCompleted && (
                     <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                       <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                   )}
                 </div>
                 <p className="text-white/60 text-sm leading-relaxed">
                   Record a short selfie video to confirm your identity. This helps us to create a trusted space for all users.
                 </p>
               </div>
              <Button
                onClick={handleVideoProof}
                fullWidth
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold"
              >
                <Video className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            </div>

                         {/* Government ID Option */}
             <div className="bg-white/5 rounded-[20px] p-6 border border-white/10">
               <div className="mb-4">
                 <div className="flex items-center gap-2 mb-2">
                   <h3 className="text-white text-lg font-semibold">Government Issued ID</h3>
                                       {idVerificationCompleted && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                 </div>
                 <p className="text-white/60 text-sm leading-relaxed">
                   Upload a government ID to verify your age and identity. Your details are encrypted and securely stored.
                 </p>
               </div>
              <Button
                onClick={handleGovernmentID}
                fullWidth
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload ID
              </Button>
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <button
              onClick={handleSkip}
              className="text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors"
            >
              Skip for now
            </button>
          </div>

          {/* Back Navigation */}
          <div className="flex justify-start mt-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
