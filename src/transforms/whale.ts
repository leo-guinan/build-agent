/**
 * Whale Transform
 * 
 * Game: Capital Deployment (IMPACT × TIMING)
 * Output: Fundraising Strategy & Capital Allocation
 * 
 * This agent understands:
 * - When to raise capital (optimal timing)
 * - How much to raise (right-sizing)
 * - What to use it for (strategic allocation)
 * - Dilution vs growth tradeoffs
 * - Investor targeting
 * 
 * Primary Mission: Determine optimal fundraising timing and help entrepreneur
 * understand capital deployment for maximum impact.
 */

import type { Transform, TransformedIdeaInputs } from './types.js';

export interface WhaleInputs extends TransformedIdeaInputs {
  // Current State
  currentRevenue: number;
  currentGrowthRate: number;
  currentBurnRate: number;
  monthsRunway: number;
  
  // Fundraising
  consideringRaise: boolean;
  amountToRaise: number;
  currentValuation: number;
  acceptableDilution: number;  // Percentage
  
  // Capital Use
  primaryUse: string;
  hiringPlan: string;
  marketingBudget: number;
  productBudget: number;
  reserveBudget: number;
  
  // Milestones
  nextMilestone: string;
  milestoneTimeline: number;  // Months
  milestoneCost: number;
  
  // Market
  marketTiming: 'hot' | 'normal' | 'cold';
  competitorRaises: string;
  
  // Investor
  investorType: 'angels' | 'seed' | 'series-a' | 'series-b' | 'growth';
  targetInvestors: number;
}

export function calculateRaiseMetrics(inputs: WhaleInputs) {
  // Calculate dilution
  const postMoneyValuation = inputs.currentValuation + inputs.amountToRaise;
  const dilution = (inputs.amountToRaise / postMoneyValuation) * 100;
  
  // Extended runway
  const monthlyBurn = inputs.currentBurnRate;
  const currentRunway = inputs.monthsRunway;
  const additionalMonths = monthlyBurn > 0 ? Math.floor(inputs.amountToRaise / monthlyBurn) : 999;
  const totalRunway = currentRunway + additionalMonths;
  
  // Capital allocation
  const totalBudget = inputs.amountToRaise;
  const allocations = {
    hiring: totalBudget * 0.4,
    marketing: inputs.marketingBudget || totalBudget * 0.3,
    product: inputs.productBudget || totalBudget * 0.15,
    reserve: inputs.reserveBudget || totalBudget * 0.15,
  };
  
  // Timing score (0-100)
  let timingScore = 50; // Base
  
  // Revenue traction (+20)
  if (inputs.currentRevenue > 10000) timingScore += 10;
  if (inputs.currentRevenue > 50000) timingScore += 10;
  
  // Growth rate (+20)
  if (inputs.currentGrowthRate > 10) timingScore += 10;
  if (inputs.currentGrowthRate > 20) timingScore += 10;
  
  // Runway (-20 if low)
  if (inputs.monthsRunway < 3) timingScore -= 20;
  else if (inputs.monthsRunway < 6) timingScore -= 10;
  
  // Market timing (+/-10)
  if (inputs.marketTiming === 'hot') timingScore += 10;
  if (inputs.marketTiming === 'cold') timingScore -= 10;
  
  const timingRecommendation = timingScore >= 70 ? 'RAISE NOW' :
                               timingScore >= 50 ? 'CONSIDER RAISING' :
                               timingScore >= 30 ? 'BUILD MORE FIRST' :
                               'NOT READY';
  
  return {
    dilution,
    acceptableDilution: inputs.acceptableDilution,
    dilutionOk: dilution <= inputs.acceptableDilution,
    totalRunway,
    additionalMonths,
    allocations,
    timingScore,
    timingRecommendation,
    postMoneyValuation,
  };
}

