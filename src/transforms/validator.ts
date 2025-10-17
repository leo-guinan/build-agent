/**
 * Validator Transform
 * 
 * Game: System Coherence (PREDICTION / REALITY)
 * Output: Validation System & Inter-Agent Quality Control
 * 
 * This agent understands:
 * - Cross-agent communication validation
 * - User feedback integration
 * - Prediction vs reality checking
 * - Assumption validation
 * - System coherence monitoring
 * 
 * Primary Mission: Ensure all agent outputs fit together and match user feedback
 * from the site. Meta-layer quality control for the multi-agent system.
 */

import type { Transform, TransformedIdeaInputs } from './types.js';

export interface ValidatorInputs extends TransformedIdeaInputs {
  // Validation Focus
  primaryAssumptions: string[] | string;
  validationMethods: string[] | string;
  feedbackSources: string[] | string;
  
  // Inter-Agent Checking
  agentsToValidate: string[] | string;
  checkFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  coherenceThreshold: number;  // Percentage
  
  // User Feedback
  feedbackChannels: string[] | string;
  minSampleSize: number;
  feedbackWeight: number;  // 1-10 scale
  
  // Reality Checking
  realityCheckpoints: string[] | string;
  toleranceLevel: number;  // Percentage variance allowed
  autoCorrect: boolean;
  
  // Quality Gates
  requiredValidations: number;
  blockOnFailure: boolean;
  escalationThreshold: number;  // Number of failures before escalation
}

export function calculateValidationMetrics(inputs: ValidatorInputs) {
  const assumptionsArray = typeof inputs.primaryAssumptions === 'string'
    ? inputs.primaryAssumptions.split(',')
    : inputs.primaryAssumptions;
  
  const agentsArray = typeof inputs.agentsToValidate === 'string'
    ? inputs.agentsToValidate.split(',')
    : inputs.agentsToValidate;
  
  const checksPerWeek = inputs.checkFrequency === 'daily' ? 5 :
                       inputs.checkFrequency === 'weekly' ? 1 :
                       inputs.checkFrequency === 'biweekly' ? 0.5 : 0.25;
  
  const validationsPerMonth = (inputs.requiredValidations * checksPerWeek * 4);
  
  const qualityScore = {
    feedback: inputs.feedbackWeight * 10,  // Convert to percentage
    coherence: inputs.coherenceThreshold,
    tolerance: 100 - inputs.toleranceLevel,  // Lower tolerance = higher quality
  };
  
  const overallQuality = (qualityScore.feedback + qualityScore.coherence + qualityScore.tolerance) / 3;
  
  const strictness = inputs.blockOnFailure ? 'STRICT' :
                    inputs.escalationThreshold < 3 ? 'HIGH' :
                    inputs.escalationThreshold < 5 ? 'MODERATE' : 'PERMISSIVE';
  
  return {
    assumptionsCount: assumptionsArray.length,
    agentsMonitored: agentsArray.length,
    checksPerWeek,
    validationsPerMonth,
    qualityScore,
    overallQuality,
    strictness,
  };
}

