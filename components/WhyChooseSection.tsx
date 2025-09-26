"use client";

import { CheckCircle, Shield, Clock } from "lucide-react";

export default function WhyChooseSection() {
  return (
    <section id="why-choose-us" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title and Subtitle */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gray-900">Why Choose</span>
            <br />
            <span className="text-pink-600">Aphrodite</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience unparalleled service with our premium platform designed for discerning individuals.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Feature Boxes Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Feature Box 1 - Top Left (spans full width) */}
            <div className="col-span-2 bg-white rounded-2xl p-8 shadow-lg border border-gray-100 w-[588px] h-[253px]">
              <div className="flex flex-col items-start space-x-4  h-full">
                <div className="w-12 h-12 bg-pink-600 rounded-xl mb-4 flex  items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 flex-col justify-center">
                  <h3 className="text-xl font-bold text-pink-600 mb-3">Verified Profiles</h3>
                  <p className="text-gray-700 leading-relaxed">
                    All members undergo thorough verification for your safety and peace of mind.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Box 2 - Bottom Left */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 w-[588px] h-[253px]">
              <div className="flex flex-col items-start text-left h-full justify-center">
                <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-pink-600 mb-3">Complete Privacy</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Your information is encrypted and protected with military-grade security.
                </p>
              </div>
            </div>

           
          </div>

          {/* Right Column - Large Image */}
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img 
                src="/images/intimate-couple.jpg" 
                alt="Premium companionship service"
                className="w-full h-[253px] object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center px-8">
                  <p className="text-white text-lg md:text-xl leading-relaxed max-w-md">
                    Our platform is designed for busy professionals who value quality, discretion, and convenience above all else.
                  </p>
                </div>
              </div>
            </div>
            {/* Feature Box 3 - Bottom Right */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 w-[588px] h-[253px]">
             <div className="flex flex-col items-start text-left h-full justify-center">
               <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mb-4">
                 <Clock className="w-6 h-6 text-white" />
               </div>
               <h3 className="text-lg font-bold text-pink-600 mb-3">24/7 Availability</h3>
               <p className="text-gray-700 text-sm leading-relaxed">
                 Connect with premium companions whenever you need, day or night.
               </p>
             </div>
           </div>
          </div>
        </div>
      </div>
    </section>
  );
}
