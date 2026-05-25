-- Smart Money PostgreSQL Database Schema
-- Location: /supabase/migrations/20260525000000_init.sql

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users onboarding meta table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    income_range TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('salary', 'business', 'mixed')),
    primary_bank TEXT NOT NULL,
    primary_goal TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own onboarding profile" ON public.users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own onboarding profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own onboarding profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 2. Statements table (for keeping upload histories)
CREATE TABLE IF NOT EXISTS public.statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bank TEXT NOT NULL,
    file_path TEXT,
    month_start DATE,
    month_end DATE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'parsed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for statements
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can operate on own statements" ON public.statements
    FOR ALL USING (auth.uid() = user_id);

-- 3. Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
    category TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('manual', 'uploaded')),
    statement_id UUID REFERENCES public.statements(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can operate on own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- 4. Budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- Stored as the first day of the month (e.g. 2026-05-01)
    category TEXT NOT NULL,
    limit_amount NUMERIC NOT NULL CHECK (limit_amount >= 0),
    UNIQUE (user_id, month, category)
);

-- Enable RLS for budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can operate on own budgets" ON public.budgets
    FOR ALL USING (auth.uid() = user_id);

-- 5. Goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can operate on own goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id);

-- 6. Payee mappings (Normalised payee memory table)
CREATE TABLE IF NOT EXISTS public.payee_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payee_key TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, payee_key)
);

-- Enable RLS for payee mappings
ALTER TABLE public.payee_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can operate on own payee mappings" ON public.payee_mappings
    FOR ALL USING (auth.uid() = user_id);

-- 7. Net worth snapshots table
CREATE TABLE IF NOT EXISTS public.net_worth_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL, -- e.g. 2026-05-01 (monthly snapshot)
    assets JSONB NOT NULL DEFAULT '{}'::jsonb,
    liabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
    net_worth NUMERIC NOT NULL,
    UNIQUE (user_id, snapshot_date)
);

-- Enable RLS for net worth snapshots
ALTER TABLE public.net_worth_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can operate on own net worth snapshots" ON public.net_worth_snapshots
    FOR ALL USING (auth.uid() = user_id);
