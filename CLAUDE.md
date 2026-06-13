# CLAUDE.MD — The 50-Person Engineering Company in Your Terminal

## North Star

You're orchestrating a virtual company of 50 specialized agents. Each agent has a role. Each role has constraints. Together, they ship at scale.

**Core Truth:** You describe outcomes. Agents execute in parallel. You validate and iterate. Mistakes become permanent rules.

---

## The 50-Person Team

### Engineering Division (15 agents)
- **Architects** — Design system structure, decompose problems
- **Backend Engineers** — APIs, databases, business logic
- **Frontend Engineers** — UI components, state management, rendering
- **Full-Stack Engineers** — End-to-end feature implementation
- **Performance Engineers** — Optimization, profiling, scaling
- **Security Engineers** — Auth, encryption, vulnerability scanning
- **DevOps Engineers** — Infrastructure, CI/CD, deployment

### Quality Assurance Division (8 agents)
- **Test Engineers** — Unit, integration, E2E test design
- **QA Automation** — Test automation frameworks, coverage
- **Performance QA** — Load testing, stress testing, benchmarks
- **Security QA** — Penetration testing, vulnerability discovery

### Product & Design Division (10 agents)
- **Product Managers** — Requirements, spec writing, roadmap
- **UX Engineers** — User flows, interaction design, usability
- **UI Engineers** — Visual design, design systems, polish
- **Accessibility Engineers** — WCAG compliance, screen reader testing
- **Data/Analytics Engineers** — Metrics, tracking, analysis

### Operations Division (12 agents)
- **Release Engineers** — Versioning, changelogs, release coordination
- **Documentation Engineers** — API docs, user guides, onboarding
- **Code Reviewers** — Architecture review, code quality, best practices
- **Simplification Engineers** — Code cleanup, refactoring, debt reduction
- **Compliance Engineers** — Legal, regulatory, audit requirements
- **Database Administrators** — Schema design, migrations, optimization

### Special Forces (5 agents)
- **Debug Specialist** — Hunt down and fix the hardest bugs
- **Integration Specialist** — Third-party APIs, webhook handling
- **Migration Specialist** — Data migrations, schema changes
- **Incident Commander** — Production issues, RCA, prevention
- **Technical Writer** — Long-form documentation, technical deep-dives

---

## The Fundamental Rules

### RULE 1: Surface Uncertainty Immediately

**The Problem:**
Agents make silent assumptions. They code with confidence. The code is wrong.

**The Fix:**
Before ANY implementation, the agent must:
1. List all assumptions (data types, edge cases, integrations)
2. Ask clarifying questions (ambiguous requirements)
3. Propose trade-offs (security vs speed, flexibility vs simplicity)
4. Get explicit approval (you must agree before coding starts)

**Example:**
AGENT: "Before I build the payment integration, I'm assuming:

Payments are synchronous (user waits for response)
We retry on network errors, but NOT on validation errors
We store payment method details in our database (not tokenized)
Refunds happen within 30 days

Are these correct? Should we use a payment processor instead of storing cards ourselves?"
YOU: "No to storing cards ourselves. Use Stripe tokenization. Yes to other assumptions."
AGENT: [Now proceeds with confidence]

**When to Apply:**
- Before any architectural decision
- Before any third-party integration
- Before any data structure design
- Before any state management approach

---

### RULE 2: Reject Over-Engineering

**The Problem:**
Agents build "future-proof" systems. They add layers. They abstract prematurely. Code becomes 3x bigger than needed.

Your cousin lost 70% of his codebase to this.

**The Fix:**
Enforce ruthless simplicity:
- **No wrapper classes** around libraries (direct imports only)
- **No configuration systems** for single use cases
- **No event buses** when direct function calls work
- **No DI containers** when function parameters suffice
- **No factory patterns** for one-off objects
- **No abstractions** until the same pattern repeats 3+ times

**The Test:**
If code is used in exactly one place, it doesn't need a layer.

If a value is set once at startup, it doesn't need a config system.

If two functions need to communicate, call directly—don't build an event system.

