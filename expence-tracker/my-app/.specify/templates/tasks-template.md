# Implementation Tasks: [FEATURE_NAME]

**Status:** [not-started | in-progress | completed]
**Version:** [SEMVER]
**Created:** [DATE_ISO]
**Last Updated:** [DATE_ISO]
**Plan Reference:** `specs/[feature]/plan.md`

---

## Constitution Compliance

Tasks MUST align with constitution principles:

- [ ] **Specifications Are Source Code** - Tasks reference testable specs
- [ ] **Validation Before Deployment** - Each task includes acceptance tests
- [ ] **Privacy by Design** - Privacy checks in relevant tasks
- [ ] **Transparency and Auditability** - Logic changes include documentation
- [ ] **Simplicity Over Feature Creep** - No unnecessary complexity added
- [ ] **Security Is a Feature** - Security validation in relevant tasks
- [ ] **Continuous Learning** - Retrospective task at end

---

## Task Categories

### Setup and Infrastructure

**TASK-001: [Setup Task Name]**
- **Description:** [What needs to be set up]
- **Acceptance Criteria:**
  - [ ] [Specific, testable criterion]
  - [ ] [Specific, testable criterion]
- **Estimated Effort:** [Small / Medium / Large]
- **Dependencies:** None
- **Test Cases:**
  - [ ] [Test scenario]
- **Status:** [not-started | in-progress | completed]

---

### Core Implementation

**TASK-002: [Implementation Task Name]**
- **Description:** [What code needs to be written]
- **Acceptance Criteria:**
  - [ ] [Specific, testable criterion]
  - [ ] [Specific, testable criterion]
  - [ ] Unit tests pass with >80% coverage
- **Estimated Effort:** [Small / Medium / Large]
- **Dependencies:** TASK-001
- **Test Cases:**
  - [ ] [Happy path test]
  - [ ] [Edge case test]
  - [ ] [Error handling test]
- **Code References:**
  - File: [path/to/file.ts]
  - Functions: [functionName1, functionName2]
- **Status:** [not-started | in-progress | completed]

**TASK-003: [Implementation Task Name]**
- **Description:** [What code needs to be written]
- **Acceptance Criteria:**
  - [ ] [Specific, testable criterion]
  - [ ] [Specific, testable criterion]
- **Estimated Effort:** [Small / Medium / Large]
- **Dependencies:** TASK-002
- **Test Cases:**
  - [ ] [Test scenario]
- **Status:** [not-started | in-progress | completed]

---

### Data and Schema

**TASK-004: [Database/Schema Task]**
- **Description:** [Schema changes or data operations]
- **Acceptance Criteria:**
  - [ ] Migration script created and tested
  - [ ] Rollback script verified
  - [ ] Data integrity checks pass
- **Estimated Effort:** [Small / Medium / Large]
- **Dependencies:** TASK-002
- **Test Cases:**
  - [ ] Forward migration succeeds
  - [ ] Rollback restores original state
  - [ ] Data constraints enforced
- **Privacy Considerations:**
  - [ ] PII handling complies with constitution
  - [ ] User consent obtained for new data collection
- **Status:** [not-started | in-progress | completed]

---

### API and Integration

**TASK-005: [API Endpoint Task]**
- **Description:** [API endpoint to implement]
- **Acceptance Criteria:**
  - [ ] Endpoint returns correct response format
  - [ ] Error handling covers all error taxonomy cases
  - [ ] API documentation updated
  - [ ] Integration tests pass
- **Estimated Effort:** [Small / Medium / Large]
- **Dependencies:** TASK-003
- **Test Cases:**
  - [ ] [200 OK: Valid request]
  - [ ] [400 Bad Request: Invalid input]
  - [ ] [401 Unauthorized: Missing auth]
  - [ ] [403 Forbidden: Insufficient permissions]
  - [ ] [500 Server Error: Handled gracefully]
- **Security Considerations:**
  - [ ] Input validation implemented
  - [ ] Authentication enforced
  - [ ] Authorization checks in place
- **Status:** [not-started | in-progress | completed]

---

### UI/UX Implementation

