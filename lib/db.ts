// Unified Database Service Adapter
// Location: /lib/db.ts

import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured, supabaseServer } from './supabase';
import { 
  Transaction, 
  Budget, 
  Goal, 
  PayeeMapping, 
  NetWorthSnapshot, 
  UserProfile,
  OnboardingData
} from '../types';

const LOCAL_DB_PATH = path.join(process.cwd(), 'local_db.json');

// Interface for Local JSON database structure
interface LocalDB {
  users: Record<string, { email: string; passwordHash: string; profile: UserProfile }>;
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  payee_mappings: PayeeMapping[];
  statements: any[];
  net_worth_snapshots: NetWorthSnapshot[];
}

// -------------------------------------------------------------
// LOCAL JSON DB HELPERS
// -------------------------------------------------------------
function readLocalDB(): LocalDB {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      const initialDB: LocalDB = {
        users: {},
        transactions: [],
        budgets: [],
        goals: [],
        payee_mappings: [],
        statements: [],
        net_worth_snapshots: []
      };
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialDB, null, 2), 'utf-8');
      return initialDB;
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local JSON database:', error);
    return {
      users: {},
      transactions: [],
      budgets: [],
      goals: [],
      payee_mappings: [],
      statements: [],
      net_worth_snapshots: []
    };
  }
}

function writeLocalDB(db: LocalDB) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing local JSON database:', error);
  }
}

function generateUUID(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// -------------------------------------------------------------
// UNIFIED API METHODS (Exposing same interface for both modes)
// -------------------------------------------------------------

// --- AUTH & PROFILE ---
export async function dbGetUserProfile(userId: string): Promise<UserProfile | null> {
  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Supabase getUserProfile error:', error);
      return null;
    }
    return data;
  } else {
    const db = readLocalDB();
    const user = db.users[userId];
    return user ? user.profile : null;
  }
}

export async function dbSaveUserProfile(userId: string, data: OnboardingData & { email?: string }): Promise<UserProfile> {
  const profile: UserProfile = {
    id: userId,
    income_range: data.income_range,
    account_type: data.account_type,
    primary_bank: data.primary_bank,
    primary_goal: data.primary_goal,
  };

  if (isSupabaseConfigured && supabaseServer) {
    const { error } = await supabaseServer
      .from('users')
      .upsert(profile);
    if (error) throw error;
    return profile;
  } else {
    const db = readLocalDB();
    if (!db.users[userId]) {
      db.users[userId] = {
        email: data.email || `${userId}@smartmoney.local`,
        passwordHash: 'local-hashed',
        profile: { ...profile, id: userId }
      };
    } else {
      db.users[userId].profile = { ...db.users[userId].profile, ...profile };
    }
    writeLocalDB(db);
    return db.users[userId].profile;
  }
}

// --- TRANSACTIONS ---
export async function dbGetTransactions(
  userId: string, 
  filters?: { month?: string; category?: string; search?: string }
): Promise<Transaction[]> {
  if (isSupabaseConfigured && supabaseServer) {
    let query = supabaseServer
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (filters?.month) {
      // Month parameter is expected to be 'YYYY-MM'
      const start = `${filters.month}-01`;
      // Find end date
      const date = new Date(start);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      query = query.gte('date', start).lte('date', end);
    }
    
    if (filters?.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error('Supabase getTransactions error:', error);
      return [];
    }
    
    let result = data as Transaction[];
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchLower) || 
        t.category.toLowerCase().includes(searchLower)
      );
    }
    return result;
  } else {
    const db = readLocalDB();
    let result = db.transactions.filter(t => t.user_id === userId);

    if (filters?.month) {
      const monthPrefix = filters.month; // 'YYYY-MM'
      result = result.filter(t => t.date.startsWith(monthPrefix));
    }

    if (filters?.category && filters.category !== 'All') {
      result = result.filter(t => t.category === filters.category);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date descending
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }
}

export async function dbSaveTransactions(userId: string, txs: Omit<Transaction, 'id' | 'user_id'>[]): Promise<Transaction[]> {
  const newTransactions: Transaction[] = txs.map(t => ({
    ...t,
    id: generateUUID(),
    user_id: userId,
    created_at: new Date().toISOString()
  }));

  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('transactions')
      .insert(newTransactions)
      .select();
    if (error) throw error;
    return data;
  } else {
    const db = readLocalDB();
    db.transactions.push(...newTransactions);
    writeLocalDB(db);
    return newTransactions;
  }
}

export async function dbUpdateTransactionCategory(userId: string, transactionId: string, category: string): Promise<Transaction | null> {
  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('transactions')
      .update({ category })
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) {
      console.error('Supabase updateTransactionCategory error:', error);
      return null;
    }
    return data;
  } else {
    const db = readLocalDB();
    const idx = db.transactions.findIndex(t => t.id === transactionId && t.user_id === userId);
    if (idx === -1) return null;
    db.transactions[idx].category = category;
    writeLocalDB(db);
    return db.transactions[idx];
  }
}

