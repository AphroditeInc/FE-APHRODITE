"use client";

import { useMemo, useState } from "react";
import { MapPin, Check, X, PhoneCall } from "lucide-react";
import {
  useAcceptOrderByProviderMutation,
  useCancelOrderMutation,
  useCompleteOrderMutation,
  useGetProfileByUserIdQuery,
  useListOrdersQuery,
  useMarkOrderReadyMutation,
  useRejectOrderByProviderMutation,
} from "@/app/api/apiSlice";
import { useAuth } from "@/lib/hooks";
import type { Order, OrderStatus } from "@/lib/types/order.types";

type OrdersTab = "Pending" | "Ongoing" | "Completed" | "Cancelled";

const tabToStatus: Record<OrdersTab, OrderStatus | undefined> = {
  Pending: "pending",
  Ongoing: "ongoing",
  Completed: "completed",
  Cancelled: "cancelled",
};

type OrderCardProps = {
  order: Order;
  isCancelling: boolean;
  onViewDetails: (id: string) => void;
  onCancel: (order: Order) => void;
  displayUserId?: string;
};

function OrderCard({ order, isCancelling, onViewDetails, onCancel, displayUserId }: OrderCardProps) {
  const { data } = useGetProfileByUserIdQuery(displayUserId || "", {
    skip: !displayUserId,
  });

  let providerName = "Unknown provider";
  if (data && typeof data === "object") {
    const profileData = "data" in data && (data as any).data ? (data as any).data : (data as any);
    const username = profileData?.user?.username || profileData?.username;
    const firstName = profileData?.user?.firstName || profileData?.firstName;
    const lastName = profileData?.user?.lastName || profileData?.lastName;
    if (username && typeof username === "string" && username.trim() !== "") {
      providerName = username;
    } else if (firstName && typeof firstName === "string") {
      providerName = `${firstName} ${typeof lastName === "string" ? lastName : ""}`.trim();
    }
  }

  const address = order.locationFrom || "No address provided";
  const serviceLabel = `${order.serviceType} (${order.visitType === "incall" ? "Incall" : "Outcall"})`;
  const amount = order.totalAmount?.toLocaleString() || order.price?.toLocaleString();
  const currency = order.currency || "APH";

  return (
    <div className="w-full">
      <div className="rounded-[24px] bg-[#2A243E] px-6 py-5 shadow-lg h-full flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-base md:text-lg">
              {providerName}
            </span>
            <Check className="w-4 h-4 text-green-500" />
          </div>
          <button
            className="text-xs md:text-sm text-[#FA266D] hover:text-pink-400"
            onClick={() => onViewDetails(order.id)}
          >
            View Details
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs md:text-sm text-white/70 mb-4">
          <MapPin className="w-4 h-4 text-[#FA266D]" />
          <span>{address}</span>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="text-xs md:text-sm text-white/60">
            <p className="mb-1">Service Type</p>
            <p className="text-white font-medium">{serviceLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-bold text-white leading-none">
              {amount}
            </p>
            <p className="text-xs md:text-sm text-white/70 mt-1">
              {currency}
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col sm:flex-row gap-3">
          <button
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#FA266D] text-white text-sm font-semibold hover:bg-pink-500 transition-colors"
            onClick={() => onViewDetails(order.id)}
          >
            <span>View details</span>
          </button>
          {order.status === "pending" && (
            <button
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-[#FA266D] text-sm font-semibold hover:bg-gray-100 transition-colors"
              onClick={() => onCancel(order)}
              disabled={isCancelling}
            >
              <span>{isCancelling ? "Cancelling..." : "Cancel order"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type ProviderOrderCardProps = {
  order: Order;
  isAccepting: boolean;
  isRejecting: boolean;
  isMarkingReady: boolean;
  isCompleting: boolean;
  isCancelling: boolean;
  onViewDetails: (id: string) => void;
  onAccept: (order: Order) => void;
  onReject: (order: Order) => void;
  onReadyForPickup: (order: Order) => void;
  onMarkDone: (order: Order) => void;
  onCallDriver: (order: Order) => void;
  onCancel: (order: Order) => void;
  displayUserId?: string;
};

function ProviderOrderCard({
  order,
  isAccepting,
  isRejecting,
  isMarkingReady,
  isCompleting,
  isCancelling,
  onViewDetails,
  onAccept,
  onReject,
  onReadyForPickup,
  onMarkDone,
  onCallDriver,
  onCancel,
  displayUserId,
}: ProviderOrderCardProps) {
  const { data } = useGetProfileByUserIdQuery(displayUserId || "", {
    skip: !displayUserId,
  });

  let displayName = "Unknown client";
  if (data && typeof data === "object") {
    const profileData = "data" in data && (data as any).data ? (data as any).data : (data as any);
    const username = profileData?.user?.username || profileData?.username;
    const firstName = profileData?.user?.firstName || profileData?.firstName;
    const lastName = profileData?.user?.lastName || profileData?.lastName;
    if (username && typeof username === "string" && username.trim() !== "") {
      displayName = username;
    } else if (firstName && typeof firstName === "string") {
      displayName = `${firstName} ${typeof lastName === "string" ? lastName : ""}`.trim();
    }
  }

  const address = order.locationFrom || "No address provided";
  const serviceLabel = `${order.serviceType} (${order.visitType === "incall" ? "Incall" : "Outcall"})`;
  const amount = order.totalAmount?.toLocaleString() || order.price?.toLocaleString();
  const currency = order.currency || "APH";

  const showPendingActions = order.status === "pending";
  const showReadyForPickupActions =
    order.status === "ongoing" || order.status === "accepted";
  const showMarkDoneActions =
    order.status === "ready_for_pickup" || order.status === "in_progress";

  return (
    <div className="w-full">
      <div className="rounded-[24px] bg-[#2A243E] px-6 py-5 shadow-lg h-full flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-base md:text-lg">
              {displayName}
            </span>
            <Check className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex items-center gap-4 text-xs md:text-sm">
            <button
              className="text-[#FA266D] hover:text-pink-400"
              onClick={() => onViewDetails(order.id)}
            >
              View Details
            </button>
            {showMarkDoneActions && (
              <button
                className="inline-flex items-center gap-1 text-[#FA266D] hover:text-pink-400"
                onClick={() => onCallDriver(order)}
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Driver</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs md:text-sm text-white/70 mb-4">
          <MapPin className="w-4 h-4 text-[#FA266D]" />
          <span>{address}</span>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="text-xs md:text-sm text-white/60">
            <p className="mb-1">Service Type</p>
            <p className="text-white font-medium">{serviceLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-bold text-white leading-none">
              {amount}
            </p>
            <p className="text-xs md:text-sm text-white/70 mt-1">
              {currency}
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col sm:flex-row gap-3">
          {showPendingActions && (
            <>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#FA266D] text-white text-sm font-semibold hover:bg-pink-500 transition-colors disabled:bg-pink-900"
                onClick={() => onAccept(order)}
                disabled={isAccepting}
              >
                <span>{isAccepting ? "Accepting..." : "Accept order"}</span>
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-[#FA266D] text-sm font-semibold hover:bg-gray-100 transition-colors disabled:bg-gray-300"
                onClick={() => onReject(order)}
                disabled={isRejecting}
              >
                <span>{isRejecting ? "Rejecting..." : "Reject order"}</span>
              </button>
            </>
          )}

          {showReadyForPickupActions && (
            <>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#FA266D] text-white text-sm font-semibold hover:bg-pink-500 transition-colors disabled:bg-pink-900"
                onClick={() => onReadyForPickup(order)}
                disabled={isMarkingReady}
              >
                <span>{isMarkingReady ? "Updating..." : "Ready for pickup"}</span>
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-[#FA266D] text-sm font-semibold hover:bg-gray-100 transition-colors disabled:bg-gray-300"
                onClick={() => onCancel(order)}
                disabled={isCancelling}
              >
                <span>{isCancelling ? "Cancelling..." : "Cancel order"}</span>
              </button>
            </>
          )}

          {showMarkDoneActions && (
            <>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#FA266D] text-white text-sm font-semibold hover:bg-pink-500 transition-colors disabled:bg-pink-900"
                onClick={() => onMarkDone(order)}
                disabled={isCompleting}
              >
                <span>{isCompleting ? "Updating..." : "Mark as done"}</span>
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-[#FA266D] text-sm font-semibold hover:bg-gray-100 transition-colors disabled:bg-gray-300"
                onClick={() => onCancel(order)}
                disabled={isCancelling}
              >
                <span>{isCancelling ? "Cancelling..." : "Cancel order"}</span>
              </button>
            </>
          )}

          {!showPendingActions && !showReadyForPickupActions && !showMarkDoneActions && (
            <button
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#FA266D] text-white text-sm font-semibold hover:bg-pink-500 transition-colors"
              onClick={() => onViewDetails(order.id)}
            >
              <span>View details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrdersTab>("Pending");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalView, setModalView] = useState<"details" | "readyConfirm" | null>(null);
  const [showAcceptSuccess, setShowAcceptSuccess] = useState(false);
  const [acceptedOrder, setAcceptedOrder] = useState<Order | null>(null);
  const [showReadySuccess, setShowReadySuccess] = useState(false);
  const [readyOrder, setReadyOrder] = useState<Order | null>(null);
  const [showCompleteSuccess, setShowCompleteSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const tabs: OrdersTab[] = ["Pending", "Ongoing", "Completed", "Cancelled"];

  const { isClient } = useAuth();

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [acceptOrderByProvider, { isLoading: isAccepting }] = useAcceptOrderByProviderMutation();
  const [rejectOrderByProvider, { isLoading: isRejecting }] = useRejectOrderByProviderMutation();
  const [markOrderReady, { isLoading: isMarkingReady }] = useMarkOrderReadyMutation();
  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation();

  const { data: ordersResponse, isLoading } = useListOrdersQuery(
    isClient
      ? {
          role: "customer",
          limit: 50,
        }
      : {
          role: "provider",
          status: tabToStatus[activeTab],
          limit: 20,
        }
  );

  const orders: Order[] = useMemo(() => {
    if (!ordersResponse || !ordersResponse.data) return [];
    const all = ordersResponse.data;

    if (!isClient) return all;

    if (activeTab === "Pending") {
      return all.filter(
        (order) =>
          (order.status === "pending" || order.status === "accepted") &&
          !order.riderId
      );
    }

    if (activeTab === "Ongoing") {
      return all.filter(
        (order) =>
          (order.status === "accepted" ||
            order.status === "ongoing" ||
            order.status === "in_progress") &&
          !!order.riderId
      );
    }

    if (activeTab === "Completed") {
      return all.filter((order) => order.status === "completed");
    }

    if (activeTab === "Cancelled") {
      return all.filter(
        (order) => order.status === "cancelled" || order.status === "rejected"
      );
    }

    return all;
  }, [ordersResponse, isClient, activeTab]);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;

  const openDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalView("details");
  };

  const closeModal = () => {
    setModalView(null);
    setSelectedOrderId(null);
  };

  const handleCancel = async (order: Order) => {
    if (!order) return;
    if (isClient && order.status !== "pending") return;
    try {
      await cancelOrder({
        id: order.id,
        data: { reason: isClient ? "Cancelled by customer" : "Cancelled by provider" },
      }).unwrap();
      setModalView(null);
      setSelectedOrderId(null);
    } catch (error) {
      console.error("[OrdersPage] Failed to cancel order", error);
    }
  };

  const handleAccept = (order: Order) => {
    setSelectedOrderId(order.id);
    setModalView("details");
  };

  const handleReject = (order: Order) => {
    setSelectedOrderId(order.id);
    setModalView("details");
  };

  const handleReadyForPickup = (order: Order) => {
    setSelectedOrderId(order.id);
    setModalView("readyConfirm");
  };

  const handleAcceptFromModal = async () => {
    if (!selectedOrder) return;
    try {
      await acceptOrderByProvider(selectedOrder.id).unwrap();
      setAcceptedOrder(selectedOrder);
      setShowAcceptSuccess(true);
      setModalView(null);
      setSelectedOrderId(null);
    } catch (error) {
      console.error("[OrdersPage] Failed to accept order from modal", error);
    }
  };

  const handleRejectFromModal = async () => {
    if (!selectedOrder) return;
    try {
      await rejectOrderByProvider(selectedOrder.id).unwrap();
      setModalView(null);
      setSelectedOrderId(null);
    } catch (error) {
      console.error("[OrdersPage] Failed to reject order from modal", error);
    }
  };

  const handleMarkDone = (order: Order) => {
    setSelectedOrderId(order.id);
    setModalView("details");
  };

  const handleCompleteFromModal = async () => {
    if (!selectedOrder) return;
    try {
      await completeOrder(selectedOrder.id).unwrap();
      setCompletedOrder(selectedOrder);
      setShowCompleteSuccess(true);
      setModalView(null);
      setSelectedOrderId(null);
    } catch (error) {
      console.error("[OrdersPage] Failed to complete order from modal", error);
    }
  };

  const handleConfirmReadyFromModal = async () => {
    if (!selectedOrder) return;
    try {
      await markOrderReady(selectedOrder.id).unwrap();
      setModalView(null);
      setSelectedOrderId(null);
    } catch (error) {
      console.error("[OrdersPage] Failed to mark order ready from modal", error);
    }
  };

  const handleCallDriver = (order: Order) => {
    setReadyOrder(order);
    setShowReadySuccess(true);
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
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedOrderId(null);
                  setModalView(null);
                }}
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
          {isLoading ? (
            <div className="col-span-full text-center text-white/60">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="col-span-full text-center text-white/60">
              No orders found for this tab.
            </div>
          ) : (
            orders.map((order) =>
              isClient ? (
                <OrderCard
                  key={order.id}
                  order={order}
                  isCancelling={isCancelling}
                  onViewDetails={openDetails}
                  onCancel={handleCancel}
                  displayUserId={order.providerId}
                />
              ) : (
                <ProviderOrderCard
                  key={order.id}
                  order={order}
                  isAccepting={isAccepting}
              isRejecting={isRejecting}
              isMarkingReady={isMarkingReady}
              isCompleting={isCompleting}
              isCancelling={isCancelling}
              onViewDetails={openDetails}
              onAccept={handleAccept}
              onReject={handleReject}
              onReadyForPickup={handleReadyForPickup}
              onMarkDone={handleMarkDone}
              onCallDriver={handleCallDriver}
              onCancel={handleCancel}
              displayUserId={order.customerId}
            />
              )
            )
          )}
        </div>
        {modalView && selectedOrder && (
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
                        <p>Pickup location</p>
                      </div>
                    </div>
                    <div className="relative flex items-start gap-2">
                      <span className="mt-1 h-3 w-3 rounded-full bg-[#FA266D]" />
                      <div>
                        <p>{selectedOrder.locationFrom || "No address provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                    Order
                  </p>
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    {selectedOrder.orderId || selectedOrder.id}
                    <Check className="h-4 w-4 text-green-500" />
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                    <MapPin className="h-4 w-4 text-[#FA266D]" />
                    <span>{selectedOrder.locationFrom || "No address provided"}</span>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                    Service Details
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">
                      {selectedOrder.serviceType} ({selectedOrder.visitType === "incall" ? "Incall" : "Outcall"})
                    </p>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        {selectedOrder.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-white/70">
                        {selectedOrder.currency || "APH"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                {modalView === "details" && (
                  <>
                    {isClient && selectedOrder.status === "pending" && (
                      <button
                        className="w-full rounded-full bg-[#FA266D] py-3 text-sm font-semibold text-white hover:bg-pink-500 transition-colors"
                        onClick={() => handleCancel(selectedOrder)}
                        disabled={isCancelling}
                      >
                        {isCancelling ? "Cancelling..." : "Cancel order"}
                      </button>
                    )}
                    {!isClient && selectedOrder.status === "pending" && (
                      <>
                        <button
                          className="w-full rounded-full bg-[#FA266D] py-3 text-sm font-semibold text-white hover:bg-pink-500 transition-colors disabled:bg-pink-900"
                          onClick={handleAcceptFromModal}
                          disabled={isAccepting}
                        >
                          {isAccepting ? "Accepting..." : "Accept order"}
                        </button>
                        <button
                          className="w-full rounded-full bg-white py-3 text-sm font-semibold text-[#FA266D] hover:bg-gray-100 transition-colors disabled:bg-gray-300"
                          onClick={handleRejectFromModal}
                          disabled={isRejecting}
                        >
                          {isRejecting ? "Rejecting..." : "Reject order"}
                        </button>
                      </>
                    )}
                    {!isClient &&
                      (selectedOrder.status === "ready_for_pickup" ||
                        selectedOrder.status === "in_progress") && (
                        <>
                          <button
                            className="w-full rounded-full bg-[#FA266D] py-3 text-sm font-semibold text-white hover:bg-pink-500 transition-colors disabled:bg-pink-900"
                            onClick={handleCompleteFromModal}
                            disabled={isCompleting}
                          >
                            {isCompleting ? "Updating..." : "Mark as done"}
                          </button>
                          <button
                            className="w-full rounded-full bg-white py-3 text-sm font-semibold text-[#FA266D] hover:bg-gray-100 transition-colors disabled:bg-gray-300"
                            onClick={() => handleCancel(selectedOrder)}
                            disabled={isCancelling}
                          >
                            {isCancelling ? "Cancelling..." : "Cancel order"}
                          </button>
                        </>
                      )}
                  </>
                )}
                {modalView === "readyConfirm" && !isClient && (
                  <>
                    <p className="text-xs text-white/70 text-center">
                      Are you ready for pickup?
                    </p>
                    <button
                      className="w-full rounded-full bg-[#FA266D] py-3 text-sm font-semibold text-white hover:bg-pink-500 transition-colors disabled:bg-pink-900"
                      onClick={handleConfirmReadyFromModal}
                      disabled={isMarkingReady}
                    >
                      {isMarkingReady ? "Updating..." : "Yes, I'm Ready"}
                    </button>
                    <button
                      className="w-full rounded-full bg-white py-3 text-sm font-semibold text-[#FA266D] hover:bg-gray-100 transition-colors disabled:bg-gray-300"
                      onClick={() => handleCancel(selectedOrder)}
                      disabled={isCancelling}
                    >
                      {isCancelling ? "Cancelling..." : "Cancel order"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {showAcceptSuccess && acceptedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-[24px] bg-[#2A243E] p-8 text-center text-white shadow-2xl">
              <div className="w-[120px] h-[120px] rounded-full bg-[#11BF401A] mx-auto flex items-center justify-center mb-6">
                <div className="flex items-center justify-center mx-auto border-4 rounded-full w-20 h-20 border-green-500/60">
                  <Check className="h-10 w-10 text-green-400" />
                </div>
              </div>
              <h3 className="text-[22px] font-semibold mb-3">Order Accepted</h3>
              <p className="text-sm text-white/70 mb-6">
                Your order has been accepted and confirmed. Now, go prepare and let the driver know
                when you are ready.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  className="w-full rounded-full bg-[#FA266D] py-3 text-sm font-semibold text-white hover:bg-pink-500 transition-colors"
                  onClick={() => setShowAcceptSuccess(false)}
                >
                  I'm ready
                </button>
                <button
                  className="w-full rounded-full bg-white py-3 text-sm font-semibold text-[#FA266D] hover:bg-gray-100 transition-colors"
                  onClick={() => setShowAcceptSuccess(false)}
                >
                  View all orders
                </button>
              </div>
            </div>
          </div>
        )}
        {showReadySuccess && readyOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-[24px] bg-[#2A243E] p-8 text-center text-white shadow-2xl">
              <div className="w-[120px] h-[120px] rounded-full bg-[#11BF401A] mx-auto flex items-center justify-center mb-6">
                <div className="flex items-center justify-center mx-auto border-4 rounded-full w-20 h-20 border-green-500/60">
                  <Check className="h-10 w-10 text-green-400" />
                </div>
              </div>
              <h3 className="text-[22px] font-semibold mb-3">Ready to Go</h3>
              <p className="text-sm text-white/70 mb-6">
                Hiya! A driver has been assigned to you and they will be with you as soon as
                possible.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  className="w-full rounded-full bg-[#FA266D] py-3 text-sm font-semibold text-white hover:bg-pink-500 transition-colors"
                  onClick={() => setShowReadySuccess(false)}
                >
                  Call Driver
                </button>
                <button
                  className="w-full rounded-full bg-white py-3 text-sm font-semibold text-[#FA266D] hover:bg-gray-100 transition-colors"
                  onClick={() => setShowReadySuccess(false)}
                >
                  View all orders
                </button>
              </div>
            </div>
          </div>
        )}
        {showCompleteSuccess && completedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-[24px] bg-[#2A243E] p-8 text-center text-white shadow-2xl">
              <div className="w-[120px] h-[120px] rounded-full bg-[#11BF401A] mx-auto flex items-center justify-center mb-6">
                <div className="flex items-center justify-center mx-auto border-4 rounded-full w-20 h-20 border-green-500/60">
                  <Check className="h-10 w-10 text-green-400" />
                </div>
              </div>
              <h3 className="text-[22px] font-semibold mb-3">Welldone</h3>
              <p className="text-sm text-white/70 mb-6">
                Hi Diva/Hunk! Welldone so far, a driver will call to pick you up as soon as the
                client has confirmed and your wallet will be credited.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  className="w-full rounded-full bg-white py-3 text-sm font-semibold text-[#FA266D] hover:bg-gray-100 transition-colors"
                  onClick={() => setShowCompleteSuccess(false)}
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
