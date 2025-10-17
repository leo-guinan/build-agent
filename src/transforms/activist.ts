/**
 * Activist Transform
 * 
 * Game: Pivot Speed (Time to Right Answer)
 * Output: Marketing Page + Customer Acquisition Strategy
 * 
 * This agent understands:
 * - Customer feedback velocity
 * - Pivot decision speed
 * - Marketing channel effectiveness
 * - Messaging iteration rate
 * - Market fit indicators
 * 
 * Primary Mission: Build marketing page that acquires customers and
 * enables rapid iteration based on feedback.
 */

import type { Transform, TransformedIdeaInputs } from './types.js';

export interface ActivistInputs extends TransformedIdeaInputs {
  // Market Positioning
  uniqueValueProposition: string;
  targetSegment: string;
  competitorsDifferentiator: string;
  
  // Customer Acquisition
  primaryChannel: string;
  secondaryChannels: string[] | string;
  initialBudget: number;
  targetLeads: number;
  weeksToValidate: number;
  
  // Iteration
  pivotTriggers: string[] | string;
  feedbackFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  minFeedbackSamples: number;
  
  // Marketing Page
  landingPageStyle: 'minimal' | 'detailed' | 'video' | 'interactive';
  ctaPrimary: string;
  socialProof: boolean;
  
  // Experimentation
  abTestingEnabled: boolean;
  metricsToTrack: string[] | string;
}

/**
 * Pivot Speed Calculator
 */
export function calculatePivotMetrics(inputs: ActivistInputs): {
  weeksToFirstPivot: number;
  feedbackCyclesPerMonth: number;
  costPerLead: number;
  leadsNeededForValidation: number;
  pivotRisk: string;
  channelDiversity: string;
} {
  // Feedback cycles per month
  const cyclesPerMonth = inputs.feedbackFrequency === 'daily' ? 22 :
                        inputs.feedbackFrequency === 'weekly' ? 4 :
                        inputs.feedbackFrequency === 'biweekly' ? 2 : 1;
  
  // Cost per lead (rough estimate by channel)
  const channelCosts: Record<string, number> = {
    'organic_social': 0,
    'paid_social': 5,
    'content_marketing': 2,
    'seo': 1,
    'email': 0.5,
    'paid_search': 10,
    'influencer': 15,
    'direct_sales': 50,
  };
  
  const costPerLead = channelCosts[inputs.primaryChannel.toLowerCase().replace(/\s+/g, '_')] || 5;
  
  // Leads needed for statistical validation
  const leadsNeededForValidation = Math.max(inputs.minFeedbackSamples, 30);
  
  // Weeks to first pivot decision
  const weeksToFirstPivot = Math.max(
    inputs.weeksToValidate,
    Math.ceil(leadsNeededForValidation / (inputs.targetLeads / inputs.weeksToValidate))
  );
  
  // Pivot risk assessment
  const pivotRisk = inputs.pivotTriggers.length < 3 ?
    'HIGH - Few triggers, may miss signals' :
    inputs.feedbackFrequency === 'monthly' ?
    'MEDIUM-HIGH - Slow feedback, late pivots' :
    inputs.minFeedbackSamples < 20 ?
    'MEDIUM - Small sample, statistical risk' :
    'LOW - Well-defined process';
  
  // Channel diversity
  const channelDiversity = inputs.secondaryChannels.length === 0 ?
    'RISKY - Single channel dependency' :
    inputs.secondaryChannels.length < 2 ?
    'MODERATE - Limited backup' :
    'GOOD - Multiple channels';
  
  return {
    weeksToFirstPivot,
    feedbackCyclesPerMonth: cyclesPerMonth,
    costPerLead,
    leadsNeededForValidation,
    pivotRisk,
    channelDiversity,
  };
}

/**
 * Activist Transform Definition
 */
