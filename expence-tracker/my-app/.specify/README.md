# SpecKit Plus - Project Governance and Documentation

This directory contains the governance framework, templates, and tooling for the Expense Tracker project following Spec-Driven Development (SDD) principles.

## Directory Structure

```
.specify/
├── memory/
│   └── constitution.md          # Project constitution (principles and governance)
├── templates/
│   ├── spec-template.md         # Feature specification template
│   ├── plan-template.md         # Implementation plan template
│   ├── tasks-template.md        # Task breakdown template
│   ├── phr-template.prompt.md   # Prompt History Record template
│   └── adr-template.md          # Architecture Decision Record template
└── scripts/
    └── bash/
        └── create-phr.sh        # PHR creation automation script

history/
├── prompts/
│   ├── constitution/            # Constitution-related PHRs
│   ├── general/                 # General development PHRs
│   └── <feature-name>/          # Feature-specific PHRs
└── adr/                         # Architecture Decision Records

specs/
└── <feature-name>/
    ├── spec.md                  # Feature requirements
    ├── plan.md                  # Implementation architecture
    └── tasks.md                 # Development tasks
```

## Core Documents

### Constitution (`.specify/memory/constitution.md`)

The project's constitutional foundation defining 9 core principles:

1. **Specifications Are Source Code** - Requirements are versioned and testable
2. **Validation Before Deployment** - Automated testing gates
3. **AI as Co-Reasoning Partner** - AI assists, humans review
4. **Privacy by Design** - User data ownership
5. **Transparency and Auditability** - Traceable financial logic
6. **Simplicity Over Feature Creep** - Purpose-driven features
7. **Automation with Human Oversight** - User control
8. **Security Is a Feature** - Built-in security
9. **Continuous Learning** - Iteration and reflection

**Version:** 1.0.0 (ratified 2025-11-04)

## Templates

### Specification Template (`spec-template.md`)

Use for defining feature requirements:
- Problem statement and user benefit
- Functional and non-functional requirements
- Data models and API contracts
- Security and privacy considerations
- Testing strategy and success metrics

**Constitution Check:** Ensures alignment with all 9 principles

### Plan Template (`plan-template.md`)

Use for architectural planning:
- Scope and dependencies
- Key decisions with rationale (ADR candidates)
- Architecture overview and component design
- NFRs (performance, security, reliability)
- Risk analysis and operational readiness

**Constitution Check:** Validates principle compliance

### Tasks Template (`tasks-template.md`)

Use for implementation breakdown:
- Categorized tasks (setup, core, data, API, UI, testing, observability, documentation, deployment)
- Acceptance criteria and test cases
- Dependency graph
- Progress tracking

**Constitution Check:** Ensures testability and principle adherence

### ADR Template (`adr-template.md`)

Use for documenting significant architectural decisions:
- Context and problem statement
- Considered options with pros/cons
- Decision outcome and rationale
- Consequences and implementation plan
- Monitoring and review criteria

**Three-Part ADR Test:**
1. Long-term consequences?
2. Multiple viable alternatives?
3. Cross-cutting impact?

### PHR Template (`phr-template.prompt.md`)

Automatically used by `/sp.phr` command or `create-phr.sh` script to record:
- User prompts (verbatim)
- Agent responses
- Files modified
- Tests run
- Outcome and evaluation

**Routing:**
- Constitution stage → `history/prompts/constitution/`
- Feature stages → `history/prompts/<feature-name>/`
- General → `history/prompts/general/`

## Workflows

### Creating a New Feature

1. **Specify** (`/sp.specify`)
   - Create `specs/<feature>/spec.md` from user requirements
   - Define problem, solution, requirements, and acceptance criteria

2. **Plan** (`/sp.plan`)
   - Create `specs/<feature>/plan.md` with architecture
   - Document key decisions (ADR candidates)
   - Define NFRs, data model, API contracts

3. **Generate Tasks** (`/sp.tasks`)
   - Create `specs/<feature>/tasks.md` with implementation breakdown
   - Organize by category with dependencies
   - Include test cases and acceptance criteria

4. **Implement** (`/sp.implement`)
   - Execute tasks in dependency order
   - Follow TDD cycle (red → green → refactor)
   - Track progress

5. **Document Decisions** (`/sp.adr <title>`)
   - Create ADRs for significant architectural decisions
   - Link to specs, plans, and related ADRs

6. **Commit and PR** (`/sp.git.commit_pr`)
   - Create commits following git workflow
   - Generate PR with summary and test plan

### Recording Work (PHR)

After each significant interaction:
```bash
.specify/scripts/bash/create-phr.sh \
  --title "Brief description" \
  --stage <constitution|spec|plan|tasks|red|green|refactor|explainer|misc|general> \
  [--feature <feature-name>] \
  --json
```

Or use `/sp.phr` command for automatic PHR creation.

## Constitution Compliance

Every template includes a **Constitution Alignment Check** section. Before finalizing any spec, plan, or task list, verify:

- [ ] Requirements are testable and versioned
- [ ] Automated validation defined
- [ ] Privacy and security addressed
- [ ] User control preserved
- [ ] Complexity justified
- [ ] Learning and reflection included

## Amendment Process

To update the constitution:

1. Propose change via pull request
2. Include rationale and impact analysis
3. Update version following semver:
   - MAJOR: Principle removal/redefinition
   - MINOR: New principle/section
   - PATCH: Clarifications/typo fixes
4. Update Sync Impact Report
5. Propagate changes to templates
6. Obtain consensus from maintainers

## Tools and Scripts

### PHR Creation Script

```bash
.specify/scripts/bash/create-phr.sh --title "Title" --stage <stage> [--feature <name>]
```

Creates a new Prompt History Record with auto-incremented ID and proper routing.

## Best Practices

1. **Keep specs close to code** - Version control everything together
2. **Make decisions explicit** - Document rationale in ADRs
3. **Validate early and often** - Define tests with requirements
4. **Respect privacy and security** - Built-in, not bolted-on
5. **Stay simple** - Justify complexity, remove unnecessary features
6. **Learn continuously** - Retrospectives, post-mortems, feedback loops

## Questions or Issues?

- Constitution questions → Discuss in team meetings or GitHub issues
- Template improvements → Submit pull request with rationale
- Process feedback → Use retrospectives to propose changes

---

**Last Updated:** 2025-11-04
**Constitution Version:** 1.0.0
