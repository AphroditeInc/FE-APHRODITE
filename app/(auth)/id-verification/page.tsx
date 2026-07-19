"use client";

import AuthCard from "@/components/auth/AuthCard";
import { Video, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUid } from "@/feature/authentication/authSlice";
import { useGetEnrichedProfileQuery } from "@/feature/profile/profileApiSlice";

export default function IDVerificationPage() {
  const router = useRouter();
  const uid = useSelector(selectUid);
  const { data: profileData, isLoading } = useGetEnrichedProfileQuery(uid!, { skip: !uid });

  const profile = (profileData as any)?.data || (profileData as any);

  // Derive completion state from real backend data — never trust localStorage
  const videoVerificationCompleted = !!profile?.hasVideoProof;
  const idVerificationCompleted = !!profile?.issuedIdUrl;
  const bothDone = videoVerificationCompleted && idVerificationCompleted;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <AuthCard
        title={bothDone ? "Identity Verification Complete!" : "Let's verify your Identity"}
        description={
          bothDone
            ? "Both verification steps are done. Our team will review and get back to you."
            : "We need to verify your identity before you can use the application. Your information is encrypted and stored securely."
        }
      >
        <div className="space-y-4 mb-8 mt-[40px]">

          {/* Video Proof */}
          <div className={`bg-white/5 rounded-[20px] p-6 border w-[406px] mx-auto ${videoVerificationCompleted ? "border-green-500/30" : "border-white/10"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-white text-lg font-semibold">Video Proof</h3>
                {videoVerificationCompleted && (
                  <img src="/icons/verify.svg" alt="Done" className="w-5 h-5" />
                )}
              </div>
              {videoVerificationCompleted ? (
                <span className="text-green-400 text-sm font-semibold">Submitted ✓</span>
              ) : (
                <button
                  onClick={() => router.push("/video-verify")}
                  className="flex items-center gap-2 px-[16px] py-[8px] rounded-[25px] bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-semibold transition-all"
                >
                  Start Recording
                  <Video className="w-[16px] h-[16px]" />
                </button>
              )}
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Record a short selfie video to confirm your identity and ensure a safe, trusted space for all users.
            </p>
          </div>

          {/* Government ID */}
          <div className={`bg-white/5 rounded-[20px] p-6 border w-[406px] mx-auto ${idVerificationCompleted ? "border-green-500/30" : "border-white/10"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-white text-lg font-semibold">Government Issued ID</h3>
                {idVerificationCompleted && (
                  <img src="/icons/verify.svg" alt="Done" className="w-5 h-5" />
                )}
              </div>
              {idVerificationCompleted ? (
                <span className="text-green-400 text-sm font-semibold">Submitted ✓</span>
              ) : (
                <button
                  onClick={() => router.push("/id-verify")}
                  className="flex items-center gap-2 px-[16px] py-[8px] rounded-[25px] bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-semibold transition-all"
                >
                  Upload ID
                  <Upload className="w-[16px] h-[16px]" />
                </button>
              )}
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Upload a valid photo ID to verify your age and identity. Your details are safe and securely stored.
            </p>
          </div>
        </div>

        {/* Both done — go to dashboard */}
        {bothDone ? (
          <div className="text-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-8 py-3 rounded-[25px] bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-semibold transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        <div className="flex justify-start mt-6">
          <button
            onClick={() => window.history.back()}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            ← Back
          </button>
        </div>
      </AuthCard>
    </div>
  );
}
