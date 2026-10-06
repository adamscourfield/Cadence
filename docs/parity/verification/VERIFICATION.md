# Prototype parity verification — 6 October 2026

## Passed

- ESLint, TypeScript, and production build.
- Focused domain checks: finite/bounded CSV values, duplicate students, CSV/TSV, mastery and mean, class-scoped misconception grouping, unchanged re-upload vs new observations, removal, unknown counts, exclusion of demo evidence from real imports, London summer/winter day boundaries, class-scoped behaviour tallies, and all four triangulation thresholds.
- Transcript checks: plain/start-only text produces estimated timing and unknown wait time; VTT/SRT preserves speaker labels and measured four-second pauses.
- API checks against `data/cadence-validation.json` on port 3002: analyzed import, roster validation, approval idempotency, invalid assessment rejection, outcomes, explicit evidence, Addressed state, replacement/removal, missing group/lesson, and fixture cleanup. The user's preview database is separate.
- Browser: consent-gated demo setup at 390px, start/stop/save to a real report, sample outcomes (60% mastery / 68% mean), teacher-entered student evidence, class filter, details overlay, Addressed state surviving reload. Global behaviour approval appears on the report; undo and denial update the same event. Attempting to navigate during an active demo preserves the lesson and displays the end-and-save prompt. Plain-text import reaches a report with estimated pace, unknown wait time and speaker labels. The Audio tab without a key shows configuration guidance and disables file selection. Stopping a partial demo now preserves its current scripted speaker label.
- Nine routes measured at 1440/1024/768/390px with no horizontal overflow. Additional 320px checks found long rubric source chips; those were changed to wrap and verified at exactly 320px document width. Captures and raw measurements are alongside this file.

## Deliberate differences

The real lesson list and per-lesson routes remain. Data totals follow actual stored lessons. Counts are reported instances, not unique students. Historical demo approvals remain attached to historical dates rather than being counted today. Misconception details use a native dialog with focus restoration, Escape/backdrop close and a simple entrance transition. The chart includes an accessible values disclosure. Synthetic answers are restricted to demo data; genuine reports require explicit teacher evidence.

## Still to verify

- Physical microphone recording, browser permission denial and final recording capture in Chrome/Edge.
- Real AssemblyAI transcription and Claude analysis; provider keys are absent locally.
- Interrupted save/provider failure recovery, exhaustive empty-database/long-content states, and a full keyboard/screen-reader audit. Reduced-motion suppression is implemented, but its OS/browser setting has not been toggled during this run.
- Exact animation choreography and all visual states against the reference; some screenshot grids capture entrance transitions rather than settled frames. The final overview captures are taken after settling.

Stage 12 remains open until these checks are done. No production classroom data or provider credentials were used.
