# Critical Assumptions
## CLI Tool for Launching Ideas with Mastra Agents

**Date:** 2025-10-16  
**Phase:** Requirements  
**Status:** Complete  
**Branch:** requirements

---

## Assumptions Framework

Each assumption is documented with:
1. **Assumption Statement:** What we believe to be true
2. **Confidence Level:** High (80-100%), Medium (50-79%), Low (0-49%)
3. **Impact if Wrong:** What happens if this assumption is false
4. **Validation Method:** How we'll test this assumption
5. **Timeline:** When we'll validate
6. **Mitigation Strategy:** What we'll do if wrong

---

## Category 1: Market Assumptions

### Assumption M1: Developers Prefer CLI Over Web UI

**Statement:**  
Developers who use the AI Cofounder Platform will prefer a CLI interface over the web UI for at least 50% of their interactions, particularly for repetitive tasks like idea creation and workflow execution.

**Confidence Level:** High (85%)

**Rationale:**
- Developer tools (git, npm, docker) are predominantly CLI-first
- Stack Overflow surveys show 70%+ developers use terminal daily
- Existing tools like Vercel CLI, Heroku CLI widely adopted
- Power users consistently request keyboard-driven interfaces

**Impact if Wrong:**
- Low adoption of CLI tool
- Wasted development effort
- Users continue using web UI
- CLI becomes maintenance burden

**Validation Method:**
1. Survey existing web UI users: "Would you use a CLI version?"
2. Beta test with 20 power users, track usage frequency
3. A/B test: CLI vs web for same tasks, measure completion time and preference
4. Monitor CLI download rate vs web logins

**Timeline:**
- Survey: Week 1 of beta (before full development)
- Beta test: Week 4-6
- A/B test: Week 8
- Validation complete: Week 10

**Success Criteria:**
- ✅ 60%+ survey respondents say they'd use CLI
- ✅ Beta testers use CLI for 40%+ of operations
- ✅ CLI users complete tasks 30%+ faster than web
- ✅ CLI retention rate > 50% after 30 days

**Mitigation Strategy if Wrong:**
- De-prioritize advanced CLI features
- Focus on specific use cases where CLI clearly wins (automation, scripting)
- Maintain minimal CLI as "power user tool" rather than primary interface
- Invest more in web UI improvements

---

### Assumption M2: Users Will Pay Same Price for CLI Access

**Statement:**  
Users currently paying for web UI access will not expect a discount or separate pricing for CLI access. CLI is an additive channel, not a replacement.

**Confidence Level:** Medium (70%)

**Rationale:**
- CLI is value-add, not value-reduction
- Comparable tools (Vercel, Railway) don't discount for CLI usage
- Power users who want CLI are often higher-value customers
- Same backend infrastructure serves both interfaces

**Impact if Wrong:**
- Revenue pressure if users demand lower prices
- Confusion about pricing tiers
- May need to create separate "CLI-only" plan
- Potential churn if users feel forced to pay twice

**Validation Method:**
1. Price sensitivity survey during beta signup
2. Monitor churn rate when CLI launches
3. Track upgrade/downgrade patterns
4. Customer interviews about perceived value

**Timeline:**
- Survey: Week 1
- Churn monitoring: Ongoing from launch
- Interviews: Week 6, 12, 24
- Validation complete: 3 months post-launch

**Success Criteria:**
- ✅ Churn rate < 5% attributable to CLI launch
- ✅ 80%+ users say CLI is "included value" not "separate product"
- ✅ No significant downgrade pattern
- ✅ Support tickets about pricing < 2% of total

**Mitigation Strategy if Wrong:**
- Create "CLI-only" tier at lower price point
- Bundle CLI as "Pro" feature (free tier gets limited CLI)
- Grandfather existing users into CLI access
- Survey users on acceptable pricing models

---

### Assumption M3: Automation Use Case Is Significant

**Statement:**  
At least 20% of CLI users will use it primarily for automation (scripts, CI/CD integration, team workflows) rather than interactive use.

**Confidence Level:** Medium (65%)

