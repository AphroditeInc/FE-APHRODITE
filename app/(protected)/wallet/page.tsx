"use client";

import { useState, useEffect, useMemo } from "react";
import { Wallet, Plus, Download, ArrowDownLeft, ArrowUpRight, X, ChevronDown, AlertCircle, CheckCircle, HandCoins, Eye, EyeOff } from "lucide-react";
import {
  useGetWalletBalanceQuery,
  useGetTransactionsQuery,
  useFundWalletMutation,
  useVerifyPaymentMutation,
  useCreatePayoutMutation,
  useGetWithdrawalAccountsQuery,
} from "@/app/api/apiSlice";
import { useAuth, useAuthProfile } from "@/lib/hooks";

export default function WalletPage() {
  const { user } = useAuthProfile();
  const { isDiva, isHunk } = useAuth();

  const { data: walletBalanceData, isLoading: isLoadingBalance, refetch: refetchBalance } = useGetWalletBalanceQuery(undefined, {
    pollingInterval: 30000,
    refetchOnMountOrArgChange: true,
  });
  const { data: transactionsData, isLoading: isLoadingTransactions, refetch: refetchTransactions } = useGetTransactionsQuery({ limit: 50 }, {
    pollingInterval: 30000,
    refetchOnMountOrArgChange: true,
  });

  const [fundWallet, { isLoading: isFundingWallet }] = useFundWalletMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();
  const [createPayout, { isLoading: isRequestingPayout }] = useCreatePayoutMutation();

  const { data: accountsData } = useGetWithdrawalAccountsQuery(undefined, { skip: !(isDiva || isHunk) });
  const withdrawalAccounts = useMemo(() => {
    const d = accountsData?.data;
    return Array.isArray(d) ? d : [];
  }, [accountsData]);

  // Fund wallet state
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [fundError, setFundError] = useState<string | null>(null);
  const [currency] = useState("NGN");

  // Payout state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState<{ amount: number; netAmount: number } | null>(null);

  // Success/verify state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [fundedAmount, setFundedAmount] = useState(0);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  // Optimistic balance — set immediately from verify response, overrides query data until next refetch
  const [optimisticBalance, setOptimisticBalance] = useState<number | null>(null);

  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const walletBalance = useMemo(() => {
    if (walletBalanceData?.success && walletBalanceData?.data) return walletBalanceData.data;
    return null;
  }, [walletBalanceData]);

  // Use optimistic balance if set (from verify response), otherwise fall back to query data
  const displayBalance = optimisticBalance ?? walletBalance?.balance ?? 0;

  const transactions = useMemo(() => {
    if (transactionsData?.success && Array.isArray(transactionsData.data)) return transactionsData.data;
    return [];
  }, [transactionsData]);

  const calculateAPH = (ngnAmount: number) => ngnAmount / 1.25;
  const calculateAfterFee = (aphAmount: number) => aphAmount * 0.95;

  const ngnAmount = parseFloat(fundAmount) || 0;
  const aphEquivalent = calculateAPH(ngnAmount);
  const aphAfterFee = calculateAfterFee(aphEquivalent);

  const handleVerifyPayment = async (reference: string) => {
    setVerifyError(null);
    try {
      const result = await verifyPayment({ reference }).unwrap();
      if (result.success && result.data) {
        const credited = result.data.amount ?? 0;
        const newBalance = result.data.balance;

        setFundedAmount(credited);
        // Set optimistic balance immediately from the verify response
        if (typeof newBalance === "number") {
          setOptimisticBalance(newBalance);
        }
        setIsSuccessModalOpen(true);
        // Force-refetch both — when they return, optimistic balance is cleared
        refetchBalance().then(() => setOptimisticBalance(null));
        refetchTransactions();
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/wallet");
        }
      } else {
        setVerifyError(
          (result as any)?.message || "Verification failed. If you were charged, please contact support."
        );
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Payment verification failed. Please contact support.";
      setVerifyError(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  // Handle Paystack callback on page mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference") || urlParams.get("trxref");
    if (reference && !isSuccessModalOpen && !isVerifyingPayment) {
      handleVerifyPayment(reference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFundWallet = async () => {
    setFundError(null);
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      setFundError("Please enter a valid amount.");
      return;
    }
    if (!user?.email) {
      setFundError("Your email is required. Please update your profile.");
      return;
    }
    if (aphEquivalent < 100) {
      setFundError(`Minimum funding is 100 APH (₦${Math.ceil(100 * 1.25).toLocaleString()} NGN).`);
      return;
    }
    try {
      const result = await fundWallet({
        amount: aphEquivalent,
        email: user.email,
        callbackUrl: `${window.location.origin}/wallet`,
      }).unwrap();
      if (result.success && result.data?.authorization_url) {
        window.location.href = result.data.authorization_url;
      }
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || "Failed to initialize payment.";
      setFundError(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const handleRequestPayout = async () => {
    setPayoutError(null);
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      setPayoutError("Enter a valid payout amount.");
      return;
    }
    if (!selectedAccountId && withdrawalAccounts.length > 0) {
      setPayoutError("Select a withdrawal account.");
      return;
    }
    if (walletBalance && amount > walletBalance.balance) {
      setPayoutError("Amount exceeds your wallet balance.");
      return;
    }
    try {
      const result = await createPayout({
        amount,
        accountId: selectedAccountId || undefined,
      }).unwrap();
      if (result.success && result.data) {
        setPayoutSuccess({ amount: result.data.amount, netAmount: result.data.netAmount });
        setPayoutAmount("");
        setSelectedAccountId("");
        refetchBalance();
        refetchTransactions();
      }
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || "Payout request failed.";
      setPayoutError(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = days[date.getDay()];
    const dayNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    const j = dayNum % 10, k = dayNum % 100;
    const suffix = j === 1 && k !== 11 ? "st" : j === 2 && k !== 12 ? "nd" : j === 3 && k !== 13 ? "rd" : "th";
    return `${day}, ${dayNum}${suffix} ${month}. ${year} • ${displayHours}:${displayMinutes}${ampm}`;
  };

  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s === "success" || s === "successful" || s === "completed") return { bg: "bg-[#10B9811A]", text: "text-[#10B981]" };
    if (s === "pending" || s === "processing") return { bg: "bg-[#FFCFA21A]", text: "text-[#FF993A]" };
    if (s === "failed" || s === "cancelled") return { bg: "bg-[#EF44441A]", text: "text-[#EF4444]" };
    return { bg: "bg-[#6B72801A]", text: "text-[#6B7280]" };
  };

  const getStatusText = (status: string) => {
    const s = status.toLowerCase();
    if (s === "success" || s === "completed") return "SUCCESSFUL";
    if (s === "pending" || s === "processing") return "PENDING";
    if (s === "failed") return "FAILED";
    return status.toUpperCase();
  };

  return (
    <div className="h-full bg-[#1F1B2C] p-6 sm:p-8 overflow-y-auto font-urbanist">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-[#FA266D] font-urbanist">Wallet</h1>

        {/* Balance Card */}
        <div className="h-[178px] rounded-[24px] bg-[#FFFFFF0F] backdrop-blur-[68px] p-6 sm:p-8 font-urbanist">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-white font-urbanist">Wallet Balance</h2>
              <button
                type="button"
                onClick={() => setIsBalanceVisible(prev => !prev)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
                aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
              >
                {isBalanceVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              {isLoadingBalance && !optimisticBalance ? (
                <div className="text-4xl sm:text-5xl font-bold text-white animate-pulse font-urbanist">Loading...</div>
              ) : isVerifyingPayment ? (
                <div className="text-2xl font-semibold text-white/70 animate-pulse font-urbanist">Verifying payment...</div>
              ) : (
                <div className="flex items-baseline gap-2 font-urbanist text-white">
                  {isBalanceVisible ? (
                    <>
                      <span className="text-[48px] font-extrabold leading-none tracking-[-0.02em]">
                        {Number(displayBalance).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[24px] font-semibold leading-none tracking-[-0.02em]">
                        {walletBalance?.currency || "APH"}
                      </span>
                    </>
                  ) : (
                    <span className="text-[48px] font-extrabold leading-none tracking-[-0.02em]">••••••</span>
                  )}
                </div>
              )}
              {verifyError && (
                <p className="text-sm text-red-400 mt-2">{verifyError}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => { setIsFundModalOpen(true); setFundError(null); }}
                className="w-[183px] h-[56px] rounded-[30px] bg-[#FA266D] hover:bg-pink-600 text-white flex items-center justify-center gap-2 transition-colors font-urbanist font-semibold text-base capitalize"
              >
                <Plus className="w-5 h-5" />
                <span>Fund Wallet</span>
              </button>
              {(isDiva || isHunk) && (
                <button
                  onClick={() => { setIsPayoutModalOpen(true); setPayoutError(null); setPayoutSuccess(null); }}
                  className="w-[210px] h-[56px] rounded-[30px] bg-white hover:bg-white/90 text-[#FA266D] flex items-center justify-center gap-2 transition-colors font-urbanist font-semibold text-base capitalize"
                >
                  <Download className="w-5 h-5" />
                  <span>Request Payout</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          <h2 className="text-[16px] font-medium text-white font-urbanist">Transaction History</h2>

          {isLoadingTransactions ? (
            <div className="rounded-[24px] bg-[#FFFFFF0F] backdrop-blur-[68px] p-8 text-center">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-white/20 rounded w-1/2 mx-auto" />
                <div className="h-4 bg-white/20 rounded w-1/3 mx-auto" />
              </div>
              <p className="text-white/60 mt-4">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-[24px] bg-[#FFFFFF0F] backdrop-blur-[68px] p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No transactions yet</h3>
              <p className="text-white/60">Your transaction history will appear here once you fund your wallet or make a payout.</p>
            </div>
          ) : (
            <div className="space-y-[24px]">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.reference || index}
                  className="h-[124px] rounded-[24px] bg-[#FFFFFF0F] backdrop-blur-[68px] p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${transaction.type === "credit" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                        {transaction.type === "credit" ? (
                          <ArrowDownLeft className="w-6 h-6 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[32px] font-bold text-white mb-[8px]">
                          {Number(transaction.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{" "}
                          <span className="text-[16px] font-medium text-white">APH</span>
                        </div>
                        <div className="font-urbanist font-medium text-[12px] leading-[20px] text-[#807E7E]">
                          {transaction.type ? transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) : "Transaction"}
                          {transaction.createdAt && <> • {formatDate(transaction.createdAt)}</>}
                        </div>
                      </div>
                    </div>
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
          <div className="bg-[#FFFFFF0F] backdrop-blur-[68px] rounded-2xl p-6 sm:p-8 w-full max-w-[621px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Fund Wallet</h2>
              <button
                onClick={() => { setIsFundModalOpen(false); setFundAmount(""); setFundError(null); }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-6 mb-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <HandCoins className="w-5 h-5 text-white/60" />
                </div>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => { setFundAmount(e.target.value); setFundError(null); }}
                  placeholder="Amount to deposit (NGN)"
                  className="w-full h-[56px] pl-12 pr-[100px] bg-white/5 border border-[#FFFFFF1A] rounded-[32px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FA266D] focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2">
                  <span className="text-white font-urbanist">NGN</span>
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </div>
              </div>

              {ngnAmount > 0 && (
                <div className="rounded-lg p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-white/60 text-[16px] font-medium mb-1">Equivalent Amount</div>
                      <div className="text-white font-bold text-[32px]">
                        {aphEquivalent.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{" "}
                        <span className="text-[16px] font-medium">APH</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-[16px] font-medium mb-1">What You Will Get</div>
                      <div className="text-white text-[32px] font-bold">
                        {aphAfterFee.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{" "}
                        <span className="text-[16px] font-medium">APH</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FA266D] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">!</span>
                </div>
                <p className="font-urbanist font-normal text-base leading-6 tracking-[-0.02em] text-[#FFFFFF99]">
                  Kindly note that we deduct 5% as service charge on all transactions.
                </p>
              </div>

              {ngnAmount > 0 && aphEquivalent < 100 && (
                <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/80">
                    Minimum funding amount is 100 APH. Please enter at least ₦{Math.ceil(100 * 1.25).toLocaleString()} NGN.
                  </p>
                </div>
              )}

              {fundError && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{fundError}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleFundWallet}
                disabled={!fundAmount || parseFloat(fundAmount) <= 0 || aphEquivalent < 100 || isFundingWallet}
                className="w-full h-[56px] rounded-[30px] bg-[#FA266D] hover:bg-pink-600 text-white font-urbanist font-semibold text-base capitalize transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isFundingWallet ? "Processing..." : "Proceed"}
              </button>
              <button
                onClick={() => { setIsFundModalOpen(false); setFundAmount(""); setFundError(null); }}
                className="w-full h-[56px] rounded-[30px] bg-white hover:bg-white/90 text-[#FA266D] font-urbanist font-semibold text-base capitalize transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF0F] backdrop-blur-[68px] rounded-2xl p-6 sm:p-8 w-full max-w-[540px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Request Payout</h2>
              <button
                onClick={() => { setIsPayoutModalOpen(false); setPayoutError(null); setPayoutSuccess(null); setPayoutAmount(""); }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {payoutSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Payout Requested</h3>
                <p className="text-white/70 text-sm">
                  Your payout of <span className="text-white font-semibold">{payoutSuccess.amount.toLocaleString()} APH</span> has been submitted.
                  You'll receive <span className="text-white font-semibold">{payoutSuccess.netAmount.toLocaleString()} APH</span> after the 5% service fee.
                </p>
                <button
                  onClick={() => { setIsPayoutModalOpen(false); setPayoutSuccess(null); }}
                  className="w-full h-[52px] rounded-[30px] bg-[#FA266D] hover:bg-pink-600 text-white font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-[16px] bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-white/50 mb-1">Available balance</p>
                  <p className="text-2xl font-bold text-white">
                    {Number(walletBalance?.balance ?? 0).toLocaleString("en-US")} <span className="text-base font-medium">APH</span>
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => { setPayoutAmount(e.target.value); setPayoutError(null); }}
                    placeholder="Amount to withdraw (APH)"
                    className="w-full h-[56px] px-5 bg-white/5 border border-[#FFFFFF1A] rounded-[32px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FA266D] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {payoutAmount && parseFloat(payoutAmount) > 0 && (
                  <div className="text-sm text-white/60 px-1">
                    You'll receive ≈{" "}
                    <span className="text-white font-semibold">
                      {(parseFloat(payoutAmount) * 0.95).toLocaleString("en-US", { maximumFractionDigits: 0 })} APH
                    </span>{" "}
                    after 5% service fee
                  </div>
                )}

                {withdrawalAccounts.length > 0 && (
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full h-[56px] px-5 bg-white/5 border border-[#FFFFFF1A] rounded-[32px] text-white focus:outline-none focus:ring-2 focus:ring-[#FA266D] appearance-none"
                  >
                    <option value="" className="bg-[#1F1B2C]">Select withdrawal account</option>
                    {withdrawalAccounts.map((acc) => (
                      <option key={acc._id} value={acc._id} className="bg-[#1F1B2C]">
                        {acc.bankName} — {acc.accountNumber} ({acc.accountName})
                      </option>
                    ))}
                  </select>
                )}

                {withdrawalAccounts.length === 0 && (
                  <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-300">
                      No withdrawal account set up. Please add a bank account in your profile settings before requesting a payout.
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FA266D] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">!</span>
                  </div>
                  <p className="text-sm leading-6 text-[#FFFFFF99]">
                    A 5% service fee is deducted from all payouts.
                  </p>
                </div>

                {payoutError && (
                  <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{payoutError}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-1">
                  <button
                    onClick={handleRequestPayout}
                    disabled={isRequestingPayout || !payoutAmount || parseFloat(payoutAmount) <= 0 || withdrawalAccounts.length === 0}
                    className="w-full h-[56px] rounded-[30px] bg-[#FA266D] hover:bg-pink-600 text-white font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {isRequestingPayout ? "Processing..." : "Request Payout"}
                  </button>
                  <button
                    onClick={() => { setIsPayoutModalOpen(false); setPayoutError(null); setPayoutAmount(""); }}
                    className="w-full h-[56px] rounded-[30px] bg-white hover:bg-white/90 text-[#FA266D] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fund Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1F1B2C] rounded-2xl p-6 sm:p-8 w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Wallet Funded Successfully</h2>
            <p className="text-white/80 mb-6">
              Your wallet has been credited with{" "}
              <span className="font-semibold text-white">
                {fundedAmount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} APH
              </span>
              . Go ahead and start exploring.
            </p>
            <button
              onClick={() => { setIsSuccessModalOpen(false); setFundedAmount(0); }}
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
