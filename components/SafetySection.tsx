"use client";

import { AlertTriangle, Mail, Phone } from "lucide-react";

export default function SafetySection() {
  const safetyTips = [
    "Trust your instincts and report any suspicious behavior",
    "Keep personal information private until you feel comfortable",
    "Use the platform's messaging system for all communications",
    "Report any violations of our community guidelines immediately"
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title and Subtitle */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Your Safety, Our Priority
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We maintain the highest standards of safety and security to protect our community members.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Safety Tips */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center mr-3">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Safety Tips</h3>
            </div>
            
            <ul className="space-y-4">
              {safetyTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-pink-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Emergency Contact */}
          <div className="bg-[#FCFCFC] rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">For Emergency Case</h3>
            
            <div className="space-y-6">
              {/* Email Contact */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center mr-4">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">contact@afretrade.com {""}
                  <span className="text-pink-600 text-sm">(24/7 Response within 24 hours)</span></p>
                </div>
              </div>

              {/* Phone Contact */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center mr-4">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">+1 (555) 123-4567 {" "}
                  <span className="text-pink-600 text-sm">(24/7 Hotline)</span> </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
