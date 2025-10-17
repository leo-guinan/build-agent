/**
 * Speculator Transform
 * 
 * Game: Future Accuracy (Predictions / Reality)
 * Output: Sales & Investment Flows
 * 
 * This agent understands:
 * - Revenue forecasting
 * - Investment scenarios
 * - Cash flow modeling
 * - Growth projections
 * - Risk assessment
 * 
 * Primary Mission: Build financial models and flows that predict and enable
 * future states of the business.
 */

import type { Transform, TransformedIdeaInputs } from './types.js';

export interface SpeculatorInputs extends TransformedIdeaInputs {
  // Revenue Model
  revenueStreams: string[] | string;
  primaryRevenue: string;
  avgTransactionValue: number;
  expectedMonthlyTransactions: number;
  
  // Growth
  monthlyGrowthRate: number;  // Percentage
  churnRate: number;  // Percentage
  timeToBreakeven: number;  // Months
  
  // Investment
  needsInvestment: boolean;
  investmentAmount: number;
  useOfFunds: string;
  expectedValuation: number;
  
  // Projections
  projectionHorizon: '6 months' | '12 months' | '18 months' | '24 months';
  conservativeCase: boolean;
  
  // Risks
  marketSize: string;
  competitiveAdvantage: string;
}

export function calculateFinancialProjections(inputs: SpeculatorInputs) {
  const months = inputs.projectionHorizon === '6 months' ? 6 :
                inputs.projectionHorizon === '12 months' ? 12 :
                inputs.projectionHorizon === '18 months' ? 18 : 24;
  
  const monthlyRevenue = inputs.avgTransactionValue * inputs.expectedMonthlyTransactions;
  const growthMultiplier = inputs.conservativeCase ? 0.7 : 1.0;
  const monthlyGrowth = (inputs.monthlyGrowthRate / 100) * growthMultiplier;
  const monthlyChurn = inputs.churnRate / 100;
  
  const projections = [];
  let cumulative = 0;
  let customers = inputs.expectedMonthlyTransactions;
  
  for (let month = 1; month <= months; month++) {
    const revenue = customers * inputs.avgTransactionValue;
    cumulative += revenue;
    customers = customers * (1 + monthlyGrowth - monthlyChurn);
    
    projections.push({
      month,
      revenue: Math.round(revenue),
      cumulative: Math.round(cumulative),
      customers: Math.round(customers),
    });
  }
  
  const finalMonthRevenue = projections[projections.length - 1].revenue;
  const totalRevenue = projections[projections.length - 1].cumulative;
  const cagr = ((finalMonthRevenue / monthlyRevenue) ** (12 / months) - 1) * 100;
  
  return {
    projections,
    monthlyRevenue,
    finalMonthRevenue,
    totalRevenue,
    cagr,
    breakevenMonth: inputs.timeToBreakeven,
    investmentNeeded: inputs.needsInvestment,
  };
}

