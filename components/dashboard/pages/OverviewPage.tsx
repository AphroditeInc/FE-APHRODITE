"use client";

import { ArrowRight, Star, Users, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function OverviewPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Welcome to your <span className="text-pink-500">Dashboard</span>
        </h1>
        <p className="text-xl text-white/60 mb-8 max-w-3xl mx-auto leading-relaxed">
          You&apos;ve successfully signed in to Aphrodite. Manage your profile, 
          verify your identity, and access all the features of our platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/details">
            <button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-4 rounded-[25px] text-lg font-semibold transition-all duration-200 flex items-center gap-2">
              Complete Profile
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/id-verification">
            <button className="border border-white/20 hover:border-pink-500 text-white px-8 py-4 rounded-[25px] text-lg font-semibold transition-all duration-200">
              Verify Identity
            </button>
          </Link>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Quick Actions
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Manage your account and access key features from your dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Management */}
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-8 border border-white/10 text-center">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Profile Management</h3>
            <p className="text-white/60 leading-relaxed mb-6">
              Update your personal information, preferences, and account settings.
            </p>
            <Link href="/details">
              <button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-[20px] text-sm font-semibold transition-all duration-200">
                Manage Profile
              </button>
            </Link>
          </div>

          {/* Identity Verification */}
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-8 border border-white/10 text-center">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Identity Verification</h3>
            <p className="text-white/60 leading-relaxed mb-6">
              Complete your identity verification to unlock all platform features.
            </p>
            <Link href="/id-verification">
              <button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-[20px] text-sm font-semibold transition-all duration-200">
                Verify Identity
              </button>
            </Link>
          </div>

          {/* Settings */}
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-8 border border-white/10 text-center">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Account Settings</h3>
            <p className="text-white/60 leading-relaxed mb-6">
              Customize your experience and manage your account preferences.
            </p>
            <button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-[20px] text-sm font-semibold transition-all duration-200">
              Open Settings
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <div className="bg-white/5 backdrop-blur-md rounded-[24px] p-12 border border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Account Status
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Track your progress and account completion status.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Account Created</h3>
              <p className="text-white/60">Successfully signed up</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Verification Pending</h3>
              <p className="text-white/60">Complete identity verification</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Go</h3>
              <p className="text-white/60">Start using the platform</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
