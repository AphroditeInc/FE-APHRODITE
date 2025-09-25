"use client";

import { Settings, Bell, Shield, User, Palette, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Account Settings */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-pink-500" />
              <h3 className="text-lg font-semibold text-white">Account Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Change Password</span>
                <button className="text-pink-400 hover:text-pink-300 text-sm">Change</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Two-Factor Authentication</span>
                <button className="text-pink-400 hover:text-pink-300 text-sm">Enable</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Account Deletion</span>
                <button className="text-red-400 hover:text-red-300 text-sm">Delete Account</button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-pink-500" />
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Email Notifications</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Push Notifications</span>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">SMS Notifications</span>
                <input type="checkbox" className="toggle" />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-pink-500" />
              <h3 className="text-lg font-semibold text-white">Privacy & Security</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Profile Visibility</span>
                <select className="bg-white/10 text-white rounded px-3 py-1">
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Data Sharing</span>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Location Services</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="h-5 w-5 text-pink-500" />
              <h3 className="text-lg font-semibold text-white">Appearance</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Theme</span>
                <select className="bg-white/10 text-white rounded px-3 py-1">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>System</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Language</span>
                <select className="bg-white/10 text-white rounded px-3 py-1">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
