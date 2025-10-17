/**
 * Researcher Transform
 * 
 * Game: Pattern Recognition (Insights / Data)
 * Output: External Context & Market Intelligence
 * 
 * This agent understands:
 * - Market research
 * - Competitive analysis
 * - User research
 * - Trend identification
 * - Pattern synthesis
 * 
 * Primary Mission: Gather external context that informs all other agents'
 * decisions with real market data and validated patterns.
 */

import type { Transform, TransformedIdeaInputs } from './types.js';

export interface ResearcherInputs extends TransformedIdeaInputs {
  // Research Focus
  researchQuestions: string[] | string;
  primaryQuestion: string;
  
  // Data Sources
  dataSources: string[] | string;
  competitorCount: number;
  userInterviewTarget: number;
  
  // Analysis
  patternHypotheses: string[] | string;
  validationMethod: string;
  insightFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  
  // Synthesis
  synthesisFormat: 'brief' | 'detailed' | 'presentation';
  stakeholders: string[] | string;
  
  // Integration
  agentsToInform: string[] | string;
  updateFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly';
}

export function calculateResearchMetrics(inputs: ResearcherInputs) {
  const questionsArray = typeof inputs.researchQuestions === 'string' 
    ? inputs.researchQuestions.split(',') 
    : inputs.researchQuestions;
  const sourcesArray = typeof inputs.dataSources === 'string'
    ? inputs.dataSources.split(',')
    : inputs.dataSources;
  const hypothesesArray = typeof inputs.patternHypotheses === 'string'
    ? inputs.patternHypotheses.split(',')
    : inputs.patternHypotheses;
    
  const questionsCount = questionsArray.length;
  const sourcesCount = sourcesArray.length;
  
  // Estimate insights per week based on frequency
  const insightsPerWeek = inputs.insightFrequency === 'daily' ? 5 :
                         inputs.insightFrequency === 'weekly' ? 1 :
                         inputs.insightFrequency === 'biweekly' ? 0.5 : 0.25;
  
  // Research velocity: insights per data source per week
  const researchVelocity = insightsPerWeek / Math.max(sourcesCount, 1);
  
  // Pattern recognition rate
  const patternRate = hypothesesArray.length / questionsCount;
  
  // Research coverage
  const coverage = {
    competitors: inputs.competitorCount >= 5 ? 'GOOD' : inputs.competitorCount >= 3 ? 'MODERATE' : 'LOW',
    users: inputs.userInterviewTarget >= 20 ? 'GOOD' : inputs.userInterviewTarget >= 10 ? 'MODERATE' : 'LOW',
    sources: sourcesCount >= 5 ? 'GOOD' : sourcesCount >= 3 ? 'MODERATE' : 'LOW',
  };
  
  return {
    questionsCount,
    sourcesCount,
    insightsPerWeek,
    researchVelocity,
    patternRate,
    coverage,
  };
}