export const speculatorTransform: Transform = {
  id: 'speculator',
  name: 'Speculator Agent',
  description: 'Optimizes for future accuracy - builds sales and investment flows',
  
  game: {
    name: 'Future Accuracy',
    description: 'Predict future states accurately and build flows to enable them',
    metrics: [
      'Revenue Forecast Accuracy',
      'Growth Rate Prediction',
      'Breakeven Timing',
      'Investment Raise Success',
      'Cash Flow Accuracy',
      'Valuation Achievement',
    ],
    successCriteria: 'Hit revenue projections within ±20% for 3 consecutive months',
  },
  
  additionalPrompts: [
    {
      name: 'revenueStreams',
      type: 'input',
      message: 'Revenue streams (comma-separated):',
      default: 'subscriptions,one-time sales',
    },
    {
      name: 'primaryRevenue',
      type: 'input',
      message: 'Primary revenue stream:',
      default: 'subscriptions',
    },
    {
      name: 'avgTransactionValue',
      type: 'number',
      message: 'Average transaction value (USD):',
      default: 49,
      validate: (input: number) => input > 0 ? true : 'Must be positive',
    },
    {
      name: 'expectedMonthlyTransactions',
      type: 'number',
      message: 'Expected monthly transactions/customers:',
      default: 100,
      validate: (input: number) => input > 0 ? true : 'Must be positive',
    },
    {
      name: 'monthlyGrowthRate',
      type: 'number',
      message: 'Expected monthly growth rate (%):',
      default: 20,
      validate: (input: number) => input >= 0 && input <= 100 ? true : 'Must be 0-100%',
    },
    {
      name: 'churnRate',
      type: 'number',
      message: 'Expected monthly churn rate (%):',
      default: 5,
      validate: (input: number) => input >= 0 && input <= 100 ? true : 'Must be 0-100%',
    },
    {
      name: 'timeToBreakeven',
      type: 'number',
      message: 'Expected months to breakeven:',
      default: 12,
      validate: (input: number) => input > 0 ? true : 'Must be at least 1 month',
    },
    {
      name: 'needsInvestment',
      type: 'confirm',
      message: 'Planning to raise investment?',
      default: false,
    },
    {
      name: 'investmentAmount',
      type: 'number',
      message: 'Investment amount seeking (USD):',
      default: 0,
      validate: (input: number) => input >= 0 ? true : 'Must be non-negative',
    },
    {
      name: 'useOfFunds',
      type: 'input',
      message: 'Primary use of investment funds:',
      default: 'product development, marketing, hiring',
    },
    {
      name: 'expectedValuation',
      type: 'number',
      message: 'Expected valuation (USD):',
      default: 0,
    },
    {
      name: 'projectionHorizon',
      type: 'list',
      message: 'Financial projection timeframe:',
      choices: ['6 months', '12 months', '18 months', '24 months'],
      default: '12 months',
    },
    {
      name: 'conservativeCase',
      type: 'confirm',
      message: 'Use conservative projections (70% of estimates)?',
      default: true,
    },
    {
      name: 'marketSize',
      type: 'input',
      message: 'Total addressable market (TAM):',
      default: '$100M',
    },
    {
      name: 'competitiveAdvantage',
      type: 'input',
      message: 'Key competitive advantage:',
      default: 'First mover, proprietary tech, network effects',
    },
  ],
  
  requirementsTemplate: (inputs: SpeculatorInputs) => {
    const projections = calculateFinancialProjections(inputs);
    const streams = typeof inputs.revenueStreams === 'string'
      ? inputs.revenueStreams.split(',').map((s: string) => s.trim())
      : inputs.revenueStreams;
    const timestamp = new Date().toISOString();
    
    return `# Requirements: ${inputs.ideaName}

**Type:** Speculator Agent  
**Game:** Future Accuracy  
**Output:** Sales & Investment Flows
**Generated:** ${timestamp}  
**Status:** Draft

---

## 🔮 Financial Projections

### ${inputs.projectionHorizon} Forecast (${inputs.conservativeCase ? 'Conservative' : 'Optimistic'})

**Starting Point:**
- Monthly Revenue: $${projections.monthlyRevenue.toLocaleString()}
- Customers: ${inputs.expectedMonthlyTransactions}
- Avg Transaction: $${inputs.avgTransactionValue}

**Growth Assumptions:**
- Monthly Growth: ${inputs.monthlyGrowthRate}%
- Monthly Churn: ${inputs.churnRate}%
- CAGR: ${projections.cagr.toFixed(1)}%

**End State (Month ${projections.projections.length}):**
- Monthly Revenue: $${projections.finalMonthRevenue.toLocaleString()}
- Total Revenue: $${projections.totalRevenue.toLocaleString()}
- Customers: ${projections.projections[projections.projections.length - 1].customers}
- Breakeven: Month ${projections.breakevenMonth}

### Monthly Breakdown

${projections.projections.slice(0, 12).map(p => 
  `Month ${p.month}: $${p.revenue.toLocaleString()} (${p.customers} customers) | Cumulative: $${p.cumulative.toLocaleString()}`
).join('\n')}

${inputs.needsInvestment ? `

### Investment Requirements

**Seeking:** $${inputs.investmentAmount.toLocaleString()}  
**Valuation:** $${inputs.expectedValuation.toLocaleString()}  
**Use of Funds:** ${inputs.useOfFunds}

**Investment Justification:**
- Breakeven: Month ${projections.breakevenMonth}
- ${projections.projections.length}-month revenue: $${projections.totalRevenue.toLocaleString()}
- Growth rate: ${inputs.monthlyGrowthRate}%/month
- Market size: ${inputs.marketSize}
- Competitive edge: ${inputs.competitiveAdvantage}
` : ''}

---

## 📊 Game Metrics

1. **Revenue Forecast Accuracy**
   - Predicted: $${projections.monthlyRevenue.toLocaleString()}/month
   - Target: ±20% accuracy at Month 3

2. **Growth Rate**
   - Predicted: ${inputs.monthlyGrowthRate}%/month
   - Target: ±5% accuracy

3. **Breakeven Timing**
   - Predicted: Month ${projections.breakevenMonth}
   - Target: ±2 months accuracy

4. **Customer Acquisition**
   - Predicted: ${projections.projections[projections.projections.length - 1].customers} by Month ${projections.projections.length}
   - Target: ±15% accuracy

**Winning:** Hit projections within acceptable variance for 3+ consecutive months.

---

## 1. Revenue Model

### Revenue Streams
${streams.map((stream: string, i: number) => `${i + 1}. **${stream}**`).join('\n')}

**Primary:** ${inputs.primaryRevenue}

### Pricing Strategy
- Transaction value: $${inputs.avgTransactionValue}
- Volume: ${inputs.expectedMonthlyTransactions}/month
- Growth: ${inputs.monthlyGrowthRate}%/month
- Churn: ${inputs.churnRate}%/month

---

## 2. Sales Flows

### Customer Journey
1. **Awareness** → ${inputs.targetUsers} discover product
2. **Interest** → Value proposition resonates
3. **Decision** → ${inputs.primaryRevenue} purchase
4. **Action** → Transaction complete
5. **Retention** → Minimize ${inputs.churnRate}% churn

### Sales Process
- Inbound: Marketing page → Trial → Purchase
- Outbound: Direct outreach → Demo → Close
- Self-serve: Product-led growth
- Target: ${inputs.expectedMonthlyTransactions} transactions/month

---

## 3. Investment Flows

${inputs.needsInvestment ? `
### Fundraising Strategy

**Round:** Seeking $${inputs.investmentAmount.toLocaleString()}  
**Valuation:** $${inputs.expectedValuation.toLocaleString()}  
**Type:** ${inputs.investmentAmount < 100000 ? 'Angel/Friends & Family' : inputs.investmentAmount < 1000000 ? 'Seed' : 'Series A'}

**Pitch:**
- TAM: ${inputs.marketSize}
- Traction: ${inputs.expectedMonthlyTransactions} customers
- Growth: ${inputs.monthlyGrowthRate}%/month
- Breakeven: Month ${projections.breakevenMonth}
- ${projections.projections.length}-month revenue: $${projections.totalRevenue.toLocaleString()}

**Use of Funds:**
${inputs.useOfFunds.split(',').map((use, i) => `${i + 1}. ${use.trim()}`).join('\n')}

**Timeline:**
- Months 1-2: Prepare deck, financials
- Months 3-4: Investor outreach (50-100)
- Months 5-6: Due diligence, close
` : `
### Bootstrapped Approach

**No external investment**  
**Strategy:** Grow organically from revenue

- Reinvest profits
- Keep burn low
- Reach breakeven: Month ${projections.breakevenMonth}
- Scale profitably thereafter
`}

---

## 4. Risk Analysis (Speculator Lens)

### Projection Risks

**Risk: Growth slower than ${inputs.monthlyGrowthRate}%/month**
- Impact: Miss revenue targets, delayed breakeven
- Mitigation: Conservative estimates (${inputs.conservativeCase ? 'already applied' : 'not applied'})
- Trigger: 2 consecutive months <${Math.floor(inputs.monthlyGrowthRate * 0.7)}% growth

**Risk: Churn higher than ${inputs.churnRate}%/month**
- Impact: Revenue decline, negative growth
- Mitigation: Focus on retention, product quality
- Trigger: Churn >${inputs.churnRate * 1.5}% for 2 months

**Risk: Can't reach ${inputs.expectedMonthlyTransactions} transactions**
- Impact: All projections off
- Mitigation: Multiple acquisition channels
- Trigger: Month 3 and <${Math.floor(inputs.expectedMonthlyTransactions * 0.5)} transactions

${inputs.needsInvestment ? `
**Risk: Can't raise $${inputs.investmentAmount.toLocaleString()}**
- Impact: Slower growth, pivot to bootstrap
- Mitigation: Have bootstrap plan ready
- Trigger: 50+ rejections, 6+ months fundraising
` : ''}

---

## 5. Tracking System

### Monthly Actuals
- [ ] Revenue: $______
- [ ] Customers: ______
- [ ] Growth rate: ______%
- [ ] Churn rate: ______%
- [ ] Variance: ______%

### Projection Updates
- [ ] Next month prediction: $______
- [ ] Confidence: Low/Medium/High
- [ ] Adjustments made: ______

---

**This is a Speculator Agent requirements document.**

**Game:** Future Accuracy  
**Horizon:** ${inputs.projectionHorizon}  
**Predicted Revenue:** $${projections.totalRevenue.toLocaleString()}  
**Breakeven:** Month ${projections.breakevenMonth}

**Predict accurately. Track actuals. Adjust forecasts. Win by being right.**

---

*Next: Build financial model, track actuals, refine predictions monthly.*
`;
  },
  
  validators: [
    {
      name: 'growth-realistic',
      required: false,
      validate: async (inputs: SpeculatorInputs) => {
        if (inputs.monthlyGrowthRate > 30 && !inputs.conservativeCase) {
          return {
            valid: true,
            warnings: [
              `${inputs.monthlyGrowthRate}% monthly growth is very aggressive`,
              'Consider enabling conservative projections',
            ],
          };
        }
        return { valid: true };
      },
    },
  ],
  
  learningEnabled: true,
  
  understands: ['time', 'money', 'revenue', 'growth', 'investment', 'futures', 'projections'],
  
  customCommands: [
    'forecast-update',
    'variance-report',
    'fundraise-status',
  ],
};

