"use client";

import { useState } from "react";
import Image from "next/image";
import Logo from "./logo";

interface BasicDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: BasicDetailsData) => void;
}

interface BasicDetailsData {
  isOver18: boolean;
  dateOfBirth: string;
  username: string;
  gender: string;
}

export default function BasicDetailsModal({
  isOpen,
  onClose,
  onContinue,
}: BasicDetailsModalProps) {
  const [formData, setFormData] = useState<BasicDetailsData>({
    isOver18: false,
    dateOfBirth: "",
    username: "",
    gender: "",
  });

  const [usernameValid, setUsernameValid] = useState(false);

  const handleInputChange = (field: keyof BasicDetailsData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate username
    if (field === 'username') {
      setUsernameValid(value.toString().length >= 3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.isOver18 && formData.dateOfBirth && formData.username && formData.gender) {
      onContinue(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/6 backdrop-blur-md rounded-[24px] p-8 w-[586px] h-[782px] mx-4 text-white border border-white/20 font-urbanist">
        {/* Header with Logo */}
        <div className="flex justify-center items-center mb-6">
          <Logo />
        </div>

        {/* Title and Description */}
        <div className="text-center mb-6">
          <h2 className="text-[40px] font-bold mb-2 leading-[100%] tracking-[-0.02em]">Basic Details</h2>
          <div className="w-[386px] h-[42px] mx-auto">
            <p className="text-white/60 text-base font-medium leading-[130%] tracking-[-0.02em] text-center">
              Input basic details in all the fields provided below, we'll like to get to know you better.
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-6 w-[408px] mx-auto">
          <div className="w-[120px] h-[5px] bg-pink-500 rounded-[30px]"></div>
          <div className="w-[120px] h-[5px] bg-white/20 rounded-[30px]"></div>
          <div className="w-[120px] h-[5px] bg-white/20 rounded-[30px]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-[386px] mx-auto">
          {/* Age Confirmation */}
          <div>
            <label className="block text-base font-medium mb-3 leading-[130%] tracking-[-0.02em] text-left text-[#FFFFFF66]">
              Are you up to 18 years old yet? *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('isOver18', true)}
                className={`flex items-center justify-between w-[191px] h-[56px] px-4 py-3 rounded-[30px] transition-all ${
                  formData.isOver18 === true
                    ? 'border-[1.5px] border-pink-500 bg-transparent'
                    : 'border-[1.5px] border-white/30 bg-transparent'
                }`}
              >
                <span className="text-white font-medium">Yes</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.isOver18 === true
                    ? 'border-pink-500'
                    : 'border-white/30'
                }`}>
                  {formData.isOver18 === true ? (
                    <svg className="w-3 h-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleInputChange('isOver18', false)}
                className={`flex items-center justify-between w-[191px] h-[56px] px-4 py-3 rounded-[30px] transition-all ${
                  formData.isOver18 === false
                    ? 'border-[1.5px] border-pink-500 bg-transparent'
                    : 'border-[1.5px] border-white/30 bg-transparent'
                }`}
              >
                <span className="text-white font-medium">No</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.isOver18 === false
                    ? 'border-pink-500'
                    : 'border-white/30'
                }`}>
                  {formData.isOver18 === false ? (
                    <svg className="w-3 h-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </div>
              </button>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-base font-medium mb-2 leading-[130%] tracking-[-0.02em] text-left text-[#FFFFFF66]">Date of Birth *</label>
            <div className="relative">
              <div className="absolute left-[1.88px] top-1/2 transform -translate-y-1/2">
                <svg className="w-[16.25px] h-[16.67px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-[406px] h-[56px] pl-[20px] pr-[20px] py-3 bg-transparent border border-[#FFFFFF1A] rounded-[32px] text-white placeholder-[#FFFFFF66] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium text-base leading-[130%] tracking-[-0.02em]"
                placeholder="Date of Birth"
              />
              <div className="absolute right-[2.22px] top-[5.47px] pointer-events-none">
                <svg className="w-[11.56px] h-[5.73px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-base font-medium mb-2 leading-[130%] tracking-[-0.02em] text-left text-[#FFFFFF66]">Username *</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-12 py-3 bg-transparent border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {usernameValid ? (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border border-green-500">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block text-base font-medium mb-2 leading-[130%] tracking-[-0.02em] text-left text-[#FFFFFF66]">Select Gender *</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <select
                required
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-transparent border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
              >
                <option value="" className="bg-gray-800 text-white">Select Gender</option>
                <option value="male" className="bg-gray-800 text-white">Male</option>
                <option value="female" className="bg-gray-800 text-white">Female</option>
                <option value="other" className="bg-gray-800 text-white">Other</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={!formData.isOver18 || !formData.dateOfBirth || !formData.username || !formData.gender}
            className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </form>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