export async function dbDeleteTransaction(userId: string, transactionId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabaseServer) {
    const { error } = await supabaseServer
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);
    if (error) {
      console.error('Supabase deleteTransaction error:', error);
      return false;
    }
    return true;
  } else {
    const db = readLocalDB();
    const initialLen = db.transactions.length;
    db.transactions = db.transactions.filter(t => !(t.id === transactionId && t.user_id === userId));
    writeLocalDB(db);
    return db.transactions.length < initialLen;
  }
}

// --- BUDGETS ---
export async function dbGetBudgets(userId: string, month: string): Promise<Budget[]> {
  // month expected as 'YYYY-MM-01' or 'YYYY-MM'
  const targetMonth = month.length === 7 ? `${month}-01` : month;

  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', targetMonth);
    if (error) {
      console.error('Supabase getBudgets error:', error);
      return [];
    }
    return data;
  } else {
    const db = readLocalDB();
    return db.budgets.filter(b => b.user_id === userId && b.month === targetMonth);
  }
}

export async function dbSaveBudget(userId: string, month: string, category: string, limitAmount: number): Promise<Budget> {
  const targetMonth = month.length === 7 ? `${month}-01` : month;

  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('budgets')
      .upsert({
        user_id: userId,
        month: targetMonth,
        category,
        limit_amount: limitAmount
      }, { onConflict: 'user_id,month,category' })
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = readLocalDB();
    const idx = db.budgets.findIndex(b => b.user_id === userId && b.month === targetMonth && b.category === category);
    
    const budgetData: Budget = {
      id: idx !== -1 ? db.budgets[idx].id : generateUUID(),
      user_id: userId,
      month: targetMonth,
      category,
      limit_amount: limitAmount
    };

    if (idx !== -1) {
      db.budgets[idx] = budgetData;
    } else {
      db.budgets.push(budgetData);
    }
    writeLocalDB(db);
    return budgetData;
  }
}

// --- GOALS ---
export async function dbGetGoals(userId: string): Promise<Goal[]> {
  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase getGoals error:', error);
      return [];
    }
    return data;
  } else {
    const db = readLocalDB();
    return db.goals.filter(g => g.user_id === userId).sort((a, b) => {
      const dateA = a.created_at || '';
      const dateB = b.created_at || '';
      return dateB.localeCompare(dateA);
    });
  }
}

export async function dbSaveGoal(
  userId: string, 
  name: string, 
  targetAmount: number, 
  currentAmount: number, 
  targetDate: string,
  goalId?: string
): Promise<Goal> {
  if (isSupabaseConfigured && supabaseServer) {
    const payload: any = {
      user_id: userId,
      name,
      target_amount: targetAmount,
      current_amount: currentAmount,
      target_date: targetDate
    };
    if (goalId) payload.id = goalId;

    const { data, error } = await supabaseServer
      .from('goals')
      .upsert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = readLocalDB();
    let goalData: Goal;

    if (goalId) {
      const idx = db.goals.findIndex(g => g.id === goalId && g.user_id === userId);
      if (idx !== -1) {
        goalData = {
          ...db.goals[idx],
          name,
          target_amount: targetAmount,
          current_amount: currentAmount,
          target_date: targetDate
        };
        db.goals[idx] = goalData;
      } else {
        throw new Error('Goal not found to edit');
      }
    } else {
      goalData = {
        id: generateUUID(),
        user_id: userId,
        name,
        target_amount: targetAmount,
        current_amount: currentAmount,
        target_date: targetDate,
        created_at: new Date().toISOString()
      };
      db.goals.push(goalData);
    }
    writeLocalDB(db);
    return goalData;
  }
}

export async function dbUpdateGoalProgress(userId: string, goalId: string, currentAmount: number): Promise<Goal | null> {
  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('goals')
      .update({ current_amount: currentAmount })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) {
      console.error('Supabase updateGoalProgress error:', error);
      return null;
    }
    return data;
  } else {
    const db = readLocalDB();
    const idx = db.goals.findIndex(g => g.id === goalId && g.user_id === userId);
    if (idx === -1) return null;
    db.goals[idx].current_amount = currentAmount;
    writeLocalDB(db);
    return db.goals[idx];
  }
}

export async function dbDeleteGoal(userId: string, goalId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabaseServer) {
    const { error } = await supabaseServer
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);
    if (error) {
      console.error('Supabase deleteGoal error:', error);
      return false;
    }
    return true;
  } else {
    const db = readLocalDB();
    const initialLen = db.goals.length;
    db.goals = db.goals.filter(g => !(g.id === goalId && g.user_id === userId));
    writeLocalDB(db);
    return db.goals.length < initialLen;
  }
}

