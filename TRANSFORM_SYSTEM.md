# Transform System: Specialized Agent Games

**TL;DR:** `build-agent transform entrepreneur` → creates entrepreneur-agent that plays the ROI game

---

## 🎮 Concept: Agent Games

**The Problem:** build-agent is general-purpose. But different people optimize for different things.

**The Solution:** Transform build-agent into specialized versions that play specific "games":

| Agent Type | Game | What It Measures |
|------------|------|------------------|
| **Entrepreneur** | ROI Accuracy | TIME + MONEY → Return on Investment |
| Builder | Ship Velocity | FEATURES / TIME → Shipping speed |
| Researcher | Pattern Recognition | INSIGHTS / DATA → Learning rate |
| Validator | User Feedback | VALIDATION / ASSUMPTION → Market fit |
| Activist | Pivot Speed | TIME_TO_RIGHT_ANSWER → Adaptation rate |
| Whale | Scale Impact | USERS × VALUE → Total impact |
| Speculator | Future Accuracy | PREDICTIONS / REALITY → Forecasting skill |

**Each agent:**
- Has domain-specific prompts
- Tracks domain-specific metrics
- Learns from actual vs predicted
- Can communicate with other agents that understand its metrics

---

## 🚀 Quick Start

### Create Entrepreneur Agent

```bash
# Transform build-agent into entrepreneur-agent
cd /Users/leoguinan/engineering_dept/build-agent
build-agent transform entrepreneur

# Setup new agent
cd entrepreneur-agent
npm install
npm run build
npm link

# Use it
entrepreneur-agent create
```

### What Gets Created

```
entrepreneur-agent/
├── src/
│   ├── commands/
│   │   ├── create.ts      (uses entrepreneur prompts)
│   │   ├── develop.ts     (same)
│   │   ├── plan.ts        (same)
│   │   └── solve.ts       (same)
│   └── transforms/
│       ├── entrepreneur.ts (ROI calculator, prompts)
│       ├── registry.ts     (transform catalog)
│       └── types.ts        (game interfaces)
├── .tracking/              (actual vs predicted data)
├── AGENT_IDENTITY.json     (knows what game it plays)
├── package.json            (entrepreneur-agent binary)
└── README.md              (game-specific docs)
```

---

## 📊 Entrepreneur Agent: The ROI Game

### Game Definition

**Objective:** Predict and achieve positive ROI as accurately as possible

**Metrics Tracked:**
- Predicted ROI vs Actual ROI
- Break-even Time (predicted vs actual)
- Customer Acquisition (target vs actual)
- Revenue Growth (predicted vs actual)
- Cost Accuracy (predicted vs actual)

**Success Criteria:** ±10% ROI prediction accuracy within 6 months

### Additional Prompts

When you create an idea with entrepreneur-agent, you get these extra questions:

```
Financial:
- Initial budget/capital available: $_____
- Expected monthly operating costs: $_____
- Revenue model: [Subscription|One-time|Usage-based|etc.]
- Price point per customer/month: $_____
- Target customers in first 6 months: _____

Time:
- Hours per week you can dedicate: _____
- Weeks to build MVP: _____
- Weeks until first revenue (after MVP): _____
```

### ROI Calculation

```typescript
developmentCost = weeklyHours × timeToMVP × $100/hr (time value)
totalInvestment = initialBudget + developmentCost + operatingCosts

firstYearRevenue = targetCustomers × pricePoint × 12
firstYearCosts = monthlyCosts × 12
netProfit = firstYearRevenue - firstYearCosts - totalInvestment

ROI = (netProfit / totalInvestment) × 100%

breakEven = weeksToRevenue + ((totalInvestment / monthlyProfit) × 4)
```

### What Gets Generated

The entrepreneur-agent generates requirements documents with:

1. **Financial Overview**
   - Investment breakdown
   - Revenue projections
   - Predicted ROI with confidence

2. **Economic Analysis**
   - Cost structure
   - Revenue projections by month
   - Key assumptions to validate

3. **Game Metrics Dashboard**
   - All predictions stated upfront
   - Target accuracy metrics
   - Winning conditions

4. **Monthly Check-ins**
   - Actual vs predicted tracking
   - Learning adjustments
   - Go/No-Go decision points

5. **ROI Warnings**
   - Negative ROI alert
   - Low ROI caution  
   - Break-even timeframe assessment

---

## 🎯 Example: Entrepreneur Agent in Action

### Step 1: Create Entrepreneur Agent

```bash
build-agent transform entrepreneur
cd entrepreneur-agent
npm install && npm run build && npm link
```

### Step 2: Create Idea with ROI Tracking

