"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useUpdatePricingMutation } from "@/app/api/apiSlice";

type PricingType = "shortTime" | "overnight" | "weekend";

type ProfilePricingEditModalProps = {
  open: boolean;
  onClose: () => void;
  profileId: string;
  pricingType: PricingType | null;
  currentPricing: any | null | undefined;
  onUpdated: () => Promise<void> | void;
};

type ToastType = "success" | "error" | "info";

type ToastState = {
  type: ToastType;
  message: string;
} | null;

export function useToast(timeout = 3000) {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    if (timeout > 0) {
      setTimeout(() => {
        setToast(null);
      }, timeout);
    }
  };

  return { toast, showToast };
}

// Default duration labels per pricing type
const DEFAULT_DURATIONS: Record<string, string> = {
  shortTime: "2 hours",
  overnight: "overnight",
  weekend: "weekend",
};

export function ProfilePricingEditModal({
  open,
  onClose,
  profileId,
  pricingType,
  currentPricing,
  onUpdated,
}: ProfilePricingEditModalProps) {
  const [incall, setIncall] = useState("");
  const [outcall, setOutcall] = useState("");
  const [duration, setDuration] = useState("");
  const { toast, showToast } = useToast();

  const [updatePricing, { isLoading: isUpdatingPricing }] = useUpdatePricingMutation();

  useEffect(() => {
    if (!open || !pricingType || !currentPricing) {
      setIncall("");
      setOutcall("");
      setDuration("");
      return;
    }

    const pricing = currentPricing[pricingType];

    setIncall(
      pricing && typeof pricing.incall !== "undefined" && pricing.incall !== null
        ? String(pricing.incall)
        : ""
    );
    setOutcall(
      pricing && typeof pricing.outcall !== "undefined" && pricing.outcall !== null
        ? String(pricing.outcall)
        : ""
    );
    setDuration(pricing?.duration || DEFAULT_DURATIONS[pricingType] || "");
  }, [open, pricingType, currentPricing]);

  const handleClose = () => {
    setIncall("");
    setOutcall("");
    setDuration("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!profileId) {
      showToast("Profile ID not found. Please refresh the page and try again.", "error");
      return;
    }

    if (!pricingType) {
      return;
    }

    if (!incall && !outcall) {
      showToast("Please enter at least one price (incall or outcall).", "error");
      return;
    }

    try {
      const pricingData: any = {};

      const incallValue = incall ? Number(incall) : 0;
      const outcallValue = outcall ? Number(outcall) : 0;
      const durationValue = duration.trim() || DEFAULT_DURATIONS[pricingType] || pricingType;

      const band = { incall: incallValue, outcall: outcallValue, duration: durationValue };

      if (pricingType === "shortTime") {
        pricingData.shortTime = band;
      } else if (pricingType === "overnight") {
        pricingData.overnight = band;
      } else if (pricingType === "weekend") {
        pricingData.weekend = band;
      }

      const result = await updatePricing({ id: profileId, data: pricingData }).unwrap();

      if (result) {
        await onUpdated();
        showToast("Pricing updated successfully!", "success");
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update pricing. Please try again.";
      showToast(`Error: ${errorMessage}`, "error");
    }
  };

  if (!open || !pricingType) return null;

  const title =
    pricingType === "shortTime"
      ? "Short Time"
      : pricingType === "overnight"
      ? "Overnight"
      : "Weekend";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Edit {title} Pricing
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration <span className="text-gray-400 font-normal">(e.g. "2 hours", "overnight")</span>
            </label>
            <input
              type="text"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder={DEFAULT_DURATIONS[pricingType ?? "shortTime"]}
              className="w-full px-4 h-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-800"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incall Price (APH)
              </label>
              <input
                type="number"
                value={incall}
                onChange={e => setIncall(e.target.value)}
                placeholder="Enter incall price"
                className="w-full px-4 h-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outcall Price (APH)
              </label>
              <input
                type="number"
                value={outcall}
                onChange={e => setOutcall(e.target.value)}
                placeholder="Enter outcall price"
                className="w-full px-4 h-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-pink-500 font-medium hover:text-pink-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdatingPricing}
              className="px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isUpdatingPricing ? "Saving..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