export const researcherTransform: Transform = {
  id: 'researcher',
  name: 'Researcher Agent',
  description: 'Optimizes for pattern recognition - gathers external context and intelligence',
  
  game: {
    name: 'Pattern Recognition',
    description: 'Extract actionable insights from data faster than the market moves',
    metrics: [
      'Insights Per Week',
      'Pattern Validation Rate',
      'Research Velocity',
      'Hypothesis Accuracy',
      'Context Quality Score',
      'Synthesis Speed',
    ],
    successCriteria: 'Generate 1+ validated insight per week with >70% accuracy',
  },
  
  additionalPrompts: [
    {
      name: 'researchQuestions',
      type: 'input',
      message: 'Key research questions (comma-separated):',
      default: 'Who are the users?, What do they need?, What are alternatives?, What would they pay?',
      validate: (input: string) => input.trim() ? true : 'Need at least one question',
    },
    {
      name: 'primaryQuestion',
      type: 'input',
      message: 'Most important research question:',
      default: 'What do users need that competitors do not provide?',
    },
    {
      name: 'dataSources',
      type: 'input',
      message: 'Data sources (comma-separated):',
      default: 'user interviews, competitor analysis, market reports, social media, forums',
    },
    {
      name: 'competitorCount',
      type: 'number',
      message: 'Number of competitors to analyze:',
      default: 5,
      validate: (input: number) => input >= 0 ? true : 'Must be non-negative',
    },
    {
      name: 'userInterviewTarget',
      type: 'number',
      message: 'Target user interviews:',
      default: 20,
      validate: (input: number) => input > 0 ? true : 'Need at least 1 interview',
    },
    {
      name: 'patternHypotheses',
      type: 'input',
      message: 'Pattern hypotheses to test (comma-separated):',
      default: 'users prioritize speed, price sensitivity is high, switching costs are low',
    },
    {
      name: 'validationMethod',
      type: 'list',
      message: 'How will you validate insights?',
      choices: [
        'User interviews',
        'Surveys',
        'A/B tests',
        'Market data',
        'Competitor analysis',
        'Mixed methods',
      ],
      default: 'Mixed methods',
    },
    {
      name: 'insightFrequency',
      type: 'list',
      message: 'How often will you generate insights?',
      choices: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly',
    },
    {
      name: 'synthesisFormat',
      type: 'list',
      message: 'How will you present findings?',
      choices: ['brief', 'detailed', 'presentation'],
      default: 'brief',
    },
    {
      name: 'stakeholders',
      type: 'input',
      message: 'Who needs this research? (comma-separated):',
      default: 'product team, marketing, leadership',
    },
    {
      name: 'agentsToInform',
      type: 'input',
      message: 'Which agents need this context? (comma-separated):',
      default: 'entrepreneur,builder,activist,speculator',
    },
    {
      name: 'updateFrequency',
      type: 'list',
      message: 'How often to update other agents?',
      choices: ['real-time', 'daily', 'weekly', 'monthly'],
      default: 'weekly',
    },
  ],
  
  requirementsTemplate: (inputs: ResearcherInputs) => {
    const metrics = calculateResearchMetrics(inputs);
    const questions = typeof inputs.researchQuestions === 'string'
      ? inputs.researchQuestions.split(',').map((s: string) => s.trim())
      : inputs.researchQuestions;
    const sources = typeof inputs.dataSources === 'string'
      ? inputs.dataSources.split(',').map((s: string) => s.trim())
      : inputs.dataSources;
    const hypotheses = typeof inputs.patternHypotheses === 'string'
      ? inputs.patternHypotheses.split(',').map((s: string) => s.trim())
      : inputs.patternHypotheses;
    const stakeholders = typeof inputs.stakeholders === 'string'
      ? inputs.stakeholders.split(',').map((s: string) => s.trim())
      : inputs.stakeholders;
    const agents = typeof inputs.agentsToInform === 'string'
      ? inputs.agentsToInform.split(',').map((s: string) => s.trim())
      : inputs.agentsToInform;
    const timestamp = new Date().toISOString();
    
    return `# Requirements: ${inputs.ideaName}

**Type:** Researcher Agent  
**Game:** Pattern Recognition  
**Output:** External Context & Market Intelligence
**Generated:** ${timestamp}  
**Status:** Draft

---

## 🔬 Research Overview

### Research Velocity
- **Questions:** ${metrics.questionsCount}
- **Data Sources:** ${metrics.sourcesCount}
- **Insights Per Week:** ${metrics.insightsPerWeek}
- **Pattern Hypotheses:** ${hypotheses.length}
- **Frequency:** ${inputs.insightFrequency}

### Coverage Assessment
- **Competitor Analysis:** ${metrics.coverage.competitors} (${inputs.competitorCount} competitors)
- **User Research:** ${metrics.coverage.users} (${inputs.userInterviewTarget} target interviews)
- **Data Sources:** ${metrics.coverage.sources} (${sources.length} sources)

${metrics.coverage.competitors === 'LOW' ? `
⚠️ **LOW COMPETITOR COVERAGE:** Only analyzing ${inputs.competitorCount} competitors
- Recommendation: Increase to 5+ for comprehensive view
` : ''}

${metrics.coverage.users === 'LOW' ? `
⚠️ **LOW USER RESEARCH:** Only ${inputs.userInterviewTarget} planned interviews
- Recommendation: Increase to 20+ for statistical validity
` : ''}

${metrics.insightsPerWeek < 1 ? `
⚠️ **SLOW INSIGHT GENERATION:** ${metrics.insightsPerWeek} insights/week
- Risk: Market moves faster than research
- Recommendation: Increase frequency to weekly
` : ''}

---

## 📊 Game Metrics

1. **Insights Per Week**
   - Target: ${metrics.insightsPerWeek}
   - Quality: >70% validated as accurate

2. **Pattern Validation Rate**
   - Hypotheses: ${hypotheses.length}
   - Target: >60% validated or refined

3. **Research Velocity**
   - Current: ${metrics.researchVelocity.toFixed(2)} insights/source/week
   - Target: Increase 20% per month

4. **Context Quality**
   - Actionable insights: >80%
   - Stakeholder satisfaction: >70%

**Winning:** Generate validated insights that materially improve other agents' decisions.

---

## 1. Research Questions

### Primary Question
**"${inputs.primaryQuestion}"**

### All Questions
${questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

### Pattern Hypotheses to Test
${hypotheses.map((h: string, i: number) => `${i + 1}. **Hypothesis:** ${h}\n   **Test:** ${inputs.validationMethod}`).join('\n\n')}

---

## 2. Data Sources

### Primary Sources
${sources.map((source: string, i: number) => `${i + 1}. **${source}**\n   - Collection: ${inputs.insightFrequency}\n   - Format: ${inputs.synthesisFormat}`).join('\n\n')}

### Competitive Analysis
**Analyzing ${inputs.competitorCount} competitors:**

1. Product features
2. Pricing strategy
3. User feedback
4. Market positioning
5. Growth tactics

**Deliverable:** Competitive matrix

### User Research
**Target: ${inputs.userInterviewTarget} interviews**

**Interview Guide:**
- Current solution & pain points
- Desired outcomes
- Willingness to pay
- Feature priorities
- Decision criteria

**Deliverable:** User persona & journey map

---

## 3. Research Workflow

### ${inputs.insightFrequency.charAt(0).toUpperCase() + inputs.insightFrequency.slice(1)} Cadence

**Data Collection:**
- Gather from ${sources.length} sources
- Document raw findings
- Tag by research question

**Analysis:**
- Identify patterns
- Test hypotheses
- Cross-reference sources
- Validate with stakeholders

**Synthesis:**
- ${inputs.synthesisFormat} format
- Highlight actionable insights
- Include confidence levels
- Provide recommendations

**Distribution:**
- Share with: ${stakeholders.join(', ')}
- Update agents: ${agents.join(', ')}
- Frequency: ${inputs.updateFrequency}

---

## 4. Integration with Other Agents

### Context Sharing

${agents.map((agent: string) => `
**${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent:**
- Receives: ${getAgentContext(agent)}
- Frequency: ${inputs.updateFrequency}
- Format: ${inputs.synthesisFormat}
`).join('\n')}

### Inter-Agent Intelligence

**Researcher → Entrepreneur:**
- Market size validation
- Pricing research
- Competitive ROI data

**Researcher → Builder:**
- Feature prioritization
- User pain points
- Technical benchmarks

**Researcher → Activist:**
- Messaging insights
- Channel effectiveness
- Pivot signals

**Researcher → Speculator:**
- Growth rate benchmarks
- Market projections
- Investment trends

---

## 5. Pattern Recognition System

### Pattern Library

**Continuously build library of:**
- User behavior patterns
- Market trends
- Competitor moves
- Success factors
- Failure modes

**Update:** ${inputs.insightFrequency}

### Insight Validation

**Validation Criteria:**
1. Multiple source confirmation
2. Statistical significance (n>${inputs.userInterviewTarget})
3. Stakeholder verification
4. Real-world testing

**Confidence Levels:**
- High: 3+ sources, validated
- Medium: 2 sources, partially validated
- Low: 1 source, hypothesis only

---

## 6. Risk Analysis (Researcher Lens)

**Risk: Research bias (confirmation bias)**
- Impact: Wrong insights → wrong decisions
- Mitigation: Multiple sources, diverse methods
- Trigger: All data confirms initial hypothesis

**Risk: Analysis paralysis**
- Impact: Slow insights, missed opportunities
- Mitigation: ${inputs.insightFrequency} deadlines, synthesis format
- Trigger: >2 weeks without new insights

**Risk: Irrelevant research**
- Impact: Waste time, don't inform decisions
- Mitigation: Align with ${agents.join(', ')} needs
- Trigger: <50% insights actioned

**Risk: Can't reach ${inputs.userInterviewTarget} users**
- Impact: Insufficient data, invalid conclusions
- Mitigation: Multiple recruitment channels
- Trigger: Week 4 and <${Math.ceil(inputs.userInterviewTarget * 0.25)} interviews

---

## 7. Tracking System

### ${inputs.insightFrequency.charAt(0).toUpperCase() + inputs.insightFrequency.slice(1)} Updates

**Research Actuals:**
- [ ] Insights generated: ______
- [ ] Hypotheses tested: ______
- [ ] Validation rate: ______%
- [ ] User interviews: ______
- [ ] Competitor updates: ______

**Pattern Recognition:**
- [ ] New patterns identified: ______
- [ ] Patterns validated: ______
- [ ] Patterns refuted: ______
- [ ] Library updates: ______

**Impact Tracking:**
- [ ] Insights actioned: ______%
- [ ] Decisions informed: ______
- [ ] Agent updates: ______
- [ ] Stakeholder satisfaction: ______/10

---

## 8. Deliverables

### Ongoing
- ${inputs.insightFrequency.charAt(0).toUpperCase() + inputs.insightFrequency.slice(1)} insights (${inputs.synthesisFormat} format)
- Pattern library updates
- Agent context updates (${inputs.updateFrequency})

### Milestones
- Week 2: Competitive analysis complete
- Week 4: User research (${Math.ceil(inputs.userInterviewTarget / 2)} interviews)
- Week 8: Pattern validation report
- Week 12: Comprehensive market intelligence

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

**This is a Researcher Agent requirements document.**

**Game:** Pattern Recognition  
**Target:** ${metrics.insightsPerWeek} insights/week  
**Coverage:** ${inputs.competitorCount} competitors, ${inputs.userInterviewTarget} users, ${sources.length} sources  
**Updates:** ${agents.join(', ')} agents ${inputs.updateFrequency}

**Research deeply. Recognize patterns. Share context. Win by being right.**

---

*Next: Begin data collection, interview users, analyze competitors, generate first insights.*
`;
  },
  
  validators: [
    {
      name: 'research-coverage',
      required: false,
      validate: async (inputs: ResearcherInputs) => {
        const metrics = calculateResearchMetrics(inputs);
        const warnings = [];
        
        if (metrics.coverage.competitors === 'LOW') {
          warnings.push(`Only ${inputs.competitorCount} competitors - consider increasing to 5+`);
        }
        if (metrics.coverage.users === 'LOW') {
          warnings.push(`Only ${inputs.userInterviewTarget} user interviews - consider 20+ for validity`);
        }
        if (metrics.insightsPerWeek < 1) {
          warnings.push(`${metrics.insightsPerWeek} insights/week is slow - consider weekly frequency`);
        }
        
        if (warnings.length > 0) {
          return { valid: true, warnings };
        }
        return { valid: true };
      },
    },
  ],
  
  learningEnabled: true,
  
  understands: ['patterns', 'data', 'insights', 'market', 'users', 'competitors', 'context'],
  
  customCommands: [
    'insight-generate',
    'pattern-check',
    'competitor-update',
  ],
};

// Helper function

function getAgentContext(agent: string): string {
  const contexts: Record<string, string> = {
    entrepreneur: 'Market size, pricing data, competitive ROI benchmarks',
    builder: 'Feature prioritization, user pain points, technical benchmarks',
    activist: 'Messaging insights, channel effectiveness, pivot signals',
    speculator: 'Growth benchmarks, market projections, investment trends',
    validator: 'User feedback themes, validation data, assumption tests',
    whale: 'Scale opportunities, impact metrics, growth patterns',
  };
  
  return contexts[agent.toLowerCase()] || 'General market intelligence';
}

