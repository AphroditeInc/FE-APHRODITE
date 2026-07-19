"use client";

import { ArrowLeft, Edit, CheckCircle, Circle, AlertTriangle, ChevronRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEnrichedProfile } from "@/lib/hooks/useEnrichedProfile";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProfilePageSkeleton } from "@/components/ui/Skeleton";
import { ProfileHeader } from "@/components/dashboard/profile/ProfileHeader";
import { ProfileMediaHero } from "@/components/dashboard/profile/ProfileMediaHero";
import { ProfileAboutGrid } from "@/components/dashboard/profile/ProfileAboutGrid";
import { ProfileMediaGrid } from "@/components/dashboard/profile/ProfileMediaGrid";
import { ProfileEditModal } from "@/components/dashboard/profile/ProfileEditModal";
import { ProfileMediaUploadModal } from "@/components/dashboard/profile/ProfileMediaUploadModal";

export default function ClientProfilePage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { profile, loading, error, refetch } = useEnrichedProfile(authUser?.id || null);
  const [activeTab, setActiveTab] = useState<"About" | "Media" | "Payment History" | "Verification">("About");
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  useEffect(() => {
    if (profile?.media && Array.isArray(profile.media) && profile.media.length > 1) {
      const mediaLength = profile.media.length;
      const interval = setInterval(() => {
        setCurrentMediaIndex(prevIndex => (prevIndex + 1) % mediaLength);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setCurrentMediaIndex(0);
    }
  }, [profile?.media]);

  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [profile?.id]);

  if (loading) return <ProfilePageSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#1F1B2C] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error loading profile</div>
          <div className="text-white/80 mb-4">{error}</div>
          <button onClick={refetch} className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#1F1B2C] flex items-center justify-center">
        <div className="text-white text-xl">No profile data available</div>
      </div>
    );
  }

  const handlePrimaryActionClick = () => {
    if (activeTab === "Media") {
      setIsMediaModalOpen(true);
    } else if (activeTab === "About") {
      setIsEditModalOpen(true);
    }
  };

  // Verification steps for client
  const verificationSteps = [
    {
      key: "basic_info",
      label: "Complete your profile details",
      description: "Add your bio and basic information so providers know who you are.",
      done: !!profile?.bio,
      action: () => setIsEditModalOpen(true),
      actionLabel: "Edit Profile",
    },
    {
      key: "media",
      label: "Upload a profile photo",
      description: "Upload at least one photo to help providers recognise you.",
      done: Array.isArray(profile?.media) && profile.media.length > 0,
      action: () => setIsMediaModalOpen(true),
      actionLabel: "Upload Photo",
    },
    {
      key: "government_id",
      label: "Upload government ID",
      description: "A valid government-issued ID (passport, driver's licence, national ID) is required to verify your identity.",
      done: !!profile?.issuedIdUrl,
      action: () => router.push("/id-verification"),
      actionLabel: "Upload ID",
    },
  ];

  const completedCount = verificationSteps.filter(s => s.done).length;
  const total = verificationSteps.length;
  const allStepsDone = completedCount === total;
  const percent = Math.round((completedCount / total) * 100);

  return (
    <div className="min-h-screen bg-[#1F1B2C]">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <button className="flex items-center gap-2 text-white hover:text-pink-300 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Back</span>
        </button>
        {(activeTab === "About" || activeTab === "Media") && (
          <button
            onClick={handlePrimaryActionClick}
            className="hover:bg-pink-600 text-white px-3 sm:px-4 py-2 rounded-full flex items-center gap-1 sm:gap-2 border-[1px] border-white/10 text-sm sm:text-base cursor-pointer"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{activeTab === "Media" ? "Add Media" : "Edit Profile"}</span>
            <span className="sm:hidden">{activeTab === "Media" ? "Add" : "Edit"}</span>
          </button>
        )}
      </div>

      <div className="px-4 sm:px-8 lg:px-12 pb-6">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <ProfileMediaHero
            profile={profile}
            currentMediaIndex={currentMediaIndex}
            setCurrentMediaIndex={setCurrentMediaIndex}
          />
          <ProfileHeader profile={profile} authUser={authUser} />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-8 lg:px-12 pb-4 sm:pb-6">
        <div className="flex space-x-4 sm:space-x-8 border-b border-white/20 overflow-x-auto scrollbar-hide">
          {(["About", "Media", "Payment History", "Verification"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 sm:pb-4 px-1 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? "text-[#FA266D] border-b-2 border-[#FA266D]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-8 lg:px-12 pb-8">
        {activeTab === "About" && <ProfileAboutGrid profile={profile} authUser={authUser} />}

        {activeTab === "Media" && <ProfileMediaGrid profile={profile} />}

        {activeTab === "Payment History" && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-white/60 text-base">No payment history yet</p>
            <p className="text-white/30 text-sm">Your transactions will appear here once you make a booking.</p>
          </div>
        )}

        {activeTab === "Verification" && (
          <div className="max-w-2xl space-y-6">
            {/* Status header */}
            {profile?.isVerified ? (
              <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
                <ShieldCheck size={28} className="text-green-400 shrink-0" />
                <div>
                  <p className="text-white font-semibold text-[15px]">Your account is verified</p>
                  <p className="text-[13px] text-white/60 mt-0.5">You have full access to all features on Aphrodite.</p>
                </div>
              </div>
            ) : allStepsDone ? (
              <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                <AlertTriangle size={22} className="text-yellow-400 shrink-0" />
                <div>
                  <p className="text-white font-semibold text-[15px]">Pending review</p>
                  <p className="text-[13px] text-white/60 mt-0.5">
                    You've completed all steps. Our team will review and verify your account shortly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-white font-semibold text-[15px]">Complete your profile to get verified</p>
                        <p className="text-[13px] text-white/60 mt-0.5">
                          {completedCount} of {total} steps done — once complete, our team will review and verify your account.
                        </p>
                      </div>
                      <span className="text-[13px] font-bold text-yellow-400 shrink-0">{percent}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#FA266D] transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Steps list */}
            <div className="space-y-3">
              {verificationSteps.map(step => (
                <div
                  key={step.key}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 ${
                    step.done
                      ? "bg-green-500/5 border border-green-500/10"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  {step.done ? (
                    <CheckCircle size={20} className="text-green-400 shrink-0" />
                  ) : (
                    <Circle size={20} className="text-white/30 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-semibold ${step.done ? "text-green-400" : "text-white"}`}>
                      {step.label}
                    </p>
                    {!step.done && (
                      <p className="text-[12px] text-white/50 mt-0.5 leading-snug">{step.description}</p>
                    )}
                  </div>
                  {!step.done && (
                    <button
                      onClick={step.action}
                      className="shrink-0 flex items-center gap-1 text-[13px] font-semibold text-[#FA266D] hover:text-pink-400 transition-colors cursor-pointer"
                    >
                      {step.actionLabel}
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProfileEditModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        authUser={authUser}
        onUpdated={refetch}
      />

      <ProfileMediaUploadModal
        open={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        profile={profile}
        authUser={authUser}
        onUpdated={refetch}
      />
    </div>
  );
}
