"use client";

import { CreditCard, DollarSign, Calendar, Download } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white">Billing & Payments</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="text-white font-medium">**** **** **** 1234</p>
                    <p className="text-sm text-white/60">Expires 12/25</p>
                  </div>
                </div>
                <button className="text-pink-400 hover:text-pink-300 text-sm">Edit</button>
              </div>
            </div>
            <button className="mt-4 text-pink-400 hover:text-pink-300 text-sm">+ Add Payment Method</button>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-white text-sm">Premium Subscription</p>
                    <p className="text-white/60 text-xs">Dec 15, 2024</p>
                  </div>
                </div>
                <span className="text-green-400 font-semibold">$29.99</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-[20px] p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Current Plan</h3>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">Free</p>
              <p className="text-white/60 text-sm">Basic features included</p>
              <button className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
