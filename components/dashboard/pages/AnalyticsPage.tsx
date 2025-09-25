"use client";

import { BarChart3, TrendingUp, Users, Eye, Calendar } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white">Analytics</h1>
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-pink-500" />
            <span className="text-white/60">Total Views</span>
          </div>
          <p className="text-3xl font-bold text-white">1,234</p>
          <p className="text-green-400 text-sm">+12% from last month</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="h-5 w-5 text-blue-500" />
            <span className="text-white/60">Profile Views</span>
          </div>
          <p className="text-3xl font-bold text-white">567</p>
          <p className="text-green-400 text-sm">+8% from last month</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-white/60">Growth Rate</span>
          </div>
          <p className="text-3xl font-bold text-white">23%</p>
          <p className="text-green-400 text-sm">+5% from last month</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-purple-500" />
            <span className="text-white/60">Active Days</span>
          </div>
          <p className="text-3xl font-bold text-white">28</p>
          <p className="text-white/60 text-sm">This month</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Activity Overview</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
