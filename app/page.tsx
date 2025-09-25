"use client";

import { useState } from "react";
import { Menu, X, ArrowRight, Star, Users, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navbar */}
      <nav className="relative bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">A</span>
              </div>
              <span className="text-pink-500 text-xl font-bold">Aphrodite</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-white hover:text-pink-400 px-3 py-2 text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#about" className="text-white hover:text-pink-400 px-3 py-2 text-sm font-medium transition-colors">
                  About
                </a>
                <a href="#contact" className="text-white hover:text-pink-400 px-3 py-2 text-sm font-medium transition-colors">
                  Contact
                </a>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <button className="text-white hover:text-pink-400 px-3 py-2 text-sm font-medium transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 rounded-[25px] text-sm font-semibold transition-all duration-200">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-white hover:text-pink-400 p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/5 backdrop-blur-md border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="text-white hover:text-pink-400 block px-3 py-2 text-base font-medium">
                Features
              </a>
              <a href="#about" className="text-white hover:text-pink-400 block px-3 py-2 text-base font-medium">
                About
              </a>
              <a href="#contact" className="text-white hover:text-pink-400 block px-3 py-2 text-base font-medium">
                Contact
              </a>
              <div className="pt-4 space-y-2">
                <Link href="/login">
                  <button className="text-white hover:text-pink-400 block w-full text-left px-3 py-2 text-base font-medium">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 rounded-[25px] text-sm font-semibold transition-all duration-200 w-full">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to <span className="text-pink-500">Aphrodite</span>
            </h1>
            <p className="text-xl text-white/60 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the future of digital identity verification. Secure, fast, and user-friendly 
              authentication that protects your privacy while ensuring trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-4 rounded-[25px] text-lg font-semibold transition-all duration-200 flex items-center gap-2">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/details">
                <button className="border border-white/20 hover:border-pink-500 text-white px-8 py-4 rounded-[25px] text-lg font-semibold transition-all duration-200">
                  Try Demo
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Aphrodite?
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with user-friendly design 
              to deliver the best identity verification experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-8 border border-white/10 text-center">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Secure & Private</h3>
              <p className="text-white/60 leading-relaxed">
                Your data is encrypted and protected with enterprise-grade security. 
                We never share your personal information.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-8 border border-white/10 text-center">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Lightning Fast</h3>
              <p className="text-white/60 leading-relaxed">
                Get verified in minutes, not days. Our AI-powered system processes 
                your verification quickly and accurately.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-8 border border-white/10 text-center">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">User Friendly</h3>
              <p className="text-white/60 leading-relaxed">
                Simple, intuitive interface that makes identity verification 
                accessible to everyone, regardless of technical expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Built for the Future
              </h2>
              <p className="text-lg text-white/60 mb-6 leading-relaxed">
                Aphrodite represents the next generation of digital identity verification. 
                We combine advanced biometric technology with user-centric design to create 
                a seamless experience that puts you in control.
              </p>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                Our mission is to make digital identity verification accessible, secure, 
                and trustworthy for everyone. Join thousands of users who trust Aphrodite 
                with their digital identity.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-white/60">4.9/5 from 10,000+ users</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-8 border border-white/10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Bank-Level Security</h4>
                    <p className="text-white/60">256-bit encryption and secure protocols</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Instant Verification</h4>
                    <p className="text-white/60">Get verified in under 2 minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Global Reach</h4>
                    <p className="text-white/60">Available in 50+ countries worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-md rounded-[24px] p-12 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Aphrodite for their digital identity verification needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-4 rounded-[25px] text-lg font-semibold transition-all duration-200 flex items-center gap-2">
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/details">
                <button className="border border-white/20 hover:border-pink-500 text-white px-8 py-4 rounded-[25px] text-lg font-semibold transition-all duration-200">
                  Try Demo
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">A</span>
              </div>
              <span className="text-pink-500 text-xl font-bold">Aphrodite</span>
            </div>
            <div className="text-white/60 text-sm">
              © 2024 Aphrodite. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}