"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "./button";

export default function HeroSection() {
  return (
    <div id="hero-section" className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero.svg')"
        }}
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto mt-[20%] text-center">
          {/* Main Headline */}
          <div className="mb-8">
            <h1 className="font-bold text-center" style={{
              fontFamily: 'Urbanist',
              fontWeight: 700,
              fontSize: '80px',
              lineHeight: '100px',
              letterSpacing: '0%'
            }}>
              <div className="text-white">Premium</div>
              <div><span className="text-pink-600">Connections </span>Redefined</div>
          
            </h1>
          </div>

          {/* Description */}
          <p className="text-white mb-12 max-w-2xl mx-auto text-center" style={{
            fontFamily: 'Urbanist',
            fontWeight: 400,
            fontSize: '24px',
            lineHeight: '35px',
            letterSpacing: '0%'
          }}>
            Experience the future of premium companionship services. Secure, discreet, and tailored to your lifestyle.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/user-type">
              <button 
                className="flex items-center justify-center w-[173px] h-14 px-8 py-[18px] rounded-[50px] border-2 border-white/20 shadow-[0px_9px_40px_0px_rgba(85,156,255,0.2)] gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                style={{
                  background: 'linear-gradient(83.42deg, #FA266D 53.61%, #FF74A2 97.69%)'
                }}
              >
                <span className="font-medium text-base leading-[140%] text-center text-[#FAFAFB] whitespace-nowrap">Get started</span>
                <ArrowRight className="w-5 h-5 text-[#FAFAFB]" />
              </button>
            </Link>
            
            <button 
              className="flex items-center justify-center w-[248px] h-14 px-8 py-[18px] rounded-[50px] border-2 border-white/20 bg-transparent shadow-[0px_9px_40px_0px_rgba(85,156,255,0.2)] gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              onClick={() => {
                // Scroll to "why choose us" section
                const element = document.getElementById('why-choose-us');
                if (element) {
                  element.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}
            >
              <span className="font-medium text-base leading-[140%] text-center text-[#FAFAFB] whitespace-nowrap">Explore verified Divas/Hunks</span>
              <ArrowRight className="w-5 h-5 text-[#FAFAFB]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