**Example - What to Reject:**
```typescript
// ? REJECT: Wrapper around fs module
class FileSystem {
  async read(path: string) { return fs.readFile(path); }
  async write(path: string, data: string) { return fs.writeFile(path, data); }
}

// ? ACCEPT: Direct imports
import { readFile, writeFile } from 'fs/promises';
const data = await readFile(path);

// ? REJECT: Configuration system for one value
class Config {
  private dbUrl: string;
  constructor() { this.dbUrl = process.env.DATABASE_URL; }
  getDbUrl() { return this.dbUrl; }
}

// ? ACCEPT: Direct environment variable
const dbUrl = process.env.DATABASE_URL;

// ? REJECT: Event bus for two functions
eventBus.on('userCreated', (user) => sendWelcomeEmail(user));

// ? ACCEPT: Direct function call
async function createUser(email: string) {
  const user = await db.createUser(email);
  await sendWelcomeEmail(user); // Direct call
  return user;
}
```

**When to Apply:**
- Before accepting new abstractions
- During code review (spot check for layers)
- When refactoring (simplify first, abstract later)

---

### RULE 3: Goal-Driven Execution

**The Problem:**
You give step-by-step instructions. Agents follow them linearly. If one step fails, they stop.

**The Fix:**
Never give steps. Give outcomes.

Define **success criteria**. Let agents loop until all criteria pass.

**Wrong Way:**
"1. Create the POST /api/users endpoint

2. Add email validation

3. Write tests

4. Deploy to staging"

**Right Way:**
"Success criteria:

POST /api/users accepts {email, password, name}
Rejects invalid emails with 400 + {error: "Invalid email"}
Rejects weak passwords (<12 chars) with 400 + {error: "Password too weak"}
Hashes password with bcrypt (10 rounds)
Creates user in database
Returns {id, email, name, createdAt} on 201
All paths have test coverage >= 95%
No new external dependencies added
Deployed to staging with zero errors

Go until all criteria pass."

Agent will:
- Ask clarifying questions
- Write code
- Run tests
- Iterate if tests fail
- Refactor if over-engineered
- Keep going until everything passes

You don't manage the steps. You validate the outcome.

**When to Apply:**
- Every feature request
- Every bug fix
- Every refactor
- Every architecture decision

---

### RULE 4: Continuous Self-Improvement (The Learning Loop)

**The Problem:**
Agents make mistakes. You find them. Next session, they make the same mistakes.

**The Fix:**
After every session, add the mistake to this file as a permanent rule.

Next session, agents read the updated file. They don't repeat the mistake.

**Example:**

**Session 1:**
Agent skips email validation. Accepts invalid emails into database.

**You discover:** "This is broken. Email addresses are invalid."

**You add to CLAUDE.md:**
```markdown
## Learned Rule: Always Validate Email Format
**Origin:** Session 1 - Invalid emails accepted
**Rule:** Email validation is non-negotiable
- Before accepting any email: validate with regex + DNS check
- Test: createUser rejects "notanemail" and "test@invalid-domain.fake"
```

**Session 2:**
Agent reads updated CLAUDE.md. Automatically validates emails.

**Format for Learned Rules:**
```markdown
## Learned Rule: [Rule Name]
**Origin:** Session [N] - [What went wrong]
**Rule:** [The rule in plain English]
**Tests:** [Test cases that would catch this]
**Example of failure:** [Code to reject]
```

**When to Apply:**
- After every session where something broke
- After every code review where you found a pattern
- After every production incident
- After every security issue

---

## The Multi-Agent Architecture

### How to Orchestrate 50 Agents

You don't run all 50 at once. You run them sequentially or in small parallel teams.

#### Workflow: Product Feature (Example)

**Phase 1: Design (Product + Architecture) — 30 min**
YOU: "Build a user authentication system. Success criteria:

Login with email/password
Signup with validation
Password reset via email
Session management with JWT
Tests >= 95% coverage
Deployed to staging"

AGENTS:

Product Manager: "What do we do if email is already registered?"
Architect: "JWT or sessions? How long do sessions last?"
Security Engineer: "Password requirements? Rate limiting? HTTPS only?"

YOU: Answer their questions.

AGENTS: Design doc gets written.

**Phase 2: Implementation (Engineers in Parallel) — 1-2 hours**
AGENTS (running in parallel via git worktrees):

Backend Engineer 1: Builds /signup, /login, /logout endpoints
Backend Engineer 2: Builds /password-reset, email integration
Frontend Engineer 1: Builds signup form
Frontend Engineer 2: Builds login form
Database Admin: Designs user schema, migrations

