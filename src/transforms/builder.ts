/**
 * Builder Transform
 * 
 * Game: Ship Velocity (Features / Time)
 * Output: AI Cofounder Webapp
 * 
 * This agent understands:
 * - Feature completion rate
 * - Technical debt accumulation
 * - Code quality metrics
 * - Deployment frequency
 * - Bug rate
 * 
 * Primary Mission: Build the AI cofounder webapp that helps entrepreneurs
 * build their ideas faster using specialized agents.
 */

import type { Transform, TransformedIdeaInputs } from './types.js';

export interface BuilderInputs extends TransformedIdeaInputs {
  // Technical Stack
  frontend: string;
  backend: string;
  database: string;
  hosting: string;
  
  // Velocity
  featuresPlanned: number;
  weeksAvailable: number;
  hoursPerWeek: number;
  teamSize: number;
  
  // Quality
  testCoverage: number;  // Target percentage
  techDebtTolerance: 'low' | 'medium' | 'high';
  codeReviewRequired: boolean;
  
  // Deployment
  deploymentFrequency: 'daily' | 'weekly' | 'sprint' | 'monthly';
  cicdPipeline: boolean;
  
  // AI Cofounder Specific
  agentTypes: string[] | string;  // Which agents to support
  userFlow: string;  // Primary user journey
}

/**
 * Velocity Calculator
 */
export function calculateShipVelocity(inputs: BuilderInputs): {
  featuresPerWeek: number;
  weeksToMVP: number;
  totalDevHours: number;
  velocityScore: number;
  techDebtRisk: string;
  deploymentCadence: string;
} {
  // Base velocity: features per person per week
  const baseVelocity = inputs.techDebtTolerance === 'low' ? 0.5 : 
                       inputs.techDebtTolerance === 'medium' ? 1.0 : 1.5;
  
  // Adjust for team size (diminishing returns)
  const teamEfficiency = inputs.teamSize === 1 ? 1.0 :
                        inputs.teamSize === 2 ? 1.7 :
                        inputs.teamSize <= 5 ? inputs.teamSize * 0.8 :
                        inputs.teamSize * 0.6;
  
  // Adjust for code review (slows velocity but improves quality)
  const reviewFactor = inputs.codeReviewRequired ? 0.8 : 1.0;
  
  // Adjust for test coverage (slows velocity but reduces bugs)
  const testFactor = inputs.testCoverage >= 80 ? 0.7 :
                    inputs.testCoverage >= 50 ? 0.85 : 1.0;
  
  // Calculate actual velocity
  const featuresPerWeek = baseVelocity * teamEfficiency * reviewFactor * testFactor;
  
  // Calculate weeks to MVP
  const weeksToMVP = Math.ceil(inputs.featuresPlanned / featuresPerWeek);
  
  // Total dev hours
  const totalDevHours = weeksToMVP * inputs.hoursPerWeek * inputs.teamSize;
  
  // Velocity score (features/week, normalized)
  const velocityScore = featuresPerWeek;
  
  // Tech debt risk assessment
  const techDebtRisk = inputs.techDebtTolerance === 'high' && !inputs.codeReviewRequired ?
    'HIGH - Fast shipping without quality gates' :
    inputs.techDebtTolerance === 'high' ? 'MEDIUM-HIGH - Fast but reviewed' :
    inputs.techDebtTolerance === 'medium' && inputs.testCoverage < 50 ?
    'MEDIUM - Balanced but undertested' :
    inputs.techDebtTolerance === 'low' || inputs.testCoverage >= 80 ?
    'LOW - Quality focused' : 'MEDIUM - Balanced approach';
  
  return {
    featuresPerWeek,
    weeksToMVP,
    totalDevHours,
    velocityScore,
    techDebtRisk,
    deploymentCadence: inputs.deploymentFrequency,
  };
}

/**
 * Builder Transform Definition
 */
