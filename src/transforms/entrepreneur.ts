/**
 * Entrepreneur Transform
 * 
 * Game: TIME + MONEY = ROI Accuracy
 * 
 * This agent understands:
 * - Time investment (hours/days/weeks)
 * - Money investment (costs)
 * - Revenue potential
 * - ROI calculation and prediction
 * - Learning from actual vs predicted
 */

import type { Transform, TransformedIdeaInputs } from './types.js';

export interface EntrepreneurInputs extends TransformedIdeaInputs {
  // Financial
  initialBudget: number;
  monthlyCosts: number;
  revenueModel: string;
  pricePoint: number;
  targetCustomers: number;
  
  // Time
  weeklyHours: number;
  timeToMVP: number;  // weeks
  timeToRevenue: number;  // weeks
  
  // Calculated
  predictedROI?: number;
  breakEvenTime?: number;  // weeks
}

/**
 * ROI Calculator
 */
export function calculatePredictedROI(inputs: EntrepreneurInputs): {
  roi: number;
  breakEven: number;
  monthlyRevenue: number;
  totalCost: number;
  netProfit: number;
} {
  // Calculate total cost
  const developmentWeeks = inputs.timeToMVP;
  const developmentCost = (inputs.weeklyHours * developmentWeeks * 100); // $100/hr time value
  const totalCost = inputs.initialBudget + developmentCost;
  
  // Calculate projected revenue
  const monthlyRevenue = inputs.targetCustomers * inputs.pricePoint;
  
  // Time to first revenue
  const weeksToRevenue = inputs.timeToRevenue;
  const operatingCosts = inputs.monthlyCosts * (weeksToRevenue / 4);
  
  // Total investment
  const totalInvestment = totalCost + operatingCosts;
  
  // ROI calculation: (Revenue - Cost) / Cost
  const firstYearRevenue = monthlyRevenue * 12;
  const firstYearCosts = inputs.monthlyCosts * 12;
  const netProfit = firstYearRevenue - firstYearCosts - totalInvestment;
  const roi = (netProfit / totalInvestment) * 100;
  
  // Break-even calculation
  const monthlyProfit = monthlyRevenue - inputs.monthlyCosts;
  const breakEven = monthlyProfit > 0 
    ? weeksToRevenue + ((totalInvestment / monthlyProfit) * 4)
    : -1;
  
  return {
    roi,
    breakEven,
    monthlyRevenue,
    totalCost: totalInvestment,
    netProfit,
  };
}

/**
 * Entrepreneur Transform Definition
 */
