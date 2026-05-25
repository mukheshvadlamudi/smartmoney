import { dbGetPayeeMappings } from './db';
import { PRESET_CATEGORIES } from '../types';

// Layer 1 Dictionary mapping keywords to standard categories
const MERCHANT_DICTIONARY: Record<string, string[]> = {
  'Food': ['SWIGGY', 'ZOMATO', 'DOMINO', 'MCDONALD', 'STARBUCKS', 'KFC', 'RESTAURANT', 'FOOD', 'CAFE', 'BAKERY', 'HOTEL', 'GROCERY', 'SUPERMARKET', 'ZEPTO', 'BLINKIT', 'BIGBASKET'],
  'Transport': ['UBER', 'OLA', 'RAPIDO', 'METRO', 'FUEL', 'HPCL', 'BPCL', 'SHELL', 'PETROL', 'AUTO', 'CAB', 'RAILWAY', 'IRCTC', 'FLIGHT', 'INDIGO'],
  'Shopping': ['AMAZON', 'FLIPKART', 'MYNTRA', 'AJIO', 'ZARA', 'HM', 'DECATHLON', 'RETAIL', 'MALL', 'APHAREL', 'CLOTHING', 'FASHION'],
  'Rent': ['RENT', 'HOUSE RENT', 'SOCIETY DUES', 'MAINTENANCE'],
  'EMI': ['EMI', 'LOAN', 'HDFC LOAN', 'SBI LOAN', 'AXIS LOAN', 'HOME LOAN', 'AUTO LOAN', 'FINANCE', 'CHOLA', 'BAJAJ'],
  'Entertainment': ['NETFLIX', 'PRIME', 'HOTSTAR', 'BOOKMYSHOW', 'SPOTIFY', 'PVR', 'CINEMA', 'PLAYSTATION', 'STEAM', 'YOUTUBE PREMIUM'],
  'Medical': ['APOLLO', 'PHARMEASY', 'MEDPLUS', 'HOSPITAL', 'CLINIC', 'DOCTOR', 'PHARMACY', 'HEALTH', 'LABS'],
  'Utilities': ['AIRTEL', 'JIO', 'BESCOM', 'WATER', 'ACT FIBERNET', 'RECHARGE', 'ELECTRICITY', 'GAS', 'BROADBAND', 'MOBILE BILL'],
  'Savings': ['MUTUAL FUND', 'SIP', 'ZERODHA', 'GROWW', 'INDMONEY', 'PPF', 'SECURITIES', 'INVESTMENT', 'STOCKS', 'GOLD', 'DEPOSIT'],
  'Income': ['SALARY', 'NEFT SALARY', 'INWARD', 'INTEREST CREDIT', 'DIVIDEND', 'CASH DEPOSIT', 'REFUND']
};

/**
 * Normalises raw bank strings for dictionary lookup
 */
export function normalizePayeeName(desc: string): string {
  return desc.toUpperCase().trim()
    .replace(/\b\d{6,}\b/g, '') // remove large reference IDs
    .replace(/[#*:-]/g, ' ')   // replace characters
    .replace(/\s+/g, ' ')       // squeeze spaces
    .trim();
}

/**
 * Smart Categorizer Engine
 */
export async function categorizeTransaction(
  userId: string,
  rawDescription: string,
  amount: number,
  type: 'debit' | 'credit'
): Promise<{ category: string; matchedLayer: 'dictionary' | 'merchant' | 'pattern' | 'llm' | 'fallback' }> {
  const normDesc = normalizePayeeName(rawDescription);

  // -------------------------------------------------------------
  // Layer 3: Check learned User Payee Mappings first (memory dictionary)
  // -------------------------------------------------------------
  try {
    const userMappings = await dbGetPayeeMappings(userId);
    // Find exact or partial match in user dictionary
    const userMatch = userMappings.find(m => 
      normDesc === m.payee_key || normDesc.includes(m.payee_key)
    );
    if (userMatch) {
      return { category: userMatch.category, matchedLayer: 'dictionary' };
    }
  } catch (error) {
    console.error('Error fetching user payee dictionary mappings:', error);
  }

  // -------------------------------------------------------------
  // Layer 1: Known Merchant Keywords matching
  // -------------------------------------------------------------
  for (const [category, keywords] of Object.entries(MERCHANT_DICTIONARY)) {
    for (const keyword of keywords) {
      if (normDesc.includes(keyword)) {
        return { category, matchedLayer: 'merchant' };
      }
    }
  }

  // -------------------------------------------------------------
  // Layer 2: Pattern analysis
  // -------------------------------------------------------------
  // Credits defaults to Income unless matched by Savings/Interest above
  if (type === 'credit') {
    return { category: 'Income', matchedLayer: 'pattern' };
  }

  // Round numbers to a person or simple UPI transfers to short names (Ramesh, Suresh)
  if (amount % 100 === 0 && amount <= 5000 && !normDesc.includes('PVT') && !normDesc.includes('LTD')) {
    // Round transfers to individuals are usually petty cash or transfers
    return { category: 'Other', matchedLayer: 'pattern' };
  }

  // Rent/EMI schedule signals (e.g. same amount on specific days usually handled by Layer 2)
  if (amount > 8000 && (normDesc.includes('LANDLORD') || normDesc.includes('OWNER') || normDesc.includes('PROP'))) {
    return { category: 'Rent', matchedLayer: 'pattern' };
  }

  // -------------------------------------------------------------
  // Optional Advanced AI Layer (LLM Wrapper)
  // -------------------------------------------------------------
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';

  if (anthropicKey.trim() !== '' || openaiKey.trim() !== '') {
    try {
      const categoryFromAI = await fetchAICategory(normDesc, anthropicKey, openaiKey);
      if (categoryFromAI && PRESET_CATEGORIES.includes(categoryFromAI)) {
        return { category: categoryFromAI, matchedLayer: 'llm' };
      }
    } catch (err) {
      console.error('AI Categorizer API error:', err);
    }
  }

  // Fallback category
  return { category: 'Other', matchedLayer: 'fallback' };
}

/**
 * Optional Server-Side API Caller to fetch category from LLM
 */
async function fetchAICategory(description: string, anthropicKey: string, openaiKey: string): Promise<string | null> {
  const prompt = `Categorize this bank transaction description "${description}" into exactly one of these categories: ${PRESET_CATEGORIES.join(', ')}. Return only the single word category name, nothing else.`;

  if (anthropicKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const json = await res.json();
    return json.content?.[0]?.text?.trim() || null;
  } else if (openaiKey) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 10,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const json = await res.json();
    return json.choices?.[0]?.message?.content?.trim() || null;
  }
  return null;
}
