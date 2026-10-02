# Logo and Gemini correction evidence

User supplied PNG copied byte-for-byte to public/study-budy-logo.png. Sidebar uses Next Image with 52x52 display dimensions, empty alt because adjacent Study Budy text names the link. Metadata uses same image as browser/apple icon. The development workflow disclosure was removed from page markup; design/workflow documentation remains.

Separate roles owned requirements, architecture, test design and independent review (reports13–15). Reviewer findings were recorded before follow-up corrections. Offline classification tests were strengthened to assert HTTP status and absence of upstream secret text.

Live diagnostics authorized by the user's Gemini troubleshooting request, separate from automated tests, used tiny synthetic biology material and never printed credentials:

1. Configured gemini-2.5-flash returned404: unavailable to new users, recommending3.8-flash.
2. Google official model documentation confirms limiting2.5 models to prior active users and recommends3.5-flash-lite or3.8-flash for new projects: https://ai.google.dev/gemini-api/docs/models
3. Minimal3.8-flash request returned503 high demand.
4. Minimal3.5-flash-lite request succeeded with text. Selected this documented model in local configuration, example, README and adapter default; no automatic model fallback.
5. Full structured adapter request returned400 invalid argument. Removing tools alone still failed. Removing schema succeeded with2 validated topics. Keeping the original schema but removing maxItems200 also succeeded with2 validated topics. Removed only that upstream constraint; system instruction and local schema retain the200-topic bound. Added injected-output test rejecting201 topics.

Provider errors now use fixed, actionable messages for authorization, unavailable model, quota, temporary service failure and rejected configuration. Raw upstream messages are never returned. No silent fake fallback. Final live adapter/build/regression results recorded below after execution.

Final actual GeminiStudyMaterialAnalyzer call (no injected generator) succeeded with2 validated topics and positive estimates. This exercises the final model/schema/SDK/parsing path using synthetic diagnostic material and creates no saved plan. Automated tests remain fully offline:33 tests in6 files passed. Final production build exited0; both the user Gemini server3000 and isolated fake verification server3001 started from it. Independent final verifier owns responsive/browser and executable rechecks in report17.
