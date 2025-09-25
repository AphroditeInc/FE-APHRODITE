"use client";

import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
// import { Circle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";

export default function UserTypePage() {
  const [selectedType, setSelectedType] = useState<string>("");
  const router = useRouter();

  const userTypes = [
    {
      id: "diva",
      title: "Sign Up As Diva/Hunk",
      description:
        "Are you ready to earn on your own terms? Join as a Diva or Hunk to offer exclusive companionship and premium experiences to verified clients.",
    },
    {
      id: "client",
      title: "Sign Up As Client",
      description:
        "Looking for discreet companionship and unforgettable moments? Join to explore top-rated Divas and Hunks, book appointment, and enjoy secure, personalized experiences.",
    },
    {
      id: "aphroRyder",
      title: "Sign Up As AphroRyder",
      description:
        "Are you ready to earn on your own terms? Choose when you want to work, earn cash bonuses and many more",
    },
  ];

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (selectedType) {
      console.log("Selected user type:", selectedType);
      // Navigate to signup page
      router.push("/signup");
      // alert(`Navigating to signup with user type: ${selectedType}`);
    }
  };

  return (
    <AuthCard
      title="Welcome to Aphrodite"
      description="Select a suitable account type of your choice to get started on Aphrodite Inc."
      className="font-urbanist"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {userTypes.map((userType) => (
            <label
              key={userType.id}
              onClick={() => setSelectedType(userType.id)}
              className={`cursor-pointer rounded-xl border p-4 transition-all relative 
                ${
                  selectedType === userType.id
                    ? "border-pink-500 bg-white/10"
                    : "border-white/20 hover:border-pink-400 hover:bg-white/5"
                }`}
            >
              {/* Circle Icon (like radio button) */}
              <div className="absolute right-4 top-4">
                {selectedType === userType.id ? (
                  // <CheckCircle2 className="w-6 h-6 text-pink-500" />
                  <></>
                ) : (
                  // <Circle className="w-6 h-6 text-gray-400" />
                  <></>
                )}
              </div>

              {/* Title + Description */}
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {userType.title}
                </h3>
                <p className="text-sm text-gray-300 mt-1 w-[344px]">
                  {userType.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!selectedType}
          className={`w-full py-3 px-4 font-medium transition-all duration-200 cursor-pointer ${
            selectedType
              ? "bg-pink-600 hover:bg-pink-700 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </Button>
      </form>
    </AuthCard>
  );
}
