"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Button from "./button";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Optimized Cloudinary URL with better compression and format
  const optimizedImageUrl = 'https://res.cloudinary.com/dpynyht1l/image/upload/f_auto,q_auto,w_1920,h_1080,c_fill/v1760294571/image_grid_kib4ze.png';

  useEffect(() => {
    // Preload the optimized hero image
    const img = new window.Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = optimizedImageUrl;
  }, []);

  return (
    <div id="hero-section" className="min-h-screen relative overflow-hidden">
      {/* Instant CSS Gradient Fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-red-900"></div>
      
      {/* Optimized Background Image */}
      {!imageError && (
        <div className="absolute inset-0">
          <Image
            src={optimizedImageUrl}
            alt="Premium companionship background"
            fill
            priority
            quality={85}
            className={`object-cover transition-opacity duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            sizes="100vw"
          />
        </div>
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <div className="mb-6 sm:mb-8">
            <h1 className="font-bold text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-tight" style={{
              fontFamily: 'Urbanist',
              fontWeight: 700,
              letterSpacing: '0%'
            }}>
              <div className="text-white">Premium</div>
              <div><span className="text-pink-600">Connections </span>Redefined</div>
            </h1>
          </div>

          {/* Description */}
          <p className="text-white mb-8 sm:mb-10 lg:mb-12 max-w-2xl mx-auto text-center text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed px-2" style={{
            fontFamily: 'Urbanist',
            fontWeight: 400,
            letterSpacing: '0%'
          }}>
            Experience the future of premium companionship services. Secure, discreet, and tailored to your lifestyle.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <Link href="/login">
              <button 
                className="flex items-center justify-center w-full sm:w-[173px] h-12 sm:h-14 px-6 sm:px-8 py-3 sm:py-[18px] rounded-[50px] border-2 border-white/20 shadow-[0px_9px_40px_0px_rgba(85,156,255,0.2)] gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                style={{
                  background: 'linear-gradient(83.42deg, #FA266D 53.61%, #FF74A2 97.69%)'
                }}
              >
                <span className="font-medium text-sm sm:text-base leading-[140%] text-center text-[#FAFAFB] whitespace-nowrap">Get started</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#FAFAFB]" />
              </button>
            </Link>
            
            <button 
              className="flex items-center justify-center w-full sm:w-[248px] h-12 sm:h-14 px-6 sm:px-8 py-3 sm:py-[18px] rounded-[50px] border-2 border-white/20 bg-transparent shadow-[0px_9px_40px_0px_rgba(85,156,255,0.2)] gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
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
              <span className="font-medium text-sm sm:text-base leading-[140%] text-center text-[#FAFAFB] whitespace-nowrap">Explore verified Divas/Hunks</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#FAFAFB]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
