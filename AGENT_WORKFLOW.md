# Study Budy agent workflow

The application and development audit trail are equal deliverables. The user authorized actual multi-agent work and autonomous routine decisions. Reports record artifacts, decisions, commands and limitations from each performed stage.

```text
User request
    ↓
Orchestrator: repository/environment/tooling inspection + constitution
    ↓
/root/specification: requirements, acceptance and clarifications
    ↓
/root/architecture: design, Spec Kit plan/tasks
    ↓
/root/test_design: independently designed behavior tests
    ↓
Orchestrator: backend implementation
/root/specification reassigned: frontend implementation
    ↓
/root/architecture reassigned: independent code/security review
    ↓
Orchestrator QA: tests, types, lint, build, audit
    ↓
Recorded failures/findings → explicitly assigned fix stages
    ↓
Re-review and regression re-test
    ↓
Separate independent final verifier → completion only on evidence
```

These are logical roles with actual delegated agent names, not eight invented independent process instances. The architecture agent reviewed application code it did not implement; it is not the final verifier of its own architecture. The specification agent was explicitly reassigned after specification completion to frontend implementation and later frontend corrections/documentation. The orchestrator implemented/integrated backend, ran QA, and fixed routed findings. Final verification must remain separate from implementation ownership.

## Stage artifacts

| Stage                        | Actual owner / evidence                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Constitution/tool inspection | Orchestrator; `.specify/memory/constitution.md`, `AGENTS.md`, `TOOLING.md`                   |
| Specification                | `/root/specification`; REQ-001–025 and AC-001–020; report 01                                 |
| Planning                     | `/root/architecture`; architecture, design/contracts, TASK-001–020; report 02                |
| Test design                  | `/root/test_design`; tests named with requirement IDs and test strategy; report 03           |
| Implementation               | Orchestrator backend + reassigned frontend agent; report 04 and frontend addendum            |
| Independent review           | Reassigned `/root/architecture`; report 05 with R-001–004 recorded before source corrections |
| QA                           | Orchestrator; report 06 records commands/results rather than expected success                |
| Fix                          | Orchestrator and reassigned delegated roles; report 07 links T/R → FIX → regression          |
| Final verification           | Separate verifier; report 08 and final traceability only after executable checks             |

## Actual correction loop

The independent reviewer reproduced blank-PDF acceptance and prerequisite inversion before fixes. Other findings identified missing persisted-payload validation and incomplete demo sampling disclosure. QA also detected partial weekday override schema rejection, PDF fixture clipping, a Vitest advisory, and improper internal link navigation. These were routed and corrected with specific IDs; no failing behavior assertion was removed merely to make checks pass. Sandbox `spawn EPERM` is recorded separately as an execution restriction and retried with appropriate escalation.

See `reports/05-code-review-report.md` for original findings and `reports/07-fixes-report.md` for correction links. A first successful production build predates later corrections and is not sufficient final evidence. Final completion requires current-tree rechecks and independent verification.

Spec Kit was initialized and its planning/task scripts were actually executed. ECC was unavailable/no execution evidence exists. no-mistakes doctor ran, but initialization lacked an origin remote; local equivalent gates are retained. No tooling/agent/test/Git action is claimed solely because it was requested.