// --- PAYEE DICTIONARY MAPPINGS ---
export async function dbGetPayeeMappings(userId: string): Promise<PayeeMapping[]> {
  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('payee_mappings')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      console.error('Supabase getPayeeMappings error:', error);
      return [];
    }
    return data;
  } else {
    const db = readLocalDB();
    return db.payee_mappings.filter(m => m.user_id === userId);
  }
}

export async function dbSavePayeeMapping(userId: string, payeeKey: string, category: string): Promise<PayeeMapping> {
  const normKey = payeeKey.trim().toUpperCase();

  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('payee_mappings')
      .upsert({
        user_id: userId,
        payee_key: normKey,
        category
      }, { onConflict: 'user_id,payee_key' })
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = readLocalDB();
    const idx = db.payee_mappings.findIndex(m => m.user_id === userId && m.payee_key === normKey);
    
    const mappingData: PayeeMapping = {
      id: idx !== -1 ? db.payee_mappings[idx].id : generateUUID(),
      user_id: userId,
      payee_key: normKey,
      category,
      created_at: new Date().toISOString()
    };

    if (idx !== -1) {
      db.payee_mappings[idx] = mappingData;
    } else {
      db.payee_mappings.push(mappingData);
    }
    writeLocalDB(db);
    return mappingData;
  }
}

// --- NET WORTH SNAPSHOTS ---
export async function dbGetNetWorthSnapshots(userId: string): Promise<NetWorthSnapshot[]> {
  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('net_worth_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: true });
    if (error) {
      console.error('Supabase getNetWorthSnapshots error:', error);
      return [];
    }
    return data;
  } else {
    const db = readLocalDB();
    return db.net_worth_snapshots
      .filter(s => s.user_id === userId)
      .sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date));
  }
}

export async function dbSaveNetWorthSnapshot(
  userId: string, 
  snapshotDate: string, // YYYY-MM-01
  assets: Record<string, number>, 
  liabilities: Record<string, number>
): Promise<NetWorthSnapshot> {
  
  // Calculate net worth sum
  const totalAssets = Object.values(assets).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + (Number(b) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const targetDate = snapshotDate.length === 7 ? `${snapshotDate}-01` : snapshotDate;

  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('net_worth_snapshots')
      .upsert({
        user_id: userId,
        snapshot_date: targetDate,
        assets,
        liabilities,
        net_worth: netWorth
      }, { onConflict: 'user_id,snapshot_date' })
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = readLocalDB();
    const idx = db.net_worth_snapshots.findIndex(s => s.user_id === userId && s.snapshot_date === targetDate);
    
    const snapshotData: NetWorthSnapshot = {
      id: idx !== -1 ? db.net_worth_snapshots[idx].id : generateUUID(),
      user_id: userId,
      snapshot_date: targetDate,
      assets,
      liabilities,
      net_worth: netWorth
    };

    if (idx !== -1) {
      db.net_worth_snapshots[idx] = snapshotData;
    } else {
      db.net_worth_snapshots.push(snapshotData);
    }
    writeLocalDB(db);
    return snapshotData;
  }
}

// --- STATEMENTS UPLOAD HISTORY ---
export async function dbGetStatements(userId: string): Promise<any[]> {
  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('statements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data;
  } else {
    const db = readLocalDB();
    return db.statements.filter(s => s.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

export async function dbSaveStatement(userId: string, bank: string, monthStart: string, monthEnd: string, status: 'pending' | 'parsed' | 'failed'): Promise<any> {
  const statement = {
    id: generateUUID(),
    user_id: userId,
    bank,
    file_path: `/uploads/${bank}-statement-${Date.now()}.csv`,
    month_start: monthStart,
    month_end: monthEnd,
    status,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('statements')
      .insert(statement)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = readLocalDB();
    db.statements.push(statement);
    writeLocalDB(db);
    return statement;
  }
}

// --- LOCAL MOCK AUTHENTICATION ROUTINES ---
// Mimics a JWT session by returning custom user objects
export async function dbMockSignUp(email: string, passwordHash: string): Promise<{ id: string; email: string }> {
  const db = readLocalDB();
  const existing = Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('User already exists');
  }
  const id = generateUUID();
  db.users[id] = {
    email,
    passwordHash,
    profile: {
      id,
      income_range: '₹50,000 - ₹1,00,000',
      account_type: 'salary',
      primary_bank: 'HDFC',
      primary_goal: 'Save more'
    }
  };
  writeLocalDB(db);
  return { id, email };
}

export async function dbMockLogIn(email: string, passwordHash: string): Promise<{ id: string; email: string } | null> {
  const db = readLocalDB();
  const userEntry = Object.entries(db.users).find(([_, u]) => u.email.toLowerCase() === email.toLowerCase());
  if (!userEntry) return null;
  
  const [id, user] = userEntry;
  // Let's accept password matches directly in this mock flow
  if (user.passwordHash === passwordHash || passwordHash === 'local-hashed' || user.passwordHash === 'local-hashed') {
    return { id, email: user.email };
  }
  return null;
}