```bash
entrepreneur-agent create

# Standard prompts
? What's your idea called? Task Manager Pro
? Describe it: AI-powered task management for small teams
? Problem: Teams waste time on manual prioritization
? Target users: Development teams (5-20 people)
? Constraints: Must integrate with Slack, GitHub
? Success: 50 teams, <200ms response, 95% uptime
? Timeframe: 3 months

# ENTREPRENEUR-SPECIFIC PROMPTS
? Initial budget: $5000
? Monthly costs: $500
? Revenue model: Subscription (recurring)
? Price point: $49/month
? Target customers: 100 in 6 months
? Weekly hours: 20
? Weeks to MVP: 8
? Weeks to first revenue: 4

✅ Idea created with ROI tracking!

📊 Predicted ROI: 127.3%
📊 Break-even: 18 weeks
📊 Monthly revenue target: $4,900
```

### Step 3: Review Requirements

```bash
cd workspaces/task-manager-pro
cat REQUIREMENTS.md
```

**Generated REQUIREMENTS.md includes:**

```markdown
## 💰 Financial Overview

### Investment
- Initial Budget: $5,000
- Development Time Value: $16,000 (20h/week × 8 weeks × $100/hr)
- Total Investment: $23,000

### Revenue Model
- Model: Subscription (recurring)
- Price Point: $49/month
- Target: 100 customers in 6 months
- Projected MRR: $4,900

### Predicted ROI
- First Year ROI: 127.3%
- Break-even: 18 weeks
- Net Profit (Year 1): $29,280

✅ STRONG: Excellent predicted ROI (127.3%). High potential if assumptions hold.

## 📊 Game Metrics

1. **ROI Prediction Accuracy**
   - Predicted: 127.3%
   - Target: ±10% accuracy at 6 months
   
2. **Break-even Achievement**
   - Predicted: 18 weeks
   - Target: Within ±2 weeks
   
3. **Customer Acquisition**
   - Target: 100 customers
   - Target: ±20% accuracy
   
4. **Revenue Growth**
   - Target: $4,900/month
   - Target: ±15% accuracy

**Winning this game means:** Predictions were accurate AND achieved positive ROI.

...

## 8. Tracking & Learning System

### Monthly Check-ins
*Update these metrics monthly*

**Financial Actuals:**
- [ ] Actual costs this month: $______
- [ ] Actual revenue this month: $______
- [ ] Actual customers acquired: ______
- [ ] Current MRR: $______

**Time Actuals:**
- [ ] Hours spent this week: ______
- [ ] Weeks into development: ______

**Learning Adjustments:**
- [ ] Cost assumptions accurate? (Y/N + adjustment)
- [ ] Revenue assumptions accurate? (Y/N + adjustment)
- [ ] New predicted ROI: ______%
- [ ] Confidence level: Low/Medium/High

## 9. Go/No-Go Decision Points

### Week 4 Checkpoint
- [ ] On track for 8-week MVP?
- [ ] $49/month acceptable to market?
- [ ] Costs under $500/month?
- [ ] Still have 20 hours/week?

### Week 12 Checkpoint (First Revenue)
- [ ] MVP shipped?
- [ ] First paying customer?
- [ ] Path to 10 customers visible?

### Month 6 Checkpoint
- [ ] At least 50 customers?
- [ ] MRR above $2,450?
- [ ] ROI prediction still positive?
```

### Step 4: Build & Track

```bash
# Start development
entrepreneur-agent develop

# Build with existing tools
entrepreneur-agent plan . "Build authentication"
# or
cursor .

# Track actuals monthly (future feature)
entrepreneur-agent track-actual task-manager-pro
```

---

## 🏗️ Architecture

### Transform System Components

```
src/transforms/
├── types.ts              # Core interfaces
│   ├── AgentGame        # Game definition
│   ├── Transform        # Transform specification
│   ├── TransformPrompt  # Additional prompts
│   ├── TransformValidator # Validation rules
│   ├── IdeaTracking     # Actuals tracking
│   └── AgentIdentity    # Self-awareness
│
├── registry.ts          # Transform catalog
│   ├── transforms{}     # Available transforms
│   ├── getTransform()   # Lookup by ID
│   └── descriptions{}   # Display info
│
└── entrepreneur.ts      # Entrepreneur transform
    ├── EntrepreneurInputs
    ├── calculatePredictedROI()
    ├── entrepreneurTransform{}
    ├── additionalPrompts[]
    ├── requirementsTemplate()
    └── validators[]
```

### How Transform Works

1. **User runs:** `build-agent transform entrepreneur`
2. **System:**
   - Loads entrepreneur transform from registry
   - Shows game description and metrics
   - Asks for confirmation
