"use client";

import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-pink-600 text-white">
      <div className=" mx-auto py-16">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start mx-auto  max-w-7xl mb-8">
          {/* Logo Section - Left */}
          <div className="mb-8 md:mb-0">
            <div>
              <h3 className="text-2xl font-bold mb-2">LOGO HERE</h3>
              <p className="text-white/90 opacity-[80%] text-lg lg:w-[282px]">
                Experience luxury, and discretion with Aphrodite's exclusive platform.
              </p>
            </div>
          </div>

          {/* Right Side - Platform and Legal */}
          <div className="flex flex-col md:flex-row gap-50">
            {/* Platform Links */}
            <div>
              <h4 className="mb-4 text-white text-xl font-semibold leading-6">
                Platform
              </h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/divas-hunks" 
                    className="text-lg leading-[35px] opacity-[80%] text-white/90"
                  >
                    For Divas/Hunks
                  </a>
                </li>
                <li>
                  <a 
                    href="/clients" 
                    className="text-lg leading-[35px] opacity-[80%] text-white/90"
                  >
                    For Clients
                  </a>
                </li>
                <li>
                  <a 
                    href="/aphro-ryders" 
                    className="text-lg leading-[35px] opacity-[80%] text-white/90"
                  >
                    For AphroRyders
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="mb-4 text-white text-xl font-semibold leading-6">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/terms" 
                    className="opacity-[80%] text-lg leading-[35px] text-white/90"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a 
                    href="/privacy" 
                    className=" opacity-[80%] text-lg leading-[35px] text-white/90"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="/help" 
                    className=" opacity-[80%] text-lg leading-[35px] text-white/90"
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
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto ">
          {/* Copyright */}
          <div className="mb-4 md:mb-0">
            <p className="text-white/90 opacity-[80%]">
              © 2025 Aphrodite Inc. All Rights Reserved.
            </p>
          </div>

          {/* Social Media and Cookie Policy */}
          <div className="flex items-center space-x-4">
            <span className="text-white/90 opacity-[80%] mr-4">Connect with us:</span>
            
            {/* Social Media Icons */}
            <div className="flex items-center space-x-3">
              <a href="#" className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-400 transition-colors">
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center hover:bg-pink-400 transition-colors">
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center hover:bg-pink-400 transition-colors">
                <Twitter className="w-4 h-4 text-white" />
              </a>
            </div>
            {/* Cookie Policy */}
            <a href="/cookies" className="text-white/90 opacity-[80%] hover:text-white transition-colors ml-4">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
