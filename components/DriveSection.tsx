"use client";

import { DollarSign, Clock, MapPin, Star, ArrowRight } from "lucide-react";

export default function DriveSection() {
  const features = [
    {
      id: 1,
      title: "Top Earnings",
      description: "Earn up to $20/trip during peak times with premium service rates.",
      icon: DollarSign
    },
    {
      id: 2,
      title: "Flexible Hours",
      description: "Drive when and where you want. Full control over your schedule.",
      icon: Clock
    },
    {
      id: 3,
      title: "Premium Routes",
      description: "Access to high-value service requests in your area.",
      icon: MapPin
    },
    {
      id: 4,
      title: "5-Star Support",
      description: "24/7 driver service & security support.",
      icon: Star
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title and Subtitle */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gray-900">Drive with</span>
            {" "}
            <span className="text-pink-600">Aphrodite</span>
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Earn Money on Your Schedule
          </h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of AphroRyders earning competitive rates while providing premium transportation services. Your car, your time, your income.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Left Column - Feature Boxes */}
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={feature.id} 
                  className="bg-white p-6  border border-gray-100 hover:shadow-xl transition-shadow"
                  style={{
                    width: '282px',
                    height: '216px',
                    borderRadius: '20px',
                    borderWidth: '1px',
                    opacity: 1
                  }}
                >
                  {/* Feature Icon */}
                  <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Feature Content */}
                  <h3 className="text-lg font-bold text-pink-600 mb-3">{feature.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Right Column - Driver Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img 
                src="/driver-smartphone.svg" 
                alt="Driver using smartphone with map navigation"
                className="w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Join Button */}
        <div className="text-center">
          <button 
            className="text-white px-8 py-4 rounded-full flex items-center space-x-3 mx-auto font-semibold hover:opacity-90 transition-opacity"
            style={{
              background: 'linear-gradient(83.42deg, #FA266D 53.61%, #FF74A2 97.69%)'
            }}
          >
            <span>Join as AphroRyder</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
