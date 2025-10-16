# Decision Log
## CLI Tool for Launching Ideas with Mastra Agents

**Date:** 2025-10-16  
**Phase:** Requirements  
**Status:** Active  
**Branch:** requirements

---

## Decision Log Framework

Each decision is documented with:
1. **Decision ID:** Unique identifier (DEC-XXX)
2. **Date:** When decision was made
3. **Decision Type:** Architecture, Technology, UX, Business, Process
4. **Context:** Why this decision was needed
5. **Options Considered:** What alternatives were evaluated
6. **Decision:** What we chose to do
7. **Rationale:** Why we chose this option
8. **Confidence Score:** 0-100% confidence this is correct
9. **Consequences:** What this decision enables/prevents
10. **Reversibility:** How hard to change later (Easy/Medium/Hard/Irreversible)
11. **Owner:** Who made/approved the decision
12. **Status:** Proposed/Accepted/Superseded

---

## Requirements Phase Decisions

### DEC-001: CLI-First Approach

**Date:** 2025-10-16  
**Type:** Architecture  
**Status:** ✅ Accepted

**Context:**  
Users have access to AI Cofounder Platform via web UI, but developers consistently request faster, scriptable interface. Need to decide: enhance web UI, or build CLI?

**Options Considered:**
1. **Enhanced web UI** - Add keyboard shortcuts, speed improvements
2. **CLI wrapper** - Thin CLI that calls web API
3. **CLI-first** - Full-featured CLI as primary power user interface
4. **Hybrid** - CLI and web evolve equally

**Decision:** CLI-first (Option 3)

**Rationale:**
- Developers live in terminal (70%+ daily terminal usage per surveys)
- Web UI cannot be automated/scripted
- CLI enables new use cases (CI/CD, team automation)
- Can iterate faster on CLI than web UI
- Terminal is natural fit for structured, step-by-step methodology

**Confidence Score:** 85%

**Consequences:**
- ✅ Enables: Automation, scripting, fast workflows, power user delight
- ✅ Enables: CI/CD integration, team workflows
- ❌ Prevents: Visual design tools, rich media in CLI
- ❌ Risk: May alienate non-technical users

**Reversibility:** Medium (can always scale back CLI, keep web as primary)

**Owner:** Product Team  
**AI Recommendation:** "CLI aligns with power user persona and waterfall methodology structure. High confidence this serves target market."

---

### DEC-002: Use Existing Mastra Backend

**Date:** 2025-10-16  
**Type:** Architecture  
**Status:** ✅ Accepted

**Context:**  
CLI needs to execute AI workflows. Options: rewrite agent logic in CLI, or connect to existing Mastra backend?

**Options Considered:**
1. **Rewrite agents in CLI** - Self-contained CLI, no backend needed
2. **Use existing Mastra backend** - CLI is client to Mastra server
3. **Hybrid** - Simple agents in CLI, complex ones call backend

**Decision:** Use existing Mastra backend (Option 2)

**Rationale:**
- Don't duplicate agent logic (DRY principle)
- Backend already has workflows, tools, branch-locking
- Easier to maintain one codebase
- Backend can serve web UI, CLI, API, mobile
- Mastra framework designed for this architecture

**Confidence Score:** 95%

**Consequences:**
- ✅ Enables: Code reuse, faster development, consistency
- ✅ Enables: One source of truth for agent behavior
- ❌ Prevents: Fully offline CLI
- ❌ Requires: Server running (adds setup complexity)

**Reversibility:** Hard (would require full agent reimplementation)

**Owner:** Engineering Team  
**AI Recommendation:** "Strong architectural alignment. Mastra backend is proven, tested, and production-ready."

---

### DEC-003: TypeScript for CLI Implementation

**Date:** 2025-10-16  
**Type:** Technology  
**Status:** ✅ Accepted

**Context:**  
Need to choose programming language for CLI tool. Backend is TypeScript, but CLI could be anything.

**Options Considered:**
1. **Go** - Fast, single binary, good for CLIs
2. **Rust** - Fast, safe, modern
3. **TypeScript** - Same as backend, code sharing
4. **Python** - Popular for CLIs, easy to write

**Decision:** TypeScript (Option 3)

**Rationale:**
- Team already knows TypeScript
- Can share types/interfaces with backend
- npm ecosystem has excellent CLI libraries (commander, inquirer, chalk)
- Can reuse validation logic, API clients
- Faster development (no context switching)

**Confidence Score:** 80%

**Consequences:**
- ✅ Enables: Code sharing, faster dev, team efficiency
- ✅ Enables: Type safety, better IDE support
- ❌ Prevents: Single binary (need Node.js installed)
- ❌ Trade-off: Slightly slower startup than Go/Rust