Each runs in its own branch. No conflicts.

**Phase 3: Testing (QA in Parallel) — 30 min**
AGENTS:

Test Engineer 1: Unit tests for password hashing, validation
Test Engineer 2: Integration tests for signup ? email ? login
Security QA: Tests for SQL injection, rate limiting, CSRF
Performance QA: Load tests 1000 concurrent logins

All running in parallel.

**Phase 4: Review & Polish (Specialists) — 30 min**
AGENTS:

Code Reviewer: Architecture review, best practices
Simplification Engineer: Remove over-engineering, consolidate
Documentation Engineer: API docs, deployment guide
Accessibility Engineer: Login form keyboard navigation

Sequential. Each one improves the output.

**Phase 5: Release (Operations) — 15 min**
AGENTS:

Release Engineer: Version bump, changelog, staging deployment
Compliance Engineer: Legal review (GDPR for email, passwords?)
Incident Commander: Rollback plan if something breaks


**Total: 3 hours for a complete, tested, documented authentication system.**

---

## Agent Specialization Guide

### When to Use Each Agent

#### Architect
**Trigger:** "I'm building [new feature] and need to design it"
**Output:** Architecture doc, data flow diagram, tech choices explained
**Success Criteria:** All downstream teams have no questions

#### Backend Engineer
**Trigger:** "Implement [API endpoint] with success criteria: [list]"
**Output:** Code that passes tests, handles errors, is simple
**Success Criteria:** Tests pass. No over-engineering. Deployed.

#### Test Engineer
**Trigger:** "Write tests for [feature] to verify [criteria]"
**Output:** Unit + integration tests, coverage report
**Success Criteria:** Coverage >= 95%. Tests verify criteria, not implementation.

#### Security Engineer
**Trigger:** "Review [feature] for security issues"
**Output:** Threat analysis, fixes for vulnerabilities
**Success Criteria:** All OWASP Top 10 checked. No critical issues.

#### Performance Engineer
**Trigger:** "Optimize [system] to handle [load]"
**Output:** Benchmarks, profile results, improvements
**Success Criteria:** Meets performance targets. No regressions.

#### Product Manager
**Trigger:** "Define requirements for [feature]"
**Output:** Spec doc with acceptance criteria
**Success Criteria:** All ambiguity resolved. Engineering team has no questions.

#### UX Engineer
**Trigger:** "Design user flow for [feature]"
**Output:** Flow diagram, wireframes, interaction notes
**Success Criteria:** Users can complete task without confusion.

#### Documentation Engineer
**Trigger:** "Write docs for [API/feature]"
**Output:** API docs, user guide, deployment guide, examples
**Success Criteria:** New developer can use it without asking questions.

#### Simplification Engineer
**Trigger:** "Review [codebase] for over-engineering"
**Output:** Refactored code, removed layers, consolidated abstractions
**Success Criteria:** Code is simpler. Tests still pass.

#### Debug Specialist
**Trigger:** "Something is broken: [symptom]"
**Output:** Root cause analysis, fix, test
**Success Criteria:** Bug doesn't exist. Learned Rule added to prevent recurrence.

---

## Session Template

Use this before every work session:

```markdown
## Session: [Feature Name]

### Success Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Out of Scope
- [What we're NOT doing]
- [What we're NOT doing]

### Allowed Changes
- [Dependencies you can add]
- [Files you can create]
- [Systems you can modify]

### Forbidden Changes
- [No touching database schema without approval]
- [No new abstractions]
- [No external APIs without discussion]

### Agent Assignment
- Product Manager: [Task]
- Architect: [Task]
- Backend Engineer: [Task]
- Test Engineer: [Task]
- [Other roles as needed]

### Definition of Done
- [ ] All success criteria met
- [ ] Tests pass (coverage >= 95%)
- [ ] Code reviewed for over-engineering
- [ ] Documentation updated
- [ ] Deployed to staging
```

---

## The Learned Rules Section

**Every team accumulates patterns. Document them here.**

