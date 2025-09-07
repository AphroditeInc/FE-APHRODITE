"use client";

import Button from "@/components/button";
import AuthCard from "@/components/auth/AuthCard";
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
    
    // Check localStorage for completed verifications
    const storedIdVerification = localStorage.getItem('idVerificationCompleted');
    const storedVideoVerification = localStorage.getItem('videoVerificationCompleted');
    
    if (storedIdVerification === 'true') {
      setIdVerificationCompleted(true);
    }
    if (storedVideoVerification === 'true') {
      setVideoVerificationCompleted(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <AuthCard
      
        title={idVerificationCompleted && videoVerificationCompleted 
          ? "Identity Verification Complete!" 
          : "Let's verify your Identity"
        }
        description={idVerificationCompleted && videoVerificationCompleted 
          ? "Congratulations! You have successfully completed both verification steps. You can now proceed to use the application."
          : "We are required to verify your identity before you can use the application for trust and security. Your information will be encrypted and stored securely."
        }
      >



          {/* Verification Options */}
          <div className="space-y-6 mb-8 mt-[40px]">
            {/* Video Proof Option */}
            <div className="bg-white/5 rounded-[20px] p-6 border border-white/10 flex flex-col w-[406px] mx-auto h-[130px]">
            <div className="flex flex-col h-full mx-auto ">
              <div className="flex items-center justify-between mt-[-10px] mb-[16px]">
                <div className="flex items-center gap-2">
                  <h3 className="text-white text-lg font-semibold">Video Proof</h3>
                  {videoVerificationCompleted && (
                    <img src="/icons/verify.svg" alt="Verified" className="w-5 h-5" />
                  )}
                </div>
                <button
                  onClick={handleVideoProof}
                 
                  className={videoVerificationCompleted 
                    ? "hover:bg-green-600 text-white font-semibold rounded-[25px]" 
                    : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-[25px]"
                  }
                >
                  {videoVerificationCompleted ? (
                    <>
                      
                    </>
                  ) : (
                    <div className="flex items-center gap-2 px-[16px] py-[8px] rounded-[25px]">
                     Start Recording
                      <Video className="w-[20px] h-[20px] mr-1" />
                     
                    </div>
                  )}
                </button>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Record a short selfie video to confirm your identity and ensure a safe, trusted space for all users.
              </p>
              </div>
            </div>

            {/* Government ID Option */}
            <div className="bg-white/5 rounded-[20px] p-6 border border-white/10 flex flex-col w-[406px] mx-auto h-[130px]">
            <div className="flex flex-col h-full mx-auto ">
              <div className="flex items-center justify-between mt-[-10px] mb-[16px]">
                <div className="flex items-center gap-2">
                  <h3 className="text-white text-lg font-semibold">Government Issued ID</h3>
                  {idVerificationCompleted && (
                    <img src="/icons/verify.svg" alt="Verified" className="w-5 h-5" />
                  )}
                </div>
                <button
                  onClick={handleGovernmentID}
                  className={idVerificationCompleted 
                    ? "hover:bg-green-600 text-white font-semibold rounded-[25px]" 
                    : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-[25px]"
                  }
                >
                  {idVerificationCompleted ? (
                    <>
                       
                    </>
                  ) : (
                    <div className="flex items-center gap-2 px-[16px] py-[8px] rounded-[25px]">
                      Capture
                      <Upload className="w-[20px] h-[20px] mr-1" />
                    </div>
                  )}
                </button>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Upload a valid photo ID to verify your age and identity. Your details are safe and securely stored.
              </p>
            </div>
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
      </AuthCard>
    </div>
  );
}
