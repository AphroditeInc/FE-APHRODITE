"use client";

import { Shield, CheckCircle, Clock, AlertCircle, Upload, Camera } from "lucide-react";

export default function VerificationPage() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Identity Verification</h1>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Clock className="h-4 w-4" />
          <span>Last updated: 2 days ago</span>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Verification Status</h2>
            <p className="text-white/60">Complete all steps to verify your identity</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-white/60">Email Verification</p>
              <p className="text-green-400 font-semibold">Completed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-white/60">ID Document</p>
              <p className="text-yellow-400 font-semibold">Pending Review</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-white/60">Video Verification</p>
              <p className="text-red-400 font-semibold">Not Started</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* ID Document Upload */}
        <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">ID Document Upload</h3>
              <p className="text-sm text-white/60">Upload a clear photo of your government ID</p>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 mb-4">Drag and drop your ID document here</p>
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors">
              Choose File
            </button>
          </div>
          
          <div className="mt-4 text-xs text-white/60">
            <p>Supported formats: JPG, PNG, PDF</p>
            <p>Max file size: 10MB</p>
          </div>
        </div>

        {/* Video Verification */}
        <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Video Verification</h3>
              <p className="text-sm text-white/60">Record a short video for identity verification</p>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
            <Camera className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 mb-4">Record a 30-second video of yourself</p>
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors">
              Start Recording
            </button>
          </div>
          
          <div className="mt-4 text-xs text-white/60">
            <p>• Look directly at the camera</p>
            <p>• Hold your ID next to your face</p>
            <p>• Speak clearly and slowly</p>
          </div>
        </div>
      </div>

      {/* Verification Tips */}
      <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Verification Tips</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-white font-medium">For ID Documents:</h4>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• Ensure all text is clearly visible</li>
              <li>• Use good lighting and avoid shadows</li>
              <li>• Keep the document flat and straight</li>
              <li>• Avoid glare and reflections</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-medium">For Video Verification:</h4>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• Use a well-lit environment</li>
              <li>• Look directly at the camera</li>
              <li>• Speak your full name clearly</li>
              <li>• Keep your face centered in the frame</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
