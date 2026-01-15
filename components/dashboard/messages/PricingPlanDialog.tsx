"use client";

import { X, Briefcase } from "lucide-react";

export type PricingPlan = "short-time" | "overnight" | "weekend" | "custom-price" | null;

type PricingPlanDialogProps = {
  open: boolean;
  selectedPlan: PricingPlan;
  onSelectPlan: (plan: PricingPlan) => void;
  onSend: () => void;
  onClose: () => void;
};

export function PricingPlanDialog({
  open,
  selectedPlan,
  onSelectPlan,
  onSend,
  onClose,
}: PricingPlanDialogProps) {
  if (!open) return null;

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
            <div
              onClick={() => onSelectPlan("short-time")}
              className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                selectedPlan === "short-time"
                  ? "border-[#FA266D] bg-[#FA266D]/10"
                  : "border-transparent hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-white text-[20px]">Incall</p>
                <p className="text-[16px] font-medium text-white">
                  50,000.00 APH
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white text-[20px]">Outcall</p>
                <p className="text-[16px] font-medium text-white">
                  70,000.00 APH
                </p>
              </div>

              <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                <span className="text-[24px] font-bold">Short Time</span>
              </button>
            </div>

            <div
              onClick={() => onSelectPlan("overnight")}
              className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                selectedPlan === "overnight"
                  ? "border-[#FA266D] bg-[#FA266D]/10"
                  : "border-transparent hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-white text-[20px]">Incall</p>
                <p className="text-[16px] font-medium text-white">
                  50,000.00 APH
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white text-[20px]">Outcall</p>
                <p className="text-[16px] font-medium text-white">
                  70,000.00 APH
                </p>
              </div>

              <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                <span className="text-[24px] font-bold">Overnight</span>
              </button>
            </div>

            <div
              onClick={() => onSelectPlan("weekend")}
              className={`bg-gray-800/50 rounded-[20px] p-6 cursor-pointer border-2 transition-all ${
                selectedPlan === "weekend"
                  ? "border-[#FA266D] bg-[#FA266D]/10"
                  : "border-transparent hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-white text-[20px]">Incall</p>
                <p className="text-[16px] font-medium text-white">---</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white text-[20px]">Outcall</p>
                <p className="text-[16px] font-medium text-white">
                  70,000.00 APH
                </p>
              </div>

              <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                <span className="text-[24px] font-bold">Weekend</span>
              </button>
            </div>

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
                  className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <button className="mt-6 w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[20px] font-medium">
                <span className="text-[24px] font-bold">Custom Price</span>
              </button>
            </div>
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
              Send Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
