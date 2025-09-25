"use client";

import { HelpCircle, Search, MessageCircle, Book, Phone } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white">Help & Support</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-5 w-5 text-pink-500" />
              <h3 className="text-lg font-semibold text-white">Search Help</h3>
            </div>
            <input 
              type="text" 
              placeholder="Search for help articles..." 
              className="w-full bg-white/10 text-white placeholder-white/60 px-4 py-3 rounded-lg focus:outline-none"
            />
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-4">
                <h4 className="text-white font-medium mb-2">How do I verify my identity?</h4>
                <p className="text-white/60 text-sm">Go to the Verification page and follow the step-by-step process to upload your documents and complete video verification.</p>
              </div>
              <div className="border-b border-white/10 pb-4">
                <h4 className="text-white font-medium mb-2">How long does verification take?</h4>
                <p className="text-white/60 text-sm">Most verifications are completed within 24-48 hours. You&apos;ll receive an email notification once it&apos;s processed.</p>
              </div>
              <div className="border-b border-white/10 pb-4">
                <h4 className="text-white font-medium mb-2">Can I change my profile information?</h4>
                <p className="text-white/60 text-sm">Yes, you can update your profile information at any time from the Profile page in your dashboard.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Support</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <MessageCircle className="h-5 w-5 text-pink-500" />
                <span className="text-white">Live Chat</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Phone className="h-5 w-5 text-pink-500" />
                <span className="text-white">Phone Support</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Book className="h-5 w-5 text-pink-500" />
                <span className="text-white">Knowledge Base</span>
              </button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="#" className="block text-pink-400 hover:text-pink-300 text-sm">Getting Started Guide</a>
              <a href="#" className="block text-pink-400 hover:text-pink-300 text-sm">Account Security</a>
              <a href="#" className="block text-pink-400 hover:text-pink-300 text-sm">Privacy Policy</a>
              <a href="#" className="block text-pink-400 hover:text-pink-300 text-sm">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
