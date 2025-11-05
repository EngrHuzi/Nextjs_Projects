# SpecKit Plus Quick Start Guide

## Overview

SpecKit Plus provides a structured approach to feature development following the Expense Tracker constitution principles.

## Quick Reference

### Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/sp.specify` | Create feature specification | Starting new feature |
| `/sp.plan` | Create implementation plan | After spec approval |
| `/sp.tasks` | Generate task breakdown | Ready to implement |
| `/sp.implement` | Execute implementation | During development |
| `/sp.adr <title>` | Document architectural decision | Significant design choice |
| `/sp.phr` | Create Prompt History Record | After any work session |
| `/sp.git.commit_pr` | Commit and create PR | Ready to merge |
| `/sp.constitution` | Update project constitution | Governance changes |
| `/sp.clarify` | Clarify underspecified areas | Spec needs refinement |
| `/sp.analyze` | Cross-artifact consistency check | Before task execution |
| `/sp.checklist` | Generate feature checklist | Quality assurance |

### Development Workflow

```
1. /sp.specify
   ↓ creates specs/<feature>/spec.md

2. /sp.clarify (optional)
   ↓ refines spec.md

3. /sp.plan
   ↓ creates specs/<feature>/plan.md
   ↓ identifies ADR candidates

4. /sp.adr <decision-title> (if needed)
   ↓ creates history/adr/<N>-<slug>.md

5. /sp.tasks
   ↓ creates specs/<feature>/tasks.md

6. /sp.analyze (optional)
   ↓ validates consistency

7. /sp.implement
   ↓ executes tasks
   ↓ follows red → green → refactor

8. /sp.git.commit_pr
   ↓ commits + creates PR

9. /sp.phr
   ↓ creates history/prompts/<route>/<N>-<slug>.md
```

## Constitution Principles Quick Check

Before committing any work, verify:

- ✅ **Testable** - Requirements have automated tests
- ✅ **Validated** - All tests pass, security scanned
- ✅ **Reviewed** - Human reviewed AI-generated code
- ✅ **Private** - User data protected, consent obtained
- ✅ **Transparent** - Financial logic is traceable
- ✅ **Simple** - No unnecessary complexity
- ✅ **Controlled** - User can override automation
- ✅ **Secure** - Secrets safe, dependencies scanned
- ✅ **Documented** - Lessons learned recorded

## Common Scenarios

### Starting a New Feature

```bash
# 1. Create branch
git checkout -b feature/my-feature

# 2. Specify requirements
/sp.specify
# Describe the feature in natural language

# 3. Plan architecture
/sp.plan
# Review and document key decisions

# 4. Break into tasks
/sp.tasks

# 5. Implement
/sp.implement
```

### Documenting an Architectural Decision

```bash
# When you make a significant decision during planning:
/sp.adr "Choose PostgreSQL for transactional data"

# Fill in the template:
# - Context and problem
# - Options considered (at least 2)
# - Decision rationale
# - Trade-offs and consequences
```

### Recording Your Work

```bash
# Automatically after each command:
/sp.phr

# Or manually via script:
.specify/scripts/bash/create-phr.sh \
  --title "Implement user authentication" \
  --stage red \
  --feature auth \
  --json
```

### Updating the Constitution

```bash
# Propose an amendment
/sp.constitution
# Provide updated principles or governance text

# Review Sync Impact Report
# Update templates if needed
# Submit PR for team consensus
```

## File Locations

| Artifact | Location | Purpose |
|----------|----------|---------|
| Constitution | `.specify/memory/constitution.md` | Project principles |
| Spec | `specs/<feature>/spec.md` | Requirements |
| Plan | `specs/<feature>/plan.md` | Architecture |
| Tasks | `specs/<feature>/tasks.md` | Implementation |
| ADR | `history/adr/<N>-<slug>.md` | Decision records |
| PHR | `history/prompts/<route>/<N>-<slug>.md` | Work history |

## Templates

All templates live in `.specify/templates/`:

- `spec-template.md` - Feature requirements
- `plan-template.md` - Implementation architecture
- `tasks-template.md` - Task breakdown
- `adr-template.md` - Architectural decisions
- `phr-template.prompt.md` - Prompt history

## Tips

1. **Specs before code** - Define requirements first
2. **Plan before tasks** - Architectural decisions inform implementation
3. **ADRs for big decisions** - Document the "why" behind choices
4. **PHRs capture learning** - Record what worked and what didn't
5. **Constitution is law** - When in doubt, check the principles

## Getting Help

- Read the constitution: `.specify/memory/constitution.md`
- Check templates: `.specify/templates/`
- Review examples: `history/prompts/`
- Full guide: `.specify/README.md`

---

**Remember:** Every feature should have a clear purpose, pass all validations, protect user privacy, and maintain simplicity. When in doubt, ask "Does this uphold our constitution?"