export const activistTransform: Transform = {
  id: 'activist',
  name: 'Activist Agent',
  description: 'Optimizes for pivot speed - builds marketing page and validates fast',
  
  game: {
    name: 'Pivot Speed',
    description: 'Find product-market fit by iterating quickly based on feedback',
    metrics: [
      'Time to First Pivot',
      'Feedback Cycles per Month',
      'Cost per Lead',
      'Conversion Rate',
      'Message-Market Fit Score',
      'Pivot Accuracy',
    ],
    successCriteria: 'Reach validated product-market fit within predicted pivot cycles',
  },
  
  additionalPrompts: [
    {
      name: 'uniqueValueProposition',
      type: 'input',
      message: 'Unique value proposition (one sentence):',
      validate: (input: string) => input.length > 10 ? true : 'UVP must be descriptive',
    },
    {
      name: 'targetSegment',
      type: 'input',
      message: 'Specific target segment (not just "developers"):',
      validate: (input: string) => input.length > 5 ? true : 'Be more specific',
    },
    {
      name: 'competitorsDifferentiator',
      type: 'input',
      message: 'How are you different from competitors?',
      validate: (input: string) => input.length > 10 ? true : 'Explain differentiation',
    },
    {
      name: 'primaryChannel',
      type: 'list',
      message: 'Primary customer acquisition channel:',
      choices: [
        'Organic Social',
        'Paid Social',
        'Content Marketing',
        'SEO',
        'Email',
        'Paid Search',
        'Influencer',
        'Direct Sales',
      ],
      default: 'Organic Social',
    },
    {
      name: 'secondaryChannels',
      type: 'input',
      message: 'Secondary channels (comma-separated):',
      default: 'Content Marketing, Email',
    },
    {
      name: 'initialBudget',
      type: 'number',
      message: 'Marketing budget for validation period (USD):',
      default: 1000,
      validate: (input: number) => input >= 0 ? true : 'Budget must be non-negative',
    },
    {
      name: 'targetLeads',
      type: 'number',
      message: 'Target leads for validation:',
      default: 100,
      validate: (input: number) => input > 0 ? true : 'Must target at least 1 lead',
    },
    {
      name: 'weeksToValidate',
      type: 'number',
      message: 'Weeks to validate product-market fit:',
      default: 4,
      validate: (input: number) => input > 0 ? true : 'Must have at least 1 week',
    },
    {
      name: 'pivotTriggers',
      type: 'input',
      message: 'Pivot triggers (comma-separated):',
      default: 'low conversion rate, negative feedback, wrong audience, better opportunity',
    },
    {
      name: 'feedbackFrequency',
      type: 'list',
      message: 'How often will you collect feedback?',
      choices: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly',
    },
    {
      name: 'minFeedbackSamples',
      type: 'number',
      message: 'Minimum feedback samples before pivoting:',
      default: 30,
      validate: (input: number) => input >= 10 ? true : 'Need at least 10 samples for validity',
    },
    {
      name: 'landingPageStyle',
      type: 'list',
      message: 'Landing page style:',
      choices: ['minimal', 'detailed', 'video', 'interactive'],
      default: 'minimal',
    },
    {
      name: 'ctaPrimary',
      type: 'input',
      message: 'Primary call-to-action:',
      default: 'Join Waitlist',
      validate: (input: string) => input.length > 0 ? true : 'CTA required',
    },
    {
      name: 'socialProof',
      type: 'confirm',
      message: 'Include social proof (testimonials, logos)?',
      default: false,
    },
    {
      name: 'abTestingEnabled',
      type: 'confirm',
      message: 'Enable A/B testing for landing page?',
      default: true,
    },
    {
      name: 'metricsToTrack',
      type: 'input',
      message: 'Metrics to track (comma-separated):',
      default: 'conversion rate, bounce rate, time on page, signup rate',
    },
  ],
  
  requirementsTemplate: (inputs: ActivistInputs) => {
    const metrics = calculatePivotMetrics(inputs);
    const channels = typeof inputs.secondaryChannels === 'string'
      ? inputs.secondaryChannels.split(',').map((s: string) => s.trim())
      : inputs.secondaryChannels;
    const triggers = typeof inputs.pivotTriggers === 'string'
      ? inputs.pivotTriggers.split(',').map((s: string) => s.trim())
      : inputs.pivotTriggers;
    const tracked = typeof inputs.metricsToTrack === 'string'
      ? inputs.metricsToTrack.split(',').map((s: string) => s.trim())
      : inputs.metricsToTrack;
    const timestamp = new Date().toISOString();
    
    return `# Requirements: ${inputs.ideaName}

**Type:** Activist Agent  
**Game:** Pivot Speed  
**Output:** Marketing Page + Acquisition Strategy
**Generated:** ${timestamp}  
**Status:** Draft

---

## 🔄 Pivot Overview

### Speed Metrics
- **Weeks to First Pivot Decision:** ${metrics.weeksToFirstPivot}
- **Feedback Cycles per Month:** ${metrics.feedbackCyclesPerMonth}
- **Cost per Lead:** $${metrics.costPerLead}
- **Leads for Validation:** ${metrics.leadsNeededForValidation}
- **Target Leads:** ${inputs.targetLeads} in ${inputs.weeksToValidate} weeks

### Risk Assessment
- **Pivot Process Risk:** ${metrics.pivotRisk}
- **Channel Diversity:** ${metrics.channelDiversity}
- **Budget Sufficiency:** ${inputs.initialBudget >= (metrics.costPerLead * metrics.leadsNeededForValidation) ? '✅ Sufficient' : '⚠️ Insufficient'}

${inputs.initialBudget < (metrics.costPerLead * metrics.leadsNeededForValidation) ? `
⚠️ **BUDGET WARNING:** Need $${(metrics.costPerLead * metrics.leadsNeededForValidation).toFixed(0)} for ${metrics.leadsNeededForValidation} leads
- Current budget: $${inputs.initialBudget}
- Shortfall: $${((metrics.costPerLead * metrics.leadsNeededForValidation) - inputs.initialBudget).toFixed(0)}
- Solution: Use ${channels[0] || 'organic channels'} more, reduce paid spend
` : ''}

${metrics.feedbackCyclesPerMonth < 4 ? `
⚠️ **SLOW FEEDBACK:** ${metrics.feedbackCyclesPerMonth} cycles/month is slow
- Risk: Miss market signals, waste time on wrong direction
- Recommendation: Increase feedback frequency to weekly
` : ''}

${channels.length === 0 ? `
⚠️ **SINGLE CHANNEL RISK:** Only using ${inputs.primaryChannel}
- Risk: If channel fails, acquisition stops
- Recommendation: Add at least 2 secondary channels
` : ''}

${triggers.length < 3 ? `
⚠️ **FEW PIVOT TRIGGERS:** Only ${triggers.length} defined
- Risk: May not recognize when to pivot
- Recommendation: Define at least 5 specific triggers
` : ''}

---

## 📊 Game Metrics

This idea will be tracked against:

1. **Time to First Pivot**
   - Predicted: ${metrics.weeksToFirstPivot} weeks
   - Target: Make first pivot decision (even if "don't pivot")
   
2. **Feedback Velocity**
   - Predicted: ${metrics.feedbackCyclesPerMonth} cycles/month
   - Target: Maintain consistent feedback collection
   
3. **Cost per Lead**
   - Predicted: $${metrics.costPerLead}
   - Target: Stay within ±$${(metrics.costPerLead * 0.3).toFixed(2)}
   
4. **Conversion Rate**
   - Target: >2% for cold traffic, >10% for warm
   - Track: Weekly improvement trend
   
5. **Pivot Accuracy**
   - Target: Pivots lead to improved metrics
   - Track: Before/after comparison

**Winning this game means:** Find product-market fit quickly by pivoting based on data, not hunches.

---

## 1. Overview

### Idea Description
${inputs.description}

### Problem Statement
${inputs.problem}

### Target Users
${inputs.targetUsers}

### Specific Target Segment
${inputs.targetSegment}

### Unique Value Proposition
**"${inputs.uniqueValueProposition}"**

### Competitive Differentiation
${inputs.competitorsDifferentiator}

### Primary Output
**Marketing Page** - Landing page that validates value proposition and acquires leads for feedback.

---

## 2. Objectives

### Primary Goal
Launch marketing page and collect ${metrics.leadsNeededForValidation} validated leads in ${inputs.weeksToValidate} weeks to make first pivot decision.

### Success Criteria (Activist Game)
- ✅ Launch landing page in Week 1
- ✅ Get ${inputs.targetLeads} leads in ${inputs.weeksToValidate} weeks
- ✅ Collect ${metrics.feedbackCyclesPerMonth} feedback cycles/month
- ✅ Make first pivot decision by Week ${metrics.weeksToFirstPivot}
- ✅ Cost per lead under $${metrics.costPerLead * 1.5}
- ✅ Conversion rate >2% (cold) or >10% (warm)
- ✅ ${inputs.successCriteria}

### Timeline
- **Week 1:** Launch landing page
- **Week 2-${inputs.weeksToValidate}:** Acquire leads, collect feedback
- **Week ${metrics.weeksToFirstPivot}:** First pivot decision
- **Target:** ${inputs.timeframe}

---

## 3. Marketing Page Requirements

### Landing Page Style
**${inputs.landingPageStyle.charAt(0).toUpperCase() + inputs.landingPageStyle.slice(1)}** approach

${getLandingPageDetails(inputs.landingPageStyle)}

### Page Structure

**Hero Section:**
- Headline: ${inputs.uniqueValueProposition}
- Subheadline: ${inputs.competitorsDifferentiator}
- Primary CTA: "${inputs.ctaPrimary}"
- Hero Image/Video: ${inputs.landingPageStyle === 'video' ? 'Explainer video' : 'Product screenshot'}

**Problem Section:**
- Paint the pain: ${inputs.problem}
- Target audience: ${inputs.targetSegment}
- Current solutions suck: ${inputs.competitorsDifferentiator}

**Solution Section:**
- Our approach: ${inputs.uniqueValueProposition}
- Key benefits: [3-5 bullets based on user interviews]
- How it works: [3-step process]

**Social Proof Section:**
${inputs.socialProof ? `
- Early user testimonials
- Logos (if B2B)
- Usage statistics
- Media mentions
` : `
- Skip for MVP (no social proof yet)
- Add after first 10 happy users
`}

**CTA Section:**
- Primary: "${inputs.ctaPrimary}"
- Secondary: "Learn More" (link to FAQ/demo)
- Form: Email only (minimize friction)

**Footer:**
- About us (1 sentence)
- Contact
- Privacy policy (required)
- Social links

### A/B Testing Setup
${inputs.abTestingEnabled ? `
**Test Variants:**
1. Headline variations (3 versions)
2. CTA copy (2 versions)
3. Hero image vs video (2 versions)
4. Pricing visibility (show vs hide)

**Tool:** Vercel A/B testing or Posthog
**Sample Size:** ${Math.ceil(metrics.leadsNeededForValidation / 2)} per variant
**Duration:** ${Math.ceil(inputs.weeksToValidate / 2)} weeks per test
` : `
**No A/B testing initially**
- Get traffic first, then test
- Need ${metrics.leadsNeededForValidation}+ visitors for valid tests
`}

---

## 4. Customer Acquisition Strategy

### Primary Channel: ${inputs.primaryChannel}
${getChannelStrategy(inputs.primaryChannel)}

**Week 1 Actions:**
${getWeekOneActions(inputs.primaryChannel)}

**Weekly Cadence:**
${getWeeklyCadence(inputs.primaryChannel)}

**Expected Results:**
- Cost per lead: $${metrics.costPerLead}
- Leads per week: ${Math.ceil(inputs.targetLeads / inputs.weeksToValidate)}
- Total budget: $${inputs.initialBudget}
- Runway: ${Math.floor(inputs.initialBudget / (metrics.costPerLead * (inputs.targetLeads / inputs.weeksToValidate)))} weeks

### Secondary Channels
${channels.map((channel: string, i: number) => `
**${i + 1}. ${channel}**
${getChannelStrategy(channel)}
`).join('\n')}

### Budget Allocation
- **${inputs.primaryChannel}:** ${Math.floor((inputs.initialBudget * 0.6))} (60%)
- **${channels[0] || 'Secondary'}:** ${Math.floor((inputs.initialBudget * 0.25))} (25%)
- **${channels[1] || 'Testing'}:** ${Math.floor((inputs.initialBudget * 0.15))} (15%)

---

## 5. Feedback & Iteration System

### Feedback Collection (${inputs.feedbackFrequency})

**What to Ask:**
1. "What problem were you trying to solve?"
2. "Is this ${inputs.uniqueValueProposition} valuable to you?"
3. "What's missing or confusing?"
4. "Would you pay $X for this?"
5. "What alternatives are you considering?"

**Collection Methods:**
- Email surveys (Typeform)
- Quick Zoom calls (15 min, top 10 leads)
- Landing page poll
- CTA click tracking

**Sample Size:** ${inputs.minFeedbackSamples} minimum before pivot decision

### Metrics to Track
${tracked.map((metric: string, i: number) => `${i + 1}. **${metric.charAt(0).toUpperCase() + metric.slice(1)}**`).join('\n')}

**Tools:**
- Analytics: Plausible or Posthog
- Heatmaps: Hotjar
- Surveys: Typeform
- Tracking: Custom events

---

## 6. Pivot Decision Framework

### Pivot Triggers (When to Change)
${triggers.map((trigger: string, i: number) => `${i + 1}. **${trigger.charAt(0).toUpperCase() + trigger.slice(1)}**`).join('\n')}

### Decision Matrix

**Week ${metrics.weeksToFirstPivot} Pivot Decision:**

**IF** conversion rate <1% **THEN** pivot messaging or audience
**IF** bounce rate >70% **THEN** pivot landing page design
**IF** negative feedback >50% **THEN** pivot value proposition
**IF** wrong audience >30% **THEN** pivot targeting
**IF** pricing concerns >60% **THEN** pivot pricing or positioning

**ELSE IF** metrics improving **THEN** don't pivot, scale what works

### Types of Pivots

**1. Messaging Pivot** (fastest, 1-2 days)
- Change headline/copy
- Test new value prop
- Reframe benefits

**2. Audience Pivot** (fast, 3-5 days)
- Target different segment
- Adjust channel strategy
- Modify messaging for new audience

**3. Feature Pivot** (medium, 1-2 weeks)
- Emphasize different benefits
- Add/remove features
- Change product positioning

**4. Business Model Pivot** (slow, 2-4 weeks)
- B2C to B2B (or reverse)
- Free to paid
- Pricing structure

**5. Complete Pivot** (slowest, 4+ weeks)
- Different problem
- Different solution
- Essentially new product

**Goal:** Make smallest pivot that solves the biggest problem.

---

## 7. Risk Analysis (Activist Lens)

### Market Risks

**Risk: Wrong target segment**
- Impact: Low conversion, wasted acquisition spend
- Probability: High (50%+ startups target wrong initially)
- Mitigation: Talk to 10+ users before launch
- Warning Sign: <1% conversion after 100 visitors

**Risk: Value proposition doesn't resonate**
- Impact: High bounce rate, low engagement
- Probability: Medium
- Mitigation: A/B test 3+ headline variations
- Warning Sign: <30 seconds average time on page

**Risk: Can't acquire ${inputs.targetLeads} leads in ${inputs.weeksToValidate} weeks**
- Impact: Can't validate, no data for pivot
- Probability: ${inputs.primaryChannel === 'Organic Social' ? 'High' : inputs.primaryChannel.includes('Paid') ? 'Low' : 'Medium'}
- Mitigation: Have ${channels.length} backup channels ready
- Warning Sign: Week ${Math.ceil(inputs.weeksToValidate / 2)} and <${Math.ceil(inputs.targetLeads * 0.25)} leads

### Execution Risks

**Risk: Too slow to pivot**
- Impact: Waste months on wrong direction
- Probability: ${inputs.feedbackFrequency === 'monthly' ? 'High' : inputs.feedbackFrequency === 'biweekly' ? 'Medium' : 'Low'}
- Mitigation: ${inputs.feedbackFrequency} feedback cadence
- Warning Sign: Still gathering data at Week ${metrics.weeksToFirstPivot + 2}

**Risk: Pivot too early (insufficient data)**
- Impact: Abandon working approach prematurely
- Probability: ${inputs.minFeedbackSamples < 30 ? 'High' : 'Low'}
- Mitigation: Require ${inputs.minFeedbackSamples} samples minimum
- Warning Sign: Pivoting based on 5-10 data points

**Risk: Budget depleted before validation**
- Impact: Can't acquire enough leads
- Probability: ${inputs.initialBudget < (metrics.costPerLead * metrics.leadsNeededForValidation) ? 'High' : 'Low'}
- Mitigation: Start with organic, layer in paid
- Warning Sign: 80% budget spent, <50% leads acquired

---

## 8. Tracking & Learning System

### Weekly Check-ins
*Update every ${inputs.feedbackFrequency}*

**Acquisition Actuals:**
- [ ] Leads acquired: ______
- [ ] Cost per lead: $______
- [ ] Conversion rate: ______%
- [ ] Primary channel performance: ______
- [ ] Secondary channels tested: ______

**Feedback Actuals:**
- [ ] Feedback responses: ______
- [ ] Positive signals: ______%
- [ ] Negative signals: ______%
- [ ] Feature requests: ______
- [ ] Pricing feedback: ______

**Metrics Actuals:**
${tracked.map((metric: string) => `- [ ] ${metric.charAt(0).toUpperCase() + metric.slice(1)}: ______`).join('\n')}

**Pivot Signals:**
- [ ] Any triggers activated? ______
- [ ] Data sufficient for decision? (Y/N)
- [ ] Confidence in current direction: Low/Medium/High

**Learning Adjustments:**
- [ ] Messaging resonates? (Y/N + changes)
- [ ] Audience correct? (Y/N + pivot)
- [ ] Channels effective? (Y/N + reallocation)
- [ ] Pricing acceptable? (Y/N + adjustment)

---

## 9. Go/No-Go Decision Points

### Week 1 Checkpoint
**If NO to any, fix immediately:**
- [ ] Landing page live?
- [ ] Analytics tracking working?
- [ ] Primary acquisition channel active?
- [ ] CTA functional?
- [ ] First 10 visitors acquired?

### Week ${Math.ceil(inputs.weeksToValidate / 2)} Checkpoint
**If NO to any, pivot or intensify:**
- [ ] ${Math.ceil(inputs.targetLeads * 0.4)} leads acquired?
- [ ] Conversion rate >1%?
- [ ] Feedback collection working?
- [ ] On track for ${inputs.targetLeads} leads?
- [ ] Any positive signals?

### Week ${metrics.weeksToFirstPivot} Checkpoint (PIVOT DECISION)
**Make decision based on data:**
- [ ] ${metrics.leadsNeededForValidation}+ feedback samples?
- [ ] Clear signal (positive or negative)?
- [ ] Metrics trending (up or down)?
- [ ] Know what to do next?

**Decision:** 
- [ ] SCALE (metrics good, double down)
- [ ] PIVOT (metrics bad, change course)
- [ ] ITERATE (metrics mixed, make adjustments)
- [ ] KILL (no path forward)

---

## 10. Activist Game Rules

### How to Win
1. **Launch fast** (Week 1, not Week 4)
2. **Get feedback fast** (${inputs.feedbackFrequency}, not "eventually")
3. **Pivot based on data** (not gut feeling)
4. **Find PMF quickly** (${metrics.weeksToFirstPivot} weeks, not 6 months)

### How to Lose
1. Build for months without feedback
2. Ignore negative signals ("they just don't get it")
3. Pivot without data (random changes)
4. Give up before validation (quit at Week ${metrics.weeksToFirstPivot - 1})

### Scoring
- **Time to Validation:** (Target weeks - Actual weeks) = better if negative
- **Pivot Accuracy:** (Metrics after pivot > Metrics before pivot) = success
- **Cost Efficiency:** (Predicted cost per lead / Actual cost per lead) × 100%
- **Feedback Quality:** Did you get actionable insights?

**Overall Score:** Did you find PMF or definitively kill the idea faster than expected?

Target: Make informed decision in <${metrics.weeksToFirstPivot * 1.5} weeks

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

**This is an Activist Agent requirements document.**

**Game:** Pivot Speed  
**Output:** Marketing Page + Acquisition Strategy  
**Target:** ${inputs.targetLeads} leads in ${inputs.weeksToValidate} weeks  
**First Pivot:** Week ${metrics.weeksToFirstPivot}  
**Primary Channel:** ${inputs.primaryChannel}

**Launch fast. Collect feedback. Pivot smart. Find PMF.**

---

*Next: Build landing page Week 1. Start acquisition Day 1. Make pivot decision by Week ${metrics.weeksToFirstPivot}.*
`;
  },
  
  validators: [
    {
      name: 'budget-sufficient',
      required: false,
      validate: async (inputs: ActivistInputs) => {
        const metrics = calculatePivotMetrics(inputs);
        if (inputs.initialBudget < (metrics.costPerLead * metrics.leadsNeededForValidation)) {
          return {
            valid: true,
            warnings: [
              `Budget ($${inputs.initialBudget}) may be insufficient for ${metrics.leadsNeededForValidation} leads`,
              `Estimated need: $${(metrics.costPerLead * metrics.leadsNeededForValidation).toFixed(0)}`,
            ],
          };
        }
        return { valid: true };
      },
    },
    {
      name: 'feedback-frequency',
      required: false,
      validate: async (inputs: ActivistInputs) => {
        const metrics = calculatePivotMetrics(inputs);
        if (metrics.feedbackCyclesPerMonth < 4) {
          return {
            valid: true,
            warnings: [
              `Only ${metrics.feedbackCyclesPerMonth} feedback cycles/month is slow`,
              'Consider weekly feedback for faster iteration',
            ],
          };
        }
        return { valid: true };
      },
    },
  ],
  
  learningEnabled: true,
  
  understands: ['time', 'feedback', 'conversion', 'marketing', 'pivots', 'customers'],
  
  customCommands: [
    'pivot-check',
    'feedback-report',
    'channel-analysis',
  ],
};