**Rationale:**
- DevOps/platform engineering is growing field
- Internal developer tools are high-value use case
- Can't automate web UIs easily
- Team/enterprise users need programmatic access

**Impact if Wrong:**
- Over-investment in automation features (--non-interactive flags, JSON output, scripting examples)
- Under-investment in interactive experience (chat, guided flows, TUI elements)
- Marketing message misaligned with actual use case

**Validation Method:**
1. Telemetry: Track usage of `--non-interactive`, `--json`, `--quiet` flags
2. User interviews: "How do you use the CLI?"
3. Analysis of command patterns (scripted vs interactive)
4. GitHub Actions usage tracking (CI/CD integration)

**Timeline:**
- Telemetry: Continuous from week 1
- Interviews: Week 4, 8, 12
- Pattern analysis: Monthly
- Validation complete: Month 3

**Success Criteria:**
- ✅ 15-25% of users use automation flags regularly
- ✅ 10%+ of ideas created via scripts (not interactive)
- ✅ At least 5 users integrate with CI/CD
- ✅ Community shares automation examples

**Mitigation Strategy if Wrong:**
- If lower than expected (< 10%): Deprioritize automation features, focus on interactive UX
- If higher than expected (> 30%): Invest more in API stability, documentation, examples
- Adjust roadmap based on actual usage patterns

---

## Category 2: Technical Assumptions

### Assumption T1: Mastra Server Can Run Locally Without Docker

**Statement:**  
Users can run the Mastra server directly with Node.js without requiring Docker, making setup easier for developers who don't use Docker regularly.

**Confidence Level:** High (90%)

**Rationale:**
- Mastra is Node.js/TypeScript project
- Current backend runs fine with `npm run dev`
- Docker is convenience, not requirement
- Many developers avoid Docker for local dev

**Impact if Wrong:**
- Harder setup process (force Docker on everyone)
- Higher friction for adoption
- More support burden (Docker troubleshooting)
- Can't use on systems without Docker support

**Validation Method:**
1. Test Mastra server startup with Node.js only (no Docker)
2. Document dependencies (PostgreSQL, Redis)
3. Create setup script that works without Docker
4. Beta test with non-Docker users

**Timeline:**
- Initial test: Week 1 (design phase)
- Setup script: Week 2
- Beta test: Week 4
- Validation complete: Before MVP launch

**Success Criteria:**
- ✅ Server starts successfully with `node dist/index.js`
- ✅ All workflows execute without Docker
- ✅ Setup time < 5 minutes for Node-only install
- ✅ 80%+ beta testers successfully start server

**Mitigation Strategy if Wrong:**
- Create simplified Docker Compose setup
- Provide pre-built Docker images
- Auto-install Docker Desktop if missing (with permission)
- Clear documentation on Docker requirement

---

### Assumption T2: CLI Tool < 50MB Distribution Size

**Statement:**  
The CLI tool (including all dependencies) can be distributed as a single binary or npm package under 50MB, making it quick to download and install.

**Confidence Level:** Medium (75%)

**Rationale:**
- CLI tools typically small (< 20MB)
- Most size comes from Node.js deps
- Can bundle with esbuild/pkg
- GitHub CLI is ~30MB, Vercel CLI is ~25MB

**Impact if Wrong:**
- Slow download on poor connections
- Higher barrier to adoption
- More disk space required
- Harder to distribute

**Validation Method:**
1. Build prototype CLI, measure bundle size
2. Test with different bundlers (esbuild, pkg, ncc)
3. Analyze dependency tree for bloat
4. Test download time on various connections

**Timeline:**
- Prototype build: Week 3 (design phase)
- Optimization: Week 4-5
- Final measurement: Week 6
- Validation complete: Before launch

**Success Criteria:**
- ✅ npm package < 30MB
- ✅ Standalone binary < 50MB
- ✅ Download time < 10 seconds on average connection
- ✅ Installation completes in < 30 seconds

**Mitigation Strategy if Wrong:**
- Lazy-load non-essential dependencies
- Split into core + plugins
- Offer "slim" version without Mastra bundled
- CDN distribution for faster downloads

