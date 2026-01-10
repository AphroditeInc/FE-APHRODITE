"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAddCustomCategoryMutation } from "@/app/api/apiSlice";

interface CustomPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
}

export default function CustomPricingModal({
  isOpen,
  onClose,
  profileId,
}: CustomPricingModalProps) {
  const [categoryName, setCategoryName] = useState("");
  const [duration, setDuration] = useState("");
  const [incall, setIncall] = useState("");
  const [outcall, setOutcall] = useState("");
  const [errors, setErrors] = useState<{
    categoryName?: string;
    duration?: string;
    incall?: string;
    outcall?: string;
  }>({});

  const [addCustomCategory, { isLoading }] = useAddCustomCategoryMutation();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!categoryName.trim()) {
      newErrors.categoryName = "Category name is required";
    }

    if (!duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    if (!incall || isNaN(Number(incall)) || Number(incall) < 0) {
      newErrors.incall = "Valid incall price is required";
    }

    if (!outcall || isNaN(Number(outcall)) || Number(outcall) < 0) {
      newErrors.outcall = "Valid outcall price is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await addCustomCategory({
        id: profileId,
        data: {
          categoryName: categoryName.trim(),
          duration: duration.trim(),
          incall: Number(incall),
          outcall: Number(outcall),
          currency: "APH",
        },
      }).unwrap();

      if (response.success) {
        alert("Custom pricing category added successfully!");
        handleClose();
      } else {
        alert(response.message || "Failed to add custom category");
      }
    } catch (error: any) {
      console.error("Error adding custom category:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to add custom category";
      alert(errorMessage);
    }
  };

  const handleClose = () => {
    setCategoryName("");
    setDuration("");
    setIncall("");
    setOutcall("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold text-[#1F1B2C] mb-6">
          Add Custom Pricing
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-[#1F1B2C] mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Girlfriend Experience"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.categoryName
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-pink-500 text-[#1F1B2C]`}
            />
            {errors.categoryName && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryName}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-[#1F1B2C] mb-2">
              Duration
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="7 days"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.duration
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-pink-500 text-[#1F1B2C]`}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
            )}
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Incall Price */}
            <div>
              <label className="block text-sm font-medium text-[#1F1B2C] mb-2">
                Incall Price (APH)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={incall}
                onChange={(e) => setIncall(e.target.value)}
                placeholder="200,000 APH"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.incall
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-pink-500 text-[#1F1B2C]`}
              />
              {errors.incall && (
                <p className="mt-1 text-sm text-red-500">{errors.incall}</p>
              )}
            </div>

            {/* Outcall Price */}
            <div>
              <label className="block text-sm font-medium text-[#1F1B2C] mb-2">
                Outcall Price (APH)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={outcall}
                onChange={(e) => setOutcall(e.target.value)}
                placeholder="150,000 APH"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.outcall
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-pink-500 text-[#1F1B2C]`}
              />
              {errors.outcall && (
                <p className="mt-1 text-sm text-red-500">{errors.outcall}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 disabled:bg-pink-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Adding..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
