"use client";

type ProfileAboutGridProps = {
  profile: any;
  authUser: any;
};

export function ProfileAboutGrid({ profile, authUser }: ProfileAboutGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Gender</p>
          <p className="text-white text-sm sm:text-base capitalize">{authUser?.gender}</p>
        </div>
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">
            Sexual Orientation
          </p>
          <p className="text-white text-sm sm:text-base">
            {profile?.sexualOrientation || "Not specified"}
          </p>
        </div>
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Looks</p>
          <p className="text-white text-sm sm:text-base">{profile?.looks || "Not specified"}</p>
        </div>
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">
            Education
          </p>
          <p className="text-white text-sm sm:text-base">{profile?.education}</p>
        </div>
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">City</p>
          <p className="text-white text-sm sm:text-base">{authUser?.city}</p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Ethnicity</p>
          <p className="text-white text-sm sm:text-base">
            {profile?.ethnicity || "Not specified"}
          </p>
        </div>
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">
            Body Build
          </p>
          <p className="text-white text-sm sm:text-base">
            {profile?.bodyBuild || "Not specified"}
          </p>
        </div>
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Smoker</p>
          <p className="text-white text-sm sm:text-base">
            {profile?.smoker ? "Yes" : "No"}
          </p>
        </div>
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">Country</p>
          <p className="text-white text-sm sm:text-base">{authUser?.country}</p>
        </div>
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">
            Last Seen
          </p>
          <p className="text-white text-sm sm:text-base">18 hours ago (null)</p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">
            Nationality
          </p>
          <p className="text-white text-sm sm:text-base">{authUser?.country}</p>
        </div>
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">
            Bust Size
          </p>
          <p className="text-white text-sm sm:text-base">
            {profile?.bustSize || "Not specified"}
          </p>
        </div>
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">
            Occupation
          </p>
          <p className="text-white text-sm sm:text-base">{profile?.occupation}</p>
        </div>
        <div className="flex-col pt-2 sm:pt-3 justify-between">
          <p className="text-pink-500 pb-2 sm:pb-4 font-semibold text-sm sm:text-base">State</p>
          <p className="text-white text-sm sm:text-base">{authUser?.state}</p>
        </div>
      </div>
    </div>
  );
}

