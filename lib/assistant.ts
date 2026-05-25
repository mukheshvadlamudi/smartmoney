// Finance Co-Pilot RAG Semantic Matching Engine
// Location: /lib/assistant.ts

export interface FinancialData {
  transactions: any[];
  budgets: any[];
  goals: any[];
  netWorth: any[];
  currentMonth: string; // e.g., "2026-05"
}

export function queryAssistant(userQuery: string, data: FinancialData): string {
  const query = userQuery.trim().toLowerCase();

  // Helper variables
  const currentMonthLabel = new Date(data.currentMonth + '-02').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // 1. GATHER GENERAL TRANSACTION SUMMARIES
  const monthlyTxs = data.transactions.filter(tx => tx.date.startsWith(data.currentMonth));
  const incomeTxs = monthlyTxs.filter(tx => tx.type === 'credit');
  const spentTxs = monthlyTxs.filter(tx => tx.type === 'debit');

  const totalIncome = incomeTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalSpent = spentTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalSaved = Math.max(0, totalIncome - totalSpent);
  const savingsRate = totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0;

  // 2. STRICT GENERAL/MARKET QUERY GUARDRAIL
  const isMarketOrExternalQuery = /price|rate|market|ticker|news|today|feed|chart|value|currency|crypto|bitcoin|gold price|silver price|stock price/i.test(query) && !/spent|spent on|spent for|budget|goal|ledger|transaction|saving|timeline/i.test(query);
  
  if (isMarketOrExternalQuery) {
    return `### Sandboxed Live Market Feed Guardrail

I am your sandboxed Finance Co-Pilot. I only have access to your personal ledger statement logs, budget limits, and savings goals. 

I do not have access to live external market feeds (such as the current gold price, stock market feeds, or real-time cryptocurrency values). 

What I can do for you:
* Aggregate your variable category outflows or track investment portfolios logged inside the Net Worth section.
* Simulate custom savings goals timelines.
* Recommend budget cap trims dynamically.

How would you like to query your active ledger transactions today?`;
  }

  // 3. DYNAMIC SAVINGS DEFICIT PLANNER
  const savingsTargetMatch = query.match(/(?:save|reduce|savings|target)\s*(?:₹)?\s*(\d+)/i);
  if (savingsTargetMatch && !/goal|timeline/i.test(query)) {
    const targetSavings = parseInt(savingsTargetMatch[1]);
    
    // Calculate current actual surplus
    const actualSurplus = Math.max(0, totalIncome - totalSpent);
    const deficit = Math.max(0, targetSavings - actualSurplus);
    
    let report = `### Savings Deficit Planner & Advisory\n\n`;
    report += `You queried how to establish a ₹${targetSavings.toLocaleString('en-IN')}/month savings target. Here is your personalized advisor report:\n\n`;
    report += `* **Current Actual Savings**: \`₹${actualSurplus.toLocaleString('en-IN')}/month\`\n`;
    report += `* **Target Savings**: \`₹${targetSavings.toLocaleString('en-IN')}/month\`\n`;
    
    if (deficit === 0) {
      report += `Deficit Status: ₹0 (Achieved!). You are already saving \`₹${actualSurplus.toLocaleString('en-IN')}\` this month, exceeding your target. Keep up the high savings discipline!\n\n`;
      return report;
    }

    report += `* **Savings Deficit to Close**: **₹${deficit.toLocaleString('en-IN')}/month**\n\n`;
    report += `To save this additional **₹${deficit.toLocaleString('en-IN')}**, we reviewed your live category outflows (excluding fixed Rent/Investments) to recommend optimal trims:\n\n`;

    // Gather variable categories: Food, Shopping, Entertainment, Miscellaneous, Travel
    const variableCats = ['Food', 'Shopping', 'Entertainment', 'Travel', 'Miscellaneous'];
    const catOutflows = variableCats.map(cat => {
      const spent = spentTxs.filter(tx => tx.category === cat).reduce((sum, tx) => sum + Number(tx.amount), 0);
      return { category: cat, spent };
    }).sort((a, b) => b.spent - a.spent);

    let totalTrimmablePotential = 0;
    let suggestionsCount = 0;
    
    catOutflows.forEach(item => {
      if (item.spent > 0) {
        let trimPercent = 0;
        let adviceText = '';
        if (item.category === 'Food') { trimPercent = 30; adviceText = 'cut Swiggy/dining outflows by 30%'; }
        else if (item.category === 'Shopping') { trimPercent = 40; adviceText = 'defer non-essential retail purchases by 40%'; }
        else if (item.category === 'Entertainment') { trimPercent = 25; adviceText = 'audit digital subscriptions to trim by 25%'; }
        else if (item.category === 'Travel') { trimPercent = 20; adviceText = 'optimize cab pools or switch to public transit (20% trim)'; }
        else { trimPercent = 15; adviceText = 'audit miscellaneous outflows for a 15% trim'; }

        const trimAmt = Math.round(item.spent * (trimPercent / 100));
        totalTrimmablePotential += trimAmt;
        suggestionsCount++;

        report += `* **${item.category}** (Logged spent: \`₹${item.spent.toLocaleString('en-IN')}\`):\n`;
        report += `  - Trim action: ${adviceText}\n`;
        report += `  - Immediate monthly savings: **+₹${trimAmt.toLocaleString('en-IN')}**\n\n`;
      }
    });

    if (suggestionsCount === 0) {
      report += `We did not find variable category outflows (like Food, Shopping, Travel) inside your active statements to recommend cuts. Ensure you have parsed ledger statements with varying payee categories to activate variable trims!`;
    } else {
      report += `Trimming Potential: Implementing these trims across variable categories could yield up to **+₹${totalTrimmablePotential.toLocaleString('en-IN')}/month** in savings.\n\n`;
      if (totalTrimmablePotential >= deficit) {
        report += `Recommendation: You can **fully close** your **₹${deficit.toLocaleString('en-IN')}** savings deficit this month by executing the suggested variable cuts!`;
      } else {
        const remainingDeficit = deficit - totalTrimmablePotential;
        report += `Recommendation: Implementing these variable trims saves you **+₹${totalTrimmablePotential.toLocaleString('en-IN')}**, closing a major part of the deficit. To cover the remaining **₹${remainingDeficit.toLocaleString('en-IN')}**, consider checking if you can renegotiate fixed utilities or look for stable income additions.`;
      }
    }

    return report;
  }

  // 4. CASH FLOW SUMMARY
  if (/summary|summarize|cash flow|overview|spending|income|spent|savings|how much did i save/i.test(query) && !/food|shopping|rent|travel|bill|medical|invest|entertainment|utility|miscellaneous/i.test(query)) {
    return `### Cash Flow Summary for ${currentMonthLabel}

Here is your sandboxed financial health breakdown for this month:
* **Total Cash Inflow**: \`₹${totalIncome.toLocaleString('en-IN')}\` (Inward credits)
* **Total Expenses Out**: \`₹${totalSpent.toLocaleString('en-IN')}\` (Outward debits)
* **Net Surplus Saved**: **₹${totalSaved.toLocaleString('en-IN')}**
* **Active Savings Rate**: **${savingsRate}%** of total earnings

${totalSaved > 0 
  ? `Excellent! You are maintaining a healthy surplus of **${savingsRate}%**. This surplus can be deployed into your active savings goals or investments.`
  : `You are currently operating at zero savings surplus. Review your recurring subscription leaks or variable expenses to establish a safety margin.`
}`;
  }

  // 5. CATEGORY SPENT AUDIT
  const presetCategories = ['Food', 'Rent', 'Shopping', 'Travel', 'Entertainment', 'Utilities', 'Medical', 'Investments', 'Miscellaneous'];
  let matchedCategory = '';
  for (const cat of presetCategories) {
    if (new RegExp(cat, 'i').test(query)) {
      matchedCategory = cat;
      break;
    }
  }
  // Alternate keyword aliases for categories
  if (!matchedCategory) {
    if (/restaurant|swiggy|zomato|eat|lunch|dinner|cafe|pizza|burger/i.test(query)) matchedCategory = 'Food';
    else if (/apartment|home rent|landlord|hostel/i.test(query)) matchedCategory = 'Rent';
    else if (/amazon|clothes|myntra|flipkart|gadgets|electronics|shoes/i.test(query)) matchedCategory = 'Shopping';
    else if (/uber|ola|cab|petrol|fuel|flight|train|bus|metro|auto/i.test(query)) matchedCategory = 'Travel';
    else if (/netflix|spotify|movie|pvr|theatre|prime video|youtube premium|gym|hotstar/i.test(query)) matchedCategory = 'Entertainment';
    else if (/electricity|water|wifi|broadband|airtel|recharge|mobile bill|gas/i.test(query)) matchedCategory = 'Utilities';
    else if (/doctor|medicine|pharmacy|hospital|health|clinical/i.test(query)) matchedCategory = 'Medical';
    else if (/sip|mutual fund|stock|fd|deposit|ppf|gold|epf/i.test(query)) matchedCategory = 'Investments';
  }

  if (matchedCategory) {
    const catSpentTxs = spentTxs.filter(tx => tx.category === matchedCategory);
    const catTotal = catSpentTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const percentOfTotal = totalSpent > 0 ? Math.round((catTotal / totalSpent) * 100) : 0;

    let advice = '';
    if (matchedCategory === 'Food') advice = 'Tip: Ordering in frequently via Swiggy/Zomato accumulates quickly. Meal prepping or cutting down on fine dining could immediately yield ₹2,000+ in monthly savings.';
    else if (matchedCategory === 'Shopping') advice = 'Tip: Implement a 48-hour delay rule for non-essential purchases on Amazon/Myntra to curb impulse buying.';
    else if (matchedCategory === 'Entertainment') advice = 'Tip: Consolidate streaming services. Audit subscriptions like Netflix, Prime, and Spotify to check for overlapping costs.';
    else if (matchedCategory === 'Utilities') advice = 'Tip: Review recurring phone plans. Switching to annual prepays instead of monthly billings often unlocks up to 20% discounts.';
    else advice = `Keep tracking your ${matchedCategory} outflows to verify that it aligns with your long-term wealth targets.`;

    return `### Category Spent Audit: **${matchedCategory}**

In **${currentMonthLabel}**, your ledger indicates:
* **Total Spent**: \`₹${catTotal.toLocaleString('en-IN')}\`
* **Ledger Share**: **${percentOfTotal}%** of your total monthly expenditures (\`₹${totalSpent.toLocaleString('en-IN')}\`)
* **Transaction Count**: logged **${catSpentTxs.length}** distinct events.

${advice}`;
  }

  // 6. BUDGETS & LIMITS AUDIT
  if (/budget|limit|alert|warning|exceed/i.test(query)) {
    const budgetStatusList = data.budgets.map(b => {
      const spent = spentTxs.filter(tx => tx.category === b.category).reduce((sum, tx) => sum + Number(tx.amount), 0);
      const limit = Number(b.limit);
      const isOver = limit > 0 && spent >= limit;
      const isWarning = limit > 0 && spent >= limit * 0.8 && spent < limit;
      const progress = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      return { category: b.category, spent, limit, isOver, isWarning, progress };
    });

    const overBudgets = budgetStatusList.filter(b => b.isOver);
    const warningBudgets = budgetStatusList.filter(b => b.isWarning);
    const healthyBudgets = budgetStatusList.filter(b => b.limit > 0 && !b.isOver && !b.isWarning);

    let summaryText = '### Category Budget Performance Audit\n\n';
    
    if (overBudgets.length > 0) {
      summaryText += `**Budget Exceeded Categories:**\n`;
      overBudgets.forEach(b => {
        summaryText += `- **${b.category}**: Spent \`₹${b.spent.toLocaleString('en-IN')}\` against limit of \`₹${b.limit.toLocaleString('en-IN')}\` (**${b.progress}%** exhausted!)\n`;
      });
      summaryText += '\n';
    }

    if (warningBudgets.length > 0) {
      summaryText += `**Warning Categories (Exceeded 80% Threshold):**\n`;
      warningBudgets.forEach(b => {
        summaryText += `- **${b.category}**: Spent \`₹${b.spent.toLocaleString('en-IN')}\` of \`₹${b.limit.toLocaleString('en-IN')}\` (**${b.progress}%** used)\n`;
      });
      summaryText += '\n';
    }

    if (healthyBudgets.length > 0) {
      summaryText += `**Healthy Active Limits:**\n`;
      healthyBudgets.forEach(b => {
        summaryText += `- **${b.category}**: Spent \`₹${b.spent.toLocaleString('en-IN')}\` of \`₹${b.limit.toLocaleString('en-IN')}\` (**${b.progress}%** used)\n`;
      });
      summaryText += '\n';
    }

    if (overBudgets.length === 0 && warningBudgets.length === 0 && healthyBudgets.length === 0) {
      summaryText += 'You currently do not have any budget limits set on this statement sandbox. Navigate to Budgets in the sidebar to configure warning limits.';
    } else {
      summaryText += `Recommendations: ${overBudgets.length > 0 ? 'Immediately reduce spending on the flagged red categories to prevent compounding monthly deficits.' : 'Excellent work keeping your expenditures inside safe budget thresholds this month!'}`;
    }

    return summaryText;
  }

  // 7. SAVINGS GOALS & DYNAMIC SIMULATIONS
  const isGoalQuery = /goal|saving|target|timeline/i.test(query) || data.goals.some(g => new RegExp(g.name.split(' ')[0], 'i').test(query));
  
  if (isGoalQuery) {
    if (data.goals.length === 0) {
      return `### Savings Goals Audit

You do not have any active savings goals logged in the database. 
Tip: Click on **Goals** in the left sidebar and create a goal (e.g. *Emergency Fund* or *Laptop Fund*) with a target amount and deadline to let us calculate your recommendations!`;
    }

    // Try to find a specific matching goal
    let matchedGoal = data.goals.find(g => new RegExp(g.name.split(' ')[0], 'i').test(query));
    if (!matchedGoal && data.goals.length === 1) {
      matchedGoal = data.goals[0];
    }

    // Try to parse a custom month timeline from the query
    let customMonths: number | null = null;
    const digitMatch = query.match(/(\d+)\s*month/);
    if (digitMatch) {
      customMonths = parseInt(digitMatch[1]);
    } else {
      const wordNumbers: { [key: string]: number } = {
        one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
        eleven: 11, twelve: 12, eighteen: 18, twenty: 20, twentyfour: 24, thirtysix: 36
      };
      for (const word in wordNumbers) {
        if (new RegExp('\\b' + word + '\\b\\s*month', 'i').test(query)) {
          customMonths = wordNumbers[word];
          break;
        }
      }
    }

    if (matchedGoal) {
      const current = Number(matchedGoal.current_amount);
      const target = Number(matchedGoal.target_amount);
      const percent = Math.min(100, Math.round((current / target) * 100));
      const remaining = Math.max(0, target - current);
      
      const targetDate = new Date(matchedGoal.target_date);
      const today = new Date();
      const diffTime = targetDate.getTime() - today.getTime();
      const originalMonths = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.4)));

      if (customMonths !== null) {
        const customMonthlyReq = customMonths > 0 ? Math.round(remaining / customMonths) : remaining;
        const originalMonthlyReq = originalMonths > 0 ? Math.round(remaining / originalMonths) : remaining;

        return `### Dynamic Savings Simulation: **${matchedGoal.name}**

* **Goal Status**: \`₹${current.toLocaleString('en-IN')}\` saved of \`₹${target.toLocaleString('en-IN')}\` (**${percent}%** completed)
* **Remaining Balance to Save**: \`₹${remaining.toLocaleString('en-IN')}\`
* **Custom Timeline Plan**: **${customMonths} months** (requested timeline)

Simulation Result: To achieve this goal in the next **${customMonths} months**, you need to save **₹${customMonthlyReq.toLocaleString('en-IN')}/month**.

*Note: Your original timeline was **${originalMonths} months** (by ${targetDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}), which required contributing **₹${originalMonthlyReq.toLocaleString('en-IN')}/month**.*`;
      } else {
        const monthlyReq = originalMonths > 0 ? Math.round(remaining / originalMonths) : remaining;
        return `### Savings Goal Audit: **${matchedGoal.name}**

Here is the progress report for your specific goal:
* **Current Balance**: \`₹${current.toLocaleString('en-IN')}\`
* **Target Target**: \`₹${target.toLocaleString('en-IN')}\` (**${percent}%** saved)
* **Deficit to Fund**: \`₹${remaining.toLocaleString('en-IN')}\`
* **Timeline Schedule**: **${originalMonths} months** remaining (Target: ${targetDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})

Required Contribution: You need to save **₹${monthlyReq.toLocaleString('en-IN')}/month** to achieve this goal on schedule.

*(If you wish to simulate other timelines, ask me: "how much should I save per month for my ${matchedGoal.name.split(' ')[0]} goal in the next 6 months?")*`;
      }
    }

    // Default: List all active goals
    let goalsText = `### Active Savings Goals Summary\n\n`;
    goalsText += `We audited your **${data.goals.length}** active savings goal(s):\n\n`;

    data.goals.forEach((g) => {
      const current = Number(g.current_amount);
      const target = Number(g.target_amount);
      const percent = Math.min(100, Math.round((current / target) * 100));
      const remaining = Math.max(0, target - current);
      
      const targetDate = new Date(g.target_date);
      const today = new Date();
      const diffTime = targetDate.getTime() - today.getTime();
      const monthsLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.4)));
      const monthlyReq = monthsLeft > 0 ? Math.round(remaining / monthsLeft) : remaining;

      goalsText += `**${g.name}**\n`;
      goalsText += `- **Progress**: \`₹${current.toLocaleString('en-IN')}\` of \`₹${target.toLocaleString('en-IN')}\` (**${percent}%** completed)\n`;
      goalsText += `- **Timeline**: Target date is ${targetDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} (**${monthsLeft} months** left)\n`;
      goalsText += `- **Strategy**: Contribute **₹${monthlyReq.toLocaleString('en-IN')}/month** to hit this goal on schedule.\n\n`;
    });

    goalsText += `*To simulate a specific goal, mention its name (e.g. "how much should I save for ${data.goals[0].name.split(' ')[0]} in the next 6 months")*`;
    return goalsText;
  }

  // 8. SUBSCRIPTION LEAKS
  if (/subscription|leak|recurring/i.test(query)) {
    const knownSubs = [
      { name: 'Netflix', keyword: 'netflix', est: 199 },
      { name: 'Spotify', keyword: 'spotify', est: 119 },
      { name: 'Airtel Fiber / Mobile', keyword: 'airtel', est: 499 },
      { name: 'Amazon Prime', keyword: 'prime', est: 299 },
      { name: 'Youtube Premium', keyword: 'youtube', est: 129 },
      { name: 'Gym Membership', keyword: 'gym', est: 1500 },
      { name: 'Adobe Suite', keyword: 'adobe', est: 600 },
      { name: 'Apple iCloud', keyword: 'icloud', est: 75 }
    ];

    const detectedSubs: any[] = [];
    spentTxs.forEach(tx => {
      const desc = tx.description.toLowerCase();
      knownSubs.forEach(sub => {
        if (desc.includes(sub.keyword)) {
          detectedSubs.push({ name: sub.name, amount: Number(tx.amount), date: tx.date });
        }
      });
    });

    const uniqueSubs = detectedSubs.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
    const subTotal = uniqueSubs.reduce((sum, s) => sum + s.amount, 0);

    if (uniqueSubs.length === 0) {
      return `### Subscription Leaks Scan

We scanned your transactions for recurring digital subscriptions (e.g. Netflix, Spotify, Airtel, Adobe, Prime) and found **zero** repeating billing patterns this month. 

Tip: If you recently parsed statements, check that digital payments are logged under **Entertainment** or **Utilities** in your ledger to let our filters catch them.`;
    }

    let subText = `### Subscription Leaks Scan & Audit\n\n`;
    subText += `We identified **${uniqueSubs.length}** recurring subscription outflows in your active statements:\n\n`;

    uniqueSubs.forEach(s => {
      subText += `- **${s.name}**: \`₹${s.amount.toLocaleString('en-IN')}\` (Logged on ${new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })})\n`;
    });

    subText += `\n* **Total Recurring Commitment**: \`₹${subTotal.toLocaleString('en-IN')}/month\` (\`₹${(subTotal * 12).toLocaleString('en-IN')}/year\`)\n\n`;
    subText += `Advisor Recommendations: Audit this list. Cancel services that have not been opened in the last 30 days to free up **₹${subTotal.toLocaleString('en-IN')}** in monthly cash flow immediately!`;

    return subText;
  }

  // 9. PROFESSIONAL FALLBACK
  return `### Smart Money Co-Pilot

Hello! I am your 100% secure, guardrailed **Finance Co-Pilot**. I analyze your transaction aggregates, goals, and budget limits to answer financial health queries.

Here are a few quick financial inquiries you can ask me:
1. **Summarize my cash flows** (Income, spent, savings rate)
2. **How much did I spend on Food?** (Calculates totals for Food, Shopping, Travel, etc.)
3. **Check my budget limits** (Reviews warning and exceeded thresholds)
4. **Am I on track for my goals?** (Audits savings timelines and monthly targets)
5. **Show my subscription leaks** (Identifies recurring streams like Netflix/broadband)

*How can I help you query your financial mirror today?*`;
}