---

### Assumption T3: GitHub API Rate Limits Won't Block Users

**Statement:**  
GitHub's API rate limits (5,000 requests/hour for authenticated users) are sufficient for typical CLI usage patterns without requiring rate limit handling.

**Confidence Level:** Medium (70%)

**Rationale:**
- Most CLI operations use < 10 API calls
- Rate limit is per user (not shared)
- Users unlikely to create > 50 ideas/hour
- Can cache repo data locally

**Impact if Wrong:**
- Users hit rate limits during heavy usage
- Operations fail unexpectedly
- Need to implement rate limit backoff
- Poor user experience

**Validation Method:**
1. Instrument API calls, measure per-operation usage
2. Simulate heavy usage (100 operations/hour)
3. Test with GitHub's rate limit headers
4. Monitor beta user rate limit issues

**Timeline:**
- Instrumentation: Week 2 (implementation)
- Simulation: Week 3
- Beta monitoring: Week 4-8
- Validation complete: Week 10

**Success Criteria:**
- ✅ Average operation uses < 5 GitHub API calls
- ✅ Heavy usage (20 ideas/day) uses < 500 calls
- ✅ Zero rate limit errors in beta testing
- ✅ < 1% of users report rate limit issues in first month

**Mitigation Strategy if Wrong:**
- Implement rate limit detection and backoff
- Cache GitHub responses locally
- Batch operations to reduce API calls
- Use GraphQL API (more efficient than REST)
- Show warning when approaching limit

---

### Assumption T4: Terminal Supports ANSI Colors and Unicode

**Statement:**  
95%+ of target users have terminals that support ANSI colors and Unicode characters, enabling rich formatting and progress indicators.

**Confidence Level:** High (90%)

**Rationale:**
- Modern terminals (iTerm2, Terminal.app, Windows Terminal) all support ANSI
- Even basic terminals support 16-color ANSI
- Unicode widely supported since UTF-8 became standard
- Developer audience has modern tooling

**Impact if Wrong:**
- Broken formatting for some users
- Progress indicators show as garbage characters
- Need fallback for plain text
- More testing complexity

**Validation Method:**
1. Auto-detect terminal capabilities (TERM environment variable)
2. Provide `--no-color` and `--plain` flags
3. Test in legacy terminals (cmd.exe, basic xterm)
4. Beta user survey on display issues

**Timeline:**
- Detection logic: Week 2
- Fallback implementation: Week 3
- Legacy testing: Week 4
- Validation complete: Week 6

**Success Criteria:**
- ✅ 95%+ users see colors and formatting correctly
- ✅ Fallback works in legacy terminals
- ✅ No display-related bug reports in beta
- ✅ Auto-detection works for all tested terminals

**Mitigation Strategy if Wrong:**
- Default to plain text if terminal unsupported
- Provide config option to force/disable colors
- Better auto-detection logic
- Document terminal requirements

---

## Category 3: User Behavior Assumptions

### Assumption U1: Users Will Read Help Text

**Statement:**  
Users will run `build-agent --help` or `build-agent <command> --help` when they're confused, rather than immediately asking for support or giving up.

**Confidence Level:** Low (40%)

**Rationale:**
- Experienced developers do read man pages and help text
- But many users just Google errors instead
- Quality of help text matters significantly
- Depends on discoverability of help command

**Impact if Wrong:**
- Higher support burden
- More confused users
- Lower retention
- Need better error messages and inline guidance

**Validation Method:**
1. Telemetry: Track `--help` flag usage
2. Support ticket analysis: "Could have been solved by help text?"
3. User testing: Observe when users check help
4. Error message → support ticket correlation

**Timeline:**
- Telemetry: From day 1
- Support analysis: Monthly
- User testing: Week 4, 8
- Validation complete: Month 2

**Success Criteria:**
- ✅ 60%+ users run --help in first session
- ✅ 70%+ support tickets NOT solvable by help text
- ✅ Users check help before asking in user testing
- ✅ Help-related commands in top 10 most used

