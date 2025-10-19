"use client";

import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-pink-600 text-white">
      <div className=" mx-auto py-16">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between items-start mx-auto max-w-7xl mb-8 px-4 sm:px-6">
          {/* Logo Section - Left */}
          <div className="mb-8 lg:mb-0 w-full lg:w-auto">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">LOGO HERE</h3>
              <p className="text-white/90 opacity-[80%] text-base sm:text-lg max-w-[282px]">
                Experience luxury, and discretion with Aphrodite&apos;s exclusive platform.
              </p>
            </div>
          </div>

          {/* Right Side - Platform and Legal */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 lg:gap-16 w-full lg:w-auto">
            {/* Platform Links */}
            <div>
              <h4 className="mb-4 text-white text-lg sm:text-xl font-semibold leading-6">
                Platform
              </h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/divas-hunks" 
                    className="text-base sm:text-lg leading-[35px] opacity-[80%] text-white/90 hover:text-white transition-colors"
                  >
                    For Divas/Hunks
                  </a>
                </li>
                <li>
                  <a 
                    href="/clients" 
                    className="text-base sm:text-lg leading-[35px] opacity-[80%] text-white/90 hover:text-white transition-colors"
                  >
                    For Clients
                  </a>
                </li>
                <li>
                  <a 
                    href="/aphro-ryders" 
                    className="text-base sm:text-lg leading-[35px] opacity-[80%] text-white/90 hover:text-white transition-colors"
                  >
                    For AphroRyders
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="mb-4 text-white text-lg sm:text-xl font-semibold leading-6">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/terms" 
                    className="opacity-[80%] text-base sm:text-lg leading-[35px] text-white/90 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a 
                    href="/privacy" 
                    className="opacity-[80%] text-base sm:text-lg leading-[35px] text-white/90 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="/help" 
                    className="opacity-[80%] text-base sm:text-lg leading-[35px] text-white/90 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Dashed Line Separator */}
        <div className="border-t border-dashed border-pink-300 mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto px-4 sm:px-6">
          {/* Copyright */}
          <div className="mb-4 sm:mb-0 text-center sm:text-left">
            <p className="text-white/90 opacity-[80%] text-sm sm:text-base">
              © 2025 Aphrodite Inc. All Rights Reserved.
            </p>
          </div>

          {/* Social Media and Cookie Policy */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <span className="text-white/90 opacity-[80%] text-sm sm:text-base">Connect with us:</span>
            
            {/* Social Media Icons */}
            <div className="flex items-center space-x-3">
              <a href="#" className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-400 transition-colors">
                <Facebook className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </a>
              <a href="#" className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-500 rounded-lg flex items-center justify-center hover:bg-pink-400 transition-colors">
                <Instagram className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </a>
              <a href="#" className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-500 rounded-lg flex items-center justify-center hover:bg-pink-400 transition-colors">
                <Twitter className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </a>
            </div>
            {/* Cookie Policy */}
            <a href="/cookies" className="text-white/90 opacity-[80%] hover:text-white transition-colors text-sm sm:text-base">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
