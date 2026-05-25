// Unit Tests for Smart Money Calculators
// Location: /lib/__tests__/calculators.test.ts

/* eslint-disable no-undef */
declare let describe: any;
declare let test: any;
declare let expect: any;

import { 
  calculateFD, 
  calculateSIP, 
  calculateLumpSum, 
  calculatePPF, 
  calculateRD, 
  compareInstruments 
} from '../calculators';

describe('Smart Money Calculator Engines', () => {
  
  // 1. FD Test Suite
  test('calculateFD matches standard compounding expectations', () => {
    const principal = 100000;
    const rate = 7.0;
    const years = 5;
    
    // Normal Citizen - Maturity (Compounded Quarterly)
    const result = calculateFD(principal, rate, years, 'maturity', false);
    expect(result.principal).toBe(principal);
    expect(result.maturityAmount).toBeGreaterThan(principal);
    expect(result.interestEarned).toBe(result.maturityAmount - principal);
    expect(result.effectiveAnnualYield).toBeCloseTo(7.19, 1);
    
    // Senior Citizen Rate Check (+0.5% bonus)
    const seniorResult = calculateFD(principal, rate, years, 'maturity', true);
    expect(seniorResult.maturityAmount).toBeGreaterThan(result.maturityAmount);
  });

  // 2. SIP Test Suite
  test('calculateSIP computes correct future value and yearly breakdown', () => {
    const monthlyAmount = 10000;
    const expectedReturn = 12.0;
    const years = 5;
    
    const result = calculateSIP(monthlyAmount, expectedReturn, years);
    expect(result.totalInvested).toBe(monthlyAmount * 12 * years);
    expect(result.estimatedCorpus).toBeGreaterThan(result.totalInvested);
    expect(result.totalWealthGain).toBe(result.estimatedCorpus - result.totalInvested);
    
    // Yearly projections should match length of duration
    expect(result.yearlyBreakdown.length).toBe(years);
    expect(result.yearlyBreakdown[0].year).toBe(1);
    expect(result.yearlyBreakdown[4].year).toBe(5);
  });

  // 3. Lump Sum Test Suite
  test('calculateLumpSum matches simple annual compounding', () => {
    const principal = 50000;
    const rate = 10.0;
    const years = 3;
    
    const result = calculateLumpSum(principal, rate, years);
    expect(result.principal).toBe(principal);
    // 50000 * 1.10^3 = 50000 * 1.331 = 66550
    expect(result.finalValue).toBe(66550);
    expect(result.absoluteGain).toBe(16550);
  });

  // 4. PPF Test Suite
  test('calculatePPF compounds annually at fixed 7.1%', () => {
    const annualContribution = 100000;
    const years = 15;
    
    const result = calculatePPF(annualContribution, years);
    expect(result.totalInvested).toBe(annualContribution * years);
    expect(result.maturityValue).toBeGreaterThan(result.totalInvested);
    expect(result.yearlyBreakdown.length).toBe(years);
  });

  // 5. RD Test Suite
  test('calculateRD matches quarterly compounding logic over months', () => {
    const monthlyDeposit = 5000;
    const rate = 6.5;
    const months = 24;
    
    const result = calculateRD(monthlyDeposit, rate, months);
    expect(result.totalDeposited).toBe(monthlyDeposit * months);
    expect(result.maturityAmount).toBeGreaterThan(result.totalDeposited);
  });

  // 6. Side-by-Side Comparison Suite
  test('compareInstruments aggregates all returns metrics correctly', () => {
    const monthlyAmount = 10000;
    const years = 10;
    
    const result = compareInstruments(monthlyAmount, years);
    expect(result.monthlyAmount).toBe(monthlyAmount);
    expect(result.years).toBe(years);
    
    // Check that we returned comparative objects
    expect(result.rd.invested).toBe(monthlyAmount * 12 * years);
    expect(result.sip.invested).toBe(monthlyAmount * 12 * years);
    
    // Equity SIP should return a higher corpus than fixed rate RD
    expect(result.sip.finalValue).toBeGreaterThan(result.rd.finalValue);
    expect(result.disclaimer).toContain('mathematical projection');
  });
});
