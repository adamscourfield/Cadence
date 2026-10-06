# Stage 01 baseline — 6 October 2026

Source baseline: `000be00`. Prototype SHA-256: `082e67cb6970deae72752b10823456623020b04ff4b38bea65635a910c8e8883`.

The unchanged reference is in `../reference/Cadence.html`. Captures cover eight prototype views and nine app routes at 1440, 1024, 768 and 390px, height 1000px. JSON measurement files record actual viewport/document widths. Some prototype screenshots capture entrance animations; static numbers should be checked against the reference markup, not intermediate count-up frames. No preview lesson data was changed during this comparison.

## Checks

- Existing lint and production build passed (6 October).
- Local preview uses ignored `data/cadence-preview.json`: 12 synthetic lessons, 11 assessments. Repeatable seeds come from `seedLessons()` with RNG seed 42. Use a separate DB path for mutation checks.
- App Overview overflows at 1024px (document width 1243px). Prototype Import overflows at 768px (865px) and 390px (601px). Fix these rather than reproduce overflow.
- App sidebar switches at 1024px, reference at 760px. App uses a mobile top header absent from the reference.

## Screen/control inventory and gaps

| Area | Functional reference behavior | Placeholder/simulated behavior | Implementation difference |
| --- | --- | --- | --- |
| Shell | View switches, active indicator, bottom tabs, Start lesson | No URL/history routing | Keep routes; match dimensions and motion |
| Overview | Trajectory crosshair/tooltip, entrance animations | Fixed values, lesson rows and All lessons are decorative | Continuous bars, smoother interactive chart, compact list; retain real links |
| Live | Objective/class/consent gate; dropdown; stop transitions to report | Scripted transcript, gauges/nudges; no microphone | Keep mic/demo distinction and real metrics; match setup and compact recording display |
| Report | Behaviour confirm/dismiss, assessment controls, transcript questions/students tabs and search | Fixed report, metrics and quotes; report review separate from global queue | Dynamic values and shared decisions; smaller summary, tighter section spacing |
| Assessment | Paste/sample CSV, file picker, busy/results/reset; note counts; class link | Artificial delay, fixed delivery 55 and Year 9; invented individual answers from low scores | Real lesson class/score, persistent replacement, explicit evidence only |
| Behaviour | Approve/Deny removal, toasts, updated tally, empty queue | Independent memory-only sample items | Global persisted queue, validated student matching, London-day tally |
| Misconceptions | Class filter, Details overlay, close/backdrop/Escape, Mark addressed | Invented demo answers; memory-only addressed state; cumulative counts labelled unique students | Persist follow-up/evidence; truthful count labels; keyboard dialog semantics |
| Insights | Entrance effects and hover titles | Fixed scatter/driver/phrase data | Preserve real correlations and sample warnings; animate bars |
| Rubric | Rendered descriptors/levels/sources | None beyond reference data | Use shared rubric rather than duplicate definitions |
| Import | Analyse button switches to report | File picker, example and audio pills lack working handlers | Restyle existing functional import flow |

Expanded misconception and addressed-state screenshots confirm the executed overlay behavior (the inline comment is stale). Addressed preserves detail access. The prototype's report uses inline expansion for assessment notes.

## State coverage to retain during implementation

- Disabled starts/empty uploads; class dropdown selected/open; tabs/search and no matches.
- Busy save/transcribe/upload, success toasts, card removal and empty queues.
- Real app empty lessons, missing assessments, missing timing/speaker labels, missing provider configuration, network failures and retry are necessary additions to the static reference.
- Hover/focus targets must remain keyboard/touch accessible. Demo answers must never be attributed to real students from aggregate scores.

## Next implementation order

Shared design and feedback → shell → overview/chart → live/report → shared behaviour review → misconception model → assessment/details → insights/rubric/import → integrated checks. Retain all source APIs and routes.
