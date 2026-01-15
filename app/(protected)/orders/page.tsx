"use client";

import { useState } from "react";
import { MapPin, Check, X } from "lucide-react";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"Pending" | "Ongoing" | "Completed" | "Cancelled">("Pending");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalView, setModalView] = useState<"details" | "accepted" | "rejected" | null>(null);

  const tabs: Array<"Pending" | "Ongoing" | "Completed" | "Cancelled"> = [
    "Pending",
    "Ongoing",
    "Completed",
    "Cancelled",
  ];

  const orders = [
    {
      id: "ORD-001",
      clientName: "Daniel Chukwumerije",
      address: "No 1 Constitution Avenue, FCT Abuja 12846",
      serviceType: "Short time (Outcall)",
      amount: "43,000",
      currency: "APH",
    },
    {
      id: "ORD-002",
      clientName: "Sophia Adeyemi",
      address: "Lekki Phase 1, Lagos, Nigeria",
      serviceType: "Overnight (Incall)",
      amount: "80,000",
      currency: "APH",
    },
  ];

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;

  const openDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalView("details");
  };

  const closeModal = () => {
    setModalView(null);
  };

  const handleAccept = () => {
    setModalView("accepted");
  };

  const handleReject = () => {
    setModalView("rejected");
  };

  return (
    <div className="h-full bg-[#1F1B2C] p-6 sm:p-8 overflow-y-auto font-urbanist">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[#FA266D] mb-6">Orders</h1>

        <div className="border-b border-white/10 mb-8">
          <nav className="flex gap-8 text-sm md:text-base">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 relative ${
                  activeTab === tab
                    ? "text-[#FA266D] font-semibold"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#FA266D] rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="w-full">
              <div className="rounded-[24px] bg-[#2A243E] px-6 py-5 shadow-lg h-full flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-base md:text-lg">
                      {order.clientName}
                    </span>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <button
                    className="text-xs md:text-sm text-[#FA266D] hover:text-pink-400"
                    onClick={() => openDetails(order.id)}
                  >
                    View Details
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs md:text-sm text-white/70 mb-4">
                  <MapPin className="w-4 h-4 text-[#FA266D]" />
                  <span>{order.address}</span>
                </div>

                <div className="flex items-center justify-between mb-5">
                  <div className="text-xs md:text-sm text-white/60">
                    <p className="mb-1">Service Type</p>
                    <p className="text-white font-medium">{order.serviceType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl md:text-3xl font-bold text-white leading-none">
                      {order.amount}
                    </p>
                    <p className="text-xs md:text-sm text-white/70 mt-1">
                      {order.currency}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row gap-3">
                  <button
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#FA266D] text-white text-sm font-semibold hover:bg-pink-500 transition-colors"
                    onClick={() => openDetails(order.id)}
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Order</span>
                  </button>
                  <button
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-[#FA266D] text-sm font-semibold hover:bg-gray-100 transition-colors"
                    onClick={() => openDetails(order.id)}
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Order</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {modalView === "details" && selectedOrder && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-xl rounded-[24px] bg-[#2A243E] px-6 py-6 sm:px-8 sm:py-8 shadow-2xl">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                    Order Details
                  </p>
                  <p className="mt-1 text-xs text-white/60">Thu, 30th Nov, 2025</p>
                </div>
                <button
                  className="text-white/60 hover:text-white"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 text-sm">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium text-white/80">Route</p>
                    <button className="text-xs font-medium text-[#FA266D] hover:text-pink-400">
                      View Timeline
                    </button>
                  </div>
                  <div className="relative pl-5 text-xs sm:text-sm text-white/80">
                    <div className="absolute left-1 top-1 bottom-6 w-px bg-white/20" />
                    <div className="relative mb-4 flex items-start gap-2">
                      <span className="mt-1 h-3 w-3 rounded-full border border-[#FA266D] bg-[#FA266D]" />
                      <div>
                        <p>San Diego Drive, Gwagpe 106104, FCT Abuja</p>
                      </div>
                    </div>
                    <div className="relative flex items-start gap-2">
                      <span className="mt-1 h-3 w-3 rounded-full bg-[#FA266D]" />
                      <div>
                        <p>{selectedOrder.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                    Client
                  </p>
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    {selectedOrder.clientName}
                    <Check className="h-4 w-4 text-green-500" />
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                    <MapPin className="h-4 w-4 text-[#FA266D]" />
                    <span>{selectedOrder.address}</span>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                    Service Details
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">
                      {selectedOrder.serviceType}
                    </p>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        {selectedOrder.amount}
                      </p>
                      <p className="text-xs text-white/70">
                        {selectedOrder.currency}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  className="w-full rounded-full bg-[#FA266D] py-3 text-sm font-semibold text-white hover:bg-pink-500 transition-colors"
                  onClick={handleAccept}
                >
                  Accept Order
                </button>
                <button
                  className="w-full rounded-full bg-white py-3 text-sm font-semibold text-[#FA266D] hover:bg-gray-100 transition-colors"
                  onClick={handleReject}
                >
                  Reject Order
                </button>
              </div>
            </div>
          </div>
        )}

        {modalView === "accepted" && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-sm rounded-[24px] bg-[#2A243E] px-6 py-8 text-center shadow-2xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-white">
                Order Accepted
              </h2>
              <p className="mb-6 text-xs sm:text-sm text-white/70">
                Your order from {selectedOrder.clientName} has been accepted and
                confirmed. Prepare yourself and we&apos;ll notify the driver
                when you are ready.
              </p>
              <div className="flex flex-col gap-3">
                <button className="w-full rounded-full bg-[#FA266D] py-3 text-sm font-semibold text-white hover:bg-pink-500 transition-colors">
                  I&apos;m ready
                </button>
                <button
                  className="w-full rounded-full bg-white py-3 text-sm font-semibold text-[#FA266D] hover:bg-gray-100 transition-colors"
                  onClick={closeModal}
                >
                  View all orders
                </button>
              </div>
            </div>
          </div>
        )}

        {modalView === "rejected" && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-sm rounded-[24px] bg-[#2A243E] px-6 py-8 text-center shadow-2xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20">
                <X className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-white">
                Order Rejected
              </h2>
              <p className="mb-6 text-xs sm:text-sm text-white/70">
                Your order from {selectedOrder.clientName} has been rejected and
                confirmed. We will let you know when there is a new order.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  className="w-full rounded-full bg-[#FA266D] py-3 text-sm font-semibold text-white hover:bg-pink-500 transition-colors"
                  onClick={closeModal}
                >
                  View all orders
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