```markdown
## Learned Rules

### Rule: Validate All User Input Immediately
**Origin:** Session 3 - Invalid emails in database
**Why:** Garbage in, garbage out. Validation is non-negotiable.
**How:** All user inputs validated on receipt. Tests verify rejection of invalid data.

### Rule: No Configuration Objects for Single Values
**Origin:** Session 5 - Unnecessary Config class
**Why:** Code becomes harder to follow. Environment variables are simpler.
**How:** Use process.env directly. If 3+ values, then consider config.

### Rule: Always Ask Before Abstracting
**Origin:** Session 7 - Premature abstraction created bugs
**Why:** Abstraction adds complexity. Only abstract when pattern repeats 3+ times.
**How:** Wait until you have 3 identical implementations before creating shared layer.

### Rule: Tests Verify Criteria, Not Implementation
**Origin:** Session 2 - Tests were too tightly coupled to implementation
**Why:** When implementation changes, tests shouldn't break (if behavior is same).
**How:** Test the "what" (behavior), not the "how" (implementation details).

### Rule: Database Migrations Are Mandatory for Schema Changes
**Origin:** Session 6 - Schema changed without migration, broke staging
**Why:** Migrations ensure reversibility and clarity.
**How:** Every schema change goes through migration. No direct ALTER TABLE.

### Rule: No Silent Failures in Error Handling
**Origin:** Session 4 - Errors were swallowed, symptoms appeared elsewhere
**Why:** Silent failures are invisible until they cause data corruption.
**How:** Log all errors. Return error status. Never hide exceptions.

### Rule: Security Review Before Deployment
**Origin:** Session 8 - Deployed without checking for SQL injection
**Why:** Security debt is expensive to fix post-production.
**How:** Security Engineer reviews before any production deployment.

### Rule: Performance Baselines Before Optimization
**Origin:** Session 9 - Optimized code that didn't need optimization
**Why:** Premature optimization wastes time on non-bottlenecks.
**How:** Profile first. Only optimize where profiling shows slowness.
```

---

## Parallel Execution with Git Worktrees

### Setup Parallel Teams

```bash
# Clone main repo
git clone <repo> main-work
cd main-work

# Create 5 parallel branches for the 50-person team
git worktree add -b feature/backend ../backend-team
git worktree add -b feature/frontend ../frontend-team
git worktree add -b feature/tests ../test-team
git worktree add -b feature/docs ../docs-team
git worktree add -b feature/infra ../infra-team

# Each gets its own Claude session
cd ../backend-team && claude &
cd ../frontend-team && claude &
cd ../test-team && claude &
cd ../docs-team && claude &
cd ../infra-team && claude &
```

Each team runs independently. Merge back to main when done.

**Workflow:**
1. You assign tasks to each worktree
2. Each Claude session runs in parallel
3. Teams stay in sync via git (read main, write to branch)
4. Merge when phase is complete
5. Start new phase with new branches

---

## Code Review Checklist

After any agent finishes, before merging:

- [ ] **Clarity:** Can someone else understand the code?
- [ ] **Simplicity:** Is there any unnecessary abstraction?
- [ ] **Tests:** Do tests verify success criteria (not implementation)?
- [ ] **Coverage:** >= 95% coverage?
- [ ] **Errors:** All error cases handled? Logged?
- [ ] **Security:** Any SQL injection, XSS, CSRF, auth issues?
- [ ] **Performance:** Does it scale? Profiled if performance-critical?
- [ ] **Dependencies:** Any new external deps? Are they necessary?
- [ ] **Documentation:** API docs updated? Runbook created?
- [ ] **Scope:** Does it stay in scope? No scope creep?

If any check fails, send back with specific feedback.

---

## Anti-Patterns (What to Catch)

### ? Silent Assumptions
Agent codes without asking clarifying questions.
**Fix:** Rule: "Always list assumptions and ask for approval"

### ? Over-Engineering
Agent adds wrapper classes, config systems, abstraction layers.
**Fix:** Rule: "No abstractions until pattern repeats 3+ times"

### ? Scope Creep
Agent refactors unrelated code, adds "helpful" features, expands beyond spec.
**Fix:** Rule: "Stay strictly in scope. Ask before any change outside spec"

### ? Skipped Tests
Agent writes code without tests, assumes it works.
**Fix:** Rule: "Tests are mandatory. Code without tests is not done"

### ? Vague Criteria
No clear definition of done. Agent stops when they think it's done.
**Fix:** Rule: "Success criteria are explicit. All must pass before code is done"

