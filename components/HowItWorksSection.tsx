"use client";

import { User, Search, Calendar, Star, ArrowRight } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      id: 1,
      title: "Create Your Profile",
      description: "Sign up and create your profile with your preferences and requirements.",
      icon: User
    },
    {
      id: 2,
      title: "Browse & Discover",
      description: "Explore our verified profiles and find the perfect match for your needs.",
      icon: Search
    },
    {
      id: 3,
      title: "Book Your Experience",
      description: "Schedule your appointment with ease using our intuitive booking system.",
      icon: Calendar
    },
    {
      id: 4,
      title: "Enjoy Premium Service",
      description: "Experience world-class companionship with complete discretion and professionalism.",
      icon: Star
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title and Subtitle */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gray-900">How</span>
            {" "}
            <span className="text-pink-600">Aphrodite</span>
            {" "}
            <span className="text-gray-900">Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Getting started is simple. Join thousands of satisfied members in just four easy steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mb-12 sm:mb-16">
          {/* Connection Line */}
          <div className="hidden lg:block absolute w-[915.5px] h-0 top-8 left-[142px] border border-dashed border-[#FA266D]"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.id} className="text-center">
                  {/* Step Icon */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 relative bg-[#FEF4F7]">
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-[#FA266D]" />
                  </div>
                  
                  {/* Step Content */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#FA266D] mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-[#807E7E] leading-relaxed px-2">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <div 
          className="relative overflow-hidden mx-auto w-full max-w-[1200px] h-[300px] sm:h-[350px] lg:h-[395px] mt-6 sm:mt-8 lg:mt-10 rounded-[20px] sm:rounded-[25px] lg:rounded-[30px]"
          style={{
            background: 'linear-gradient(94.62deg, #FA266D 36.82%, #FF6D9E 82.38%)'
          }}
        >
          <div className="p-6 sm:p-8 md:p-12 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center h-full">
              {/* Left Content */}
              <div className="text-white text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                  Ready To Experience Luxury?
                </h3>
                <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 leading-relaxed">
                  Join our exclusive community and discover what premium companionship really means.
                </p>
                <button className="bg-white text-pink-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full flex items-center space-x-2 sm:space-x-3 font-semibold hover:bg-gray-100 transition-colors mx-auto lg:mx-0">
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Right Image */}
              <div className="relative hidden lg:block">
                <div className="relative rounded-2xl overflow-hidden">
                  <img 
                    src="/aphrodite.svg" 
                    alt="Premium companionship experience"
                    className="w-full h-80 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}