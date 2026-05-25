// Bank Statement Text/CSV Parser Engine
// Location: /lib/parser.ts

export interface ParsedTransaction {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string; // filled later by categorizer
  isAmbiguous: boolean; // UPI reference IDs or cryptic codes go into review pile
}

// Cleans up UPI reference numbers and cryptic transaction text
export function cleanUPIString(desc: string): { cleanName: string; isCryptic: boolean } {
  const upper = desc.toUpperCase().trim();
  
  // UPI Cryptic matchers
  // e.g. "UPI-RASHMI SHARMA-RASHMI32@OKHDFC-BARB0UNIYEL-5125925..." -> "RASHMI SHARMA"
  // e.g. "IMPS-612456234-KUMAR S" -> "KUMAR S"
  // e.g. "ACH DEBIT-HDFC HOME EMI" -> "HDFC HOME EMI"
  
  // 1. UPI patterns
  if (upper.includes('UPI/') || upper.includes('UPI-') || upper.startsWith('UPI')) {
    // Extract payee name. UPI descriptions usually look like: UPI/PAYEE NAME/REF_NO/REMARK
    // or UPI-PAYEE_NAME-VPA@provider-REF-REMARK
    const tokens = upper.split(/[/|-]/);
    for (const token of tokens) {
      const cleanToken = token.trim();
      // Skip utility keywords and numbers
      if (
        cleanToken.length > 3 && 
        !/^\d+$/.test(cleanToken) && 
        !['UPI', 'DR', 'CR', 'IMPS', 'NEFT', 'RTGS', 'XX', 'PAY', 'TRANSFER'].includes(cleanToken) &&
        !cleanToken.includes('@')
      ) {
        return { cleanName: cleanToken, isCryptic: false };
      }
    }
  }

  // 2. Fallback check for raw cryptic strings (long hashes or only numbers/cryptic words)
  const isCryptic = upper.length > 25 || /^[0-9A-Z]{12,}$/.test(upper) || upper.startsWith('NFR') || upper.startsWith('REMASHU');

  // Strip digits and trailing punctuation for clean merchant names
  let cleanName = upper
    .replace(/\b\d{6,}\b/g, '') // remove large numbers (reference IDs)
    .replace(/[#*:-]/g, ' ')   // replace symbols with spaces
    .replace(/\s+/g, ' ')       // shrink extra spaces
    .trim();

  return { cleanName: cleanName || upper, isCryptic };
}

// Main parser function
export function parseBankStatement(text: string, bank: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const lines = text.split('\n');

  if (text.trim() === '' || lines.length <= 1) {
    // If empty, generate standard mock transactions for the selected bank so the user has immediate data to play with!
    return generateMockTransactions(bank);
  }

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Skip headers
    if (line.toLowerCase().includes('date') || line.toLowerCase().includes('balance') || line.toLowerCase().includes('statement')) {
      continue;
    }

    // Try parsing CSV or Tab-delimited row
    let cols = line.split(',');
    if (cols.length < 3) {
      cols = line.split('\t');
    }
    if (cols.length < 3) {
      // Space separated split fallback
      cols = line.split(/\s{2,}/); 
    }

    if (cols.length >= 3) {
      try {
        const rawDate = cols[0].trim();
        const rawDesc = cols[1].trim();
        let rawAmtStr = cols[2].trim().replace(/,/g, '');
        
        // Skip rows that don't have a date format
        if (!/^\d/.test(rawDate)) continue;

        let date = normalizeDate(rawDate);
        let amount = parseFloat(rawAmtStr);
        let type: 'debit' | 'credit' = 'debit';

        // Check if there is a separate credit/debit column or indicator
        if (cols.length >= 4) {
          const typeCol = cols[3].trim().toLowerCase();
          if (typeCol.includes('cr') || typeCol.includes('credit') || typeCol === 'c' || parseFloat(typeCol) > 0) {
            type = 'credit';
          }
        }

        // Handle negative amounts or credit/debit sign
        if (amount < 0) {
          amount = Math.abs(amount);
          type = 'debit';
        } else if (rawAmtStr.includes('DR') || rawAmtStr.includes('-')) {
          type = 'debit';
        } else if (rawAmtStr.includes('CR') || rawAmtStr.includes('+')) {
          type = 'credit';
        }

        if (isNaN(amount) || amount === 0) continue;

        const { cleanName, isCryptic } = cleanUPIString(rawDesc);

        transactions.push({
          date,
          description: cleanName,
          amount,
          type,
          category: 'Other',
          isAmbiguous: isCryptic
        });
      } catch (e) {
        // Skip malformed rows
        console.error('Row parsing skipped:', line, e);
      }
    }
  }

  // If no transactions could be parsed, return simulation mocks
  if (transactions.length === 0) {
    return generateMockTransactions(bank);
  }

  return transactions;
}

// Normalizes formats like DD-MM-YYYY, DD/MM/YY, DD MMM YYYY to YYYY-MM-DD
function normalizeDate(rawDate: string): string {
  const clean = rawDate.replace(/[-/]/g, ' ').trim();
  const parts = clean.split(/\s+/);
  
  const today = new Date().toISOString().split('T')[0];
  if (parts.length < 3) return today;

  let day = parts[0];
  let month = parts[1];
  let year = parts[2];

  // Map month word to number if text
  const monthsMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    january: '01', february: '02', march: '03', april: '04', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
  };

  if (isNaN(Number(month))) {
    month = monthsMap[month.toLowerCase()] || '01';
  }

  // Padding
  if (day.length === 1) day = '0' + day;
  if (month.length === 1) month = '0' + month;
  if (year.length === 2) year = '20' + year; // Convert 25 to 2025

  const formatted = `${year}-${month}-${day}`;
  
  // Verify date is valid
  if (isNaN(Date.parse(formatted))) {
    return today;
  }
  
  return formatted;
}