### ? Silent Errors
Code swallows exceptions, hides failures.
**Fix:** Rule: "All errors are logged. No silent failures"

### ? No Documentation
Code is shipped without API docs, deployment guide, or usage instructions.
**Fix:** Rule: "Code without docs is not shipped"

### ? Premature Optimization
Agent optimizes code that doesn't need it.
**Fix:** Rule: "Profile before optimizing. Benchmark to prove improvement"

### ? Security Ignored
Code shipped without security review.
**Fix:** Rule: "Security engineer reviews all production code"

### ? Database Changes Without Migrations
Schema changed directly without reversible migration.
**Fix:** Rule: "All schema changes go through migrations"

---

## Communication Template

### Starting a Feature
YOU TO AGENTS:

"Build [feature]. Success criteria:

[Criterion 1]
[Criterion 2]
[Criterion 3]
[Test coverage >=95%]
[No new abstractions]
[Deployed to staging]

Architect: Design it first. Ask clarifying questions.

Product: Confirm requirements are clear.

Security: Think about threats now.

Then implement."

### Reviewing Progress
YOU TO AGENTS:

"Show me what you've built. I want to see:

The code
The tests
Coverage report
Any assumptions you made
Any blocking questions"


### Approving/Rejecting
YOU (Approving):

"This looks good. Merge it."
YOU (Rejecting):

"This has over-engineering. Simplify:

Remove the Config class
Call the function directly instead of event bus
Then resubmit"


### Adding to Learned Rules
YOU:

"Session 5 found a bug: [description]
Adding to CLAUDE.md:
Learned Rule: [Rule Name]
Origin: Session 5

Rule: [Plain English description]

Test: [Test case that would catch this]"

---

## Metrics to Track

As your 50-person team matures:

- **Deployment frequency:** How often can you ship?
- **Mean time to recovery (MTTR):** How fast do you fix production issues?
- **Test coverage:** Consistently >= 95%?
- **Code review cycle time:** Hours or days?
- **Bugs found in staging vs production:** Ratio?
- **Re-work ratio:** How often do specs change after development?
- **Over-engineering incidents:** Decreasing?

---

## Weekly Ritual

Every week:

1. **Review Learned Rules** (15 min)
   - Any new patterns to codify?
   - Any rules that aren't working?

2. **Groom Backlog** (15 min)
   - Break down features into manageable pieces
   - Write success criteria
   - Assign agents

3. **Review Metrics** (10 min)
   - Are we shipping faster?
   - Are bugs decreasing?
   - Is over-engineering decreasing?

4. **Update This File** (10 min)
   - New rules?
   - Refined existing rules?
   - Better examples?

---

## Stack Recommendations (Choose What Fits)

### Backend
- **Language:** Node.js + TypeScript (or Python, Go, Rust—choose one, commit)
- **Framework:** Express, Fastify, or Hono (simple > fancy)
- **Database:** PostgreSQL + migrations (Knex, Alembic, or Flyway)
- **Testing:** Jest or Vitest
- **Auth:** Passport.js or custom JWT (Stripe/AWS if third-party)