3. **Transform process:**
   - Copies entire build-agent directory
   - Excludes: node_modules, dist, workspaces, .git
   - Updates package.json (name, description, binary)
   - Creates AGENT_IDENTITY.json
   - Updates README with game-specific docs
   - Updates CLI name references
   - Adds transform-specific imports
   - Initializes .tracking/ directory
   - Creates new git repo
4. **Result:** Independent specialized agent

---

## 🧠 Agent Identity & Self-Awareness

### AGENT_IDENTITY.json

Every transformed agent knows what it is:

```json
{
  "type": "entrepreneur",
  "game": {
    "name": "ROI Accuracy",
    "description": "Predict and achieve positive ROI as accurately as possible",
    "metrics": [
      "Predicted ROI",
      "Actual ROI",
      "Prediction Accuracy",
      "Break-even Time",
      "Customer Acquisition",
      "Revenue Growth"
    ],
    "successCriteria": "±10% ROI prediction accuracy within 6 months"
  },
  "version": "1.0.0",
  "created": "2025-10-17T...",
  "parentAgent": "build-agent"
}
```

### Interoperability via "Understands"

```typescript
entrepreneurTransform.understands = [
  'time',
  'money',
  'roi',
  'customers',
  'revenue'
];

builderTransform.understands = [
  'time',
  'features',
  'velocity',
  'technical_debt'
];

// Agents can share metrics they both understand
// Example: both understand "time" → can compare time estimates
```

---

## 🎲 Future Agent Games

### Builder Agent (Not Yet Implemented)

**Game:** Ship Velocity  
**Formula:** Features / Time  
**Tracks:**
- Features shipped per week
- Time per feature
- Technical debt accumulation
- Velocity trend

**Additional Prompts:**
- Features planned
- Ideal shipping cadence
- Acceptable tech debt level

### Researcher Agent (Not Yet Implemented)

**Game:** Pattern Recognition  
**Formula:** Insights / Data  
**Tracks:**
- Patterns identified
- Research time invested
- Pattern validation rate
- Learning velocity

**Additional Prompts:**
- Research questions
- Data sources
- Pattern hypothesis

### Validator Agent (Not Yet Implemented)

**Game:** User Feedback  
**Formula:** Validation / Assumption  
**Tracks:**
- Assumptions stated
- Validations completed
- Accuracy of assumptions
- Pivot triggers

**Additional Prompts:**
- Key assumptions
- Validation methods
- Acceptable validation rate

---

## 📈 Learning System (Architecture)

### How Learning Works

1. **At Creation:** Agent makes predictions based on inputs
2. **Monthly Tracking:** User updates actuals
3. **Accuracy Calculation:** System compares predicted vs actual
4. **Pattern Recognition:** System identifies your biases
5. **Adjustment:** Future predictions adjusted based on history

### Example Learning

**Idea 1:**
- Predicted: 8 weeks to MVP
- Actual: 14 weeks
- Learning: You underestimate by 75%

**Idea 2:**
- Predicted: 10 weeks (adjusted: 10 × 1.75 = 17.5 weeks)
- Actual: 16 weeks
- Learning: Adjustment factor now 1.6x

**Idea 3:**
- Predicted: 12 weeks (adjusted: 12 × 1.6 = 19.2 weeks)
- Actual: 18 weeks
- Learning: Converging to accurate predictions

**Goal:** By idea 5-10, your predictions are consistently accurate.

---

## 🔗 Interop Example

### Scenario: Entrepreneur Consults Builder

```typescript
// entrepreneur-agent working on idea
const entrepreneurIdea = {
  predictedROI: 127%,
  timeToMVP: 8 weeks,
  features: ['auth', 'dashboard', 'billing'],
};

// Consult builder-agent for velocity estimate
const builderEstimate = await builderAgent.estimateVelocity({
  features: entrepreneurIdea.features,
  quality: 'MVP',
});

// Builder says: "3 features at MVP quality = 12 weeks at your skill level"
// Entrepreneur updates prediction:
entrepreneurIdea.timeToMVP = builderEstimate.weeks; // 12
entrepreneurIdea.predictedROI = recalculate(); // 89%

// Better prediction due to cross-agent consultation
```

### Shared Metrics Language

All agents that understand "time" use the same units:
- Hours per week
- Weeks to milestone
- Value per hour

This enables agents to share and compare data.

---

## 🎮 Playing Multiple Games

**You can have multiple specialized agents:**

```bash
build-agent transform entrepreneur  → entrepreneur-agent/
build-agent transform builder       → builder-agent/
build-agent transform researcher    → researcher-agent/
```

**Use cases:**

1. **Same idea, different lenses:**
   - entrepreneur-agent: Is this profitable?
   - builder-agent: Can I ship this fast?
   - researcher-agent: Will users actually want this?

