# Study Budy agent workflow

The application and development audit trail are equal deliverables. The user authorized actual multi-agent work and autonomous routine decisions. Reports record artifacts, decisions, commands and limitations from each performed stage.

## Design-first UI refresh — 2026-10-02

This sequence applies to the current BMW-inspired UI refresh, rather than retroactively describing the original application build.

1. **Reference first:** the orchestrator retrieved https://getdesign.md/bmw/design-md using `npx --yes getdesign@latest add bmw`, producing root `DESIGN.md`, and read that file before modifying UI code.
2. **Visual decisions:** the architecture role read `DESIGN.md`, the constitution and the specification, then mapped the reference to a white dashboard, blue `#1c69d4` actions, a dark navy hero, square controls, flat cards and the documented system-font fallback. The mapping is recorded in `ARCHITECTURE.md`.
3. **Specification and test design:** separate delegated roles define refresh acceptance and verification while preserving existing study-planning behavior and offline AI tests.
4. **Implementation and QA:** the orchestrator applies the mapped design and records actual checks and any corrections.
5. **Independent review and final verification:** separate roles record findings before fixes and assess the final tree with executable evidence.

The retrieval, reference reading and architecture mapping above are performed stages. Later stages require their own recorded results before they can be described as passed. Gemini remains the server-side material analyzer; no live Gemini design session or Gemini reading of `DESIGN.md` is claimed. The interface's development-workflow description should show reference reading as the first step of this refresh.

Refresh evidence: `reports/09-design-test-plan.md` records independent test design; `reports/10-design-review.md` records findings before corrections; `reports/11-design-implementation.md` records retrieval/read order, implementation, failures/corrections and passing QA. `reports/12-design-final-verification.md` contains the separate verifier's results when completed.

## Original application development

The subsequent user-requested logo/Gemini correction removes the development-workflow disclosure from the product UI while preserving this audit trail. Its roles, live diagnostic findings, offline tests, review and independent verification are recorded in reports13–17. Live diagnosis found model access rejection and a rejected upstream schema constraint; the final real analyzer succeeded with synthetic material. Automated tests remain offline.

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