// Helper functions

function getLandingPageDetails(style: string): string {
  const details: Record<string, string> = {
    minimal: `
**Minimal Style:**
- Single-page, fast load
- One primary CTA above fold
- 3-5 key benefits maximum
- Clean, uncluttered design
- Perfect for: Testing value prop quickly`,
    
    detailed: `
**Detailed Style:**
- Multi-section page
- Features, benefits, FAQ, pricing
- Multiple CTAs throughout
- Trust signals everywhere
- Perfect for: B2B or complex products`,
    
    video: `
**Video-First Style:**
- Explainer video hero
- 60-90 seconds max
- Minimal text
- Video CTA at end
- Perfect for: Visual products or complex concepts`,
    
    interactive: `
**Interactive Style:**
- Product demo or calculator
- User engagement required
- Show value before CTA
- Higher engagement
- Perfect for: Tools, SaaS, calculators`,
  };
  
  return details[style] || '';
}

function getChannelStrategy(channel: string): string {
  const normalized = channel.toLowerCase().replace(/\s+/g, '_');
  const strategies: Record<string, string> = {
    organic_social: `
**Organic Social Strategy:**
- Platform: Twitter/LinkedIn for B2B, Instagram/TikTok for B2C
- Frequency: Daily posts
- Content: Value first, promotion second (80/20 rule)
- Engagement: Reply to comments, join conversations
- Growth: Consistent posting for 3+ months`,
    
    paid_social: `
**Paid Social Strategy:**
- Platform: Facebook/Instagram for B2C, LinkedIn for B2B
- Budget: $10-50/day to start
- Targeting: Specific demographics, interests, behaviors
- Creative: Multiple ad variations
- Optimization: Daily monitoring, weekly adjustments`,
    
    content_marketing: `
**Content Marketing Strategy:**
- Format: Blog posts, guides, case studies
- Frequency: 2-3 posts per week
- SEO: Keyword research, optimization
- Distribution: Social, email, communities
- Timeline: 3-6 months for results`,
    
    seo: `
**SEO Strategy:**
- Keywords: Long-tail, specific to problem
- Content: High-quality, problem-solving
- Technical: Fast site, mobile-friendly
- Backlinks: Guest posts, partnerships
- Timeline: 6-12 months for organic traffic`,
    
    email: `
**Email Strategy:**
- List building: Lead magnet, waitlist
- Sequence: Welcome, value, pitch
- Frequency: 2-3x per week
- Personalization: Segment by interest
- Warm traffic: 10-30% conversion possible`,
    
    paid_search: `
**Paid Search Strategy:**
- Platform: Google Ads
- Keywords: High intent, specific
- Budget: $20-100/day
- Landing: Dedicated page per keyword
- Optimization: Bid adjustments, A/B testing`,
    
    influencer: `
**Influencer Strategy:**
- Size: Micro-influencers (10k-100k)
- Niche: Specific to target audience
- Deal: Affiliate, sponsored post, or free product
- Authenticity: Let them create content
- ROI: Track with affiliate links`,
    
    direct_sales: `
**Direct Sales Strategy:**
- Outreach: Email, LinkedIn, cold call
- Volume: 50-100 contacts per day
- Personalization: Research, custom message
- Follow-up: 3-5 touch points
- Conversion: 1-5% typical for cold outreach`,
  };
  
  return strategies[normalized] || 'Standard acquisition approach for this channel.';
}