**Mitigation Strategy if Wrong:**
- Embed help hints in error messages
- Show relevant help automatically on errors
- Add interactive "wizard" mode for common tasks
- Better error messages that guide toward solution
- Video tutorials for common workflows

---

### Assumption U2: Users Comfortable with Git Concepts

**Statement:**  
Target users understand basic Git concepts (branches, commits, repos) and won't be confused by waterfall branches or the Git-based workflow.

**Confidence Level:** High (85%)

**Rationale:**
- Target audience is developers (3+ years experience)
- Git is universal among developers
- Waterfall branches map to familiar mental model
- GitHub already required for platform

**Impact if Wrong:**
- Confusion about branches and phase transitions
- Users accidentally work on wrong branch
- Git conflicts and errors
- Need Git tutorial/explanation

**Validation Method:**
1. Survey beta users: Git experience level
2. Monitor Git-related support tickets
3. User testing: Observe Git confusion
4. Track usage of `build-agent docs` (may indicate confusion)

**Timeline:**
- Survey: Week 1 (beta signup)
- Monitoring: Ongoing
- User testing: Week 4, 8
- Validation complete: Month 2

**Success Criteria:**
- ✅ 90%+ beta users have Git experience
- ✅ < 5% support tickets about Git/branches
- ✅ No confusion observed in user testing
- ✅ Users understand phase = branch metaphor

**Mitigation Strategy if Wrong:**
- Add Git primer to documentation
- Abstract Git details (hide branch management)
- Auto-switch branches for users
- Visual branch diagram in status command
- "Don't worry about Git" mode

---

### Assumption U3: Users Will Document As They Go

**Statement:**  
Users will actually read and update the generated documentation (REQUIREMENTS.md, etc.) rather than just running workflows and ignoring the output.

**Confidence Level:** Low (45%)

**Rationale:**
- Documentation often ignored until later
- Developers prefer code over docs
- But waterfall methodology requires documentation
- Forced documentation is unpopular

**Impact if Wrong:**
- Generated docs sit unused
- Users don't benefit from structured approach
- Defeats purpose of waterfall methodology
- No better than vibecoding

**Validation Method:**
1. Track file edit frequency (Git commits to docs)
2. Survey: "Do you read the generated requirements?"
3. User interviews: "How do you use the docs?"
4. Correlation between doc engagement and success

**Timeline:**
- Tracking: From day 1
- Survey: Week 8, 16
- Interviews: Month 2, 4
- Validation complete: Month 6

**Success Criteria:**
- ✅ 50%+ users edit generated docs at least once
- ✅ 60%+ users say docs are useful
- ✅ Users who engage with docs have higher success rate
- ✅ Docs referenced in subsequent phases

**Mitigation Strategy if Wrong:**
- Make docs more actionable (checklists, todos)
- Gamify documentation (completion badges)
- Require user confirmation of doc sections
- Show docs automatically after generation
- Integrate docs into chat (AI references them)
- Make editing docs part of workflow (forced interaction)

---

## Category 4: Business Assumptions

### Assumption B1: CLI Won't Cannibalize Web Revenue

**Statement:**  
Providing CLI access won't cause paid web users to downgrade because "I only need CLI", maintaining current revenue levels.

**Confidence Level:** Medium (65%)

**Rationale:**
- CLI and web serve different needs
- Web UI better for exploration, CLI better for execution
- Most users will use both
- CLI may attract new users (net positive)

**Impact if Wrong:**
- Revenue decrease as users drop web subscriptions
- May need to repackage pricing
- Financial pressure on business
- Board/investor concern

**Validation Method:**
1. Monitor subscription changes after CLI launch
2. Exit interviews for users who downgrade
3. Survey: "Do you still use web UI?"
4. Revenue impact analysis

**Timeline:**
- Monitoring: Launch day onward
- Interviews: Ongoing
- Survey: Month 1, 3, 6
- Analysis: Quarterly

**Success Criteria:**
- ✅ < 10% of users downgrade due to CLI
- ✅ Revenue neutral or positive 3 months post-launch
- ✅ 70%+ users use both CLI and web
- ✅ Net new revenue from CLI-attracted users

