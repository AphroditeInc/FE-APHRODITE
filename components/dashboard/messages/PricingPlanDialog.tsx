"use client";

import { X, Briefcase } from "lucide-react";

type PlanPricing = {
  incall?: string;
  outcall?: string;
};

type PricingValues = {
  shortTime?: PlanPricing;
  overnight?: PlanPricing;
  weekend?: PlanPricing;
};

export type PricingPlan = "short-time" | "overnight" | "weekend" | "custom-price" | null;

type PricingPlanDialogProps = {
  open: boolean;
  selectedPlan: PricingPlan;
  onSelectPlan: (plan: PricingPlan) => void;
  customPrice: string;
  onChangeCustomPrice: (value: string) => void;
  onSend: () => void;
  onClose: () => void;
  pricing?: PricingValues | null;
  submitLabel?: string;
  showCustomPrice?: boolean;
};

export function PricingPlanDialog({
  open,
  selectedPlan,
  onSelectPlan,
  customPrice,
  onChangeCustomPrice,
  onSend,
  onClose,
  pricing,
  submitLabel = "Send Pricing",
  showCustomPrice = true,
}: PricingPlanDialogProps) {
  if (!open) return null;

  const parseAmount = (value?: string): number | null => {
    if (!value) return null;
    const cleaned = value.replace(/[^\d.]/g, "");
    if (!cleaned) return null;
    const num = Number.parseFloat(cleaned);
    if (!Number.isFinite(num)) return null;
    return num;
  };

  const hasPrice = (value?: string): boolean => {
    const num = parseAmount(value);
    return num !== null && num > 0;
  };

  const hasShortTimeIncall = hasPrice(pricing?.shortTime?.incall);
  const hasShortTimeOutcall = hasPrice(pricing?.shortTime?.outcall);
  const showShortTime = hasShortTimeIncall || hasShortTimeOutcall;

  const hasOvernightIncall = hasPrice(pricing?.overnight?.incall);
  const hasOvernightOutcall = hasPrice(pricing?.overnight?.outcall);
  const showOvernight = hasOvernightIncall || hasOvernightOutcall;

  const hasWeekendIncall = hasPrice(pricing?.weekend?.incall);
  const hasWeekendOutcall = hasPrice(pricing?.weekend?.outcall);
  const showWeekend = hasWeekendIncall || hasWeekendOutcall;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative max-w-[706px] w-full mx-4 bg-[#FFFFFF0F] backdrop-blur-[60px] rounded-[24px] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8 text-center">
          <h2 className="text-white text-[40px] font-bold mb-2">Select Plan</h2>
          <p className="text-[16px] font-medium mb-8">
            Select the plan you will like to share with the client below.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {showShortTime && (
              <div
                onClick={() => onSelectPlan("short-time")}
                className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                  selectedPlan === "short-time"
                    ? "border-[#FA266D] bg-[#FA266D]/10"
                    : "border-transparent hover:border-white/20"
                }`}
              >
                {hasShortTimeIncall && (
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-white text-[20px]">Incall</p>
                    <p className="text-[16px] font-medium text-white">
                      {pricing?.shortTime?.incall}
                    </p>
                  </div>
                )}
                {hasShortTimeOutcall && (
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white text-[20px]">Outcall</p>
                    <p className="text-[16px] font-medium text-white">
                      {pricing?.shortTime?.outcall}
                    </p>
                  </div>
                )}

                <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                  <span className="text-[24px] font-bold">Short Time</span>
                </button>
              </div>
            )}

            {showOvernight && (
              <div
                onClick={() => onSelectPlan("overnight")}
                className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                  selectedPlan === "overnight"
                    ? "border-[#FA266D] bg-[#FA266D]/10"
                    : "border-transparent hover:border-white/20"
                }`}
              >
                {hasOvernightIncall && (
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-white text-[20px]">Incall</p>
                    <p className="text-[16px] font-medium text-white">
                      {pricing?.overnight?.incall}
                    </p>
                  </div>
                )}
                {hasOvernightOutcall && (
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white text-[20px]">Outcall</p>
                    <p className="text-[16px] font-medium text-white">
                      {pricing?.overnight?.outcall}
                    </p>
                  </div>
                )}

                <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                  <span className="text-[24px] font-bold">Overnight</span>
                </button>
              </div>
            )}

            {showWeekend && (
              <div
                onClick={() => onSelectPlan("weekend")}
                className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                  selectedPlan === "weekend"
                    ? "border-[#FA266D] bg-[#FA266D]/10"
                    : "border-transparent hover:border-white/20"
                }`}
              >
                {hasWeekendIncall && (
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-white text-[20px]">Incall</p>
                    <p className="text-[16px] font-medium text-white">
                      {pricing?.weekend?.incall}
                    </p>
                  </div>
                )}
                {hasWeekendOutcall && (
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white text-[20px]">Outcall</p>
                    <p className="text-[16px] font-medium text-white">
                      {pricing?.weekend?.outcall}
                    </p>
                  </div>
                )}

                <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                  <span className="text-[24px] font-bold">Weekend</span>
                </button>
              </div>
            )}

            {showCustomPrice && (
              <div
                onClick={() => onSelectPlan("custom-price")}
                className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                  selectedPlan === "custom-price"
                    ? "border-[#FA266D] bg-[#FA266D]/10"
                    : "border-transparent hover:border-white/20"
                }`}
              >
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />

                  <input
                    type="number"
                    placeholder="Input price here"
                    value={customPrice}
                    onChange={e => onChangeCustomPrice(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                  <span className="text-[24px] font-bold">Custom Price</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
          <button
            onClick={onSend}
            disabled={!selectedPlan}
            className={`flex-1 py-3 rounded-[40px] font-semibold transition-colors ${
              selectedPlan
                ? "bg-[#FA266D] text-white hover:bg-pink-600"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {submitLabel}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