// Returns a realistic dataset for testing and walkthroughs when no file is present
export function generateMockTransactions(bank: string): ParsedTransaction[] {
  const mockPayees = [
    { name: 'SWIGGY', amt: 350, type: 'debit', category: 'Food', isCryptic: false },
    { name: 'ZOMATO', amt: 640, type: 'debit', category: 'Food', isCryptic: false },
    { name: 'UBER INDIA', amt: 480, type: 'debit', category: 'Transport', isCryptic: false },
    { name: 'OLA RECHARGES', amt: 120, type: 'debit', category: 'Transport', isCryptic: false },
    { name: 'AMAZON PAY INDIA', amt: 1849, type: 'debit', category: 'Shopping', isCryptic: false },
    { name: 'NETFLIX ENTERTAINMENT', amt: 649, type: 'debit', category: 'Entertainment', isCryptic: false },
    { name: 'HDFC EMI LOAN PAYMENT', amt: 12500, type: 'debit', category: 'EMI', isCryptic: false },
    { name: 'REMASHU IN827419', amt: 3000, type: 'debit', category: 'Other', isCryptic: true }, // ambiguous UPI
    { name: 'KUMAR GROCERY STORE', amt: 850, type: 'debit', category: 'Food', isCryptic: false },
    { name: 'FLIPKART INTERNET', amt: 2999, type: 'debit', category: 'Shopping', isCryptic: false },
    { name: 'AIRTEL INVOICE BILL', amt: 799, type: 'debit', category: 'Utilities', isCryptic: false },
    { name: 'ACT FIBERNET WATER BILL', amt: 1150, type: 'debit', category: 'Utilities', isCryptic: false },
    { name: 'GROWW MUTUAL FUND SIP', amt: 5000, type: 'debit', category: 'Savings', isCryptic: false },
    { name: 'SALARY NEFT DISBURSEMENT', amt: 95000, type: 'credit', category: 'Income', isCryptic: false },
    { name: 'INTEREST CREDIT INWARD', amt: 412, type: 'credit', category: 'Savings', isCryptic: false },
    { name: 'UPI REF 6821A938', amt: 150, type: 'debit', category: 'Other', isCryptic: true } // ambiguous UPI
  ];

  const parsed: ParsedTransaction[] = [];
  const now = new Date();
  
  // Generate transactions spread over the last 30 days
  for (let idx = 0; idx < mockPayees.length; idx++) {
    const payee = mockPayees[idx];
    const txDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - idx);
    const dateStr = txDate.toISOString().split('T')[0];

    parsed.push({
      date: dateStr,
      description: payee.name,
      amount: payee.amt,
      type: payee.type as 'debit' | 'credit',
      category: payee.category,
      isAmbiguous: payee.isCryptic
    });
  }

  return parsed;
}