export const entrepreneurTransform: Transform = {
  id: 'entrepreneur',
  name: 'Entrepreneur Agent',
  description: 'Optimizes for ROI - tracks time and money to maximize return on investment',
  
  game: {
    name: 'ROI Accuracy',
    description: 'Predict and achieve positive ROI as accurately as possible',
    metrics: [
      'Predicted ROI',
      'Actual ROI',
      'Prediction Accuracy',
      'Break-even Time',
      'Customer Acquisition',
      'Revenue Growth',
    ],
    successCriteria: '±10% ROI prediction accuracy within 6 months',
  },
  
  additionalPrompts: [
    {
      name: 'initialBudget',
      type: 'number',
      message: 'Initial budget/capital available (USD):',
      default: 5000,
      validate: (input: number) => input >= 0 ? true : 'Budget must be non-negative',
    },
    {
      name: 'monthlyCosts',
      type: 'number',
      message: 'Expected monthly operating costs (USD):',
      default: 500,
      validate: (input: number) => input >= 0 ? true : 'Costs must be non-negative',
    },
    {
      name: 'revenueModel',
      type: 'list',
      message: 'Revenue model:',
      choices: [
        'Subscription (recurring)',
        'One-time purchase',
        'Usage-based',
        'Freemium',
        'Advertising',
        'B2B contracts',
        'Other',
      ],
      default: 'Subscription (recurring)',
    },
    {
      name: 'pricePoint',
      type: 'number',
      message: 'Price point per customer/month (USD):',
      default: 29,
      validate: (input: number) => input > 0 ? true : 'Price must be positive',
    },
    {
      name: 'targetCustomers',
      type: 'number',
      message: 'Target customers in first 6 months:',
      default: 100,
      validate: (input: number) => input > 0 ? true : 'Must target at least 1 customer',
    },
    {
      name: 'weeklyHours',
      type: 'number',
      message: 'Hours per week you can dedicate:',
      default: 20,
      validate: (input: number) => 
        input > 0 && input <= 168 ? true : 'Must be between 1-168 hours',
    },
    {
      name: 'timeToMVP',
      type: 'number',
      message: 'Weeks to build MVP:',
      default: 8,
      validate: (input: number) => input > 0 ? true : 'Must be at least 1 week',
    },
    {
      name: 'timeToRevenue',
      type: 'number',
      message: 'Weeks until first revenue (after MVP):',
      default: 4,
      validate: (input: number) => input >= 0 ? true : 'Must be non-negative',
    },
  ],
  
  requirementsTemplate: (inputs: EntrepreneurInputs) => {
    const roi = calculatePredictedROI(inputs);
    const timestamp = new Date().toISOString();
    
    return `# Requirements: ${inputs.ideaName}

**Type:** Entrepreneur Agent  
**Game:** ROI Accuracy  
**Generated:** ${timestamp}  
**Status:** Draft

---

## 💰 Financial Overview

### Investment
- **Initial Budget:** $${inputs.initialBudget.toLocaleString()}
- **Monthly Operating Costs:** $${inputs.monthlyCosts.toLocaleString()}
- **Development Time Value:** $${(inputs.weeklyHours * inputs.timeToMVP * 100).toLocaleString()} (${inputs.weeklyHours}h/week × ${inputs.timeToMVP} weeks × $100/hr)
- **Total Investment:** $${roi.totalCost.toLocaleString()}

### Revenue Model
- **Model:** ${inputs.revenueModel}
- **Price Point:** $${inputs.pricePoint}/month
- **Target Customers:** ${inputs.targetCustomers} in 6 months
- **Projected Monthly Revenue:** $${roi.monthlyRevenue.toLocaleString()}

### Predicted ROI
- **First Year ROI:** ${roi.roi.toFixed(1)}%
- **Break-even Time:** ${roi.breakEven > 0 ? Math.ceil(roi.breakEven) + ' weeks' : 'Beyond 1 year'}
- **Net Profit (Year 1):** $${roi.netProfit.toLocaleString()}

${roi.roi < 0 ? `
⚠️ **WARNING:** Predicted negative ROI. Consider:
- Increasing price point
- Reducing costs
- Growing customer base faster
- Reducing time to MVP
` : ''}

${roi.roi > 0 && roi.roi < 50 ? `
⚠️ **CAUTION:** Low ROI (${roi.roi.toFixed(1)}%). This may not justify the risk and time investment.
` : ''}

${roi.roi >= 50 && roi.roi < 100 ? `
✅ **MODERATE:** Decent ROI (${roi.roi.toFixed(1)}%). Viable if risk tolerance allows.
` : ''}

${roi.roi >= 100 ? `
✅ **STRONG:** Excellent predicted ROI (${roi.roi.toFixed(1)}%). High potential if assumptions hold.
` : ''}

---

## 📊 Game Metrics

This idea will be tracked against:

1. **ROI Prediction Accuracy**
   - Predicted: ${roi.roi.toFixed(1)}%
   - Target: ±10% accuracy at 6 months
   
2. **Break-even Achievement**
   - Predicted: ${roi.breakEven > 0 ? Math.ceil(roi.breakEven) + ' weeks' : 'Beyond 1 year'}
   - Target: Achieve within predicted ±2 weeks
   
3. **Customer Acquisition**
   - Target: ${inputs.targetCustomers} customers
   - Target: ±20% accuracy at 6 months
   
4. **Revenue Growth**
   - Target: $${roi.monthlyRevenue.toLocaleString()}/month
   - Target: ±15% accuracy at 6 months

**Winning this game means:** Your predictions were accurate AND you achieved positive ROI.

---

## 1. Overview

### Idea Description
${inputs.description}

### Problem Statement
${inputs.problem}

### Target Users
${inputs.targetUsers}

### Business Model
${inputs.revenueModel} model targeting ${inputs.targetCustomers} customers at $${inputs.pricePoint}/customer/month.

---

## 2. Objectives

### Primary Goal
Achieve ${roi.roi.toFixed(0)}% ROI within 12 months while maintaining ±10% prediction accuracy.

### Success Criteria (Entrepreneur Game)
- ✅ Break even within ${roi.breakEven > 0 ? Math.ceil(roi.breakEven) : 52} weeks
- ✅ Acquire ${inputs.targetCustomers} customers in 6 months
- ✅ Generate $${roi.monthlyRevenue.toLocaleString()}/month recurring revenue
- ✅ ROI prediction accuracy within ±10%
- ✅ ${inputs.successCriteria}

### Timeline
- **MVP:** ${inputs.timeToMVP} weeks
- **First Revenue:** ${inputs.timeToRevenue} weeks after MVP
- **Break-even:** ${roi.breakEven > 0 ? Math.ceil(roi.breakEven) : '52+'} weeks
- **Target:** ${inputs.timeframe}

---

## 3. Economic Analysis

### Cost Structure
\`\`\`
Initial Budget:        $${inputs.initialBudget.toLocaleString()}
Development (time):    $${(inputs.weeklyHours * inputs.timeToMVP * 100).toLocaleString()}
Operating Costs:       $${inputs.monthlyCosts.toLocaleString()}/month
-----------------
Total Investment:      $${roi.totalCost.toLocaleString()}
\`\`\`

### Revenue Projections
\`\`\`
Month 1:   $${(roi.monthlyRevenue * 0.1).toLocaleString()} (10% of target)
Month 3:   $${(roi.monthlyRevenue * 0.4).toLocaleString()} (40% of target)
Month 6:   $${roi.monthlyRevenue.toLocaleString()} (100% of target)
Month 12:  $${(roi.monthlyRevenue * 1.5).toLocaleString()} (150% of target)
\`\`\`

### Key Assumptions
1. Can dedicate ${inputs.weeklyHours} hours/week consistently
2. MVP achievable in ${inputs.timeToMVP} weeks
3. First customer within ${inputs.timeToRevenue} weeks
4. Can reach ${inputs.targetCustomers} customers in 6 months
5. ${inputs.pricePoint}/month price point is acceptable to market
6. Monthly costs stay under $${inputs.monthlyCosts}

**CRITICAL:** These assumptions must be validated. Track actuals monthly.

---

## 4. Functional Requirements

### Core Features (MVP - ${inputs.timeToMVP} weeks)
*Features must justify $${inputs.pricePoint}/month price point*

1. **Feature 1:** [Core value proposition feature]
2. **Feature 2:** [Differentiation feature]
3. **Feature 3:** [Must-have for target users]

### Revenue-Critical Features
*Features that directly enable monetization*

1. **Payment Integration:** Stripe/PayPal for ${inputs.revenueModel}
2. **User Authentication:** Secure signup/login
3. **Usage Tracking:** For billing and analytics
4. **Admin Dashboard:** Customer management

### Post-MVP Features
*Features to increase retention and growth*

1. [Feature that reduces churn]
2. [Feature that enables upsells]
3. [Feature that improves viral coefficient]

---

## 5. Technical Requirements

### Constraints
${inputs.constraints}

### Architecture Priorities
1. **Fast to Market:** Ship MVP in ${inputs.timeToMVP} weeks
2. **Cost Efficient:** Keep infrastructure under $${inputs.monthlyCosts}/month
3. **Revenue Enabled:** Payment and billing from day 1
4. **Scalable:** Support ${inputs.targetCustomers * 10} users without redesign

### Technology Stack Considerations
*Choose based on speed and cost, not perfection*

- **Frontend:** Fast to build, fast to deploy
- **Backend:** Proven stack, cheap hosting
- **Database:** Simple, scales to ${inputs.targetCustomers * 10} users
- **Payments:** Stripe (fast integration)
- **Hosting:** Under $50/month for MVP scale

---

## 6. Customer Acquisition Plan

### Target: ${inputs.targetCustomers} customers in 6 months

**Month 1-2 (MVP Development):**
- Build in public (social media, dev blogs)
- Collect waitlist emails (target: 50+)
- Validate price point with potential customers

**Month 3-4 (Launch + First Revenue):**
- Beta launch to waitlist
- Get first 10 paying customers
- Collect feedback, iterate quickly

**Month 5-6 (Growth):**
- Scale working acquisition channels
- Reach ${Math.floor(inputs.targetCustomers * 0.5)} customers
- Optimize conversion funnel

**Month 7-12 (Scale to Target):**
- Hit ${inputs.targetCustomers} customers
- Optimize retention
- Expand features based on demand

### Budget Allocation
- Development: ${((inputs.weeklyHours * inputs.timeToMVP * 100) / roi.totalCost * 100).toFixed(0)}% (your time)
- Marketing: ${(((roi.totalCost - (inputs.weeklyHours * inputs.timeToMVP * 100)) / roi.totalCost) * 100).toFixed(0)}% (remaining budget)

---

## 7. Risk Analysis (Entrepreneur Lens)

### Financial Risks

**Risk: Can't reach target customers**
- Impact: Revenue miss, negative ROI
- Probability: Medium
- Mitigation: Validate demand pre-MVP, start marketing early
- Warning Sign: < 10 customers by Month 3

**Risk: Price point too low**
- Impact: Can't cover costs, need more customers
- Probability: Medium  
- Mitigation: Customer interviews, competitor analysis
- Warning Sign: High signup but feedback says "too cheap"

**Risk: Development takes longer than ${inputs.timeToMVP} weeks**
- Impact: Increased cost, delayed revenue
- Probability: High (most MVPs take 2x estimate)
- Mitigation: Cut scope ruthlessly, ship incomplete
- Warning Sign: Week ${Math.ceil(inputs.timeToMVP / 2)} and < 50% done

**Risk: Operating costs exceed $${inputs.monthlyCosts}/month**
- Impact: Faster burn, need more revenue
- Probability: Medium
- Mitigation: Use cheap/free tools, optimize early
- Warning Sign: Approaching $${inputs.monthlyCosts * 0.8}/month

### Time Risks

**Risk: Can't sustain ${inputs.weeklyHours} hours/week**
- Impact: Slower development, delayed revenue
- Probability: Medium
- Mitigation: Schedule time blocks, say no to distractions
- Warning Sign: Missing weekly hour targets 2+ weeks in row

---

## 8. Tracking & Learning System

### Monthly Check-ins
*Update these metrics monthly to improve predictions*

**Financial Actuals:**
- [ ] Actual costs this month: $______
- [ ] Actual revenue this month: $______
- [ ] Actual customers acquired: ______
- [ ] Current MRR: $______

**Time Actuals:**
- [ ] Hours spent this week: ______
- [ ] Weeks into development: ______
- [ ] Estimated weeks remaining: ______

**Learning Adjustments:**
- [ ] Cost assumptions accurate? (Y/N + adjustment)
- [ ] Revenue assumptions accurate? (Y/N + adjustment)
- [ ] Time assumptions accurate? (Y/N + adjustment)
- [ ] Customer acquisition assumptions accurate? (Y/N + adjustment)

**Prediction Updates:**
- [ ] New predicted ROI: ______%
- [ ] New break-even date: ______
- [ ] Confidence level: Low/Medium/High

---

## 9. Go/No-Go Decision Points

### Week ${Math.ceil(inputs.timeToMVP / 2)} Checkpoint
**If NO to any, consider pivoting:**
- [ ] Still on track for ${inputs.timeToMVP}-week MVP?
- [ ] Confirmed $${inputs.pricePoint}/month is acceptable to market?
- [ ] Costs still under $${inputs.monthlyCosts}/month?
- [ ] Still have ${inputs.weeklyHours} hours/week available?

### Week ${inputs.timeToMVP + 4} Checkpoint (First Revenue Target)
**If NO to any, reassess:**
- [ ] MVP shipped?
- [ ] First paying customer acquired?
- [ ] Path to ${Math.ceil(inputs.targetCustomers * 0.1)} customers visible?
- [ ] Total spent under $${(roi.totalCost * 1.2).toLocaleString()}?

### Month 6 Checkpoint
**If NO to any, consider shutting down:**
- [ ] At least ${Math.ceil(inputs.targetCustomers * 0.5)} customers?
- [ ] Monthly revenue above $${(roi.monthlyRevenue * 0.5).toLocaleString()}?
- [ ] ROI prediction still positive?
- [ ] Path to break-even visible?

---

## 10. Entrepreneur Game Rules

### How to Win
1. **Achieve predicted ROI ±10%** (accuracy matters)
2. **Break even within predicted time ±2 weeks**
3. **Learn and adjust quickly** (bad predictions aren't failure if you learn)

### How to Lose
1. Ignore actuals (track nothing, learn nothing)
2. Miss go/no-go checkpoints (keep building when data says stop)
3. Spend more than break-even allows (run out of money)
4. Take > 2x predicted time (opportunity cost too high)

### Scoring
- **Prediction Accuracy:** (100 - |predicted - actual| / predicted * 100)%
- **ROI Achievement:** Actual ROI (negative = loss)
- **Learning Rate:** How quickly you adjusted when wrong
- **Resource Efficiency:** Actual cost vs predicted cost

---

## Original Input

- **Idea Name:** ${inputs.ideaName}
- **Description:** ${inputs.description}
- **Problem:** ${inputs.problem}
- **Target Users:** ${inputs.targetUsers}
- **Constraints:** ${inputs.constraints}
- **Success Criteria:** ${inputs.successCriteria}
- **Timeframe:** ${inputs.timeframe}

---

**This is an Entrepreneur Agent requirements document.**

**Game:** ROI Accuracy  
**Predicted ROI:** ${roi.roi.toFixed(1)}%  
**Break-even:** ${roi.breakEven > 0 ? Math.ceil(roi.breakEven) + ' weeks' : 'Beyond 1 year'}

**Track actuals monthly. Adjust predictions quarterly. Win by being accurate AND profitable.**

---

*Next: Create develop branch and start building the MVP that hits these numbers.*
`;
  },
  
  validators: [
    {
      name: 'roi-positive',
      required: false,
      validate: async (inputs: EntrepreneurInputs) => {
        const roi = calculatePredictedROI(inputs);
        if (roi.roi < 0) {
          return {
            valid: true,  // Still allow, but warn
            warnings: [
              `Predicted ROI is negative (${roi.roi.toFixed(1)}%)`,
              'Consider: increasing price, reducing costs, or growing faster',
            ],
          };
        }
        return { valid: true };
      },
    },
    {
      name: 'break-even-reasonable',
      required: false,
      validate: async (inputs: EntrepreneurInputs) => {
        const roi = calculatePredictedROI(inputs);
        if (roi.breakEven < 0 || roi.breakEven > 104) {  // > 2 years
          return {
            valid: true,
            warnings: [
              'Break-even time is beyond 2 years',
              'High risk - most startups need break-even within 18 months',
            ],
          };
        }
        return { valid: true };
      },
    },
  ],
  
  learningEnabled: true,
  
  understands: ['time', 'money', 'roi', 'customers', 'revenue'],
  
  customCommands: [
    'roi-update',
    'roi-report',
    'track-actual',
  ],
};

