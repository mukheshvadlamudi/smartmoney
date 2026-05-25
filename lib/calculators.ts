// Smart Money Calculator Engines
// Location: /lib/calculators.ts

// -------------------------------------------------------------
// 1. FIXED DEPOSIT (FD) CALCULATOR
// Formula: A = P * (1 + r/n)^(n*t)
// -------------------------------------------------------------
export interface FDResult {
  principal: number;
  maturityAmount: number;
  interestEarned: number;
  effectiveAnnualYield: number;
  taxImpactEst: number; // Informational 30% tax bracket
}

export function calculateFD(
  principal: number,
  ratePercent: number,
  tenureYears: number,
  payoutType: 'monthly' | 'quarterly' | 'maturity' = 'maturity',
  isSeniorCitizen: boolean = false
): FDResult {
  const p = principal;
  let r = ratePercent;
  
  // Senior citizen bonus
  if (isSeniorCitizen) {
    r += 0.5;
  }
  
  const decimalRate = r / 100;
  
  // Compounding frequency: 
  // Monthly payout = compounds monthly
  // Quarterly payout / maturity = compounds quarterly (standard Indian banking convention)
  let n = 4; // default quarterly
  if (payoutType === 'monthly') {
    n = 12;
  }

  // Calculate maturity amount
  const t = tenureYears;
  const maturityAmount = p * Math.pow(1 + decimalRate / n, n * t);
  const interestEarned = maturityAmount - p;
  
  // Effective Annual Yield = (1 + r/n)^n - 1
  const effectiveAnnualYield = (Math.pow(1 + decimalRate / n, n) - 1) * 100;
  
  // 30% tax impact (informational note for general tax brackets in India)
  const taxImpactEst = interestEarned * 0.30;

  return {
    principal: p,
    maturityAmount: Math.round(maturityAmount),
    interestEarned: Math.round(interestEarned),
    effectiveAnnualYield: parseFloat(effectiveAnnualYield.toFixed(2)),
    taxImpactEst: Math.round(taxImpactEst)
  };
}

// -------------------------------------------------------------
// 2. SIP (MUTUAL FUND) CALCULATOR
// Formula: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
// where i = monthly return rate, n = tenure in months
// -------------------------------------------------------------
export interface ProjectedYear {
  year: number;
  investedAmount: number;
  estimatedCorpus: number;
  wealthGain: number;
}

export interface SIPResult {
  totalInvested: number;
  estimatedCorpus: number;
  totalWealthGain: number;
  yearlyBreakdown: ProjectedYear[];
}

export function calculateSIP(
  monthlyAmount: number,
  expectedReturnPercent: number,
  durationYears: number
): SIPResult {
  const p = monthlyAmount;
  const r = expectedReturnPercent / 100;
  const i = r / 12; // monthly rate
  const totalMonths = durationYears * 12;

  // Standard future value of an annuity due formula
  const estimatedCorpus = p * ((Math.pow(1 + i, totalMonths) - 1) / i) * (1 + i);
  const totalInvested = p * totalMonths;
  const totalWealthGain = estimatedCorpus - totalInvested;

  // Year-by-year projections for graphing
  const yearlyBreakdown: ProjectedYear[] = [];
  for (let year = 1; year <= durationYears; year++) {
    const k = year * 12;
    const corpusY = p * ((Math.pow(1 + i, k) - 1) / i) * (1 + i);
    const investedY = p * k;
    yearlyBreakdown.push({
      year,
      investedAmount: Math.round(investedY),
      estimatedCorpus: Math.round(corpusY),
      wealthGain: Math.round(corpusY - investedY)
    });
  }

  return {
    totalInvested: Math.round(totalInvested),
    estimatedCorpus: Math.round(estimatedCorpus),
    totalWealthGain: Math.round(totalWealthGain),
    yearlyBreakdown
  };
}

// -------------------------------------------------------------
// 3. LUMP SUM MUTUAL FUND CALCULATOR
// Formula: FV = PV * (1 + r)^t (annual compounding)
// -------------------------------------------------------------
export interface LumpSumResult {
  principal: number;
  finalValue: number;
  absoluteGain: number;
  cagr: number;
}

export function calculateLumpSum(
  principal: number,
  expectedReturnPercent: number,
  durationYears: number
): LumpSumResult {
  const pv = principal;
  const r = expectedReturnPercent / 100;
  const t = durationYears;

  const finalValue = pv * Math.pow(1 + r, t);
  const absoluteGain = finalValue - pv;

  return {
    principal: pv,
    finalValue: Math.round(finalValue),
    absoluteGain: Math.round(absoluteGain),
    cagr: expectedReturnPercent
  };
}

// -------------------------------------------------------------
// 4. PPF (PUBLIC PROVIDENT FUND) CALCULATOR
// Standard government rate is 7.1%. Compounds annually.
// In PPF, users invest once annually (usually at start of fiscal year) 
// or monthly. Standard calculator assumes annual contributions:
// F = P * [((1 + r)^t - 1) / r] * (1 + r) or standard compounds:
// -------------------------------------------------------------
export interface PPFResult {
  totalInvested: number;
  maturityValue: number;
  interestEarned: number;
  yearlyBreakdown: ProjectedYear[];
}

