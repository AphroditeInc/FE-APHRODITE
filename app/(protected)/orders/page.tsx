"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus, Download, ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle, Clock, X, ArrowUp, ChevronDown, AlertCircle, CheckCircle, HandCoins, Eye, EyeOff } from "lucide-react";
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
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  
  const walletBalance = useMemo(() => {
    if (walletBalanceData?.success && walletBalanceData?.data) {
      return walletBalanceData.data;
    }
    return null;
  }, [walletBalanceData]);

  const transactions = useMemo(() => {
    if (transactionsData?.success && transactionsData?.data && Array.isArray(transactionsData.data) && transactionsData.data.length > 0) {
      return transactionsData.data;
    }
    // Dummy data for design purposes
    return [
      {
        type: 'credit' as const,
        amount: 50000,
        nairaAmount: 62500,
        description: 'Wallet funding',
        reference: 'TXN_001',
        status: 'successful',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        type: 'debit' as const,
        amount: 15000,
        nairaAmount: 18750,
        description: 'Payout request',
        reference: 'TXN_002',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
      {
        type: 'credit' as const,
        amount: 25000,
        nairaAmount: 31250,
        description: 'Wallet funding',
        reference: 'TXN_003',
        status: 'successful',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
      {
        type: 'debit' as const,
        amount: 10000,
        nairaAmount: 12500,
        description: 'Service payment',
        reference: 'TXN_004',
        status: 'failed',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      },
    ];
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
    
    return `${day}, ${dayNum}${getOrdinalSuffix(dayNum)} ${month}. ${year} • ${displayHours}:${displayMinutes}${ampm}`;
  };

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const getStatusStyles = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'success' || statusLower === 'successful' || statusLower === 'completed') {
      return {
        bg: 'bg-[#10B9811A]', // Green background with opacity
        text: 'text-[#10B981]', // Green text
      };
    }
    if (statusLower === 'pending' || statusLower === 'processing') {
      return {
        bg: 'bg-[#FFCFA21A]', // Orange background with opacity
        text: 'text-[#FF993A]', // Orange text
      };
    }
    if (statusLower === 'failed' || statusLower === 'cancelled') {
      return {
        bg: 'bg-[#EF44441A]', // Red background with opacity
        text: 'text-[#EF4444]', // Red text
      };
    }
    return {
      bg: 'bg-[#6B72801A]', // Gray background with opacity
      text: 'text-[#6B7280]', // Gray text
    };
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
    <div className="h-full bg-[#1F1B2C] p-6 sm:p-8 overflow-y-auto font-urbanist">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-[#FA266D] font-urbanist">Wallet</h1>

        {/* Wallet Balance Card */}
        <div className="h-[178px] rounded-[24px] bg-[#FFFFFF0F] backdrop-blur-[68px] p-6 sm:p-8 font-urbanist">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-white font-urbanist">Wallet Balance</h2>
              <button
                type="button"
                onClick={() => {
                  console.log("Eye icon clicked, current state:", isBalanceVisible);
                  setIsBalanceVisible(prev => {
                    console.log("Toggling from", prev, "to", !prev);
                    return !prev;
                  });
                }}
                className="text-white/60 hover:text-white transition-colors cursor-pointer z-10 relative"
                aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
              >
                {isBalanceVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              {isLoadingBalance ? (
                <div className="text-4xl sm:text-5xl font-bold text-white animate-pulse font-urbanist">Loading...</div>
              ) : walletBalance ? (
                <div className="flex items-baseline gap-2 font-urbanist text-white">
                  {isBalanceVisible ? (
                    <>
                      <span className="text-[48px] font-extrabold leading-none tracking-[-0.02em]">
                        {Number(walletBalance.balance || 0).toLocaleString('en-US', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 0 
                        })}
                      </span>
                      <span className="text-[24px] font-semibold leading-none tracking-[-0.02em]">
                        {walletBalance.currency || 'APH'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[48px] font-extrabold leading-none tracking-[-0.02em]">••••••</span>
                      {/* <span className="text-[24px] font-semibold leading-none tracking-[-0.02em]">•••</span> */}
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-baseline gap-2 font-urbanist text-white">
                  {isBalanceVisible ? (
                    <>
                      <span className="text-[48px] font-extrabold leading-none tracking-[-0.02em]">0</span>
                      <span className="text-[24px] font-semibold leading-none tracking-[-0.02em]">APH</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[48px] font-extrabold leading-none tracking-[-0.02em]">••••••</span>
                      {/* <span className="text-[24px] font-semibold leading-none tracking-[-0.02em]">•••</span> */}
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setIsFundModalOpen(true)}
                className="w-[183px] h-[56px] rounded-[30px] bg-[#FA266D] hover:bg-pink-600 text-white flex items-center justify-center gap-2 transition-colors font-urbanist font-semibold text-base leading-none capitalize"
              >
                <Plus className="w-5 h-5" />
                <span>Fund Wallet</span>
              </button>
              <button className="w-[210px] h-[56px] rounded-[30px] bg-white hover:bg-white/90 text-[#FA266D] flex items-center justify-center gap-2 transition-colors font-urbanist font-semibold text-base leading-none capitalize">
                <Download className="w-5 h-5" />
                <span>Request Payout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          <h2 className="text-[16px] font-medium text-white font-urbanist">Transaction History</h2>
          
          {isLoadingTransactions ? (
            <div className="text-center py-12">
              <div className="text-white/60">Loading transactions...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white/60">No transactions yet</div>
            </div>
          ) : (
            <div className="space-y-[24px]">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.reference || index}
                  className="h-[124px] rounded-[24px] bg-[#FFFFFF0F] backdrop-blur-[68px] p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left Side - Icon and Amount */}
                    <div className="flex items-start gap-4 flex-1">
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
                        <div className="text-[32px] font-bold text-white mb-[8px]">
                          {Number(transaction.amount || 0).toLocaleString('en-US', { 
                            minimumFractionDigits: 0, 
                            maximumFractionDigits: 0 
                          })} <span className="text-[16px] font-medium text-[#FFFFFF]">APH</span>
                        </div>
                        <div className="font-urbanist font-medium text-[12px] leading-[20px] text-[#807E7E]">
                          {transaction.type ? transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) : 'Transaction'}
                          {transaction.createdAt && (
                            <>
                              {' • '}
                              {formatDate(transaction.createdAt)}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Status */}
                    <div className="flex items-center gap-[10px]">
                      <span className={`rounded-[20px] py-[6px] px-3 ${getStatusStyles(transaction.status).bg} ${getStatusStyles(transaction.status).text} font-urbanist font-medium text-[12px] leading-none text-center`}>
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
          <div className="bg-[#FFFFFF0F] backdrop-blur-[68px] rounded-xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-[621px]">
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
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <HandCoins className="w-5 h-5 text-white/60" />
                </div>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="How much do you want to deposit?"
                  className="w-full max-w-[541px] h-[56px] pl-12 pr-[100px] bg-white/5 border border-[#FFFFFF1A] rounded-[32px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FA266D] focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none appearance-none pr-2 cursor-pointer font-urbanist"
                  >
                    <option value="NGN" className="bg-[#1F1B2C]">NGN</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-white/60 pointer-events-none" />
                </div>
              </div>

              {/* Equivalent Amount and What You Will Get - Side by Side */}
              {ngnAmount > 0 && (
                <div className="rounded-lg p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-white/60 text-[16px] font-medium mb-1">Equivalent Amount</div>
                      <div className="text-white font-bold text-[32px]">
                        {aphEquivalent.toLocaleString('en-US', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 0 
                        })} <span className="text-[16px] font-medium">APH</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-[16px] font-medium mb-1">What You Will Get</div>
                      <div className="text-white  text-[32px] font-bold ">
                        {aphAfterFee.toLocaleString('en-US', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 0 
                        })} <span className="text-[16px] font-medium">APH</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Message */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FA266D] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">!</span>
                </div>
                <p className="font-urbanist font-normal text-base leading-6 tracking-[-0.02em] text-[#FFFFFF99]">
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
                className="w-full max-w-[541px] h-[56px] rounded-[30px] bg-[#FA266D] hover:bg-pink-600 text-white font-urbanist font-semibold text-base leading-none capitalize transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isFundingWallet ? 'Processing...' : 'Proceed'}
              </button>
              <button
                onClick={() => {
                  setIsFundModalOpen(false);
                  setFundAmount("");
                }}
                className="w-full max-w-[541px] h-[56px] rounded-[30px] bg-white hover:bg-white/90 text-[#FA266D] font-urbanist font-semibold text-base leading-none capitalize transition-colors"
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
