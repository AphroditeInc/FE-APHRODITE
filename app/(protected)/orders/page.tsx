"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus, Download, ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle, Clock, X, ArrowUp, ChevronDown, AlertCircle, CheckCircle, HandCoins } from "lucide-react";
import { useGetWalletBalanceQuery, useGetTransactionsQuery, useFundWalletMutation, useVerifyPaymentMutation } from "@/app/api/apiSlice";
import { useAuthProfile } from "@/lib/hooks";
import { useMemo } from "react";
export default function OrdersPage() {
  const { user } = useAuthProfile();
  const { data: walletBalanceData, isLoading: isLoadingBalance, refetch: refetchBalance } = useGetWalletBalanceQuery();
  const { data: transactionsData, isLoading: isLoadingTransactions, refetch: refetchTransactions } = useGetTransactionsQuery({ limit: 50 });
  const [fundWallet, { isLoading: isFundingWallet }] = useFundWalletMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();
  
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [fundedAmount, setFundedAmount] = useState(0);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  
  const walletBalance = useMemo(() => {
    if (walletBalanceData?.success && walletBalanceData?.data) {
      return walletBalanceData.data;
    }
    return null;
  }, [walletBalanceData]);

  const transactions = useMemo(() => {
    if (transactionsData?.success && transactionsData?.data && Array.isArray(transactionsData.data)) {
      return transactionsData.data;
    }
    return [];
  }, [transactionsData]);

  // Calculate APH equivalent (1 APH = 1.25 NGN)
  const calculateAPH = (ngnAmount: number) => {
    return ngnAmount / 1.25;
  };

  // Calculate what user will get after 5% fee
  const calculateAfterFee = (aphAmount: number) => {
    return aphAmount * 0.95; // 5% fee deducted
  };

  const handleVerifyPayment = async (reference: string) => {
    try {
      const result = await verifyPayment({ reference }).unwrap();
      if (result.success && result.data) {
        setFundedAmount(result.data.amount);
        setPaymentReference(reference);
        setIsSuccessModalOpen(true);
        // Refetch balance and transactions
        refetchBalance();
        refetchTransactions();
        // Clear URL parameters
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/orders');
        }
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      alert("Payment verification failed. Please contact support.");
    }
  };

  // Handle payment verification from Paystack callback
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    const trxref = urlParams.get('trxref');
    const paymentRef = reference || trxref;
    
    if (paymentRef && !isSuccessModalOpen && !isVerifyingPayment) {
      handleVerifyPayment(paymentRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFundWallet = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!user?.email) {
      alert("User email is required for payment");
      return;
    }

    try {
      const ngnAmount = parseFloat(fundAmount);
      const aphAmount = calculateAPH(ngnAmount);
      
      // Validate minimum funding amount (100 APH)
      if (aphAmount < 100) {
        alert("Minimum funding amount is 100 APH. Please enter a higher amount.");
        return;
      }
      
      const result = await fundWallet({
        amount: aphAmount,
        email: user.email,
        callbackUrl: `${window.location.origin}/orders?reference=`,
      }).unwrap();

      if (result.success && result.data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = result.data.authorization_url;
      }
    } catch (error: any) {
      console.error("Fund wallet error:", error);
      const errorMessage = error?.data?.message || error?.data?.error || "Failed to initialize payment. Please try again.";
      alert(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
    }
  };

  const ngnAmount = parseFloat(fundAmount) || 0;
  const aphEquivalent = calculateAPH(ngnAmount);
  const aphAfterFee = calculateAfterFee(aphEquivalent);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[date.getDay()];
    const dayNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${day}. ${dayNum}${getOrdinalSuffix(dayNum)} ${month}. ${year} • ${displayHours}:${displayMinutes}${ampm}`;
  };

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'success' || statusLower === 'successful' || statusLower === 'completed') {
      return 'text-green-500';
    }
    if (statusLower === 'pending' || statusLower === 'processing') {
      return 'text-orange-500';
    }
    if (statusLower === 'failed' || statusLower === 'cancelled') {
      return 'text-red-500';
    }
    return 'text-gray-400';
  };

  const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'success' || statusLower === 'completed') {
      return 'SUCCESSFUL';
    }
    if (statusLower === 'pending' || statusLower === 'processing') {
      return 'PENDING';
    }
    if (statusLower === 'failed') {
      return 'FAILED';
    }
    return status.toUpperCase();
  };

  return (
    <div className="h-full bg-[#1F1B2C] p-6 sm:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-[#FA266D]">Wallet</h1>

        {/* Wallet Balance Card */}
        <div className="bg-white/5 rounded-lg p-6 sm:p-8 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-white/60" />
              <h2 className="text-xl font-semibold text-white">Wallet Balance</h2>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              {isLoadingBalance ? (
                <div className="text-4xl sm:text-5xl font-bold text-white animate-pulse">Loading...</div>
              ) : walletBalance ? (
                <div className="text-4xl sm:text-5xl font-bold text-white">
                  {Number(walletBalance.balance || 0).toLocaleString('en-US', { 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 0 
                  })} {walletBalance.currency || 'APH'}
                </div>
              ) : (
                <div className="text-4xl sm:text-5xl font-bold text-white">0 APH</div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setIsFundModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-[#FA266D] hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Fund Wallet</span>
              </button>
              <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg font-medium transition-colors">
                <Download className="w-5 h-5" />
                <span>Request Payout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Transaction History</h2>
          
          {isLoadingTransactions ? (
            <div className="text-center py-12">
              <div className="text-white/60">Loading transactions...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white/60">No transactions yet</div>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.reference || index}
                  className="bg-white/5 rounded-lg p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left Side - Icon and Amount */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' 
                          ? 'bg-green-500/20' 
                          : 'bg-red-500/20'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDownLeft className="w-6 h-6 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-2xl font-bold text-white mb-1">
                          {Number(transaction.amount || 0).toLocaleString('en-US', { 
                            minimumFractionDigits: 0, 
                            maximumFractionDigits: 0 
                          })} APH
                        </div>
                        <div className="text-white/60 text-sm capitalize">
                          {transaction.type || 'Transaction'}
                        </div>
                        <div className="text-white/40 text-xs mt-1">
                          {transaction.createdAt ? formatDate(transaction.createdAt) : 'Date not available'}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Status */}
                    <div className="flex items-center">
                      <span className={`font-semibold text-sm ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fund Wallet Modal */}
      {isFundModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1F1B2C] rounded-xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Fund Wallet</h2>
              <button 
                onClick={() => {
                  setIsFundModalOpen(false);
                  setFundAmount("");
                }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Amount Input */}
            <div className="space-y-6 mb-6">
              {/* Input Field with Icon and Currency Selector */}
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <HandCoins className="w-5 h-5 text-white/60" />
                  </div>
                  <input
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="How much do you want to deposit?"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FA266D] focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-4 py-3 pr-8 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FA266D] focus:border-transparent appearance-none"
                  >
                    <option value="NGN" className="bg-[#1F1B2C]">NGN</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Equivalent Amount and What You Will Get - Side by Side */}
              {ngnAmount > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-white/60 text-sm mb-1">Equivalent Amount</div>
                      <div className="text-white font-bold text-lg">
                        {aphEquivalent.toLocaleString('en-US', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 0 
                        })} APH
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-sm mb-1">What You Will Get</div>
                      <div className="text-white font-bold text-lg">
                        {aphAfterFee.toLocaleString('en-US', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 0 
                        })} APH
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Message */}
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-3 h-3 text-white" fill="currentColor" />
                </div>
                <p className="text-sm text-white/80">
                  Kindly note that we deduct 5% fee as service charge on all transactions.
                </p>
              </div>

              {/* Minimum Amount Validation Message */}
              {ngnAmount > 0 && aphEquivalent < 100 && (
                <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/80">
                    Minimum funding amount is 100 APH. Please enter at least ₦{Math.ceil(100 * 1.25).toLocaleString('en-US')} NGN.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons - Proceed on top, Cancel below */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleFundWallet}
                disabled={!fundAmount || parseFloat(fundAmount) <= 0 || aphEquivalent < 100 || isFundingWallet}
                className="w-full px-6 py-3 bg-[#FA266D] hover:bg-pink-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isFundingWallet ? 'Processing...' : 'Proceed'}
              </button>
              <button
                onClick={() => {
                  setIsFundModalOpen(false);
                  setFundAmount("");
                }}
                className="w-full px-6 py-3 bg-white border border-gray-300 text-[#FA266D] rounded-lg font-medium transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1F1B2C] rounded-xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-md text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-2xl font-bold text-white mb-4">Wallet Funding Successful</h2>
            <p className="text-white/80 mb-6">
              Your wallet has been funded successfully with the total amount of{" "}
              <span className="font-semibold text-white">
                {fundedAmount.toLocaleString('en-US', { 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 0 
                })}APH
              </span>
              . Now, go ahead and start exploring.
            </p>

            {/* Action Button */}
            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                setFundedAmount(0);
                setPaymentReference(null);
                // Clear URL parameters
                window.history.replaceState({}, '', '/orders');
              }}
              className="w-full px-6 py-3 bg-[#FA266D] hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
            >
              Okay, got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
