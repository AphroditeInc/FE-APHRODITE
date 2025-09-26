"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-center items-center pt-16">
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{
            width: '894px',
            height: '64px',
            borderRadius: '1000px',
            backdropFilter: 'blur(50px)',
            background: 'rgba(218, 218, 218, 0.08)',
            opacity: 1
          }}
        >
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/icons/logo.svg" 
              alt="Aphrodite Logo" 
              className="w-8 h-8"
            />
            <span className="text-pink-600 text-2xl font-bold">Aphrodite</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#testimonials" className="text-white hover:text-pink-400 transition-colors">
              Testimonials
            </Link>
            <Link href="#about" className="text-white hover:text-pink-400 transition-colors">
              About
            </Link>
            <Link href="#faq" className="text-white hover:text-pink-400 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Get Started Button */}
          <Link 
            href="/user-type" 
            className="flex items-center justify-center w-[148px] h-12 px-[27px] py-[15px] rounded-[43px] border-[1.71px] border-white/20 shadow-[0px_7.71px_34.29px_0px_rgba(85,156,255,0.2)] gap-[10px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            style={{
              background: 'linear-gradient(83.42deg, #FA266D 53.61%, #FF74A2 97.69%)'
            }}
          >
            <span className="font-medium text-sm text-white whitespace-nowrap">Get started</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </div>
    </header>
  );
}

