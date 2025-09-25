"use client";

import { Calendar, Plus, Clock, MapPin } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Calendar</h1>
        <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>
      
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              <div className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
                <p className="text-white font-medium text-sm">Verification Call</p>
                <p className="text-white/60 text-xs">Today, 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Calendar className="h-16 w-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Calendar view coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
