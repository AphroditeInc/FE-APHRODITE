"use client";

import { Check, MapPin, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCreateOrderMutation, useGetWalletBalanceQuery } from "@/app/api/apiSlice";
import type { CreateOrderPayload } from "@/lib/types";

type PricingAmounts = { incall: string; outcall: string };

type CheckoutModalProps = {
  open: boolean;
  plan: "short-time" | "overnight" | "weekend" | "custom-price";
  amounts: PricingAmounts;
  providerUserId: string;
  roomId?: string;
  onClose: () => void;
};

const parseAph = (value: string | number | undefined): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[^\d.]/g, "").replace(/\.([^.]*)\./g, ".$1");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export function CheckoutModal({
  open,
  plan,
  amounts,
  providerUserId,
  roomId,
  onClose,
}: CheckoutModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"incall" | "outcall" | "">("");
  const [location, setLocation] = useState("");
  const [driverMessage, setDriverMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const price = useMemo(() => {
    if (mode === "incall") return parseAph(amounts.incall);
    if (mode === "outcall") return parseAph(amounts.outcall);
    return 0;
  }, [mode, amounts]);

  const hasIncall = useMemo(() => parseAph(amounts.incall) > 0, [amounts.incall]);
  const hasOutcall = useMemo(() => parseAph(amounts.outcall) > 0, [amounts.outcall]);

  useEffect(() => {
    setMode("");
  }, [plan, amounts.incall, amounts.outcall]);

  const serviceCharge = useMemo(() => Math.round(price * 0.1), [price]);
  const transportation = useMemo(() => (mode === "outcall" ? Math.round(price * 0.2) : 0), [mode, price]);
  const total = useMemo(() => price + serviceCharge + transportation, [price, serviceCharge, transportation]);

  const { data: walletResp } = useGetWalletBalanceQuery(undefined, { skip: !open });
  const walletBalance = useMemo(() => {
    const bal = walletResp?.data?.balance ?? 0;
    return typeof bal === "number" ? bal : parseAph(bal);
  }, [walletResp]);

  const [createOrder, { isLoading }] = useCreateOrderMutation();

  if (!open) return null;

  const handlePayNow = async () => {
    setErrorMessage(null);
    if (!providerUserId || providerUserId.trim() === "") {
      setErrorMessage("Provider ID not available. Please reopen the chat and try again.");
      return;
    }
    if (mode !== "incall" && mode !== "outcall") {
      setErrorMessage("Please select service mode (Incall/Outcall).");
      return;
    }
    if (price <= 0) {
      setErrorMessage("Invalid price for selected mode. Please switch mode.");
      return;
    }
    let serviceType: string;

    if (plan === "short-time") {
      serviceType = "Short time";
    } else if (plan === "overnight") {
      serviceType = "Overnight";
    } else if (plan === "weekend") {
      serviceType = "Weekend";
    } else {
      serviceType = "Custom price";
    }

    const payload: CreateOrderPayload = {
      providerId: providerUserId,
      serviceType,
      visitType: mode,
      price,
      transportationCost: transportation,
      serviceCharge,
      locationFrom: location || undefined,
      notes: driverMessage || undefined,
      roomId: roomId && roomId.trim() !== "" ? roomId : undefined,
    };

    try {
      const result = await createOrder(payload).unwrap();
      setShowSuccess(true);
      const orderId = (result as any)?.data?.id || (result as any)?.id;
      if (!orderId) {
        console.warn("[CheckoutModal] Order created but could not determine order ID from response:", result);
      }
    } catch (err) {
      let msg = "Failed to create order";
      try {
        const e = err as any;
        if (e?.data?.message) msg = String(e.data.message);
        else if (e?.message) msg = String(e.message);
        else if (typeof e === "object") msg = JSON.stringify(e);
      } catch {}
      setErrorMessage(msg);
      console.error("[CheckoutModal] Failed to create order:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={showSuccess ? undefined : onClose}
    >
      <div
        className="relative w-[488px] mx-4 bg-[#FFFFFF0F] backdrop-blur-[68px] text-white rounded-[24px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button> */}

        <div className="p-8">
          {showSuccess ? (
            <div className="rounded-[24px] mx-auto  p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center gap-2 text-[24px] font-semibold">
                  <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FA266D]">
                    <Image
                      src="/icons/logo.svg"
                      alt="Aphrodite Logo"
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                  </span>
                  <span className="text-[#FA266D]">Aphrodite</span>
                </div>
              </div>

              <div className=" w-[120px] h-[120px] rounded-full bg-[#11BF401A] mx-auto flex items-center justify-center">
                <div className=" flex items-center justify-center mx-auto border-4 rounded-full w-20 h-20 border-green-500/60">
                <Check className="h-10 w-10 text-green-400" />
                </div>
              </div>
              <h3 className="text-[22px] font-semibold mb-3">Payment Successful</h3>
              <p className="text-sm text-white/70 mb-6">
                Your payment for this service has been made successfully. You can now track to see if your provider is close to you.
              </p>
              <button
                onClick={() => {
                  onClose();
                  router.push("/orders");
                }}
                className="w-full bg-[#FA266D] text-white py-2 px-4 rounded-[15px] text-[16px] font-medium"
              >
                Track your order
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-[32px] font-bold mb-6">Checkout</h2>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg">
                  ⚥
                </span>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as "incall" | "outcall")}
                  className="w-full py-3 appearance-none bg-transparent border border-[#FFFFFF1A] rounded-[32px] text-white pl-11 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="" disabled>
                    Select service mode (Incall/Outcall)
                  </option>
                  {hasIncall && <option value="incall">Incall</option>}
                  {hasOutcall && <option value="outcall">Outcall</option>}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/60 h-5 w-5" />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <input
                type="text"
                placeholder="Message for the driver"
                value={driverMessage}
                onChange={(e) => setDriverMessage(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-[40px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />

              <div className="pt-2 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Diva/Hunk</span>
                  <span>{price.toLocaleString()} APH</span>
                </div>
                <div className="flex justify-between">
                  <span>Transportation</span>
                  <span>{transportation.toLocaleString()} APH</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge</span>
                  <span>{serviceCharge.toLocaleString()} APH</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>{total.toLocaleString()} APH</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-base mb-2">Payment Method</p>
                <div className="flex items-center justify-between border border-white/20 rounded-[20px] p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">₳</div>
                    <div>
                      <p className="text-sm">Wallet</p>
                      <p className="text-xs text-white/70">
                        {walletBalance.toLocaleString()} APH
                      </p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border border-white/30" />
                </div>
              </div>

              <button
                onClick={handlePayNow}
                disabled={isLoading}
                className="mt-6 w-full bg-[#FA266D] text-white py-3 px-4 rounded-[20px] text-[18px] font-medium hover:bg-pink-600 disabled:bg-gray-600"
              >
                {isLoading ? "Processing..." : "Pay Now"}
              </button>
              {errorMessage && (
                <p className="mt-3 text-sm text-red-400">{errorMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
