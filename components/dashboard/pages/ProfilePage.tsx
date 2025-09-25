"use client";

import { User, Mail, Phone, MapPin, Calendar, Edit } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Profile Management</h1>
        <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Edit className="h-4 w-4" />
          Edit Profile
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-8 border border-white/10 text-center">
            <div className="w-24 h-24 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">John Doe</h2>
            <p className="text-white/60 mb-4">john.doe@example.com</p>
            <div className="w-full h-2 bg-white/10 rounded-full mb-2">
              <div className="h-2 bg-pink-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-sm text-white/60">Profile 75% complete</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Full Name</label>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <User className="h-4 w-4 text-white/60" />
                  <span className="text-white">John Doe</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Email</label>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Mail className="h-4 w-4 text-white/60" />
                  <span className="text-white">john.doe@example.com</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Phone</label>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Phone className="h-4 w-4 text-white/60" />
                  <span className="text-white">+1 (555) 123-4567</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Date of Birth</label>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Calendar className="h-4 w-4 text-white/60" />
                  <span className="text-white">January 15, 1990</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Address Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Address</label>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <MapPin className="h-4 w-4 text-white/60" />
                  <span className="text-white">123 Main Street, New York, NY 10001</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Account Status</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm text-white/60">Account</p>
                <p className="text-green-400 font-semibold">Active</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-sm text-white/60">Email</p>
                <p className="text-yellow-400 font-semibold">Verified</p>
              </div>
              <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Phone className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-sm text-white/60">Phone</p>
                <p className="text-red-400 font-semibold">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
