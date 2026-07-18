"use client";

type ProfileAboutGridProps = {
  profile: any;
  authUser: any;
};

export function ProfileAboutGrid({ profile, authUser }: ProfileAboutGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Gender</p>
        <p className="text-white text-xs sm:text-sm capitalize break-words">
          {authUser?.gender || "Not specified"}
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Sexual Orientation</p>
        <p className="text-white text-xs sm:text-sm break-words">
          {profile?.sexualOrientation || "Not specified"}
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Looks</p>
        <p className="text-white text-xs sm:text-sm break-words">
          {profile?.looks || "Not specified"}
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Education</p>
        <p className="text-white text-xs sm:text-sm break-words">
          {profile?.education || "Not specified"}
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">City</p>
        <p className="text-white text-xs sm:text-sm break-words">
          {authUser?.city || "Not specified"}
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Ethnicity</p>
        <p className="text-white text-xs sm:text-sm break-words">
          {profile?.ethnicity || "Not specified"}
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Body Build</p>
        <p className="text-white text-xs sm:text-sm break-words">
          {profile?.bodyBuild || "Not specified"}
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Smoker</p>
        <p className="text-white text-xs sm:text-sm break-words">
          {profile?.smoker ? "Yes" : "No"}
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Country</p>
        <p className="text-white text-xs sm:text-sm break-words">
          {authUser?.country || "Not specified"}
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Last Seen</p>
        <p className="text-white text-xs sm:text-sm break-words">
          18 hours ago (null)
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Nationality</p>
        <p className="text-white text-xs sm:text-sm break-words">
          {authUser?.country || "Not specified"}
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Bust Size</p>
        <p className="text-white text-xs sm:text-sm break-words">
          {profile?.bustSize || "Not specified"}
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">Occupation</p>
        <p className="text-white text-xs sm:text-sm break-words">
          {profile?.occupation || "Not specified"}
        </p>
      </div>
      <div className="pt-3">
        <p className="text-pink-500 pb-2 sm:pb-3 font-semibold text-xs sm:text-sm">State</p>
        <p className="text-white text-xs sm:text-sm break-words">
          {authUser?.state || "Not specified"}
        </p>
      </div>
    </div>
  );
}