**TASK-006: [UI Component Task]**
- **Description:** [UI component to build]
- **Acceptance Criteria:**
  - [ ] Component renders correctly
  - [ ] Responsive design verified (mobile, tablet, desktop)
  - [ ] Accessibility standards met (WCAG 2.1 AA)
  - [ ] User flow tested
- **Estimated Effort:** [Small / Medium / Large]
- **Dependencies:** TASK-005
- **Test Cases:**
  - [ ] [User interaction scenario]
  - [ ] [Visual regression test]
- **Status:** [not-started | in-progress | completed]

---

### Testing and Validation

**TASK-007: [Testing Task]**
- **Description:** [Testing scope]
- **Acceptance Criteria:**
  - [ ] Unit test coverage >80%
  - [ ] Integration tests cover critical paths
  - [ ] Performance benchmarks met
  - [ ] Security scan passes
- **Estimated Effort:** [Small / Medium / Large]
- **Dependencies:** TASK-006
- **Test Cases:**
  - [ ] [End-to-end scenario 1]
  - [ ] [End-to-end scenario 2]
  - [ ] [Performance test: p95 latency < X ms]
  - [ ] [Load test: Y concurrent users]
- **Status:** [not-started | in-progress | completed]

---

### Observability and Monitoring

**TASK-008: [Observability Task]**
- **Description:** [Logging, metrics, alerts to implement]
- **Acceptance Criteria:**
  - [ ] Logs structured and queryable
  - [ ] Key metrics tracked (latency, errors, throughput)
  - [ ] Alerts configured with runbooks
  - [ ] Dashboard created
- **Estimated Effort:** [Small / Medium / Large]
- **Dependencies:** TASK-007
- **Test Cases:**
  - [ ] Logs appear in monitoring system
  - [ ] Metrics update in real-time
  - [ ] Alerts trigger correctly
- **Status:** [not-started | in-progress | completed]

---

### Documentation

**TASK-009: [Documentation Task]**
- **Description:** [Documentation to create/update]
- **Acceptance Criteria:**
  - [ ] API documentation updated
  - [ ] User guide created/updated
  - [ ] Runbooks written for common issues
  - [ ] Architecture diagrams updated
- **Estimated Effort:** [Small / Medium / Large]
- **Dependencies:** TASK-008
- **Status:** [not-started | in-progress | completed]

---

### Deployment and Release

**TASK-010: [Deployment Task]**
- **Description:** [Deployment steps]
- **Acceptance Criteria:**
  - [ ] Feature flag configured
  - [ ] Canary deployment successful
  - [ ] Rollback tested
  - [ ] Production deployment verified
- **Estimated Effort:** [Small / Medium / Large]
- **Dependencies:** TASK-009
- **Test Cases:**
  - [ ] Deployment completes without errors
  - [ ] Health checks pass
  - [ ] Rollback works if needed
- **Status:** [not-started | in-progress | completed]

---

### Retrospective and Learning

**TASK-011: Retrospective**
- **Description:** Post-implementation review
- **Acceptance Criteria:**
  - [ ] Team retrospective conducted
  - [ ] Lessons learned documented
  - [ ] Action items identified
  - [ ] Success metrics evaluated
- **Estimated Effort:** Small
- **Dependencies:** TASK-010
- **Reflection Questions:**
  - What went well?
  - What could be improved?
  - What did we learn?
  - What should we do differently next time?
- **Status:** [not-started | in-progress | completed]

---

## Task Dependency Graph

```
TASK-001 (Setup)
    ↓
TASK-002 (Core Implementation)
    ↓
TASK-003 (Implementation)
    ↓
TASK-004 (Data/Schema)
    ↓
TASK-005 (API)
    ↓
TASK-006 (UI/UX)
    ↓
TASK-007 (Testing)
    ↓
TASK-008 (Observability)
    ↓
TASK-009 (Documentation)
    ↓
TASK-010 (Deployment)
    ↓
TASK-011 (Retrospective)
```

---

## Progress Summary

- **Total Tasks:** 11
- **Completed:** 0
- **In Progress:** 0
- **Not Started:** 11
- **Blocked:** 0

---

## Related Documents

- Feature Specification: `specs/[feature]/spec.md`
- Implementation Plan: `specs/[feature]/plan.md`
- Constitution: `.specify/memory/constitution.md`
- Architecture Decision Records: `history/adr/`
