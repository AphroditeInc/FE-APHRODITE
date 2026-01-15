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

  const [updatePricing, { isLoading: isUpdatingPricing }] = useUpdatePricingMutation();

  useEffect(() => {
    if (!open || !pricingType || !currentPricing) {
      setIncall("");
      setOutcall("");
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
  }, [open, pricingType, currentPricing]);

  const handleClose = () => {
    setIncall("");
    setOutcall("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!profileId) {
      alert("Profile ID not found. Please refresh the page and try again.");
      return;
    }

    if (!pricingType) {
      return;
    }

    if (!incall && !outcall) {
      alert("Please enter at least one price (incall or outcall).");
      return;
    }

    try {
      const pricingData: any = {};

      const incallValue = incall ? Number(incall) : undefined;
      const outcallValue = outcall ? Number(outcall) : undefined;

      if (pricingType === "shortTime") {
        pricingData.shortTime = {
          incall: incallValue,
          outcall: outcallValue,
        };
      } else if (pricingType === "overnight") {
        pricingData.overnight = {
          incall: incallValue,
          outcall: outcallValue,
        };
      } else if (pricingType === "weekend") {
        pricingData.weekend = {
          incall: incallValue,
          outcall: outcallValue,
        };
      }

      const result = await updatePricing({ id: profileId, data: pricingData }).unwrap();

      if (result) {
        await onUpdated();
        handleClose();
        alert("Pricing updated successfully!");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update pricing. Please try again.";
      alert(`Error: ${errorMessage}`);
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