function getWeekOneActions(channel: string): string {
  const normalized = channel.toLowerCase().replace(/\s+/g, '_');
  const actions: Record<string, string> = {
    organic_social: `
- Set up business accounts on primary platforms
- Create 1 week of content (7 posts)
- Join 5-10 relevant communities
- Follow 50-100 target audience members
- Post first piece of value content`,
    
    paid_social: `
- Set up business manager/ads account
- Install pixel/tracking
- Create 3 ad variations
- Set up audience targeting
- Launch with $10/day budget`,
    
    content_marketing: `
- Publish first blog post
- Share on social channels
- Submit to relevant communities
- Email to existing contacts
- Set up content calendar for next 4 weeks`,
    
    seo: `
- Do keyword research (20-30 keywords)
- Optimize homepage for main keyword
- Create first 3 SEO-optimized pages
- Submit sitemap to Google
- Set up Google Search Console`,
    
    email: `
- Set up email tool (ConvertKit, Buttondown)
- Create lead magnet
- Set up opt-in forms
- Write welcome sequence (3-5 emails)
- Send to existing contacts`,
    
    paid_search: `
- Set up Google Ads account
- Keyword research (10-20 keywords)
- Create 3 ad variations
- Set up conversion tracking
- Launch with $20/day budget`,
    
    influencer: `
- Identify 10-20 relevant influencers
- Prepare outreach message
- Send personalized pitches
- Follow up after 3 days
- Negotiate deals with interested`,
    
    direct_sales: `
- Build list of 200+ prospects
- Create email template (personalized)
- Send 20 emails per day
- Track opens/clicks
- Follow up with engaged prospects`,
  };
  
  return actions[normalized] || 'Set up channel and begin acquisition.';
}