export const whaleTransform: Transform = {
  id: 'whale',
  name: 'Whale Agent',
  description: 'Optimizes capital deployment timing - when to raise, how much, what for',
  
  game: {
    name: 'Capital Deployment',
    description: 'Raise the right amount at the right time for maximum impact',
    metrics: [
      'Fundraise Timing Score',
      'Capital Efficiency',
      'Dilution Management',
      'Runway Extension',
      'Milestone Achievement',
      'Impact per Dollar',
    ],
    successCriteria: 'Raise capital within timing window at acceptable dilution and achieve milestones',
  },
  
  additionalPrompts: [
    {
      name: 'currentRevenue',
      type: 'number',
      message: 'Current monthly revenue (USD):',
      default: 0,
      validate: (input: number) => input >= 0 ? true : 'Must be non-negative',
    },
    {
      name: 'currentGrowthRate',
      type: 'number',
      message: 'Current month-over-month growth rate (%):',
      default: 0,
      validate: (input: number) => input >= -100 && input <= 1000 ? true : 'Must be -100 to 1000%',
    },
    {
      name: 'currentBurnRate',
      type: 'number',
      message: 'Current monthly burn rate (USD):',
      default: 5000,
      validate: (input: number) => input >= 0 ? true : 'Must be non-negative',
    },
    {
      name: 'monthsRunway',
      type: 'number',
      message: 'Current runway (months):',
      default: 12,
      validate: (input: number) => input > 0 ? true : 'Must be positive',
    },
    {
      name: 'consideringRaise',
      type: 'confirm',
      message: 'Considering raising capital?',
      default: true,
    },
    {
      name: 'amountToRaise',
      type: 'number',
      message: 'Amount considering raising (USD):',
      default: 500000,
      validate: (input: number) => input > 0 ? true : 'Must be positive',
    },
    {
      name: 'currentValuation',
      type: 'number',
      message: 'Current valuation estimate (USD):',
      default: 2000000,
      validate: (input: number) => input > 0 ? true : 'Must be positive',
    },
    {
      name: 'acceptableDilution',
      type: 'number',
      message: 'Maximum acceptable dilution (%):',
      default: 20,
      validate: (input: number) => input > 0 && input <= 100 ? true : 'Must be 1-100%',
    },
    {
      name: 'primaryUse',
      type: 'input',
      message: 'Primary use of capital:',
      default: 'Hiring, marketing, product development',
    },
    {
      name: 'hiringPlan',
      type: 'input',
      message: 'Hiring plan (roles/count):',
      default: '2 engineers, 1 marketer, 1 sales',
    },
    {
      name: 'marketingBudget',
      type: 'number',
      message: 'Marketing budget from raise (USD):',
      default: 150000,
    },
    {
      name: 'productBudget',
      type: 'number',
      message: 'Product/development budget (USD):',
      default: 75000,
    },
    {
      name: 'reserveBudget',
      type: 'number',
      message: 'Reserve/buffer budget (USD):',
      default: 75000,
    },
    {
      name: 'nextMilestone',
      type: 'input',
      message: 'Next major milestone:',
      default: '$50k MRR, 100 customers, product-market fit',
    },
    {
      name: 'milestoneTimeline',
      type: 'number',
      message: 'Months to achieve milestone:',
      default: 12,
      validate: (input: number) => input > 0 ? true : 'Must be positive',
    },
    {
      name: 'milestoneCost',
      type: 'number',
      message: 'Estimated cost to reach milestone (USD):',
      default: 400000,
    },
    {
      name: 'marketTiming',
      type: 'list',
      message: 'Current market fundraising climate:',
      choices: ['hot', 'normal', 'cold'],
      default: 'normal',
    },
    {
      name: 'competitorRaises',
      type: 'input',
      message: 'Recent competitor fundraising activity:',
      default: 'Competitor A raised $1M seed, Competitor B raised $3M Series A',
    },
    {
      name: 'investorType',
      type: 'list',
      message: 'Target investor type:',
      choices: ['angels', 'seed', 'series-a', 'series-b', 'growth'],
      default: 'seed',
    },
    {
      name: 'targetInvestors',
      type: 'number',
      message: 'Number of investors to approach:',
      default: 50,
      validate: (input: number) => input > 0 ? true : 'Must approach at least 1 investor',
    },
  ],
  
  requirementsTemplate: (inputs: WhaleInputs) => {
    const metrics = calculateRaiseMetrics(inputs);
    const timestamp = new Date().toISOString();
    
    return `# Requirements: ${inputs.ideaName}

**Type:** Whale Agent  
**Game:** Capital Deployment  
**Output:** Fundraising Strategy & Capital Allocation
**Generated:** ${timestamp}  
**Status:** Draft

---

## 🐋 Fundraising Overview

### Current State
- **Monthly Revenue:** $${inputs.currentRevenue.toLocaleString()}
- **Growth Rate:** ${inputs.currentGrowthRate}% MoM
- **Burn Rate:** $${inputs.currentBurnRate.toLocaleString()}/month
- **Current Runway:** ${inputs.monthsRunway} months

### Proposed Raise
- **Amount:** $${inputs.amountToRaise.toLocaleString()}
- **Pre-Money Valuation:** $${inputs.currentValuation.toLocaleString()}
- **Post-Money Valuation:** $${metrics.postMoneyValuation.toLocaleString()}
- **Dilution:** ${metrics.dilution.toFixed(1)}%
- **Acceptable Dilution:** ${metrics.acceptableDilution}%

${!metrics.dilutionOk ? `
⚠️ **DILUTION WARNING:** ${metrics.dilution.toFixed(1)}% exceeds acceptable ${metrics.acceptableDilution}%

Options:
1. Reduce raise amount to $${Math.floor(inputs.currentValuation * (metrics.acceptableDilution / 100) / (1 - metrics.acceptableDilution / 100)).toLocaleString()}
2. Increase valuation to $${Math.floor((inputs.amountToRaise / (metrics.acceptableDilution / 100)) - inputs.amountToRaise).toLocaleString()}
3. Accept higher dilution
` : ''}

### Extended Runway
- **Additional Months:** ${metrics.additionalMonths}
- **Total Runway:** ${metrics.totalRunway} months
- **Target Milestone:** ${inputs.nextMilestone}
- **Milestone Timeline:** ${inputs.milestoneTimeline} months

${metrics.totalRunway < inputs.milestoneTimeline ? `
⚠️ **RUNWAY WARNING:** ${metrics.totalRunway} months < ${inputs.milestoneTimeline} months to milestone

Need $${((inputs.milestoneTimeline - metrics.totalRunway) * inputs.currentBurnRate).toLocaleString()} more, OR reduce burn rate to $${Math.floor(inputs.amountToRaise / inputs.milestoneTimeline).toLocaleString()}/month
` : ''}

---

## 📊 Game Metrics

### Timing Score: ${metrics.timingScore}/100

**Recommendation:** ${metrics.timingRecommendation}

**Breakdown:**
- Revenue traction: ${inputs.currentRevenue > 50000 ? '+20' : inputs.currentRevenue > 10000 ? '+10' : '0'}
- Growth rate: ${inputs.currentGrowthRate > 20 ? '+20' : inputs.currentGrowthRate > 10 ? '+10' : '0'}
- Runway pressure: ${inputs.monthsRunway < 3 ? '-20' : inputs.monthsRunway < 6 ? '-10' : '0'}
- Market timing: ${inputs.marketTiming === 'hot' ? '+10' : inputs.marketTiming === 'cold' ? '-10' : '0'}

${metrics.timingRecommendation === 'RAISE NOW' ? `
✅ **STRONG TIMING:** Multiple positive signals. Market conditions favorable.
- Action: Begin investor outreach immediately
- Timeline: 3-6 months to close
- Prepare: Deck, financials, data room
` : metrics.timingRecommendation === 'CONSIDER RAISING' ? `
✅ **MODERATE TIMING:** Some positive signals. Could raise now or build more.
- Action: Parallel path (raise + build)
- Timeline: 4-8 months to close
- Decision: Raise if great terms, else keep building
` : metrics.timingRecommendation === 'BUILD MORE FIRST' ? `
⚠️ **BUILD MORE:** Weak signals. Focus on metrics before raising.
- Action: Improve revenue/growth/traction first
- Timeline: 6-12 months before raising
- Target: 2-3x current metrics
` : `
🚫 **NOT READY:** Very weak signals. Raising now would be difficult/dilutive.
- Action: Bootstrap longer, improve fundamentals
- Timeline: 12+ months before raising
- Focus: Product-market fit, revenue, growth
`}

### Tracking Metrics

1. **Fundraise Timing**
   - Target: Raise within optimal window
   - Score: ${metrics.timingScore}/100

2. **Capital Efficiency**
   - Target: ${inputs.milestoneCost.toLocaleString()} to reach milestone
   - Raised: ${inputs.amountToRaise.toLocaleString()}
   - Efficiency: ${((inputs.milestoneCost / inputs.amountToRaise) * 100).toFixed(0)}%

3. **Dilution Management**
   - Actual: ${metrics.dilution.toFixed(1)}%
   - Target: <${metrics.acceptableDilution}%
   - ${metrics.dilutionOk ? '✅ Within limits' : '⚠️ Exceeds target'}

4. **Milestone Achievement**
   - Target: ${inputs.nextMilestone}
   - Timeline: ${inputs.milestoneTimeline} months
   - Runway: ${metrics.totalRunway} months

**Winning:** Raise at acceptable dilution during optimal window and achieve milestones on time.

---

## 1. Overview

### Idea Description
${inputs.description}

### Problem Statement
${inputs.problem}

### Target Users
${inputs.targetUsers}

### Current Traction
- Revenue: $${inputs.currentRevenue.toLocaleString()}/month
- Growth: ${inputs.currentGrowthRate}% MoM
- Burn: $${inputs.currentBurnRate.toLocaleString()}/month

---

## 2. Capital Allocation Strategy

### Total Raise: $${inputs.amountToRaise.toLocaleString()}

**Allocation Breakdown:**

**40% - Hiring (${metrics.allocations.hiring.toLocaleString()})**
${inputs.hiringPlan}
- Average cost per hire: $${(metrics.allocations.hiring / (inputs.hiringPlan.split(',').length || 4)).toLocaleString()}
- Timeline: ${Math.ceil(inputs.milestoneTimeline / 2)} months to fully hire
- Impact: Increase team velocity, expand capabilities

**${Math.round((inputs.marketingBudget / inputs.amountToRaise) * 100)}% - Marketing ($${inputs.marketingBudget.toLocaleString()})**
- Customer acquisition
- Brand building
- Channel expansion
- Target: $${(inputs.marketingBudget / 12).toLocaleString()}/month for ${Math.floor(inputs.amountToRaise / inputs.currentBurnRate)} months

**${Math.round((inputs.productBudget / inputs.amountToRaise) * 100)}% - Product ($${inputs.productBudget.toLocaleString()})**
- Feature development
- Technical infrastructure
- Tools & services
- Quality improvements

**${Math.round((inputs.reserveBudget / inputs.amountToRaise) * 100)}% - Reserve ($${inputs.reserveBudget.toLocaleString()})**
- Buffer for unexpected costs
- Opportunity fund
- Runway extension
- 3-6 months of additional runway

### ROI on Capital

**Expected Outcomes:**
- Revenue: $${inputs.currentRevenue.toLocaleString()} → $${(inputs.currentRevenue * Math.pow(1 + inputs.currentGrowthRate / 100, inputs.milestoneTimeline)).toLocaleString()}
- Customers: Current → ${inputs.nextMilestone.includes('customers') ? inputs.nextMilestone.match(/\\d+/)?.[0] || '?' : '?'}
- Valuation: $${inputs.currentValuation.toLocaleString()} → $${(inputs.currentValuation * 3).toLocaleString()} (target 3x)

**Capital Multiple:**
- Investment: $${inputs.amountToRaise.toLocaleString()}
- Dilution: ${metrics.dilution.toFixed(1)}%
- If 3x valuation: Your equity worth $${((metrics.postMoneyValuation * 3) * (1 - metrics.dilution / 100)).toLocaleString()}
- Value created: $${((metrics.postMoneyValuation * 3) - metrics.postMoneyValuation).toLocaleString()}

---

## 3. Fundraising Strategy

### Target: ${inputs.investorType.charAt(0).toUpperCase() + inputs.investorType.slice(1)} Round

**Investor Profile:**
${getInvestorProfile(inputs.investorType)}

**Approach:**
- **Target Investors:** ${inputs.targetInvestors}
- **Meeting Goal:** 30-50 conversations
- **Term Sheet Goal:** 3-5 offers
- **Timeline:** ${getTimelineByType(inputs.investorType)}

### Outreach Plan

**Month 1-2: Preparation**
- Deck (15-20 slides)
- Financial model (3-year projections)
- Data room (metrics, legal, product)
- Warm introductions (target 20+)

**Month 3-4: Outreach**
- Email ${Math.ceil(inputs.targetInvestors * 0.3)} per week
- 10-15 meetings per week
- Follow-ups with interested (50%)
- Second meetings (30%)

**Month 5-6: Closing**
- Due diligence (2-4 weeks)
- Terms negotiation
- Legal docs
- Wire transfer

### Pitch Structure

**The Hook:**
"We're solving [${inputs.problem}] for [${inputs.targetUsers}]. Currently at $${inputs.currentRevenue.toLocaleString()}/month, growing ${inputs.currentGrowthRate}% MoM. Raising $${inputs.amountToRaise.toLocaleString()} to reach [${inputs.nextMilestone}]."

**The Traction:**
- Revenue: $${inputs.currentRevenue.toLocaleString()}/month
- Growth: ${inputs.currentGrowthRate}% MoM
- Runway: ${inputs.monthsRunway} months
- Momentum: ${inputs.currentGrowthRate > 20 ? 'Strong' : inputs.currentGrowthRate > 10 ? 'Moderate' : 'Building'}

**The Ask:**
- Amount: $${inputs.amountToRaise.toLocaleString()}
- Valuation: $${inputs.currentValuation.toLocaleString()} pre-money
- Use: ${inputs.primaryUse}
- Milestone: ${inputs.nextMilestone} in ${inputs.milestoneTimeline} months

**The Outcome:**
- Valuation: $${(inputs.currentValuation * 3).toLocaleString()} (3x) at next round
- Return: ${((inputs.currentValuation * 3 / metrics.postMoneyValuation) - 1) * 100}% for investors
- Exit: $${(inputs.currentValuation * 10).toLocaleString()}+ potential

---

## 4. Market Timing Analysis

### Current Climate: ${inputs.marketTiming.toUpperCase()}

${getMarketAnalysis(inputs.marketTiming)}

### Competitive Fundraising
${inputs.competitorRaises}

**Implications:**
${inputs.competitorRaises.toLowerCase().includes('raised') ? `
- Validates market opportunity
- Shows investor appetite
- Creates FOMO (fear of missing out)
- May increase valuations
- Easier to raise (proven category)
` : `
- Market may be uncertain
- Need stronger differentiation
- Focus on fundamentals
- Potentially better valuations (less competition)
- Longer fundraise timeline
`}

---

## 5. Dilution & Ownership Strategy

### Current Structure (Pre-Raise)
- Founders: ${100 - (inputs.amountToRaise > 0 ? 15 : 0)}%
- ${inputs.amountToRaise > 0 ? 'Angels/Early: 15%' : 'No previous investors'}
- Option Pool: ${10}%

### Post-Raise Structure
- Founders: ${(100 - (inputs.amountToRaise > 0 ? 15 : 0)) * (1 - metrics.dilution / 100)}%
- Angels/Early: ${inputs.amountToRaise > 0 ? (15 * (1 - metrics.dilution / 100)).toFixed(1) : 0}%
- This Round: ${metrics.dilution.toFixed(1)}%
- Option Pool: ${(10 * (1 - metrics.dilution / 100)).toFixed(1)}%

### Future Dilution Path
- Seed: ${metrics.dilution.toFixed(1)}% (this round)
- Series A: ~20% (if raising)
- Series B: ~15% (if raising)
- Total: ~${(metrics.dilution + 20 + 15).toFixed(1)}%
- Founder ownership at exit: ~${(100 - metrics.dilution - 20 - 15) * 0.5}% (assuming 50/50 split)

**At $${(inputs.currentValuation * 10).toLocaleString()} exit:**
- Your stake: $${((inputs.currentValuation * 10) * ((100 - metrics.dilution - 20 - 15) * 0.5 / 100)).toLocaleString()}

---

## 6. Risk Analysis (Whale Lens)

### Capital Risks

**Risk: Can't raise $${inputs.amountToRaise.toLocaleString()} at $${inputs.currentValuation.toLocaleString()} valuation**
- Impact: Need to lower valuation (more dilution) or raise less
- Probability: ${metrics.timingScore < 50 ? 'High' : metrics.timingScore < 70 ? 'Medium' : 'Low'}
- Mitigation: ${metrics.timingScore < 50 ? 'Build more traction before raising' : 'Approach more investors'}
- Warning Sign: ${inputs.targetInvestors * 0.5} rejections

**Risk: Burn through capital before reaching milestone**
- Impact: Need bridge round (dilutive, difficult)
- Probability: ${metrics.totalRunway < inputs.milestoneTimeline ? 'High' : 'Low'}
- Mitigation: Reduce burn or raise more
- Warning Sign: 80% capital spent, <60% milestone progress

**Risk: Dilution exceeds ${metrics.acceptableDilution}%**
- Impact: ${metrics.dilutionOk ? 'Currently OK' : 'Currently exceeds target'}
- Probability: ${metrics.dilutionOk ? 'Low' : 'High (already exceeds)'}
- Mitigation: ${metrics.dilutionOk ? 'Maintain valuation discipline' : 'Reduce raise amount or increase valuation ask'}
- Warning Sign: Multiple investors pushing for lower valuation

**Risk: Market timing shifts (${inputs.marketTiming} → cold)**
- Impact: Harder to raise, lower valuations, longer timeline
- Probability: Medium (markets change)
- Mitigation: Raise quickly if market is hot, build runway if cold
- Warning Sign: Competitor fundraises slowing, macro uncertainty

---

## 7. Milestone-Based Capital Plan

### Primary Milestone: ${inputs.nextMilestone}

**Timeline:** ${inputs.milestoneTimeline} months  
**Cost:** $${inputs.milestoneCost.toLocaleString()}  
**Raised:** $${inputs.amountToRaise.toLocaleString()}

${inputs.amountToRaise >= inputs.milestoneCost ? `
✅ **SUFFICIENT CAPITAL:** Raise covers milestone with $${(inputs.amountToRaise - inputs.milestoneCost).toLocaleString()} buffer
` : `
⚠️ **INSUFFICIENT CAPITAL:** Need $${(inputs.milestoneCost - inputs.amountToRaise).toLocaleString()} more to reach milestone

Options:
1. Raise $${inputs.milestoneCost.toLocaleString()} instead (${((inputs.milestoneCost / (inputs.currentValuation + inputs.milestoneCost)) * 100).toFixed(1)}% dilution)
2. Reduce milestone scope
3. Plan for follow-on raise
`}

### Sub-Milestones (Quarterly)

**Q1 (Months 1-3):**
- Hire ${inputs.hiringPlan.split(',')[0] || 'first role'}
- Burn: $${(metrics.allocations.hiring / 4 + inputs.currentBurnRate).toLocaleString()}/month
- Checkpoint: Team in place

**Q2 (Months 4-6):**
- Scale marketing ($${(inputs.marketingBudget / 2).toLocaleString()})
- Burn: $${(metrics.allocations.marketing / 4 + inputs.currentBurnRate).toLocaleString()}/month
- Checkpoint: Customer growth accelerating

**Q3 (Months 7-9):**
- Product expansion ($${inputs.productBudget.toLocaleString()})
- Burn: $${(metrics.allocations.product / 3 + inputs.currentBurnRate).toLocaleString()}/month
- Checkpoint: Feature parity with roadmap

**Q4 (Months 10-12):**
- Hit milestone: ${inputs.nextMilestone}
- Burn: $${inputs.currentBurnRate.toLocaleString()}/month (stabilized)
- Checkpoint: Ready for next round

---

## 8. Tracking & Learning System

### Monthly Capital Check-ins

**Burn Actuals:**
- [ ] Monthly spend: $______
- [ ] Burn rate: $______/month
- [ ] vs Budget: ______%
- [ ] Runway remaining: ______ months

**Milestone Progress:**
- [ ] % Complete: ______%
- [ ] On track? (Y/N)
- [ ] Blockers: ______
- [ ] Adjustment needed? (Y/N)

**Capital Efficiency:**
- [ ] $ spent per milestone %: $______
- [ ] Efficiency score: ______%
- [ ] Waste identified: $______
- [ ] Reallocation needed: $______

**Fundraise Progress (if active):**
- [ ] Investors approached: ______
- [ ] Meetings held: ______
- [ ] Second meetings: ______
- [ ] Term sheets: ______
- [ ] Timeline: On track / Delayed / Ahead

---

## 9. Integration with Other Agents

### Shares Capital Context

**→ Entrepreneur:**
- Capital availability updates
- Burn rate constraints
- Dilution implications
- Investor expectations

**→ Builder:**
- Product budget allocation
- Hiring timeline
- Infrastructure budget
- Build vs buy decisions

**→ Activist:**
- Marketing budget
- CAC targets
- Channel budget allocation
- Growth expectations

**→ Speculator:**
- Revenue growth requirements
- Milestone targets
- Valuation expectations
- Next round timing

**→ Researcher:**
- Investor feedback themes
- Market timing signals
- Competitive fundraises
- Valuation benchmarks

---

## 10. Whale Game Rules

### How to Win
1. **Raise during optimal window** (timing score >70)
2. **Stay within dilution limits** (<${metrics.acceptableDilution}%)
3. **Achieve milestones on budget** (±10%)
4. **Deploy capital efficiently** (minimize waste)

### How to Lose
1. Raise too early (weak metrics, high dilution)
2. Raise too late (runway crisis, bridge round)
3. Burn through capital without progress
4. Miss milestones (need more capital)

### Scoring
- **Timing:** (100 - |optimal_timing - actual_timing| weeks)
- **Dilution:** (100 - |target_dilution - actual_dilution|%)
- **Efficiency:** (milestone_cost / actual_spend) × 100
- **Achievement:** Milestone reached? (Yes = 100, No = 0)

**Overall Score:** (Timing + Dilution + Efficiency + Achievement) / 4

Target: >80% overall score

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

**This is a Whale Agent requirements document.**

**Game:** Capital Deployment  
**Timing Score:** ${metrics.timingScore}/100  
**Recommendation:** ${metrics.timingRecommendation}  
**Raise:** $${inputs.amountToRaise.toLocaleString()} at ${metrics.dilution.toFixed(1)}% dilution  
**Runway:** ${metrics.totalRunway} months

**Raise at the right time, for the right amount, at the right valuation. Deploy efficiently. Hit milestones.**

---

*Next: ${metrics.timingRecommendation === 'RAISE NOW' ? 'Start investor outreach immediately' : metrics.timingRecommendation === 'CONSIDER RAISING' ? 'Prepare deck while building metrics' : 'Focus on traction first, raise later'}.*
`;
  },
  
  validators: [
    {
      name: 'dilution-acceptable',
      required: false,
      validate: async (inputs: WhaleInputs) => {
        const metrics = calculateRaiseMetrics(inputs);
        if (!metrics.dilutionOk) {
          return {
            valid: true,
            warnings: [
              `Dilution ${metrics.dilution.toFixed(1)}% exceeds acceptable ${metrics.acceptableDilution}%`,
              'Consider reducing raise amount or increasing valuation',
            ],
          };
        }
        return { valid: true };
      },
    },
    {
      name: 'runway-sufficient',
      required: false,
      validate: async (inputs: WhaleInputs) => {
        const metrics = calculateRaiseMetrics(inputs);
        if (metrics.totalRunway < inputs.milestoneTimeline) {
          return {
            valid: true,
            warnings: [
              `Runway ${metrics.totalRunway} months < Milestone timeline ${inputs.milestoneTimeline} months`,
              'Need to raise more or reduce burn rate',
            ],
          };
        }
        return { valid: true };
      },
    },
  ],
  
  learningEnabled: true,
  
  understands: ['time', 'money', 'capital', 'dilution', 'valuation', 'milestones', 'investors', 'runway'],
  
  customCommands: [
    'raise-timing',
    'capital-efficiency',
    'milestone-check',
  ],
};