**Reversibility:** Medium (could port to Go/Rust in v2)

**Owner:** Engineering Lead  
**AI Recommendation:** "Pragmatic choice. Speed of development > marginal performance gains for MVP."

---

### DEC-004: Branch-Locked Agents (Preserve from Backend)

**Date:** 2025-10-16  
**Type:** Architecture  
**Status:** ✅ Accepted

**Context:**  
Backend has branch-locked agents (each agent only accesses its phase branch). Should CLI preserve this or allow cross-phase access?

**Options Considered:**
1. **Preserve branch-locking** - CLI enforces same restrictions
2. **Remove restrictions** - CLI can access all branches
3. **Hybrid** - CLI can read all, write only current

**Decision:** Preserve branch-locking (Option 1)

**Rationale:**
- Core innovation of the platform
- Prevents AI from contaminating phases
- Maintains immutable decision history
- Forces proper waterfall progression
- Consistency with web UI behavior

**Confidence Score:** 90%

**Consequences:**
- ✅ Enables: Clean separation, prevents shortcuts, methodology integrity
- ✅ Enables: Trust in AI guidance (can't skip validation)
- ❌ Prevents: Quick fixes across phases
- ❌ Requires: Proper phase transitions

**Reversibility:** Easy (just remove checks)

**Owner:** Product Team  
**AI Recommendation:** "Critical to methodology. Do not compromise."

---

### DEC-005: MoSCoW Prioritization for Features

**Date:** 2025-10-16  
**Type:** Process  
**Status:** ✅ Accepted

**Context:**  
Many possible CLI features. Need framework to decide what's MVP vs future.

**Options Considered:**
1. **Build everything** - All features from day 1
2. **MoSCoW prioritization** - Must/Should/Could/Won't Have
3. **User voting** - Let beta users decide
4. **Phased releases** - V1, V2, V3 roadmap

**Decision:** MoSCoW prioritization (Option 2)

**Rationale:**
- Clear framework for MVP scope
- Prevents scope creep
- Forces hard choices (what's really essential?)
- Familiar to team
- Can ship MVP in 8 weeks with MUST HAVEs only

**Confidence Score:** 90%

**Consequences:**
- ✅ Enables: Fast MVP, focused development, clear priorities
- ✅ Enables: Shipping in 8 weeks
- ❌ Prevents: Some users won't get "dream features" immediately
- ❌ Risk: Might deprioritize something users really want

**Reversibility:** Easy (just re-prioritize)

**Owner:** Product Team  
**AI Recommendation:** "Standard best practice. Enables speed without sacrificing quality."

---

### DEC-006: Support macOS, Linux, Windows (WSL)

**Date:** 2025-10-16  
**Type:** Technology  
**Status:** ✅ Accepted

**Context:**  
Need to decide which operating systems to support. Full Windows support? Mac only?

**Options Considered:**
1. **macOS only** - Simplest, most devs on Mac
2. **macOS + Linux** - Cover 80% of developers
3. **macOS + Linux + Windows (WSL)** - Cover 95%+
4. **All platforms including native Windows** - 100%

**Decision:** macOS + Linux + Windows (WSL) (Option 3)

**Rationale:**
- Node.js/TypeScript already cross-platform
- WSL gives Windows users Unix-like environment
- Native Windows (cmd.exe/PowerShell) has different assumptions (paths, env, etc.)
- 95%+ coverage with 3 platforms vs 100% with 10x effort

**Confidence Score:** 85%

**Consequences:**
- ✅ Enables: Wide developer reach, inclusive
- ✅ Enables: Testing on CI across platforms
- ❌ Prevents: Native Windows (cmd) users
- ❌ Requires: Cross-platform testing infrastructure

**Reversibility:** Easy (can add native Windows later)

**Owner:** Engineering Team  
**AI Recommendation:** "Pragmatic. WSL is standard for Windows developers. Native Windows support not worth MVP effort."

---

### DEC-007: NPM as Primary Distribution

**Date:** 2025-10-16  
**Type:** Technology  
**Status:** ✅ Accepted

**Context:**  
How should users install CLI? NPM, Homebrew, direct download, all of the above?

**Options Considered:**
1. **NPM only** - `npm install -g build-agent`
2. **Homebrew only** - `brew install build-agent`
3. **Multiple methods** - NPM, Homebrew, curl script, binaries
4. **Standalone binaries** - Download and run

**Decision:** NPM as primary, others secondary (Option 1 → 3 later)

**Rationale:**
- Target users already have npm (Node.js developers)
- NPM handles dependencies, updates automatically
- Can add Homebrew/binaries later
- Fastest to ship (no binary building, signing)

**Confidence Score:** 80%

**Consequences:**
- ✅ Enables: Fast release cycle, easy updates, dependency management
- ✅ Enables: Leveraging existing npm ecosystem
- ❌ Prevents: Users without Node.js installed
- ❌ Requires: Node.js 20+ as prerequisite

**Reversibility:** Easy (can add other distribution methods)

**Owner:** DevOps Team  
**AI Recommendation:** "Start simple. NPM for MVP, expand distribution later based on demand."

---

### DEC-008: Commander.js for CLI Framework

**Date:** 2025-10-16  
**Type:** Technology  
**Status:** ✅ Accepted

**Context:**  
Need CLI framework for parsing commands, flags, help text. Which library?

**Options Considered:**
1. **Commander.js** - Popular, mature, simple
2. **Yargs** - More features, more complex
3. **Oclif** - Salesforce's framework, heavy
4. **Custom** - Build our own parser

**Decision:** Commander.js (Option 1)

**Rationale:**
- Most popular (20M+ weekly downloads)
- Simple API, easy to learn
- Good documentation
- Lightweight (vs Oclif)
- Sufficient for our needs

**Confidence Score:** 90%

**Consequences:**
- ✅ Enables: Fast development, community support
- ✅ Enables: Standard CLI patterns (--help, --version)
- ❌ Prevents: Some advanced features (Oclif plugins)
- ❌ Trade-off: Less opinionated than Oclif

**Reversibility:** Medium (would need to rewrite command structure)

**Owner:** Engineering Team  
**AI Recommendation:** "Safe choice. Commander.js is battle-tested and sufficient for MVP."

---

### DEC-009: Chalk + Ora for Terminal UI

**Date:** 2025-10-16  
**Type:** Technology  
**Status:** ✅ Accepted

**Context:**  
Need libraries for colors, spinners, progress indicators in terminal.

**Options Considered:**
1. **Chalk + Ora + Inquirer** - Best-in-class for each
2. **Blessed/Ink** - Full TUI framework
3. **Vanilla ANSI codes** - No dependencies
4. **Pastel** - All-in-one library

**Decision:** Chalk + Ora + Inquirer (Option 1)

**Rationale:**
- Chalk: Industry standard for colors (15M weekly downloads)
- Ora: Best spinner library (simple, elegant)
- Inquirer: Best prompts (interactive mode)
- Composable (pick best tool for each job)

**Confidence Score:** 85%

**Consequences:**
- ✅ Enables: Beautiful terminal output, progress feedback
- ✅ Enables: Standard patterns users expect
- ❌ Prevents: Full TUI (no cursor navigation)
- ❌ Dependencies: 3 libraries instead of 1

**Reversibility:** Easy (UI is presentation layer)

**Owner:** Engineering Team  
**AI Recommendation:** "Standard stack. Users expect this UX in modern CLIs."

---

### DEC-010: ~/.build-agent for Configuration

**Date:** 2025-10-16  
**Type:** Architecture  
**Status:** ✅ Accepted

**Context:**  
Where should CLI store config, credentials, cache? System locations or user home?

**Options Considered:**
1. **~/.build-agent/** - Dotfile in user home
2. **~/.config/build-agent/** - XDG spec
3. **System locations** - /etc or /var
4. **Project directory** - .build-agent/ in each project

**Decision:** ~/.build-agent/ (Option 1)

**Rationale:**
- Simple, predictable location
- User-specific (no permission issues)
- Easy to backup/delete
- Familiar pattern (like ~/.aws, ~/.npm)

**Confidence Score:** 80%

**Consequences:**
- ✅ Enables: Per-user config, easy troubleshooting
- ✅ Enables: No sudo required
- ❌ Prevents: System-wide config
- ❌ Prevents: Per-project config (could add later)

**Reversibility:** Hard (migration required)

**Owner:** Engineering Team  
**AI Recommendation:** "Standard pattern. Users understand dotfiles."

---

### DEC-011: Git Required (Not Optional)

**Date:** 2025-10-16  
**Type:** Architecture  
**Status:** ✅ Accepted

**Context:**  
Should CLI work without Git? Could we abstract version control?

**Options Considered:**
1. **Git required** - Won't work without it
2. **Git optional** - Degrade gracefully
3. **Abstract VCS** - Support Git, Mercurial, etc.

**Decision:** Git required (Option 1)

**Rationale:**
- GitHub is core to platform (repos, branches, commits)
- Target users all have Git
- Abstracting version control is massive effort
- Git is standard (99%+ developers use it)

**Confidence Score:** 95%

**Consequences:**
- ✅ Enables: Leverage Git's power, simpler architecture
- ✅ Enables: GitHub integration baked in
- ❌ Prevents: Users without Git (but who are they?)
- ❌ Prevents: Other version control systems

**Reversibility:** Very Hard (architecture assumes Git)

**Owner:** Product Team  
**AI Recommendation:** "Correct decision. Git is table stakes for target audience."

---

### DEC-012: OpenAI GPT-4 Only (For MVP)

**Date:** 2025-10-16  
**Type:** Technology  
**Status:** ✅ Accepted

**Context:**  
Which AI models should CLI support? OpenAI, Anthropic, local models, all?

**Options Considered:**
1. **OpenAI GPT-4 only** - Single model
2. **OpenAI + Anthropic** - Two providers
3. **Model-agnostic** - Support many providers
4. **Local models** - Ollama, LM Studio

**Decision:** OpenAI GPT-4 only (Option 1)

**Rationale:**
- Backend already uses GPT-4
- Don't want to test multiple models
- GPT-4 proven to work well
- Can add others post-MVP

**Confidence Score:** 75%

**Consequences:**
- ✅ Enables: Simple implementation, fast MVP
- ✅ Enables: Consistency with web UI
- ❌ Prevents: Users who prefer Anthropic/local
- ❌ Risk: OpenAI API changes or pricing

**Reversibility:** Medium (can abstract model layer)

**Owner:** Engineering Team  
**AI Recommendation:** "Reasonable MVP scope. Expand model support based on demand."

---

### DEC-013: Online-Only (No Offline Mode)

**Date:** 2025-10-16  
**Type:** Architecture  
**Status:** ✅ Accepted

**Context:**  
Should CLI work offline? Some features offline, all online, or hybrid?

**Options Considered:**
1. **Online-only** - Requires internet
2. **Offline docs** - Can view docs offline
3. **Hybrid** - Some features work offline
4. **Fully offline** - Cache everything

**Decision:** Online-only for MVP, offline docs later (Option 1 → 2)

**Rationale:**
- AI agents require OpenAI API (online)
- GitHub API requires connection
- Most CLI usage happens while developing (already online)
- Offline mode adds significant complexity

**Confidence Score:** 70%

**Consequences:**
- ✅ Enables: Simpler implementation, real-time data
- ✅ Enables: Faster MVP
- ❌ Prevents: Offline usage (planes, poor connections)
- ❌ Risk: Users in low-connectivity environments

**Reversibility:** Medium (can add offline docs, cache)

**Owner:** Product Team  
**AI Recommendation:** "Acceptable for MVP. Monitor requests for offline mode."

---

## Decisions Pending Review

### DEC-014: Telemetry and Analytics

**Date:** 2025-10-16  
**Type:** Business  
**Status:** ⏳ Proposed

**Context:**  
Should CLI send usage telemetry? What data? Opt-in or opt-out?

**Options Considered:**
1. **No telemetry** - Privacy-first, blind to usage
2. **Opt-in telemetry** - Users choose to share
3. **Opt-out telemetry** - On by default, can disable
4. **Anonymous only** - No PII, just commands

**Preliminary Recommendation:** Opt-out with anonymization (Option 3 + 4)

**Rationale:**
- Need data to improve product
- Understand usage patterns, errors
- But respect privacy
- Many CLIs use opt-out (VS Code, Next.js, Homebrew)

**Confidence Score:** 60% (needs team discussion)

**Open Questions:**
- What data exactly? (commands, errors, performance)
- How to anonymize? (hash user IDs?)
- How to make opt-out easy? (ENV var + config)
- Where to disclose? (First run message + docs)

**Next Steps:** Team discussion, privacy policy review

---

## Superseded Decisions

None yet.

---

## Decision Statistics

**Total Decisions:** 14 (13 accepted, 1 proposed)  
**By Type:**
- Architecture: 6
- Technology: 6
- Process: 1
- Business: 1

**By Confidence:**
- High (80-100%): 9 decisions
- Medium (50-79%): 4 decisions
- Low (0-49%): 0 decisions

**Average Confidence:** 83%

**By Reversibility:**
- Easy: 5 decisions
- Medium: 5 decisions
- Hard: 2 decisions
- Very Hard: 1 decision

---

## Decision Review Schedule

- **Weekly:** Review pending decisions
- **Monthly:** Review all decisions, update confidence based on learnings
- **Quarterly:** Identify superseded decisions, document pivots

---

## Next Phase

**Status:** Requirements phase decisions complete  
**Ready for Analysis:** YES  
**Analysis phase will add:** Technology stack details, MVP scope decisions, risk mitigation choices

**Reviewer:** Skippy the Magnificent  
**Notes:** "Solid decision-making. Clear rationales. Good confidence scores. You're not just guessing - you're thinking. That's rare for a monkey."

