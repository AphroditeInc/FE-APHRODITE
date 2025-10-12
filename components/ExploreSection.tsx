"use client";

import { ArrowRight, Heart } from "lucide-react";

export default function ExploreSection() {
  // Array of background images for variety
  const backgroundImages = [
    "/home/image.svg",
    "/home/image2.svg",
    "/home/image3.svg",
    "/home/image4.svg",
    "/home/image5.svg",
    "/home/image6.svg",
    "/home/image7.svg",
    "/home/image8.svg",
    "/home/image9.svg",
    "/home/image10.svg",
    "/home/image11.svg",
    "/home/image12.svg"
  ];

  const profiles = [
    {
      id: 1,
      name: "Bellaposh",
      location: "Lagos Island",
      rating: "5.0"
    },
    {
      id: 2,
      name: "Sweetym",
      location: "Lekki",
      rating: "4.9"
    },
    {
      id: 3,
      name: "Elina",
      location: "Abeokuta",
      rating: "4.9"
    },
    {
      id: 4,
      name: "Bigslut",
      location: "Port-Harcourt",
      rating: "4.7"
    },
    {
      id: 5,
      name: "Busty Queen",
      location: "Ikeja",
      rating: "4.5"
    },
    {
      id: 6,
      name: "Josh Dee",
      location: "Abuja",
      rating: "4.5"
    },
    {
      id: 7,
      name: "Inile",
      location: "Alimosho",
      rating: "4.5"
    },
    {
      id: 8,
      name: "Lush Baby",
      location: "Ibadan",
      rating: "4.3"
    },
    {
      id: 9,
      name: "Pookie",
      location: "Lekki",
      rating: "4.2"
    },
    {
      id: 10,
      name: "Kimmy",
      location: "Benin City",
      rating: "4.0"
    },
    {
      id: 11,
      name: "Diggie",
      location: "Victoria Island",
      rating: "4.0"
    },
    {
      id: 12,
      name: "Laura",
      location: "Ikeja",
      rating: "4.0"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title and Subtitle */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gray-900">Explore Verified</span>
            <br />
            <span className="text-pink-600">Divas/Hunks</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore the list of verified, top-rated and trusted experts handpicked for your premium experience.
          </p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {profiles.map((profile) => (
            <div 
              key={profile.id} 
              className="relative overflow-hidden group cursor-pointer w-[282px] h-[300px] rounded-[20px]"
            >
              {/* Profile Image */}
              <div className="relative w-full h-full">
                <img 
                  src={backgroundImages[(profile.id - 1) % backgroundImages.length]} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Profile Info Overlay */}
                <div className="absolute text-white w-[250px] h-[93px] top-[191px] left-4 rounded-2xl bg-white/[0.06] backdrop-blur-[40px]">
                  <div className="p-4 h-full flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold flex items-center">
                        {profile.name}
                        <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                      </h3>
                      <Heart className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-pink-500 mr-1">📍</span>
                        <p className="text-sm text-gray-200">{profile.location}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-sm font-medium text-gray-200">{profile.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* See More Button */}
        <div className="text-center">
          <button 
            className="text-white px-8 py-4 rounded-full flex items-center space-x-3 mx-auto transition-colors border-2 border-white/20 shadow-[0px_9px_40px_0px_rgba(85,156,255,0.2)]"
            style={{
              background: 'linear-gradient(83.42deg, #FA266D 53.61%, #FF74A2 97.69%)'
            }}
          >
            <span className="font-medium">See more</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