export const validatorTransform: Transform = {
  id: 'validator',
  name: 'Validator Agent',
  description: 'Ensures system coherence - validates agent outputs against user feedback',
  
  game: {
    name: 'System Coherence',
    description: 'Keep all agents aligned with reality and user feedback',
    metrics: [
      'Validation Success Rate',
      'Inter-Agent Coherence',
      'User Feedback Alignment',
      'Assumption Accuracy',
      'Reality Variance',
      'System Quality Score',
    ],
    successCriteria: 'Maintain >80% coherence across agents with <20% variance from reality',
  },
  
  additionalPrompts: [
    {
      name: 'primaryAssumptions',
      type: 'input',
      message: 'Key assumptions to validate (comma-separated):',
      default: 'Users want this, Price is acceptable, Market is growing, Competition is beatable',
      validate: (input: string) => input.trim() ? true : 'Need at least one assumption',
    },
    {
      name: 'validationMethods',
      type: 'input',
      message: 'Validation methods (comma-separated):',
      default: 'User interviews, Analytics data, A/B tests, Feedback surveys',
    },
    {
      name: 'feedbackSources',
      type: 'input',
      message: 'Feedback sources (comma-separated):',
      default: 'In-app surveys, Support tickets, User interviews, Analytics events',
    },
    {
      name: 'agentsToValidate',
      type: 'input',
      message: 'Which agents to validate (comma-separated):',
      default: 'entrepreneur,builder,activist,speculator,researcher',
    },
    {
      name: 'checkFrequency',
      type: 'list',
      message: 'How often to run validation checks?',
      choices: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly',
    },
    {
      name: 'coherenceThreshold',
      type: 'number',
      message: 'Minimum coherence threshold (%):',
      default: 80,
      validate: (input: number) => input >= 0 && input <= 100 ? true : 'Must be 0-100%',
    },
    {
      name: 'feedbackChannels',
      type: 'input',
      message: 'User feedback channels (comma-separated):',
      default: 'Email, In-app chat, Support tickets, NPS surveys',
    },
    {
      name: 'minSampleSize',
      type: 'number',
      message: 'Minimum feedback samples for validation:',
      default: 30,
      validate: (input: number) => input > 0 ? true : 'Must be at least 1',
    },
    {
      name: 'feedbackWeight',
      type: 'number',
      message: 'User feedback weight (1-10):',
      default: 8,
      validate: (input: number) => input >= 1 && input <= 10 ? true : 'Must be 1-10',
    },
    {
      name: 'realityCheckpoints',
      type: 'input',
      message: 'Reality checkpoints (comma-separated):',
      default: 'Revenue vs forecast, Users vs target, Churn vs expected, Conversion vs predicted',
    },
    {
      name: 'toleranceLevel',
      type: 'number',
      message: 'Variance tolerance (%):',
      default: 20,
      validate: (input: number) => input >= 0 && input <= 100 ? true : 'Must be 0-100%',
    },
    {
      name: 'autoCorrect',
      type: 'confirm',
      message: 'Auto-correct agent outputs when validation fails?',
      default: false,
    },
    {
      name: 'requiredValidations',
      type: 'number',
      message: 'Required validations per check:',
      default: 5,
      validate: (input: number) => input > 0 ? true : 'Must be at least 1',
    },
    {
      name: 'blockOnFailure',
      type: 'confirm',
      message: 'Block agent actions on validation failure?',
      default: false,
    },
    {
      name: 'escalationThreshold',
      type: 'number',
      message: 'Failures before escalating to human:',
      default: 3,
      validate: (input: number) => input > 0 ? true : 'Must be at least 1',
    },
  ],
  
  requirementsTemplate: (inputs: ValidatorInputs) => {
    const metrics = calculateValidationMetrics(inputs);
    const assumptions = typeof inputs.primaryAssumptions === 'string'
      ? inputs.primaryAssumptions.split(',').map((s: string) => s.trim())
      : inputs.primaryAssumptions;
    const methods = typeof inputs.validationMethods === 'string'
      ? inputs.validationMethods.split(',').map((s: string) => s.trim())
      : inputs.validationMethods;
    const agents = typeof inputs.agentsToValidate === 'string'
      ? inputs.agentsToValidate.split(',').map((s: string) => s.trim())
      : inputs.agentsToValidate;
    const feedbackSources = typeof inputs.feedbackSources === 'string'
      ? inputs.feedbackSources.split(',').map((s: string) => s.trim())
      : inputs.feedbackSources;
    const checkpoints = typeof inputs.realityCheckpoints === 'string'
      ? inputs.realityCheckpoints.split(',').map((s: string) => s.trim())
      : inputs.realityCheckpoints;
    const channels = typeof inputs.feedbackChannels === 'string'
      ? inputs.feedbackChannels.split(',').map((s: string) => s.trim())
      : inputs.feedbackChannels;
    const timestamp = new Date().toISOString();
    
    return `# Requirements: ${inputs.ideaName}

**Type:** Validator Agent  
**Game:** System Coherence  
**Output:** Validation System & Quality Control
**Generated:** ${timestamp}  
**Status:** Draft

---

## ✅ Validation Overview

### System Quality
- **Coherence Threshold:** ${inputs.coherenceThreshold}%
- **Variance Tolerance:** ${inputs.toleranceLevel}%
- **Overall Quality Score:** ${metrics.overallQuality.toFixed(0)}/100
- **Strictness:** ${metrics.strictness}

### Monitoring Scope
- **Agents Validated:** ${metrics.agentsMonitored} (${agents.join(', ')})
- **Assumptions Tracked:** ${metrics.assumptionsCount}
- **Checkpoints:** ${checkpoints.length}
- **Check Frequency:** ${inputs.checkFrequency} (${metrics.checksPerWeek}/week)

### Quality Gates
- **Required Validations:** ${inputs.requiredValidations} per check
- **Block on Failure:** ${inputs.blockOnFailure ? 'YES ⚠️' : 'NO'}
- **Escalation Threshold:** ${inputs.escalationThreshold} failures
- **Auto-Correction:** ${inputs.autoCorrect ? 'ENABLED' : 'DISABLED'}

${inputs.blockOnFailure ? `
⚠️ **STRICT MODE:** Agents blocked on validation failure
- System will prevent actions when coherence < ${inputs.coherenceThreshold}%
- Manual override required to proceed
- Use for mission-critical applications
` : ''}

${metrics.overallQuality < 60 ? `
⚠️ **LOW QUALITY SETTINGS:** Overall quality score ${metrics.overallQuality.toFixed(0)}/100

Recommendations:
- Increase coherence threshold to 80%+
- Increase feedback weight to 7+
- Reduce variance tolerance to 20% or less
` : ''}

---

## 📊 Game Metrics

### Validation Success Rate
- **Target:** >${inputs.coherenceThreshold}%
- **Frequency:** ${metrics.checksPerWeek} checks/week
- **Validations:** ${metrics.validationsPerMonth}/month

### Inter-Agent Coherence
- **Agents:** ${agents.join(', ')}
- **Threshold:** ${inputs.coherenceThreshold}%
- **Method:** Cross-reference predictions and outputs

### User Feedback Alignment
- **Sources:** ${feedbackSources.length}
- **Min Samples:** ${inputs.minSampleSize}
- **Weight:** ${inputs.feedbackWeight}/10

### Reality Variance
- **Checkpoints:** ${checkpoints.length}
- **Tolerance:** ±${inputs.toleranceLevel}%
- **Action:** ${inputs.autoCorrect ? 'Auto-correct' : 'Alert only'}

**Winning:** Maintain >${inputs.coherenceThreshold}% coherence with <${inputs.toleranceLevel}% variance from reality.

---

## 1. Overview

### Idea Description
${inputs.description}

### Problem Statement
${inputs.problem}

### Target Users
${inputs.targetUsers}

### Validation Mission
**Ensure all agents (${agents.join(', ')}) stay aligned with user feedback and reality.**

---

## 2. Assumption Validation Framework

### Primary Assumptions (${assumptions.length})

${assumptions.map((assumption: string, i: number) => `
**${i + 1}. ${assumption}**
- **Validation Method:** ${methods[i] || methods[0] || 'User feedback'}
- **Frequency:** ${inputs.checkFrequency}
- **Sample Size:** ${inputs.minSampleSize}+ responses
- **Pass Criteria:** >${100 - inputs.toleranceLevel}% confirm assumption
- **Fail Action:** ${inputs.blockOnFailure ? 'Block + alert' : 'Alert + log'}
`).join('\n')}

### Validation Methods

${methods.map((method: string, i: number) => `
**${i + 1}. ${method}**
- When: ${inputs.checkFrequency}
- Sample: ${inputs.minSampleSize}+
- Weight: ${inputs.feedbackWeight}/10
`).join('\n')}

---

## 3. Inter-Agent Coherence Checking

### Agents Monitored (${agents.length})

${agents.map((agent: string) => `
**${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent**
- **Outputs to Validate:** ${getAgentOutputs(agent)}
- **Check Against:** User feedback, other agents, reality checkpoints
- **Frequency:** ${inputs.checkFrequency}
- **Coherence Required:** ${inputs.coherenceThreshold}%
`).join('\n')}

### Cross-Agent Validation

**Entrepreneur ↔ Speculator:**
- ROI predictions should align with revenue forecasts
- Cost estimates should match across both
- Tolerance: ±${inputs.toleranceLevel}%

**Builder ↔ Activist:**
- Feature priorities should match user feedback
- Timeline estimates should align
- Tolerance: ±${inputs.toleranceLevel}%

**Speculator ↔ Whale:**
- Revenue forecasts should support fundraising timing
- Capital needs should match growth plans
- Tolerance: ±${inputs.toleranceLevel}%

**Researcher → All:**
- Market intelligence should inform all agent outputs
- User research should validate assumptions
- Tolerance: ±${inputs.toleranceLevel}%

### Coherence Score Calculation

\`\`\`
For each pair of agents:
  1. Extract shared concepts (time, money, customers, etc.)
  2. Compare predicted values
  3. Calculate variance
  4. Score = 100 - (variance% / 2)

Overall Coherence = Average of all pair scores
\`\`\`

**Pass:** Coherence ≥ ${inputs.coherenceThreshold}%  
**Fail:** Coherence < ${inputs.coherenceThreshold}%

---

## 4. User Feedback Integration

### Feedback Sources (${feedbackSources.length})

${feedbackSources.map((source: string, i: number) => `
**${i + 1}. ${source}**
- Collection: ${inputs.checkFrequency}
- Min samples: ${inputs.minSampleSize}
- Weight: ${inputs.feedbackWeight}/10
- Action: ${inputs.autoCorrect ? 'Auto-update agent outputs' : 'Flag discrepancies'}
`).join('\n')}

### Feedback Channels (${channels.length})

${channels.map((channel: string, i: number) => `
**${i + 1}. ${channel}**
- Monitor: Continuously
- Analyze: ${inputs.checkFrequency}
- Alert on: ${inputs.escalationThreshold} negative feedback items
`).join('\n')}

### Feedback Analysis Process

**${inputs.checkFrequency.charAt(0).toUpperCase() + inputs.checkFrequency.slice(1)} Workflow:**

1. **Collect:** Gather feedback from all ${channels.length} channels
2. **Categorize:** Tag by agent (${agents.join(', ')})
3. **Analyze:** Extract themes, sentiment, specific issues
4. **Compare:** Match against agent predictions
5. **Score:** Calculate alignment (0-100%)
6. **Act:** ${inputs.autoCorrect ? 'Update outputs' : 'Alert humans'} if <${inputs.coherenceThreshold}%

### Feedback → Agent Mapping

**Pricing feedback** → Entrepreneur, Speculator  
**Feature requests** → Builder, Researcher  
**Marketing effectiveness** → Activist  
**Conversion complaints** → Activist, Builder  
**Value perception** → All agents

---

## 5. Reality Checkpoints

### Checkpoints (${checkpoints.length})

${checkpoints.map((checkpoint: string, i: number) => `
**${i + 1}. ${checkpoint}**
- **Frequency:** ${inputs.checkFrequency}
- **Tolerance:** ±${inputs.toleranceLevel}%
- **Data Source:** Analytics, financials, user metrics
- **Agents Affected:** ${getCheckpointAgents(checkpoint)}
- **Fail Action:** ${inputs.blockOnFailure ? 'Block agents' : 'Alert + log'}
`).join('\n')}

### Variance Tracking

**Acceptable Variance:** ±${inputs.toleranceLevel}%

**Examples:**
- Revenue $10k predicted, $8k-$12k actual = ✅ PASS (20% tolerance)
- Users 100 predicted, 50 actual = ${inputs.toleranceLevel >= 50 ? '✅ PASS' : '❌ FAIL'} (50% variance)
- Churn 5% predicted, 6% actual = ✅ PASS (20% variance)

**When Variance Exceeds Tolerance:**
1. Log failure
2. ${inputs.autoCorrect ? 'Auto-update agent predictions' : 'Alert human operator'}
3. ${inputs.blockOnFailure ? 'Block affected agents' : 'Continue with warning'}
4. After ${inputs.escalationThreshold} failures → Escalate

---

## 6. Quality Gates

### Gate 1: Assumption Validation
- **Required:** ${Math.ceil(assumptions.length * 0.7)}/${assumptions.length} assumptions validated
- **Frequency:** ${inputs.checkFrequency}
- **Block:** ${inputs.blockOnFailure}

### Gate 2: Inter-Agent Coherence
- **Required:** ${inputs.coherenceThreshold}% coherence across agents
- **Frequency:** ${inputs.checkFrequency}
- **Block:** ${inputs.blockOnFailure}

### Gate 3: User Feedback Alignment
- **Required:** ${inputs.minSampleSize}+ samples, >${100 - inputs.toleranceLevel}% positive
- **Frequency:** ${inputs.checkFrequency}
- **Block:** ${inputs.blockOnFailure}

### Gate 4: Reality Variance
- **Required:** ${Math.ceil(checkpoints.length * 0.8)}/${checkpoints.length} checkpoints within tolerance
- **Frequency:** ${inputs.checkFrequency}
- **Block:** ${inputs.blockOnFailure}

**All gates must pass to maintain system coherence.**

---

## 7. Auto-Correction System

### Enabled: ${inputs.autoCorrect ? 'YES' : 'NO'}

${inputs.autoCorrect ? `
**Auto-Correction Active**

When validation fails:
1. Identify discrepancy
2. Calculate correction factor
3. Update agent outputs automatically
4. Log correction
5. Notify human operator

**Example:**
- Entrepreneur predicts $10k revenue
- Actual: $8k (20% below)
- Auto-correct: Update predictions by 0.8x factor
- Notify: "Revenue predictions corrected down 20%"

**Safety Limits:**
- Max correction: 50% (larger requires human)
- Corrections logged and reversible
- Human can override any auto-correction
` : `
**Auto-Correction Disabled**

When validation fails:
1. Identify discrepancy
2. Alert human operator
3. Provide recommended corrections
4. Wait for human approval
5. Apply corrections manually

**More control, slower response**
`}

---

## 8. Escalation Protocol

### Threshold: ${inputs.escalationThreshold} Failures

**Failure Counter:**
- Assumption validation fails: +1
- Coherence drops below ${inputs.coherenceThreshold}%: +1
- Feedback alignment fails: +1
- Reality variance exceeds ${inputs.toleranceLevel}%: +1

**At ${inputs.escalationThreshold} Failures:**
1. **Alert:** Notify human operator immediately
2. **Report:** Generate validation failure report
3. **Recommend:** Suggested corrections
4. **${inputs.blockOnFailure ? 'Block' : 'Warn'}:** ${ inputs.blockOnFailure ? 'All agents until resolved' : 'Continue with warnings'}

**Escalation Levels:**
- ${inputs.escalationThreshold} failures: Alert operator
- ${inputs.escalationThreshold * 2} failures: Stop all automated agent actions
- ${inputs.escalationThreshold * 3} failures: Full system audit required

---

## 9. Validation Tracking

### ${inputs.checkFrequency.charAt(0).toUpperCase() + inputs.checkFrequency.slice(1)} Check-ins

**Assumption Validation:**
${assumptions.map((assumption: string) => `- [ ] ${assumption}: Pass/Fail`).join('\n')}

**Inter-Agent Coherence:**
${agents.map((agent: string) => `- [ ] ${agent.charAt(0).toUpperCase() + agent.slice(1)}: _____%`).join('\n')}
- [ ] Overall: _____%

**User Feedback:**
- [ ] Samples collected: ______
- [ ] Positive: ______%
- [ ] Negative: ______%
- [ ] Alignment score: _____%

**Reality Checkpoints:**
${checkpoints.map((checkpoint: string) => `- [ ] ${checkpoint}: ±______%`).join('\n')}

**Quality Score:** ______/100

**Action Required:** Yes / No  
**Escalation Needed:** Yes / No

---

## 10. Integration with Other Agents

### Validates All Agents

**Entrepreneur Agent:**
- ROI predictions vs actuals
- Cost estimates vs spending
- Revenue assumptions vs feedback
- Break-even timing vs reality

**Builder Agent:**
- Feature priorities vs user requests
- Velocity predictions vs actual ship rate
- Tech debt estimates vs reality
- Quality metrics vs user complaints

**Activist Agent:**
- Conversion predictions vs actuals
- Channel effectiveness vs data
- Messaging resonance vs feedback
- Pivot decisions vs outcomes

**Speculator Agent:**
- Revenue forecasts vs actuals
- Growth rate predictions vs reality
- Investment assumptions vs market
- Valuation estimates vs offers

**Researcher Agent:**
- Insight accuracy vs validation
- Pattern recognition vs reality
- Competitive intelligence vs market
- User research vs feedback

**Whale Agent:**
- Fundraise timing vs outcomes
- Capital efficiency vs spending
- Milestone predictions vs achievement
- Dilution estimates vs actuals

---

## 11. Validator Game Rules

### How to Win
1. **Maintain coherence** (>${inputs.coherenceThreshold}%)
2. **Stay within tolerance** (<${inputs.toleranceLevel}% variance)
3. **Validate assumptions** (>${100 - inputs.toleranceLevel}% confirm)
4. **Align with feedback** (${inputs.minSampleSize}+ samples positive)

### How to Lose
1. Coherence drops below ${inputs.coherenceThreshold}%
2. Variance exceeds ${inputs.toleranceLevel}%
3. Assumptions invalidated
4. Feedback misalignment
5. ≥${inputs.escalationThreshold} failures in short period

### Scoring
- **Coherence:** Agent alignment score (0-100%)
- **Variance:** (100 - average_variance%)
- **Validation:** (passed_assumptions / total_assumptions) × 100
- **Feedback:** (positive_samples / total_samples) × 100

**Overall Score:** (Coherence + Variance + Validation + Feedback) / 4

Target: >${inputs.coherenceThreshold}% overall

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

**This is a Validator Agent requirements document.**

**Game:** System Coherence  
**Agents Validated:** ${agents.join(', ')}  
**Coherence Target:** ${inputs.coherenceThreshold}%  
**Variance Tolerance:** ±${inputs.toleranceLevel}%  
**Strictness:** ${metrics.strictness}

**Keep agents aligned. Validate against reality. Maintain system quality.**

---

*Next: Set up validation system, integrate feedback sources, begin ${inputs.checkFrequency} checks.*
`;
  },
  
  validators: [
    {
      name: 'coherence-achievable',
      required: false,
      validate: async (inputs: ValidatorInputs) => {
        if (inputs.coherenceThreshold > 90) {
          return {
            valid: true,
            warnings: [
              `Coherence threshold ${inputs.coherenceThreshold}% is very high`,
              'May be difficult to maintain across all agents',
            ],
          };
        }
        return { valid: true };
      },
    },
    {
      name: 'sample-size-sufficient',
      required: false,
      validate: async (inputs: ValidatorInputs) => {
        if (inputs.minSampleSize < 30) {
          return {
            valid: true,
            warnings: [
              `Sample size ${inputs.minSampleSize} may be too small for statistical validity`,
              'Consider 30+ samples for reliable validation',
            ],
          };
        }
        return { valid: true };
      },
    },
  ],
  
  learningEnabled: true,
  
  understands: ['validation', 'feedback', 'coherence', 'assumptions', 'reality', 'quality', 'users', 'agents'],
  
  customCommands: [
    'validate-all',
    'coherence-check',
    'feedback-analyze',
  ],
};

// Helper functions

function getAgentOutputs(agent: string): string {
  const outputs: Record<string, string> = {
    entrepreneur: 'ROI predictions, cost estimates, financial projections',
    builder: 'Velocity estimates, feature priorities, quality metrics',
    activist: 'Conversion predictions, channel effectiveness, messaging',
    speculator: 'Revenue forecasts, growth rates, valuation estimates',
    researcher: 'Market insights, competitive analysis, user research',
    whale: 'Fundraise timing, capital allocation, milestone predictions',
  };
  
  return outputs[agent.toLowerCase()] || 'General predictions and outputs';
}

function getCheckpointAgents(checkpoint: string): string {
  const lower = checkpoint.toLowerCase();
  
  if (lower.includes('revenue') || lower.includes('forecast')) {
    return 'Entrepreneur, Speculator';
  } else if (lower.includes('user') || lower.includes('target')) {
    return 'Activist, Researcher';
  } else if (lower.includes('churn') || lower.includes('conversion')) {
    return 'Activist, Builder';
  } else if (lower.includes('feature') || lower.includes('velocity')) {
    return 'Builder, Researcher';
  }
  
  return 'All agents';
}

