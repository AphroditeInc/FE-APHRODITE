"use client";

import { X, Coins } from "lucide-react";

type PricingDetailsModalProps = {
    open: boolean;
    onClose: () => void;
    planName: string;
    duration?: string;
    pricing: {
        incall?: string | number;
        outcall?: string | number;
    };
    services: any[];
};

export function PricingDetailsModal({
    open,
    onClose,
    planName,
    duration,
    pricing,
    services,
}: PricingDetailsModalProps) {
    if (!open) return null;

    // Format price helper
    const formatPrice = (price: string | number | undefined) => {
        if (!price) return "---";
        return `${Number(price).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} APH`;
    };

    // Extract service names
    const serviceNames = services
        .map((service) =>
            typeof service === "string" ? service : service.name || service.id || ""
        )
        .filter((s): s is string => s !== "");

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#1F1B2C] rounded-xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-[600px] max-h-[90vh] overflow-y-auto relative border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-baseline gap-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white font-urbanist">
                            {planName}
                        </h2>
                        {duration && (
                            <span className="text-white/60 text-lg font-urbanist">{duration}</span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Plans Section */}
                <div className="mb-8">
                    <h3 className="text-[#FA266D] text-lg font-medium mb-4 font-urbanist">Plans</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-white text-xl font-semibold font-urbanist">Incall</span>
                            <div className="flex items-center gap-2">
                                <Coins className="w-5 h-5 text-[#FFC000]" />
                                <span className="text-white text-xl font-semibold font-urbanist">
                                    {formatPrice(pricing.incall)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white text-xl font-semibold font-urbanist">Outcall</span>
                            <div className="flex items-center gap-2">
                                <Coins className="w-5 h-5 text-[#FFC000]" />
                                <span className="text-white text-xl font-semibold font-urbanist">
                                    {formatPrice(pricing.outcall)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div className="mb-8">
                    <h3 className="text-[#FA266D] text-lg font-medium mb-4 font-urbanist">Services</h3>
                    <div className="flex flex-wrap gap-3">
                        {serviceNames.length > 0 ? (
                            serviceNames.map((service, index) => (
                                <div
                                    key={index}
                                    className="px-4 py-2 rounded-full border border-white/30 text-white font-urbanist text-sm sm:text-base"
                                >
                                    {service}
                                </div>
                            ))
                        ) : (
                            <span className="text-white/40 italic">No services listed</span>
                        )}
                    </div>
                </div>

                {/* Book Now Button */}
                <button className="w-full h-[56px] bg-[#FA266D] hover:bg-pink-600 text-white rounded-[30px] font-bold text-lg transition-colors font-urbanist">
                    Book Now
                </button>
            </div>
        </div>
    );
}