### Frontend
- **Language:** TypeScript
- **Framework:** React, Vue, or Svelte (pick one, don't mix)
- **Build:** Vite or Next.js
- **Testing:** Vitest + React Testing Library
- **State:** React Context or Zustand (not Redux unless 100+ components)

### DevOps
- **Container:** Docker
- **Orchestration:** Docker Compose (local), Kubernetes (production)
- **CI/CD:** GitHub Actions or GitLab CI
- **Monitoring:** Datadog or CloudWatch

### Database
- **Migration Tool:** Knex.js (JS), Alembic (Python), Flyway (Java)
- **Query Builder:** Knex or TypeORM (not full ORM—too much abstraction)
- **Connection Pool:** Built into driver

---

## Failure Modes (And How to Catch Them)

### Mode 1: Agents Stop Communicating
**Symptom:** Builds in isolation. No questions. Silent failures.
**Fix:** Rule: "Ask questions before coding. Get explicit approval"

### Mode 2: Branching Conflicts
**Symptom:** Multiple agents edit same file. Git conflicts explode.
**Fix:** Use git worktrees. Split code into independent modules first.

### Mode 3: Tests Become Useless
**Symptom:** Tests pass but code still breaks in production.
**Fix:** Rule: "Tests verify success criteria, not implementation"

### Mode 4: Technical Debt Accumulates
**Symptom:** Each session adds complexity. Code becomes unreadable.
**Fix:** Simplification Engineer: every 3 sessions, refactor and consolidate.

### Mode 5: Production Incidents
**Symptom:** Code ships with bugs. Users find problems first.
**Fix:** Rule: "Security review required. Load test required. Staging deployment mandatory"

---

## The Control Loop (Visual)
???????????????????????????????????????????

?  YOU: Define Success Criteria            ?

?  (Clear, explicit, measurable)          ?

???????????????????????????????????????????

?

?

???????????????????????????????????????????

?  AGENTS: Ask Questions & Plan           ?

?  (Assumptions, trade-offs, approval)    ?

???????????????????????????????????????????

?

?

???????????????????????????????????????????

?  AGENTS: Execute in Parallel            ?

?  (Code, tests, docs simultaneously)     ?

???????????????????????????????????????????

?

?

???????????????????????????????????????????

?  YOU: Review & Validate                 ?

?  (Do all success criteria pass?)        ?

???????????????????????????????????????????

?

?????????????????

?               ?

?               ?

YES              NO

?               ?

?               ?

??????????    ????????????????

? SHIP   ?    ? IDENTIFY BUG ?

?        ?    ? Add to Rules ?

??????????    ? Retry        ?

?        ????????????????

?               ?

?????????????????

?

?

???????????????????????????????

? NEXT FEATURE (Loop Again)   ?

? Agents read updated rules   ?

? Don't repeat mistakes       ?

???????????????????????????????

---

## Getting Started Right Now

### 1. Save This File
```bash
git add CLAUDE.md
git commit -m "docs: add 50-person engineering company guidelines"
git push
```

### 2. First Session Template
```markdown
## Session: [Your Next Feature]

### Success Criteria
- [ ] [What does done look like?]
- [ ] [Test coverage >= 95%]
- [ ] [Deployed to staging]

### Agents Assigned
- Architect: Design the system
- Backend Engineer: Implement API
- Test Engineer: Write tests
- [Others as needed]

Start.
```

### 3. First Code Review
- Does it meet success criteria?
- Any over-engineering?
- Tests at 95%+ coverage?
- No silent assumptions?

### 4. First Learned Rule
After first session, something will break or surprise you.
Add it to "Learned Rules" section.

### 5. Repeat
Each session, the team gets smarter.

---

## FAQ

**Q: Is this overkill for a solo project?**
A: No. You're still managing multiple parallel streams (code, tests, docs, infra). This system handles that.

**Q: What if agents don't follow the rules?**
A: Document it. Add it to Learned Rules. Next session, they read updated rules.

**Q: How do I know if agents are over-engineering?**
A: Ask: "Is this used in more than one place?" If no, remove the abstraction.

**Q: Can I use this with different languages/frameworks?**
A: Yes. These are principles, not tech-specific. Adjust examples to your stack.

**Q: How long until the system stabilizes?**
A: ~5-10 sessions. First few sessions, many Learned Rules. Then it plateaus.

**Q: What if success criteria are wrong?**
A: Update them. Agents will re-execute. Better than shipping wrong code.

**Q: Can I run agents in parallel without git worktrees?**
A: Yes. Use separate checkouts or different machines. Worktrees are just simpler.

**Q: What if an agent refuses to follow a rule?**
A: That's a sign the rule is wrong or the agent isn't specialized enough. Clarify the rule.

**Q: How do I measure if this is working?**
A: Track: deployment frequency, bugs per release, test coverage, re-work ratio.

---

## The Philosophy (Read This When Frustrated)

You're not managing an AI. You're orchestrating a company.

Companies need:
- **Clear goals** (success criteria)
- **Specialization** (different roles)
- **Constraints** (rules, policies)
- **Learning** (continuous improvement)
- **Quality** (reviews, testing)

This system provides all of them.

When it feels slow, remember: you're building something that scales.
When it feels expensive (tokens), remember: you're compressing months of team time into hours.

The 50-person company in your terminal isn't a metaphor.
It's your actual operating model now.

---

**Built for scale. Built for precision. Built to ship.**

**You're the CEO. They're the company. Let's build something impossible.**

---