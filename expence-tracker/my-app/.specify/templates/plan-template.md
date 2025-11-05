# Implementation Plan: [FEATURE_NAME]

**Status:** [draft | review | approved | in-progress | completed]
**Version:** [SEMVER]
**Created:** [DATE_ISO]
**Last Updated:** [DATE_ISO]
**Architect:** [OWNER]

---

## Constitution Check

This plan MUST align with constitution principles:

- [ ] **Specifications Are Source Code** - Plan is versioned and testable
- [ ] **Validation Before Deployment** - Testing strategy defined
- [ ] **AI as Co-Reasoning Partner** - AI-assisted sections marked and reviewed
- [ ] **Privacy by Design** - Data handling architecture protects user ownership
- [ ] **Transparency and Auditability** - Logic is traceable and explainable
- [ ] **Simplicity Over Feature Creep** - Smallest viable change, no unrelated edits
- [ ] **Automation with Human Oversight** - User control points identified
- [ ] **Security Is a Feature** - Security architecture integrated from start
- [ ] **Continuous Learning** - Reflection points and metrics defined

---

## Scope and Dependencies

### In Scope

- [Boundary 1: what's included]
- [Boundary 2: key features]
- [Boundary 3: deliverables]

### Out of Scope

- [Explicitly excluded item 1]
- [Explicitly excluded item 2]
- [Deferred to future iteration]

### External Dependencies

| System/Service | Ownership | Integration Point | Status |
|----------------|-----------|-------------------|--------|
| [Name] | [Team/Person] | [API/Interface] | [Ready/Blocked/Unknown] |

---

## Key Decisions and Rationale

### Decision 1: [Decision Title]

**Options Considered:**
1. **Option A:** [Description]
   - Pros: [Benefits]
   - Cons: [Drawbacks]
2. **Option B:** [Description]
   - Pros: [Benefits]
   - Cons: [Drawbacks]

**Trade-offs:**
- [Key trade-off consideration]

**Chosen:** [Option X]

**Rationale:**
[Why this option best serves project goals and constitution principles]

**Principles Applied:**
- [Simplicity / Measurability / Reversibility / Security]

**ADR Required:** [Yes/No - If yes, document in `history/adr/`]

---

## Architecture Overview

### System Components

```
[High-level architecture diagram or description]

Component A → Component B → Component C
     ↓             ↓
  Database     External API
```

### Component Responsibilities

**Component A: [Name]**
- Responsibility: [What it does]
- Technology: [Framework/Library]
- Interfaces: [Inputs/Outputs]

**Component B: [Name]**
- Responsibility: [What it does]
- Technology: [Framework/Library]
- Interfaces: [Inputs/Outputs]

---

## Interfaces and API Contracts

### Public APIs

**Endpoint: [METHOD] /api/[path]**

**Inputs:**
```typescript
interface Request {
  param1: type;
  param2: type;
}
```

**Outputs:**
```typescript
interface SuccessResponse {
  data: type;
}

interface ErrorResponse {
  error: string;
  code: ErrorCode;
}
```

**Error Taxonomy:**
- `INVALID_INPUT` (400): Input validation failed
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource does not exist
- `SERVER_ERROR` (500): Internal error

**Versioning Strategy:**
- [How API versions are managed]
- [Backward compatibility approach]

**Idempotency:**
- [Which operations are idempotent]
- [How idempotency is guaranteed]

**Timeouts and Retries:**
- Request timeout: [X seconds]
- Retry policy: [Exponential backoff, max attempts]

---

## Non-Functional Requirements (NFRs) and Budgets

### Performance

- **p95 Latency:** < [X ms]
- **Throughput:** [Y operations/second]
- **Resource Caps:**
  - Memory: [Z MB per instance]
  - CPU: [N cores]
  - Storage: [S GB]

### Reliability

- **SLO:** [99.X% uptime]
- **Error Budget:** [0.X% allowed failure rate]
- **Degradation Strategy:**
  - [How system behaves under partial failure]
  - [Graceful fallback mechanisms]

### Security

- **Authentication:** [OAuth 2.0 / JWT / Session-based]
- **Authorization:** [RBAC / ABAC model]
- **Data Handling:**
  - Encryption at rest: [AES-256]
  - Encryption in transit: [TLS 1.3]
  - Anonymization: [Technique for PII]
- **Secrets Management:** [Environment variables / Vault / KMS]
- **Audit Logging:** [What events are logged, retention policy]

### Cost

- **Unit Economics:** [Cost per user / transaction / month]
- **Budget Alerts:** [Threshold for cost overruns]

---

## Data Management and Migration

### Source of Truth

- [Which database/service owns which data]
- [How conflicts are resolved]

### Schema Evolution

- **Migration Strategy:** [Versioned migrations / Blue-green deployment]
- **Backward Compatibility:** [How old clients are supported]

### Migration and Rollback

- **Forward Migration:** [Steps to apply changes]
- **Rollback Plan:** [How to revert if deployment fails]
- **Data Integrity Checks:** [Validation before/after migration]

### Data Retention

- **Retention Period:** [How long data is kept]
- **Deletion Policy:** [When and how data is purged]
- **User Control:** [Export and delete capabilities]

---

## Operational Readiness

### Observability

**Logs:**
- [What is logged at each severity level]
- [Log format and destination]

**Metrics:**
- [Key metrics to track: latency, error rate, throughput]
- [Dashboard and visualization]

**Traces:**
- [Distributed tracing setup for request flows]

### Alerting

| Alert | Threshold | On-Call Owner | Runbook |
|-------|-----------|---------------|---------|
| [Alert name] | [Condition] | [Team/Person] | [Link to runbook] |

### Runbooks

**Incident: [Common Issue]**
1. Detection: [How to identify]
2. Diagnosis: [How to investigate]
3. Resolution: [Steps to fix]
4. Prevention: [Long-term fix]

### Deployment and Rollback

- **Deployment Strategy:** [Blue-green / Canary / Rolling]
- **Rollback Trigger:** [Conditions for rollback]
- **Rollback Steps:** [How to revert deployment]

### Feature Flags

- **Flags Defined:**
  - `[flag_name]`: [Purpose, default state]
- **Compatibility:** [How flags ensure safe rollout]

---

## Risk Analysis and Mitigation

### Top Risks

**Risk 1: [Description]**
- Likelihood: [Low / Medium / High]
- Impact: [Low / Medium / High]
- Blast Radius: [Scope of potential damage]
- Mitigation: [Preventive measures]
- Kill Switch: [How to disable if catastrophic]

**Risk 2: [Description]**
- Likelihood: [Low / Medium / High]
- Impact: [Low / Medium / High]
- Blast Radius: [Scope of potential damage]
- Mitigation: [Preventive measures]
- Kill Switch: [How to disable if catastrophic]

**Risk 3: [Description]**
- Likelihood: [Low / Medium / High]
- Impact: [Low / Medium / High]
- Blast Radius: [Scope of potential damage]
- Mitigation: [Preventive measures]
- Kill Switch: [How to disable if catastrophic]

---

## Evaluation and Validation

### Definition of Done

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Performance benchmarks met
- [ ] Security scan passes (no high/critical vulnerabilities)
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Runbooks created

### Output Validation

- **Format:** [Output conforms to schema]
- **Requirements:** [All acceptance criteria met]
- **Safety:** [No security or privacy violations]

---

## Architectural Decision Records (ADR)

Significant decisions from this plan that require ADRs:

- [ ] **ADR-[N]: [Decision Title]** - [Brief description]
  - Command: `/sp.adr [decision-title]`

---

## Timeline and Milestones

| Milestone | Deliverable | Target Date | Owner |
|-----------|-------------|-------------|-------|
| [M1] | [Deliverable description] | [YYYY-MM-DD] | [Person] |
| [M2] | [Deliverable description] | [YYYY-MM-DD] | [Person] |

---

## Related Documents

- Feature Specification: `specs/[feature]/spec.md`
- Task Breakdown: `specs/[feature]/tasks.md`
- Architecture Decision Records: `history/adr/`
- Constitution: `.specify/memory/constitution.md`