2. **Different ideas, different games:**
   - SaaS product → entrepreneur-agent (ROI matters)
   - Open source tool → builder-agent (velocity matters)
   - Research project → researcher-agent (insights matter)

3. **Team with different roles:**
   - Founder uses entrepreneur-agent
   - Dev lead uses builder-agent
   - Product manager uses validator-agent
   - Everyone shares metrics

---

## 💡 Implementation Details

### Transform Command

```bash
build-agent transform [type]

# Interactive mode
build-agent transform
> Choose transform: entrepreneur

# Direct
build-agent transform entrepreneur

# Custom output
build-agent transform entrepreneur --output-dir ~/my-agents

# List available
build-agent transform --list
```

### Files Modified During Transform

**Updated:**
- `package.json` - Name, description, binary name
- `src/index.ts` - CLI name
- `README.md` - Complete rewrite for game
- `src/commands/create.ts` - Add transform imports

**Created:**
- `AGENT_IDENTITY.json` - Self-awareness
- `.tracking/` - Actual vs predicted data
- `.tracking/README.md` - Don't commit this

**Preserved:**
- All source code (agents, commands, utils)
- All transforms (so transformed agents can transform further)
- Git history starts fresh

---

## 🔮 Future Enhancements

### Phase 1: Additional Transforms (Next)
- [ ] Builder transform
- [ ] Researcher transform
- [ ] Validator transform

### Phase 2: Tracking Commands (Soon)
- [ ] `track-actual` command
- [ ] `roi-report` command
- [ ] `game-status` command
- [ ] Learning adjustment automation

### Phase 3: Agent Communication (Later)
- [ ] Export metrics in standard format
- [ ] Import other agents' data
- [ ] Cross-agent consultation API
- [ ] Multi-agent decision making

### Phase 4: Advanced Features (Future)
- [ ] Transform chains (entrepreneur → validator)
- [ ] Custom transforms (define your own game)
- [ ] Transform marketplace (share games)
- [ ] AI-assisted game design

---

## 🎓 Philosophy: Why Agent Games?

### The Pattern

**Problem:** Everyone optimizes for something different:
- Entrepreneurs optimize for ROI
- Builders optimize for shipping
- Researchers optimize for insights
- Validators optimize for user feedback

**Traditional Solution:** One tool tries to do everything (and does nothing well)

**Our Solution:** One tool that transforms into specialists

### The Bottega 1010 Connection

This is the **Guild System as Code:**

| Guild | Fragment | Game |
|-------|----------|------|
| Apprentice | (General) | Learn to see patterns |
| Entrepreneur | Whale/Speculator | ROI accuracy |
| Builder | Builder | Ship velocity |
| Researcher | Researcher | Pattern recognition |
| Validator | Validator | User feedback |
| Activist | Activist | Pivot speed |
| Master | (All) | Know when to let go |

**Each guild has its own measurements because each Fragment has different dysfunction.**

The agent games map to Fragment-specific metrics:
- Whale: Scale (maximize impact)
- Speculator: Futures (predict accurately)
- Builder: Shipping (move fast)
- Researcher: Patterns (see clearly)
- Validator: Permission (validate quickly)
- Activist: Pivots (adapt rapidly)

---

## 📊 Success Metrics for Transform System

### System Success
- [ ] 3+ transform types implemented
- [ ] Transform process takes < 60 seconds
- [ ] Transformed agents work independently
- [ ] No cross-agent conflicts

### Entrepreneur Agent Success
- [ ] ROI calculations accurate
- [ ] Requirements include all financial projections
- [ ] Go/No-Go checkpoints useful
- [ ] Users track actuals monthly
- [ ] Prediction accuracy improves over time

### Adoption Success
- [ ] Users create 10+ specialized agents
- [ ] Users track 5+ ideas per agent
- [ ] Prediction accuracy improves 20%+ by idea 5
- [ ] Users report better decision making

---

## 🚀 Get Started

```bash
# 1. Create entrepreneur agent
build-agent transform entrepreneur

# 2. Setup
cd entrepreneur-agent
npm install && npm run build && npm link

# 3. Create first idea
entrepreneur-agent create

# 4. Build it
cd workspaces/your-idea
entrepreneur-agent develop

# 5. Win the game
# - Ship within predicted time
# - Hit revenue targets
# - Achieve predicted ROI
# - Learn from actuals
```

---

**The Transform System: Building specialized agents that play specific games**

Each agent knows what it's optimizing for.  
Each agent tracks what matters to its game.  
Each agent learns from reality.

Different games for different Fragments.

**Ready to transform?**

`build-agent transform entrepreneur`

---

**Created:** 2025-10-17  
**Status:** Entrepreneur transform complete, tracking commands in progress  
**Version:** 1.0.0

