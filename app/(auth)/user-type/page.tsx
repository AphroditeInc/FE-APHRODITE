"use client";

import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";

export default function UserTypePage() {
  const [selectedType, setSelectedType] = useState<string>("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType) {
      console.log("Selected user type:", selectedType);
      // Navigate to next step or save preference
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
              className={`cursor-pointer rounded-xl  border p-4 transition-all  relative 
                  ${
                    selectedType === userType.id
                      ? "border-pink-500 "
                      : "border-white/20 hover:border-pink-400 hover:bg-white/10"
                  }`}
            >
              <input
                type="checkbox"
                name="userType"
                value={userType.id}
                checked={selectedType === userType.id}
                onChange={(e) => setSelectedType(e.target.value)}
                className="right-4 top-4 absolute w-5 h-5 text-pink-600 bg-transparent border-gray-300 focus:ring-pink-500 cursor-pointer"
              />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {userType.title}
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  {userType.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={!selectedType}
          className="w-full py-3 px-4 rounded-lg bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white font-medium"
        >
          Continue
        </button>
      </form>
    </AuthCard>
  );
}