function getWeeklyCadence(channel: string): string {
  const normalized = channel.toLowerCase().replace(/\s+/g, '_');
  const cadences: Record<string, string> = {
    organic_social: `
- Daily: Post valuable content
- Daily: Engage with audience (30 min)
- Weekly: Analyze what's working
- Weekly: Adjust content strategy`,
    
    paid_social: `
- Daily: Check ad performance
- Every 2 days: Pause low performers
- Weekly: Launch new ad variations
- Weekly: Adjust budget allocation`,
    
    content_marketing: `
- 2-3x per week: Publish new content
- Daily: Share on social
- Weekly: Check analytics
- Weekly: Update high-traffic pages`,
    
    seo: `
- 2-3x per week: Publish SEO content
- Weekly: Monitor rankings
- Weekly: Build 5-10 backlinks
- Monthly: Technical SEO audit`,
    
    email: `
- 2-3x per week: Send emails
- Daily: Monitor open/click rates
- Weekly: Segment analysis
- Weekly: A/B test subject lines`,
    
    paid_search: `
- Daily: Monitor spend/conversions
- Every 2 days: Adjust bids
- Weekly: Add negative keywords
- Weekly: Test new ad copy`,
    
    influencer: `
- Weekly: Reach out to 5-10 new influencers
- Weekly: Check results from active campaigns
- Monthly: Pay/provide product to partners
- Monthly: Analyze ROI per influencer`,
    
    direct_sales: `
- Daily: Send 20-50 outreach emails
- Daily: Follow up with engaged prospects
- Weekly: Review response rates
- Weekly: Refine messaging based on feedback`,
  };
  
  return cadences[normalized] || 'Maintain consistent effort on this channel.';
}