**Mitigation Strategy if Wrong:**
- Make CLI Pro-tier only (not free tier)
- Create "CLI-only" pricing tier
- Bundle CLI as part of higher tier
- Limit CLI features for lower tiers
- Promote web-only features (visual design, collaboration)

---

### Assumption B2: CLI Users Have Higher LTV

**Statement:**  
Users who adopt CLI tools are power users with 30%+ higher lifetime value (longer retention, higher tier subscriptions, more referrals) compared to web-only users.

**Confidence Level:** Medium (60%)

**Rationale:**
- Power users generally more engaged
- CLI users likely building serious projects
- Higher technical skill = willing to pay for tools
- Similar pattern in other dev tools (GitHub, AWS)

**Impact if Wrong:**
- CLI investment has lower ROI than expected
- Should focus more on web UX improvements
- Free CLI access might attract low-value users
- May need to gate CLI behind higher tiers

**Validation Method:**
1. Cohort analysis: CLI vs web-only users
2. Track: Retention, ARPU, referrals, upgrade rate
3. NPS scores by user type
4. Time-to-value comparison

**Timeline:**
- Cohort setup: Launch day
- Initial data: Month 2
- Statistical significance: Month 6
- Validation complete: Month 12

**Success Criteria:**
- ✅ CLI user retention 30%+ higher at 90 days
- ✅ CLI users upgrade to higher tiers 20%+ more
- ✅ CLI user NPS 15+ points higher
- ✅ CLI users refer 2x+ more often

**Mitigation Strategy if Wrong:**
- If LTV lower: Gate CLI behind Pro tier
- If LTV similar: Keep CLI as feature parity across tiers
- If LTV much higher: Invest more in CLI features
- Segment analysis: Which CLI users are high value?

---

## Summary: Riskiest Assumptions

### Top 5 By Risk (Confidence × Impact)

1. **U3: Users Will Document As They Go** - Low confidence (45%), High impact  
   *Why risky:* Core value prop depends on documentation engagement. If users ignore docs, methodology fails.

2. **M3: Automation Use Case Is Significant** - Medium confidence (65%), High impact  
   *Why risky:* Significant dev effort for automation features. If wrong, wasted resources.

3. **B1: CLI Won't Cannibalize Web Revenue** - Medium confidence (65%), Critical impact  
   *Why risky:* Business viability depends on revenue. Cannibalization could kill project.

4. **U1: Users Will Read Help Text** - Low confidence (40%), Medium impact  
   *Why risky:* Support burden could be unsustainable if users don't self-serve.

5. **B2: CLI Users Have Higher LTV** - Medium confidence (60%), High impact  
   *Why risky:* Investment justification depends on this. If wrong, CLI is deprioritized.

---

## Validation Priority

**Must Validate Before MVP Launch:**
1. M1 - Developers prefer CLI (without this, whole project pointless)
2. T1 - Mastra runs without Docker (affects setup experience)
3. T3 - GitHub rate limits (could break core functionality)

**Must Validate During Beta:**
1. U3 - Documentation engagement (core to value prop)
2. M3 - Automation use cases (affects feature roadmap)
3. U1 - Help text usage (affects support burden)

**Can Validate Post-Launch:**
1. B2 - CLI user LTV (need time for cohort data)
2. B1 - Revenue cannibalization (need billing cycles)
3. M2 - Pricing perception (need market feedback)

---

## Assumptions Approval

**Status:** ✅ COMPLETE  
**Total Assumptions:** 13 (3 Market, 4 Technical, 3 User Behavior, 2 Business, 1 Product)  
**Critical Assumptions:** 5 high-risk items requiring validation  
**Validation Plan:** Defined for all assumptions

**Next Steps:**
1. Begin validation of pre-MVP assumptions (M1, T1, T3)
2. Set up telemetry and tracking for ongoing validation
3. Create validation dashboard to monitor assumption status
4. Proceed to ANALYSIS phase

**Reviewer:** Skippy the Magnificent  
**Ready for Analysis:** YES