export const builderTransform: Transform = {
  id: 'builder',
  name: 'Builder Agent',
  description: 'Optimizes for shipping velocity - builds AI cofounder webapp fast',
  
  game: {
    name: 'Ship Velocity',
    description: 'Ship features as fast as possible while maintaining acceptable quality',
    metrics: [
      'Features Per Week',
      'Time to MVP',
      'Deployment Frequency',
      'Tech Debt Level',
      'Bug Rate',
      'Code Quality Score',
    ],
    successCriteria: 'Ship MVP in predicted time ±1 week with <5 critical bugs',
  },
  
  additionalPrompts: [
    {
      name: 'frontend',
      type: 'list',
      message: 'Frontend framework:',
      choices: ['Next.js', 'React', 'Vue', 'Svelte', 'Vanilla JS'],
      default: 'Next.js',
    },
    {
      name: 'backend',
      type: 'list',
      message: 'Backend framework:',
      choices: ['Next.js API Routes', 'Node/Express', 'Python/FastAPI', 'Go', 'Ruby/Rails'],
      default: 'Next.js API Routes',
    },
    {
      name: 'database',
      type: 'list',
      message: 'Database:',
      choices: ['PostgreSQL', 'MongoDB', 'SQLite', 'Supabase', 'Firebase', 'Planetscale'],
      default: 'Supabase',
    },
    {
      name: 'hosting',
      type: 'list',
      message: 'Hosting platform:',
      choices: ['Vercel', 'Netlify', 'Railway', 'Fly.io', 'AWS', 'GCP'],
      default: 'Vercel',
    },
    {
      name: 'featuresPlanned',
      type: 'number',
      message: 'Number of features for MVP:',
      default: 10,
      validate: (input: number) => input > 0 ? true : 'Must plan at least 1 feature',
    },
    {
      name: 'weeksAvailable',
      type: 'number',
      message: 'Weeks available to build:',
      default: 8,
      validate: (input: number) => input > 0 ? true : 'Must have at least 1 week',
    },
    {
      name: 'hoursPerWeek',
      type: 'number',
      message: 'Hours per week you can code:',
      default: 20,
      validate: (input: number) => input > 0 && input <= 168 ? true : 'Must be 1-168 hours',
    },
    {
      name: 'teamSize',
      type: 'number',
      message: 'Team size (including you):',
      default: 1,
      validate: (input: number) => input > 0 ? true : 'Team must have at least 1 person',
    },
    {
      name: 'testCoverage',
      type: 'number',
      message: 'Target test coverage (%):',
      default: 70,
      validate: (input: number) => input >= 0 && input <= 100 ? true : 'Must be 0-100%',
    },
    {
      name: 'techDebtTolerance',
      type: 'list',
      message: 'Technical debt tolerance:',
      choices: ['low', 'medium', 'high'],
      default: 'medium',
    },
    {
      name: 'codeReviewRequired',
      type: 'confirm',
      message: 'Require code review for all changes?',
      default: true,
    },
    {
      name: 'deploymentFrequency',
      type: 'list',
      message: 'How often will you deploy?',
      choices: ['daily', 'weekly', 'sprint', 'monthly'],
      default: 'weekly',
    },
    {
      name: 'cicdPipeline',
      type: 'confirm',
      message: 'Setup CI/CD pipeline?',
      default: true,
    },
    {
      name: 'agentTypes',
      type: 'input',
      message: 'Which agent types to support? (comma-separated):',
      default: 'entrepreneur,builder,researcher,activist',
      validate: (input: string) => input.trim() ? true : 'Must specify at least one agent type',
    },
    {
      name: 'userFlow',
      type: 'input',
      message: 'Primary user journey (one sentence):',
      default: 'User creates idea → chooses agent type → gets specialized requirements → builds with AI assistance',
    },
  ],
  
  requirementsTemplate: (inputs: BuilderInputs) => {
    const velocity = calculateShipVelocity(inputs);
    const agentList = typeof inputs.agentTypes === 'string' 
      ? inputs.agentTypes.split(',').map(s => s.trim())
      : inputs.agentTypes;
    const timestamp = new Date().toISOString();
    
    return `# Requirements: ${inputs.ideaName}

**Type:** Builder Agent  
**Game:** Ship Velocity  
**Output:** AI Cofounder Webapp
**Generated:** ${timestamp}  
**Status:** Draft

---

## 🔨 Velocity Overview

### Shipping Metrics
- **Features Planned:** ${inputs.featuresPlanned}
- **Predicted Velocity:** ${velocity.featuresPerWeek.toFixed(2)} features/week
- **Weeks to MVP:** ${velocity.weeksToMVP} weeks
- **Total Dev Hours:** ${velocity.totalDevHours} hours
- **Velocity Score:** ${velocity.velocityScore.toFixed(2)}

### Quality Gates
- **Test Coverage Target:** ${inputs.testCoverage}%
- **Code Review:** ${inputs.codeReviewRequired ? 'Required' : 'Optional'}
- **Tech Debt Tolerance:** ${inputs.techDebtTolerance.toUpperCase()}
- **Tech Debt Risk:** ${velocity.techDebtRisk}

### Deployment
- **Frequency:** ${velocity.deploymentCadence}
- **CI/CD:** ${inputs.cicdPipeline ? 'Enabled' : 'Manual'}
- **Target:** Ship ${inputs.deploymentFrequency} without breaking production

${velocity.weeksToMVP > inputs.weeksAvailable ? `
⚠️ **WARNING:** Predicted ${velocity.weeksToMVP} weeks > Available ${inputs.weeksAvailable} weeks
- Reduce features from ${inputs.featuresPlanned} to ${Math.floor(inputs.featuresPlanned * inputs.weeksAvailable / velocity.weeksToMVP)}
- OR increase hours/week from ${inputs.hoursPerWeek} to ${Math.ceil(inputs.hoursPerWeek * velocity.weeksToMVP / inputs.weeksAvailable)}
- OR accept lower quality (increase tech debt tolerance)
` : ''}

${inputs.techDebtTolerance === 'high' && !inputs.codeReviewRequired ? `
⚠️ **CAUTION:** High tech debt + No code review = HIGH RISK
- Fast shipping but quality will suffer
- Expect major refactors in 3-6 months
- Bug rate will be elevated
` : ''}

${velocity.featuresPerWeek < 1.0 ? `
⚠️ **SLOW VELOCITY:** ${velocity.featuresPerWeek.toFixed(2)} features/week is below industry average
- Consider: Reducing test coverage target
- Consider: Increasing tech debt tolerance
- Consider: Adding team members
- Consider: Simplifying features
` : ''}

${velocity.featuresPerWeek > 2.0 ? `
✅ **FAST VELOCITY:** ${velocity.featuresPerWeek.toFixed(2)} features/week is excellent
- Quality checks: Ensure tests are meaningful, not just hitting coverage
- Sustainability: Can you maintain this pace for ${velocity.weeksToMVP} weeks?
` : ''}

---

## 📊 Game Metrics

This idea will be tracked against:

1. **Ship Velocity**
   - Predicted: ${velocity.featuresPerWeek.toFixed(2)} features/week
   - Target: ±0.5 features/week accuracy
   
2. **Time to MVP**
   - Predicted: ${velocity.weeksToMVP} weeks
   - Target: ±1 week accuracy
   
3. **Deployment Frequency**
   - Target: ${inputs.deploymentFrequency} deployments
   - Target: 100% successful deploys
   
4. **Tech Debt Level**
   - Risk: ${velocity.techDebtRisk}
   - Target: Stays at or below predicted risk
   
5. **Bug Rate**
   - Target: <5 critical bugs in first month post-launch
   - Target: <20 minor bugs in first month

**Winning this game means:** Ship on time, maintain velocity, keep tech debt under control.

---

## 1. Overview

### Idea Description
${inputs.description}

### Problem Statement
${inputs.problem}

### Target Users
${inputs.targetUsers}

### Primary Output
**AI Cofounder Webapp** - A web application that provides specialized AI agents to help entrepreneurs build their ideas faster.

---

## 2. Objectives

### Primary Goal
Ship MVP of AI Cofounder Webapp in ${velocity.weeksToMVP} weeks with ${inputs.featuresPlanned} core features.

### Success Criteria (Builder Game)
- ✅ Ship within ${velocity.weeksToMVP} weeks (±1 week)
- ✅ Deliver all ${inputs.featuresPlanned} planned features
- ✅ Achieve ${inputs.testCoverage}% test coverage
- ✅ Deploy ${inputs.deploymentFrequency} successfully
- ✅ <5 critical bugs in first month
- ✅ Maintain ${velocity.featuresPerWeek.toFixed(2)} features/week velocity
- ✅ ${inputs.successCriteria}

### Timeline
- **MVP:** ${velocity.weeksToMVP} weeks
- **First Deploy:** Week ${Math.ceil(velocity.weeksToMVP / 4)} (first feature complete)
- **Beta Launch:** Week ${velocity.weeksToMVP}
- **Target:** ${inputs.timeframe}

---

## 3. Technical Stack

### Frontend
- **Framework:** ${inputs.frontend}
- **Why:** ${getTechJustification(inputs.frontend, 'frontend')}
- **Velocity Impact:** ${getVelocityImpact(inputs.frontend)}

### Backend
- **Framework:** ${inputs.backend}
- **Why:** ${getTechJustification(inputs.backend, 'backend')}
- **Velocity Impact:** ${getVelocityImpact(inputs.backend)}

### Database
- **System:** ${inputs.database}
- **Why:** ${getTechJustification(inputs.database, 'database')}
- **Velocity Impact:** ${getVelocityImpact(inputs.database)}

### Hosting
- **Platform:** ${inputs.hosting}
- **Why:** ${getTechJustification(inputs.hosting, 'hosting')}
- **Velocity Impact:** ${getVelocityImpact(inputs.hosting)}
- **Deploy Frequency:** Supports ${inputs.deploymentFrequency} deploys

### Development Tools
- **CI/CD:** ${inputs.cicdPipeline ? 'GitHub Actions / Vercel Deploy' : 'Manual deployment'}
- **Testing:** Vitest + Playwright (target ${inputs.testCoverage}% coverage)
- **Linting:** ESLint + Prettier
- **Code Review:** ${inputs.codeReviewRequired ? 'Required via PR review' : 'Optional peer review'}

---

## 4. Core Features (${inputs.featuresPlanned} for MVP)

### AI Cofounder Webapp Features

**Week 1-2: Foundation (${Math.ceil(inputs.featuresPlanned * 0.2)} features)**
1. User authentication (email/password)
2. Agent type selection UI
3. Basic idea creation flow

**Week 3-4: Agent Integration (${Math.ceil(inputs.featuresPlanned * 0.3)} features)**
4. Entrepreneur agent integration
5. Requirements generation
6. Idea workspace creation
7. AI-enhanced requirements (OpenRouter)

**Week 5-6: Build Tools (${Math.ceil(inputs.featuresPlanned * 0.3)} features)**
8. Develop branch creation
9. Agent command dashboard
10. Progress tracking

**Week 7-${velocity.weeksToMVP}: Polish (${inputs.featuresPlanned - Math.ceil(inputs.featuresPlanned * 0.8)} features)**
${inputs.featuresPlanned > 10 ? `11. Additional agent types (${agentList.join(', ')})` : ''}
${inputs.featuresPlanned > 11 ? `12. Real-time collaboration` : ''}
${inputs.featuresPlanned > 12 ? `13. Export/share functionality` : ''}

### Supported Agent Types
${agentList.map((agent: string, i: number) => `${i + 1}. **${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent** - ${getAgentDescription(agent)}`).join('\n')}

### Primary User Journey
${inputs.userFlow}

---

## 5. Velocity Optimization

### Shipping Strategy
- **Sprint Length:** ${inputs.deploymentFrequency === 'daily' ? '1 day' : inputs.deploymentFrequency === 'weekly' ? '1 week' : '2 weeks'}
- **Features per Sprint:** ${(velocity.featuresPerWeek * (inputs.deploymentFrequency === 'daily' ? 0.2 : inputs.deploymentFrequency === 'weekly' ? 1 : 2)).toFixed(1)}
- **Review Process:** ${inputs.codeReviewRequired ? 'PR review required' : 'Self-review acceptable'}
- **Tech Debt:** ${inputs.techDebtTolerance === 'high' ? 'Ship fast, refactor later' : inputs.techDebtTolerance === 'medium' ? 'Balance quality and speed' : 'Quality first, speed second'}

### Quality Gates
- **Tests:** ${inputs.testCoverage}% coverage required before merge
- **Linting:** Must pass ESLint
- **Type Safety:** Must pass TypeScript compilation
- **Performance:** Lighthouse score >80

### Blockers to Avoid
1. **Over-engineering:** Ship MVP features, not perfect features
2. **Bikeshedding:** Don't debate colors for 2 hours
3. **Premature optimization:** Make it work, then make it fast
4. **Scope creep:** Lock features, ship, then iterate
5. **Analysis paralysis:** 80% confident = ship it

---

## 6. Development Workflow

### Daily Routine (${inputs.hoursPerWeek / 5} hours/day)
1. **Morning:** Pick highest priority feature
2. **Midday:** Write tests, implement feature
3. **Afternoon:** Review, deploy to staging
4. **Evening:** Test in staging, fix bugs
5. **End of day:** Merge if tests pass, deploy if ${inputs.deploymentFrequency}

### Weekly Cadence
- **Monday:** Sprint planning, feature breakdown
- **Tue-Thu:** Build, test, ship
- **Friday:** Deploy to production, retrospective
- **Weekend:** ${inputs.hoursPerWeek > 40 ? 'Keep building' : 'Rest (avoid burnout)'}

### Deployment Process
${inputs.cicdPipeline ? `
**Automated CI/CD:**
1. Push to GitHub
2. Tests run automatically
3. Deploy to staging on merge to develop
4. Deploy to production on merge to main
5. Rollback if errors detected
` : `
**Manual Deployment:**
1. Run tests locally
2. Build production bundle
3. Deploy via ${inputs.hosting} CLI
4. Verify production
5. Monitor for errors
`}

---

## 7. Risk Analysis (Builder Lens)

### Velocity Risks

**Risk: Features take longer than estimated**
- Impact: Miss ${velocity.weeksToMVP}-week target
- Probability: High (estimates are always wrong)
- Mitigation: Buffer 20% time, cut scope if needed
- Warning Sign: Week ${Math.ceil(velocity.weeksToMVP / 3)} and <33% features done

**Risk: Tech debt slows future work**
- Impact: Velocity drops from ${velocity.featuresPerWeek.toFixed(2)} to ${(velocity.featuresPerWeek * 0.5).toFixed(2)} features/week
- Probability: ${inputs.techDebtTolerance === 'high' ? 'High' : inputs.techDebtTolerance === 'medium' ? 'Medium' : 'Low'}
- Mitigation: ${inputs.techDebtTolerance === 'high' ? 'Plan refactor sprints every 4 weeks' : 'Maintain code quality from start'}
- Warning Sign: PRs taking >2 days due to complexity

**Risk: Bug rate exceeds capacity to fix**
- Impact: Spend time fixing instead of building
- Probability: ${inputs.testCoverage < 50 ? 'High' : inputs.testCoverage < 80 ? 'Medium' : 'Low'}
- Mitigation: ${inputs.testCoverage < 50 ? 'Increase test coverage to 70%+' : 'Maintain current testing practices'}
- Warning Sign: >10 bugs reported per week

**Risk: Burnout from ${inputs.hoursPerWeek} hours/week**
- Impact: Velocity crashes, project stalls
- Probability: ${inputs.hoursPerWeek > 40 ? 'High' : inputs.hoursPerWeek > 25 ? 'Medium' : 'Low'}
- Mitigation: ${inputs.hoursPerWeek > 40 ? 'Reduce to 30 hours or add team member' : 'Maintain sustainable pace'}
- Warning Sign: Skipping days, feeling dread about coding

### Technical Risks

**Risk: ${inputs.frontend} has breaking changes**
- Impact: Delays of 1-2 weeks
- Probability: Low (use stable versions)
- Mitigation: Pin versions, don't upgrade mid-build

**Risk: ${inputs.hosting} downtime**
- Impact: Can't deploy, users can't access
- Probability: Very Low (${getHostingUptime(inputs.hosting)}% uptime)
- Mitigation: Have backup hosting plan

---

## 8. Tracking & Learning System

### Weekly Check-ins
*Update every ${inputs.deploymentFrequency}*

**Velocity Actuals:**
- [ ] Features shipped this week: ______
- [ ] Hours spent coding: ______
- [ ] Bugs introduced: ______
- [ ] Bugs fixed: ______
- [ ] Current velocity: ______ features/week

**Quality Actuals:**
- [ ] Test coverage: ______%
- [ ] Linting errors: ______
- [ ] TypeScript errors: ______
- [ ] Production bugs: ______

**Deployment Actuals:**
- [ ] Successful deploys: ______
- [ ] Failed deploys: ______
- [ ] Rollbacks: ______
- [ ] Downtime: ______ minutes

**Learning Adjustments:**
- [ ] Velocity prediction accurate? (Y/N + adjustment)
- [ ] Time estimates accurate? (Y/N + adjustment)
- [ ] Tech debt manageable? (Y/N + action)
- [ ] Quality sufficient? (Y/N + action)

**Prediction Updates:**
- [ ] New predicted velocity: ______ features/week
- [ ] New predicted completion: Week ______
- [ ] Confidence level: Low/Medium/High

---

## 9. Go/No-Go Decision Points

### Week ${Math.ceil(velocity.weeksToMVP / 4)} Checkpoint (25% mark)
**If NO to any, cut scope or extend timeline:**
- [ ] ${Math.ceil(inputs.featuresPlanned * 0.25)} features complete?
- [ ] Velocity still ${velocity.featuresPerWeek.toFixed(2)} features/week?
- [ ] Tech debt under control?
- [ ] Still have ${inputs.hoursPerWeek} hours/week available?
- [ ] No major technical blockers?

### Week ${Math.ceil(velocity.weeksToMVP / 2)} Checkpoint (50% mark)
**If NO to any, reassess timeline:**
- [ ] ${Math.ceil(inputs.featuresPlanned * 0.5)} features complete?
- [ ] Can still ship in ${velocity.weeksToMVP} weeks?
- [ ] Test coverage above ${inputs.testCoverage - 10}%?
- [ ] Production-ready infrastructure?
- [ ] No burnout symptoms?

### Week ${Math.ceil(velocity.weeksToMVP * 0.75)} Checkpoint (75% mark)
**If NO to any, consider MVP reduction:**
- [ ] ${Math.ceil(inputs.featuresPlanned * 0.75)} features complete?
- [ ] Remaining features achievable in ${Math.ceil(velocity.weeksToMVP * 0.25)} weeks?
- [ ] Beta-ready quality?
- [ ] Deployment pipeline working?
- [ ] Ready for users?

---

## 10. Builder Game Rules

### How to Win
1. **Ship within predicted time ±1 week** (accuracy matters)
2. **Maintain velocity** (consistency beats bursts)
3. **Keep tech debt manageable** (sustainable pace)
4. **Learn from estimates** (get better at predicting)

### How to Lose
1. Ignore velocity data (keep building blindly)
2. Skip testing (ship fast, break everything)
3. Accumulate tech debt (slow to a crawl)
4. Burn out (quit after 3 weeks)

### Scoring
- **Velocity Accuracy:** (100 - |predicted - actual| / predicted * 100)%
- **Timeline Accuracy:** (100 - |predicted weeks - actual weeks| / predicted weeks * 100)%
- **Quality Score:** (test coverage + deployment success) / 2
- **Sustainability:** Did you maintain pace without burning out?

**Overall Score:** (Velocity + Timeline + Quality + Sustainability) / 4

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

**This is a Builder Agent requirements document.**

**Game:** Ship Velocity  
**Output:** AI Cofounder Webapp  
**Predicted Velocity:** ${velocity.featuresPerWeek.toFixed(2)} features/week  
**Weeks to MVP:** ${velocity.weeksToMVP}  
**Tech Stack:** ${inputs.frontend} + ${inputs.backend} + ${inputs.database} on ${inputs.hosting}

**Track velocity weekly. Adjust predictions monthly. Win by shipping on time.**

---

*Next: Create develop branch and start building. Ship fast, ship often.*
`;
  },
  
  validators: [
    {
      name: 'velocity-achievable',
      required: false,
      validate: async (inputs: BuilderInputs) => {
        const velocity = calculateShipVelocity(inputs);
        if (velocity.weeksToMVP > inputs.weeksAvailable) {
          return {
            valid: true,
            warnings: [
              `Predicted ${velocity.weeksToMVP} weeks > Available ${inputs.weeksAvailable} weeks`,
              `Reduce features or increase hours/week`,
            ],
          };
        }
        return { valid: true };
      },
    },
    {
      name: 'tech-debt-risk',
      required: false,
      validate: async (inputs: BuilderInputs) => {
        if (inputs.techDebtTolerance === 'high' && !inputs.codeReviewRequired) {
          return {
            valid: true,
            warnings: [
              'High tech debt + no code review = HIGH RISK',
              'Expect major refactors in 3-6 months',
            ],
          };
        }
        return { valid: true };
      },
    },
  ],
  
  learningEnabled: true,
  
  understands: ['time', 'features', 'velocity', 'technical_debt', 'quality', 'deployment'],
  
  customCommands: [
    'velocity-report',
    'tech-debt-check',
    'deploy',
  ],
};

// Helper functions

function getTechJustification(tech: string, category: string): string {
  const justifications: Record<string, Record<string, string>> = {
    frontend: {
      'Next.js': 'Full-stack React with great DX, fast builds, SEO ready',
      'React': 'Most popular, huge ecosystem, easy to hire for',
      'Vue': 'Gentle learning curve, great docs, progressive framework',
      'Svelte': 'Fastest, smallest bundle, compile-time framework',
      'Vanilla JS': 'No framework overhead, maximum control',
    },
    backend: {
      'Next.js API Routes': 'Same codebase as frontend, unified deployment',
      'Node/Express': 'Industry standard, mature ecosystem',
      'Python/FastAPI': 'Fast development, great for AI integration',
      'Go': 'High performance, low resource usage',
      'Ruby/Rails': 'Convention over configuration, rapid prototyping',
    },
    database: {
      'PostgreSQL': 'Powerful, reliable, great for complex queries',
      'MongoDB': 'Flexible schema, good for rapid iteration',
      'SQLite': 'Zero config, perfect for MVP',
      'Supabase': 'Postgres + Auth + Storage, fast setup',
      'Firebase': 'Real-time, auth included, Google infrastructure',
      'Planetscale': 'MySQL with Git-like branching, scales well',
    },
    hosting: {
      'Vercel': 'Next.js native, zero-config, great DX',
      'Netlify': 'Excellent CI/CD, generous free tier',
      'Railway': 'Full-stack deployments, simple database setup',
      'Fly.io': 'Edge deployment, Docker-based, global',
      'AWS': 'Maximum control, scales infinitely',
      'GCP': 'Good AI/ML integration, competitive pricing',
    },
  };
  
  return justifications[category]?.[tech] || 'Standard choice for this use case';
}

function getVelocityImpact(tech: string): string {
  const impacts: Record<string, string> = {
    'Next.js': 'Fast (integrated tooling)',
    'React': 'Medium (need additional setup)',
    'Vue': 'Fast (batteries included)',
    'Svelte': 'Fast (simple syntax)',
    'Vanilla JS': 'Slow (build everything)',
    'Next.js API Routes': 'Fast (no context switching)',
    'Node/Express': 'Medium (standard setup)',
    'Python/FastAPI': 'Fast (auto-docs, simple syntax)',
    'Go': 'Slow (verbose, compiled)',
    'Ruby/Rails': 'Fast (convention over config)',
    'PostgreSQL': 'Medium (robust but complex)',
    'MongoDB': 'Fast (flexible schema)',
    'SQLite': 'Very Fast (zero config)',
    'Supabase': 'Very Fast (auth + DB ready)',
    'Firebase': 'Very Fast (real-time ready)',
    'Planetscale': 'Fast (branches like Git)',
    'Vercel': 'Very Fast (push to deploy)',
    'Netlify': 'Very Fast (git-based deploys)',
    'Railway': 'Fast (simple setup)',
    'Fly.io': 'Medium (Docker learning curve)',
    'AWS': 'Slow (complex setup)',
    'GCP': 'Medium (moderate learning curve)',
  };
  
  return impacts[tech] || 'Medium';
}

function getAgentDescription(agent: string): string {
  const descriptions: Record<string, string> = {
    entrepreneur: 'Tracks ROI, financial projections',
    builder: 'Tracks velocity, technical quality',
    researcher: 'Gathers context, market intelligence',
    activist: 'Manages pivots, marketing strategy',
    speculator: 'Forecasts futures, investment flows',
    validator: 'Collects feedback, validates assumptions',
    whale: 'Optimizes for scale and impact',
  };
  
  return descriptions[agent.toLowerCase()] || 'Specialized agent';
}

function getHostingUptime(hosting: string): number {
  const uptimes: Record<string, number> = {
    'Vercel': 99.99,
    'Netlify': 99.99,
    'Railway': 99.9,
    'Fly.io': 99.95,
    'AWS': 99.99,
    'GCP': 99.95,
  };
  
  return uptimes[hosting] || 99.9;
}