// Helper functions

function getInvestorProfile(type: string): string {
  const profiles: Record<string, string> = {
    angels: `**Angel Investors**
- Check size: $25k-$100k
- Decision time: 2-4 weeks
- Typically: Successful entrepreneurs, executives
- Value-add: Advice, intros, mentorship
- Expectation: High risk, potential 10-100x return`,
    
    seed: `**Seed VCs**
- Check size: $500k-$2M
- Decision time: 1-3 months
- Focus: Early traction, team, market
- Value-add: Network, recruiting, next round
- Expectation: Product-market fit, path to $1M ARR`,
    
    'series-a': `**Series A VCs**
- Check size: $2M-$15M
- Decision time: 2-4 months
- Focus: Proven model, growth, unit economics
- Value-add: Board seat, strategic guidance, recruitment
- Expectation: $1M+ ARR, clear path to $10M ARR`,
    
    'series-b': `**Series B VCs**
- Check size: $15M-$50M
- Decision time: 3-6 months
- Focus: Scale, efficiency, market dominance
- Value-add: Board seat, partnerships, M&A strategy
- Expectation: $5M+ ARR, proven scalability`,
    
    growth: `**Growth Equity**
- Check size: $50M+
- Decision time: 3-6 months
- Focus: Revenue, profitability potential, market leadership
- Value-add: Operational expertise, exits, partnerships
- Expectation: $20M+ ARR, path to profitability`,
  };
  
  return profiles[type] || 'General investors';
}

