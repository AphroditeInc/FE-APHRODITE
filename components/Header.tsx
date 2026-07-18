"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-center items-center pt-4 sm:pt-8 lg:pt-16 px-4">
        <div
          className="flex items-center justify-between px-4 sm:px-6 w-full max-w-[894px] h-16"
          style={{
            borderRadius: '1000px',
            backdropFilter: 'blur(25px)',
            background: 'rgba(218, 218, 218, 0.08)',
            opacity: 1
          }}
        >
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img
              src="/icons/logo-new.svg"
              alt="Aphrodite Logo"
              className="h-6 w-auto sm:h-8"
            />
            <span className="text-[#FA266D] text-[17.143px] leading-[1.5] tracking-[-0.343px] font-semibold whitespace-nowrap">Aphrodite Inc.</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-[40px]">
            <Link href="#testimonials" className="text-white hover:text-pink-400 transition-colors text-[14px] leading-[24px] font-medium">
              Testimonials
            </Link>
            <Link href="#about" className="text-white hover:text-pink-400 transition-colors text-[14px] leading-[24px] font-medium">
              About
            </Link>
            <Link href="#faq" className="text-white hover:text-pink-400 transition-colors text-[14px] leading-[24px] font-medium">
              FAQ
            </Link>
          </nav>

          {/* Get Started Button */}
          <Link
            href="/login"
            className="flex items-center justify-center w-[120px] sm:w-[140px] lg:w-[148px] h-10 sm:h-12 px-4 sm:px-6 lg:px-[27px] py-2 sm:py-3 lg:py-[15px] rounded-[43px] border-[1.71px] border-white/20 shadow-[0px_7.71px_34.29px_0px_rgba(85,156,255,0.2)] gap-2 sm:gap-[10px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            style={{
              background: 'linear-gradient(83.42deg, #FA266D 53.61%, #FF74A2 97.69%)'
            }}
          >
            <span className="font-medium text-xs sm:text-[13.714px] text-white whitespace-nowrap">Get started</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </Link>
        </div>
      </div>
    </header>
  );
}

