/**
 * Wallet Types
 */

export interface WalletBalance {
  balance: number;
  currency: string;
  nairaEquivalent: number;
}

export interface FundWalletPayload {
  amount: number;
  email: string;
  callbackUrl?: string;
}

export interface FundWalletResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
  aphAmount: number;
  nairaAmount: number;
}

export interface VerifyPaymentPayload {
  reference: string;
}

export interface VerifyPaymentResponse {
  reference: string;
  amount: number;
  nairaAmount: number;
  status: string;
  balance: number;
}

export interface Transaction {
  type: 'credit' | 'debit';
  amount: number;
  nairaAmount: number;
  description: string;
  reference: string;
  status: string;
  createdAt: string;
}

export interface WithdrawalAccount {
  _id: string;
  userId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface AddWithdrawalAccountPayload {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  isDefault?: boolean;
}

export interface SetDefaultAccountPayload {
  accountId: string;
}

export interface VerifyAccountPayload {
  accountNumber: string;
  bankCode: string;
}

export interface VerifyAccountResponse {
  accountNumber: string;
  accountName: string;
  bankId: number;
}

export interface Bank {
  name: string;
  code: string;
  slug: string;
  active: boolean;
}

export interface CreatePayoutPayload {
  amount: number;
  accountId?: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  bankCode?: string;
}

export interface Payout {
  id: string;
  reference: string;
  amount: number;
  serviceFee: number;
  netAmount: number;
  nairaAmount: number;
  netNairaAmount: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
}

export interface CancelPayoutPayload {
  reason: string;
}