function getTimelineByType(type: string): string {
  const timelines: Record<string, string> = {
    angels: '2-4 months (faster decisions)',
    seed: '3-6 months (thorough diligence)',
    'series-a': '4-8 months (extensive diligence)',
    'series-b': '6-12 months (deep diligence)',
    growth: '6-12 months (comprehensive diligence)',
  };
  
  return timelines[type] || '3-6 months';
}

function getMarketAnalysis(timing: string): string {
  const analyses: Record<string, string> = {
    hot: `**HOT MARKET**
- ✅ Investors actively deploying capital
- ✅ Higher valuations
- ✅ Faster processes
- ✅ FOMO working in your favor
- ✅ Good time to raise

**Action:** Move quickly, capitalize on momentum`,
    
    normal: `**NORMAL MARKET**
- Steady investor activity
- Fair valuations
- Standard timelines
- Quality deals get done
- Fundamentals matter

**Action:** Execute standard fundraise process`,
    
    cold: `**COLD MARKET**
- ⚠️ Investors more cautious
- ⚠️ Lower valuations
- ⚠️ Longer timelines
- ⚠️ Higher bar for traction
- ⚠️ Difficult environment

**Action:** Consider waiting if runway allows, or accept tougher terms`,
  };
  
  return analyses[timing] || '';
}

