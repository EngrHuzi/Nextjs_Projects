# Feature Specification: [FEATURE_NAME]

**Status:** [draft | review | approved | implemented]
**Version:** [SEMVER]
**Created:** [DATE_ISO]
**Last Updated:** [DATE_ISO]
**Owner:** [OWNER]

---

## Constitution Alignment Check

This specification MUST comply with all principles in `.specify/memory/constitution.md`:

- [ ] **Specifications Are Source Code** - This spec is versioned, testable, and lives with the code
- [ ] **Validation Before Deployment** - Acceptance criteria include automated tests
- [ ] **Privacy by Design** - Data handling respects user ownership and consent
- [ ] **Transparency and Auditability** - Logic is explainable and traceable
- [ ] **Simplicity Over Feature Creep** - Clear purpose statement, avoids unnecessary complexity
- [ ] **Automation with Human Oversight** - User retains control over automated behaviors
- [ ] **Security Is a Feature** - Security considerations documented
- [ ] **Continuous Learning** - Includes reflection points and success metrics

---

## Overview

### Problem Statement

[Describe the problem this feature solves. What user pain point does it address?]

### Proposed Solution

[High-level description of how this feature addresses the problem]

### User Benefit

[Clear statement of value delivered to users]

---

## Scope

### In Scope

- [Item 1]
- [Item 2]
- [Item 3]

### Out of Scope

- [Explicitly excluded item 1]
- [Explicitly excluded item 2]

### External Dependencies

- [System/Service/Team: ownership and integration points]

---

## Requirements

### Functional Requirements

**FR-1: [Requirement Name]**
- Description: [Clear, testable requirement]
- Acceptance Criteria:
  - [ ] [Specific, measurable criterion]
  - [ ] [Specific, measurable criterion]

**FR-2: [Requirement Name]**
- Description: [Clear, testable requirement]
- Acceptance Criteria:
  - [ ] [Specific, measurable criterion]

### Non-Functional Requirements

**NFR-1: Performance**
- p95 latency: [< X ms]
- Throughput: [Y operations/second]
- Resource limits: [Memory, CPU, storage constraints]

**NFR-2: Security**
- Authentication: [Mechanism]
- Authorization: [Access control model]
- Data handling: [Encryption, anonymization requirements]
- Secrets management: [How API keys, tokens are managed]

**NFR-3: Privacy**
- Data collection: [What, why, with what consent]
- Data retention: [How long, deletion policy]
- User control: [Export, deletion capabilities]

**NFR-4: Reliability**
- SLO: [Service level objective]
- Error budget: [Acceptable failure rate]
- Degradation strategy: [How system behaves under failure]

---

## Data Model

### Entities

**[EntityName]**
```
{
  field1: type,
  field2: type,
  ...
}
```

### Relationships

[Describe entity relationships, foreign keys, constraints]

### Schema Evolution

[How will schema changes be managed? Migration strategy?]

---

## API Contracts

### Endpoints

**[HTTP METHOD] /api/[path]**

**Input:**
```json
{
  "param1": "type",
  "param2": "type"
}
```

**Output (Success):**
```json
{
  "result": "type"
}
```

**Output (Error):**
```json
{
  "error": "string",
  "code": "ERROR_CODE"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid input
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

---

## User Experience

### User Flows

**Flow 1: [Flow Name]**
1. User action
2. System response
3. User sees/receives

### UI/UX Requirements

- [Visual/interaction requirement]
- [Accessibility requirement]
- [Responsive design consideration]

---

## Security Considerations

- **Threat Model:** [What threats does this feature face?]
- **Mitigations:** [How are threats addressed?]
- **Audit Requirements:** [What must be logged?]

---

## Privacy Considerations

- **Data Minimization:** [What data is truly necessary?]
- **User Consent:** [When and how is consent obtained?]
- **Data Lifecycle:** [Collection → Storage → Deletion path]

---

## Testing Strategy

### Unit Tests

- [Component to test]
- [Edge cases to cover]

### Integration Tests

- [Integration point to test]
- [End-to-end scenario]

### Performance Tests

- [Load scenario]
- [Benchmark to validate]

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk description] | Low/Med/High | Low/Med/High | [How to address] |

---

## Success Metrics

- [Metric 1: e.g., User adoption rate > X%]
- [Metric 2: e.g., Error rate < Y%]
- [Metric 3: e.g., Performance target met]

---

## Open Questions

- [ ] [Question requiring resolution before implementation]

---

## Related Documents

- Architecture Decision Records: `history/adr/[relevant-adr].md`
- Implementation Plan: `specs/[feature]/plan.md`
- Tasks: `specs/[feature]/tasks.md`
