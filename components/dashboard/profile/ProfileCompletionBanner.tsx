"use client";

import { CheckCircle, Circle, AlertTriangle, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Step = {
    key: string;
    label: string;
    description: string;
    done: boolean;
    action: () => void;
    actionLabel: string;
};

type Props = {
    profile: any;
    onEditProfile: () => void;
    onEditServices?: () => void;
    onAddMedia: () => void;
    userType?: "client" | "provider";
};

export function ProfileCompletionBanner({ profile, onEditProfile, onEditServices, onAddMedia, userType = "provider" }: Props) {
    const router = useRouter();

    const providerSteps: Step[] = [
        {
            key: "basic_info",
            label: "Complete your bio & details",
            description: "Add your bio, occupation, education, and physical attributes so clients know who you are.",
            done: !!(
                profile?.bio &&
                profile?.occupation &&
                profile?.education &&
                profile?.gender &&
                profile?.ethnicity &&
                profile?.nationality &&
                profile?.bodyBuild &&
                profile?.looks
            ),
            action: onEditProfile,
            actionLabel: "Edit Profile",
        },
        {
            key: "services",
            label: "List your services",
            description: "Add at least one service you offer. This is required before your profile can be verified.",
            done: Array.isArray(profile?.services) && profile.services.length > 0,
            action: onEditServices || onEditProfile,
            actionLabel: "Add Services",
        },
        {
            key: "media",
            label: "Upload photos",
            description: "Upload at least one photo so clients can see you. Profiles without photos rarely get bookings.",
            done: Array.isArray(profile?.media) && profile.media.length > 0,
            action: onAddMedia,
            actionLabel: "Upload Photos",
        },
        {
            key: "video_proof",
            label: "Upload video proof",
            description: "A short verification video is required by our team to confirm your identity.",
            done: !!profile?.hasVideoProof,
            action: () => router.push("/video-verify"),
            actionLabel: "Record Video",
        },
        {
            key: "government_id",
            label: "Upload government ID",
            description: "A valid government-issued ID (passport, driver's licence, national ID) is required to confirm your identity.",
            done: !!profile?.issuedIdUrl,
            action: () => router.push("/id-verification"),
            actionLabel: "Upload ID",
        },
    ];

    const clientSteps: Step[] = [
        {
            key: "basic_info",
            label: "Complete your profile details",
            description: "Add your bio and basic information so providers know who you are.",
            done: !!(profile?.bio),
            action: onEditProfile,
            actionLabel: "Edit Profile",
        },
        {
            key: "media",
            label: "Upload a profile photo",
            description: "Upload at least one photo to help providers recognise you.",
            done: Array.isArray(profile?.media) && profile.media.length > 0,
            action: onAddMedia,
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

    const steps = userType === "client" ? clientSteps : providerSteps;

    const completedCount = steps.filter((s) => s.done).length;
    const total = steps.length;
    const allDone = completedCount === total;

    // Hide as soon as the user has completed all steps — admin review happens separately
    if (allDone) return null;

    const percent = Math.round((completedCount / total) * 100);

    return (
        <div className="mx-4 sm:mx-8 lg:mx-12 mb-6">
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <p className="text-white font-semibold text-[15px]">
                                    Complete your profile to get verified
                                </p>
                                <p className="text-[13px] text-white/60 mt-0.5">
                                    {completedCount} of {total} steps done — once complete, our team will review and verify your profile.
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

                {/* Steps — only show incomplete ones */}
                {!allDone && (
                    <div className="space-y-2 pt-1">
                        {steps.map((step) => (
                            <div
                                key={step.key}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                                    step.done
                                        ? "bg-green-500/5 border border-green-500/10"
                                        : "bg-white/5 border border-white/10"
                                }`}
                            >
                                {step.done ? (
                                    <CheckCircle size={18} className="text-green-400 shrink-0" />
                                ) : (
                                    <Circle size={18} className="text-white/30 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[13px] font-semibold ${step.done ? "text-green-400" : "text-white"}`}>
                                        {step.label}
                                    </p>
                                    {!step.done && (
                                        <p className="text-[12px] text-white/50 mt-0.5 leading-snug">{step.description}</p>
                                    )}
                                </div>
                                {!step.done && (
                                    <button
                                        onClick={step.action}
                                        className="shrink-0 flex items-center gap-1 text-[12px] font-semibold text-[#FA266D] hover:text-pink-400 transition-colors"
                                    >
                                        {step.actionLabel}
                                        <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