export function calculatePPF(
  annualContribution: number,
  durationYears: number // Minimum 15, Max 30
): PPFResult {
  const p = annualContribution;
  const r = 0.071; // current government rate 7.1%
  const t = durationYears;

  // Formula for maturity value of PPF compounded annually
  // Assuming contribution is made at the start of each year:
  // A = P * (((1 + r)^t - 1) / r) * (1 + r)
  const maturityValue = p * ((Math.pow(1 + r, t) - 1) / r) * (1 + r);
  const totalInvested = p * t;
  const interestEarned = maturityValue - totalInvested;

  const yearlyBreakdown: ProjectedYear[] = [];
  for (let year = 1; year <= durationYears; year++) {
    const corpusY = p * ((Math.pow(1 + r, year) - 1) / r) * (1 + r);
    const investedY = p * year;
    yearlyBreakdown.push({
      year,
      investedAmount: Math.round(investedY),
      estimatedCorpus: Math.round(corpusY),
      wealthGain: Math.round(corpusY - investedY)
    });
  }

  return {
    totalInvested: Math.round(totalInvested),
    maturityValue: Math.round(maturityValue),
    interestEarned: Math.round(interestEarned),
    yearlyBreakdown
  };
}

// -------------------------------------------------------------
// 5. RECURRING DEPOSIT (RD) CALCULATOR
// Formula: M = R * [(1 + r)^n - 1] / r
// standard Indian banks use quarterly compounding for RD:
// M = sum from 1 to n of R * (1 + rate / 4) ^ (4 * i / 12)
// -------------------------------------------------------------
export interface RDResult {
  totalDeposited: number;
  maturityAmount: number;
  interestEarned: number;
}

export function calculateRD(
  monthlyDeposit: number,
  ratePercent: number,
  tenureMonths: number
): RDResult {
  const p = monthlyDeposit;
  const rate = ratePercent / 100;
  
  // Standard Indian banking quarterly compounding for RD:
  // Month-by-month compounding compounding quarterly:
  let maturityAmount = 0;
  for (let m = 1; m <= tenureMonths; m++) {
    // tenure in quarters for this specific installment
    const quarters = (tenureMonths - m + 1) / 3;
    maturityAmount += p * Math.pow(1 + rate / 4, quarters);
  }
  
  const totalDeposited = p * tenureMonths;
  const interestEarned = maturityAmount - totalDeposited;

  return {
    totalDeposited: Math.round(totalDeposited),
    maturityAmount: Math.round(maturityAmount),
    interestEarned: Math.round(interestEarned)
  };
}

// -------------------------------------------------------------
// 6. SIDE-BY-SIDE COMPARISON ENGINE
// Inputs: "I have ₹X/month to invest for Y years"
// Compares:
// - FD/RD: Using a standard 7.0% bank interest rate
// - PPF: Using the fixed 7.1% government rate
// - SIP (Mutual Funds): Using a conservative 12.0% estimated return rate
// -------------------------------------------------------------
export interface ComparisonResult {
  monthlyAmount: number;
  years: number;
  rd: {
    invested: number;
    finalValue: number;
    interest: number;
    label: string;
  };
  ppf: {
    invested: number;
    finalValue: number;
    interest: number;
    label: string;
  };
  sip: {
    invested: number;
    finalValue: number;
    interest: number;
    label: string;
  };
  disclaimer: string;
}

export function compareInstruments(
  monthlyAmount: number,
  years: number
): ComparisonResult {
  // 1. RD calculation (using standard 7.0% RD rate)
  const rdCalc = calculateRD(monthlyAmount, 7.0, years * 12);
  
  // 2. PPF calculation (converts monthly amount to annual, capped at 1.5L/year)
  const annualPPF = Math.min(monthlyAmount * 12, 150000);
  const ppfCalc = calculatePPF(annualPPF, years);
  
  // 3. SIP calculation (using standard 12.0% equity mutual fund expectation)
  const sipCalc = calculateSIP(monthlyAmount, 12.0, years);

  return {
    monthlyAmount,
    years,
    rd: {
      invested: rdCalc.totalDeposited,
      finalValue: rdCalc.maturityAmount,
      interest: rdCalc.interestEarned,
      label: 'Recurring Deposit (7.0%)'
    },
    ppf: {
      invested: ppfCalc.totalInvested,
      finalValue: ppfCalc.maturityValue,
      interest: ppfCalc.interestEarned,
      label: 'Public Provident Fund (7.1% Tax-Free)'
    },
    sip: {
      invested: sipCalc.totalInvested,
      finalValue: sipCalc.estimatedCorpus,
      interest: sipCalc.totalWealthGain,
      label: 'Mutual Fund SIP (12.0% Est. Return)'
    },
    disclaimer: 'This is a mathematical projection based on typical historical rates and interest formulas. Actual returns are subject to market conditions, bank policies, and government declarations. This does not constitute SEBI-regulated investment advice.'
  };
}
