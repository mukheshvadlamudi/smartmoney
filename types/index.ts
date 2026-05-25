// TypeScript core type definitions
// Location: /types/index.ts

export interface OnboardingData {
  income_range: string;
  account_type: 'salary' | 'business' | 'mixed';
  primary_bank: string;
  primary_goal: string;
}

export interface UserProfile extends OnboardingData {
  id: string;
  email?: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  source: 'manual' | 'uploaded';
  statement_id?: string | null;
  created_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string; // YYYY-MM-DD (first of month)
  category: string;
  limit_amount: number;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string; // YYYY-MM-DD
  created_at?: string;
}

export interface PayeeMapping {
  id: string;
  user_id: string;
  payee_key: string;
  category: string;
  created_at?: string;
}

export interface StatementUpload {
  id: string;
  user_id: string;
  bank: string;
  file_path?: string | null;
  month_start?: string | null;
  month_end?: string | null;
  status: 'pending' | 'parsed' | 'failed';
  created_at?: string;
}

export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string; // YYYY-MM-01
  assets: Record<string, number>;
  liabilities: Record<string, number>;
  net_worth: number;
}

export interface CalculatorInputs {
  principal?: number;
  monthlyDeposit?: number;
  interestRate?: number;
  expectedReturn?: number;
  tenureYears?: number;
  tenureMonths?: number;
  payoutType?: 'monthly' | 'quarterly' | 'maturity';
  isSeniorCitizen?: boolean;
}

export const PRESET_CATEGORIES = [
  'Food',
  'Transport',
  'Rent',
  'EMI',
  'Shopping',
  'Medical',
  'Entertainment',
  'Business',
  'Family',
  'Utilities',
  'Savings',
  'Income',
  'Other'
];
