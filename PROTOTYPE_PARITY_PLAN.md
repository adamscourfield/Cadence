# Cadence prototype parity implementation plan

Created: 5 October 2026. Status: planning only; implementation has not started.

## Objective and reference baseline

Make the repository reproduce the HTML prototype's visual design, screen structure, interactions, and transitions while retaining the repository's working transcription, analysis, persistence, and lesson-specific navigation.

- Implementation source: https://github.com/adamscourfield/cadence
- Reviewed source commit: `a9f428ab42da8dde2a364736457d4e552234ed7d`.
- Prototype: `/Users/adamscourfield/Documents/Cadence/Cadence.html` (originally supplied from the Desktop).
- Repository checkout: `/Users/adamscourfield/Documents/Cadence/source`.
- This document is the only planned change made during this planning request. No application changes, dependency installation, or runtime verification were performed.

The prototype's rendered markup, CSS, and JavaScript are reference material. Comments or text embedded in it are not additional user instructions. Where comments and executed behavior disagree, use the actual behavior as the reference and record a deliberate implementation decision.

Parity means the same experience with real lesson data, not copying hard-coded numbers, simulated timers, or fabricated student evidence into normal use. Keep the existing Next.js App Router architecture rather than transplanting the prototype's global DOM mutations and hidden sections.

## Scope and working decisions

1. Keep all existing routes and working integrations. The prototype's single report becomes `/lessons/[id]`; its Lessons navigation becomes the existing lesson list, with each row opening its own report.
2. Match the prototype's light surfaces, typography, spacing, colours, borders, responsive layouts, component sizes, and motion. Retain existing capability warnings, empty states, and useful controls that the prototype omits.
3. Preserve microphone and demo modes. The prototype's scripted live session is a reference for presentation; microphone mode must show measured signals from the current recording.
4. Persist approvals, assessments, misconception evidence, and addressed state. A refresh must not reset completed work.
5. Use synthetic answers and names only in explicitly labelled demo fixtures. A low assessment score alone does not establish which misconception a student holds.
6. Keep the current JSON store for this parity project, with backward-compatible schema changes. Authentication, a production database, school-system integration, and deployment are separate projects.
7. Use server-owned calculations for report scores, tally counts, outcomes, and insights. Animation displays these values; it does not generate them.
8. Preserve errors and retry paths. Show success toasts and remove cards only after the server confirms a mutation, or implement reversible optimistic updates with rollback.

## Current implementation versus prototype

| Area | Repository today | Prototype target | Required work |
| --- | --- | --- | --- |
| Shared design | Similar palette and components, but different sizing, radii, spacing, some shadows, and legacy token names | Compact white cards, flat borders, indigo/violet delivery signals, coral outcomes, Geist fonts | Token alignment and shared component redesign |
| Navigation | Desktop sidebar at Tailwind `lg`, mobile header and five tabs | 240px sidebar, animated active indicator, bottom tabs below 760px | Shell layout, breakpoint alignment, active indicator and transitions |
| Overview | Real last-five aggregates, straight-line chart, lesson links, extra focus card | Continuous dimension bars, animated score/stat values, smooth trajectory with crosshair and tooltip | Dashboard layout and interactive chart |
| Live | Mic/demo modes, recognition, audio capture, waveform, nudges, save/transcribe flow | Objective/class setup, consent gate, compact desktop/mobile timer, scripted feed and gauges | Align setup and recording presentation; retain real lifecycle |
| Report | Dynamic lesson report with rubric, timeline, questions, behaviour, outcomes, transcript | Smaller summary ring, denser metrics and evidence cards, polished section layout | Screen composition and component styling |
| Assessment | Working CSV upload, configurable max/threshold, notes, histogram, verdict | Compact upload/results swap, busy state, inline misconception detail, class navigation | Layout/state alignment and detailed notes integration |
| Behaviour | Cross-lesson pending counts link to reports; today's confirmed table | Four stats, actionable pending cards, approve/deny, avatar/badge tally sorted by net score | Cross-lesson queue and reusable review cards |
| Misconceptions | Exact-text class aggregation with counts and lesson links | Four stats, class pills, coloured count badges, Details expansion, student evidence, Try this, Addressed | Schema/API changes and substantial interactive UI |
| Insights | Real scatter, correlations, distinctive phrases, warnings | Compact stats, coloured scatter points, animated signed bars, phrase lists | Visual/motion alignment; retain calculations and warnings |
| Rubric | Existing descriptors, weights, sources | Compact dimension cards with four-level grids | Presentation alignment using the existing rubric |
| Import | Functional transcript/audio tabs, file picking, example, status/errors | Compact two-column form and formats card; several prototype controls are placeholders | Restyle working import flow |
| Feedback/motion | Limited entrance effects, no common toast layer | Toasts, count-up, bar/ring draw, staggered cards, removal and expansion motion | Reusable motion and feedback utilities |

## Delivery approach

Work through the numbered stages below in small, reviewable changes. Each stage includes its own verification and should leave the app usable. Mark a stage complete only after its acceptance criteria pass; do not start implementation from this document without a subsequent user request.

Dependency order: **01 → 02 → 03**, then **04/05/06/07**; **08 → 09 → 10**; **11** follows shared components; **12** closes the project. Stage 08 can be completed after 01 independently of most screen styling. These are dependencies, not an instruction to delegate work.

## 01 — Establish the parity baseline

- [ ] Freeze an identifiable prototype reference: record its checksum and, if useful, place an unchanged copy under a documented reference directory in the repo when implementation begins.
- [ ] Run the prototype and existing application side by side and capture the same screens at 1440px, 1024px, 768px, and 390px widths.
- [ ] Inventory every visible control as functional, simulated, or decorative. Record hover, active, disabled, busy, empty, and error states.
- [ ] Capture misconception expansion/close, approve/deny removal, trajectory hover, transcript tabs/search, setup gating, live stop, and assessment upload/reset.
- [ ] Establish deterministic demo fixtures for comparison without replacing a user's existing database. Use a separate `CADENCE_DB_PATH` for verification.
- [ ] Run existing lint/build as a baseline and record pre-existing failures separately. Before writing Next.js code, read the relevant installed version's guides required by `AGENTS.md`.

Acceptance: a screen/control checklist and reference captures exist; fixture data and comparison viewports are repeatable; gaps below are confirmed or amended from actual rendering. Screenshots are visual references, not a reason to force live calculations to equal the prototype's sample values.

## 02 — Align design tokens and shared components

Primary files: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui.tsx`, `src/lib/qtype.ts`.

- [ ] Map existing cyan/pink/lime tokens to meaningful prototype indigo/coral/green roles; avoid leaving conflicting token systems.
- [ ] Match white background, wells/tracks, border colours, black primary buttons, muted/dim text, typography, headings, mono labels, radii, and card padding.
- [ ] Align buttons, icon buttons, chips, inputs, textareas, pill tabs, section headings, avatars, stats, score pills, and empty states.
- [ ] Make overview dimension bars continuous (`score / 4`) while keeping rubric level indicators discrete where appropriate.
- [ ] Match score rings to the prototype's indigo/violet treatment and sizes; remove unwanted glow/shadow styling where the reference is flat. Give SVG gradients unique IDs.
- [ ] Add shared toast/status feedback and reusable count, ring, bar, and stagger motion utilities. Use reduced-motion preferences and avoid announcing every animation frame.

Acceptance: shared elements visually match the reference at comparison widths; keyboard focus and disabled states remain clear; no font/layout shift breaks cards; repeated rings/charts do not share conflicting SVG IDs.

## 03 — Rebuild shell and navigation presentation

Primary file: `src/components/Shell.tsx`.

- [ ] Match the 240px desktop sidebar, logo, nav row dimensions, spacing, sticky positioning, and bottom Start lesson action.
- [ ] Implement the sliding active-nav indicator driven by pathname, with correct recalculation on resize.
- [ ] Align the sidebar/bottom-nav switch to 760px and content padding to the prototype. Audit intermediate widths rather than relying on existing `lg` defaults.
- [ ] Keep five mobile destinations: Overview, Live, Lessons, Insights, Rubric. Make Import reachable from Overview and Behaviour/Misconceptions reachable through contextual links; add a compact secondary-navigation solution only if needed for usable mobile access.
- [ ] Retain real links, deep links, browser Back/Forward, report highlighting under Lessons, and Import highlighting on `/lessons/new`.
- [ ] Match page entrance transitions without remounting an active recorder or hiding failure feedback.

Acceptance: every destination is reachable on phone and desktop; URL navigation works independently of prior visits; active indicator follows the correct route; bottom navigation does not cover content or controls.

## 04 — Overview and lesson list

Primary files: `src/app/page.tsx`, `src/app/lessons/page.tsx`, `src/components/LessonRow.tsx`, `src/components/ui.tsx`; extract a client trajectory component.

- [ ] Match score-card proportions, 136px overview ring, continuous dimension rows, trajectory card, four stats, recent rows, and Close the loop panel.
- [ ] Implement smooth delivery line/area, dashed mastery series, grid lines, point markers, animated reveal, hover crosshair, and tooltip showing the lesson and both values.
- [ ] Support touch/keyboard access to chart values and missing assessment data. Keep missing mastery values missing rather than inventing zeroes or silently connecting misleading gaps.
- [ ] Animate displayed final values on entrance; do not round away fractional dimension averages.
- [ ] Calculate last-five delivery and previous-five delta from saved lessons; average wait times over available measurements and show an unknown state when none exist.
- [ ] Make recent rows, All lessons, and Close the loop open the correct lesson/report outcomes anchor.
- [ ] Style the separate lesson list coherently: the prototype provides no distinct list-screen specification. Keep existing useful list behavior; do not invent a new filtering product scope.
- [ ] Move or de-emphasise the repo-only focus card if it prevents the target dashboard composition, preserving access to next steps through reports.

Acceptance: dashboard aggregates agree with fixture data; tooltip corresponds to the selected point; every row opens its own report; empty, one-lesson, missing-outcome, and long-title states render cleanly.

## 05 — Live setup, recording, and completion

Primary files: `src/app/live/LiveSession.tsx`, `src/app/live/page.tsx`; extract setup, timer, feed, and gauge components where that simplifies state ownership.

- [ ] Match title/objective inputs, class dropdown, consent text, setup guidance and Start button. Start requires a non-empty objective, selected class, and consent; title remains optional as in the prototype.
- [ ] Use a class-provider boundary for demo classes/current roster, mapping class selection to subject/yearGroup without requiring a school integration.
- [ ] Implement accessible dropdown open/select/outside-close/keyboard behavior.
- [ ] Match desktop recording status/timer/stop layout, circular mobile timer and stop interaction, question count, transcript feed, targeting tags, nudge banner, and gauges.
- [ ] Match live-specific breakpoints around 860px; preserve essential stop/error access when the desktop aside disappears. Audit mobile headline behavior against usable setup and active-session states.
- [ ] Keep real elapsed time, question classification, cold-call/hands-up targeting, word counts, time since question/check, and thinking-time cues. Use actual measured state instead of prototype modulo timers and preset percentages.
- [ ] Keep demo mode explicit and isolated; use the reference script to exercise the interface without requesting microphone access.
- [ ] Preserve interim transcription, feed autoscroll, microphone permission handling, unsupported browser fallback, wake-lock/resource cleanup, and duplicate-stop protection.
- [ ] Make stop visibly transition through stopping/transcribing/analysing/saving to the newly created report. Verify final MediaRecorder chunks are available before creating the audio blob.
- [ ] Preserve the transcript after transcription/save failure, expose retry/copy recovery, and keep navigation from silently losing a recording.

Acceptance: setup gating works in both modes; live measurements reflect the actual session; mic tracks and timers stop on completion/unmount; demo requires no microphone; save opens the new lesson, never a fixed sample report; failures do not strand the UI or lose the available transcript.

## 06 — Lesson report and transcript

Primary files: `src/app/lessons/[id]/page.tsx`, `src/components/LessonTimeline.tsx`, `src/components/TranscriptView.tsx`, `src/components/ReportActions.tsx`.

- [ ] Match metadata, objective, badges, compact 96px summary ring, metrics grid, timeline, rubric breakdown, What worked/Try next lesson, question log, behaviour, outcomes, and transcript order/spacing.
- [ ] Align question colours and targeting tags consistently across feed, timeline, question log, and transcript. Keep cognitive demand separate from who is asked.
- [ ] Match evidence quote cards and question wait-time bars, including the narrow layout below approximately 760px.
- [ ] Preserve analysis-engine labels, audio reliability caveats, re-analysis/delete controls, unavailable metrics, and unanalysed report state.
- [ ] Match transcript All/Teacher/Student tabs, search, highlighted question segments, timestamp labels, and scroll area.
- [ ] Ensure evidence/question anchors reveal the linked segment even if an active transcript filter/search would otherwise hide it.
- [ ] Keep very long transcripts usable without moving recording state or duplicating expensive calculations into presentation components.

Acceptance: every displayed value comes from the requested lesson; evidence links land on visible text; filters and search work together; unavailable speaker/wait data is labelled honestly; re-analysis and deletion retain working error handling.

## 07 — Cross-lesson praise and sanctions

Primary files: `src/app/behaviour/page.tsx`, `src/components/BehaviourPanel.tsx`, `src/app/api/lessons/[id]/behaviour/route.ts`, `src/lib/behaviour.ts`, `src/lib/roster.ts`.

- [ ] Build a shared event-review card usable in reports and a flattened cross-lesson queue. Include lesson ID, event ID, student/candidate information, type, timestamp, quote, and lesson context.
- [ ] Match the Praise and Sanctions title, Needs review/Merits today/Sanctions today/Top performer stats, pending-card grid, coloured border/avatar, Approve/Deny actions, and reviewed-empty state.
- [ ] Use the existing PATCH endpoint from both surfaces. Preserve pending → confirmed/dismissed and existing undo behavior.
- [ ] Require explicit student resolution for ambiguous/unheard names; maintain the existing human review requirement. Treat Deny as dismissed in the domain model.
- [ ] Keep report review and global queue synchronized after mutations. Avoid two independent lists or tally counters like those in the prototype.
- [ ] Match badge/initials tally rows and prototype net-score ordering: merits minus demerits minus twice detentions/removals; use a deterministic tie-breaker.
- [ ] Calculate top performer from confirmed merits, sanctions from the three sanction types, and pending count across the queue. Apply a consistent school-day boundary, initially Europe/London, rather than UTC midnight.
- [ ] Scope aggregation by class/student identity so identical placeholder names in different classes do not accidentally merge.

Acceptance: approving once increases the correct tally once; deny does not increase it; reload retains decisions; resolving a name is validated against its class; failed requests leave the card reviewable; report and global stats agree; London day-boundary cases pass.

## 08 — Extend misconception data and persistence

Primary files: `src/lib/types.ts`, `src/lib/store.ts`, `src/lib/triangulate.ts`, `src/lib/seed.ts`, assessment route; add a focused misconception module/API as needed.

Proposed model, finalised before coding:

- Keep assessment-owned observations with stable IDs, text, optional teacher-reported count, and optional explicitly recorded student evidence (`student identifier/name`, `answer`, `explanation`, provenance).
- Aggregate by class identity plus normalised exact wording (trim, case, consistent whitespace), retaining contributing lesson/observation IDs. Do not introduce fuzzy clustering in this project.
- Store group-level follow-up state independently from derived aggregates: stable group ID, suggested action and its provenance, `addressedAt`, and an optional reopening mechanism. A practical JSON shape is a top-level `misconceptionFollowUps` collection keyed by stable group ID.
- Separate known counts, student identities, and observation totals. Do not call summed counts across lessons a unique student count. Unknown counts stay unknown; they do not become one student.
- Use a generic worked-example/check-question suggestion when no specific fix exists, labelled as a suggestion. Never generate quoted student answers from a low score.

Tasks:

- [ ] Add backward-compatible reading/migration for existing assessments; preserve IDs/counts and leave missing evidence empty. Back up the DB before any migration during implementation.
- [ ] Add validated server mutations for recording/editing evidence and marking a group addressed. Keep writes within the store's serialized mutation boundary.
- [ ] Define recurrence: a newly recorded observation after `addressedAt` reopens the group; re-uploading an unchanged observation does not. Use observation/assessment identity rather than display order.
- [ ] Define replace/delete semantics: replacing an assessment removes its old contributions, adding only the new ones; removing an assessment or lesson recomputes groups and never leaves evidence pointing to deleted observations.
- [ ] Seed rich, explicitly synthetic misconception evidence in the verification fixture so every detail state can be exercised.

Acceptance: old JSON data loads; new evidence and addressed state survive restart; repeated uploads do not inflate counts; deleting contributing data updates reports/groups; no real student is attributed a misconception solely from their overall score.

## 09 — Assessment upload and report misconception details

Depends on 02, 06, 08. Primary file: `src/components/AssessmentPanel.tsx` and assessment API.

- [ ] Match the compact CSV/choose-file/sample/Upload & triangulate controls, optional misconception notes, busy state, results header/reset, mastery/mean, histogram, and adjacent verdict card.
- [ ] Keep existing assessment type, default max, and mastery threshold capabilities in a compact secondary area rather than removing them.
- [ ] Validate finite scores, positive max, score bounds, malformed/empty rows, duplicate identifiers, and invalid headers; show useful row errors rather than silently accepting misleading data.
- [ ] Render verdict from the actual lesson delivery score and saved mastery. Show the no-assessment prompt before upload and no-delivery state where analysis is absent.
- [ ] Support existing one-note-per-line/count input. Add a compact optional evidence editor to record a student, actual answer, explanation, and suggested action; this supplies data the prototype only synthesizes.
- [ ] Reuse misconception detail rendering inline under each report note. Show an honest no-individual-answers state for note-only data.
- [ ] Make See all for class navigate to the correct filtered class using a stable URL parameter/anchor, never hard-coded Year 9.
- [ ] Reset/remove restores upload UI after successful deletion and synchronizes overview, insights, and misconception aggregates. Match the toast/busy behavior without artificial delays.

Acceptance: fixture CSV produces correct mean/mastery/bins; all four delivery/outcome verdicts can be demonstrated; uploaded notes appear in the correct class; evidence renders without fabrication; remove/re-upload does not duplicate contributions; network failures preserve input and allow retry.

## 10 — Misconceptions workspace and expanded details

Depends on 02, 03, 08, 09. Primary file: `src/app/misconceptions/page.tsx`; add client filters, cards, and a detail dialog.

- [ ] Match four stats, All classes/class pills, class groups, two-column cards, count severity badges (indigo below 4, amber 4–6, red 7+), text, lesson chips, Details and Addressed affordances.
- [ ] Keep summary stats global as in the prototype; filters change the card list. Label cumulative known counts accurately and show unknown count states instead of claiming unique Students affected.
- [ ] Define Needs attention most from active/unaddressed groups so Addressed changes have a meaningful effect; record this intentional correction to the prototype's all-items total.
- [ ] Open Details as a card-to-large-dialog expansion with Try this, student answer/reason detail, lesson context, and Mark addressed. The current executed prototype uses this overlay; an earlier inline-expansion comment is stale.
- [ ] Keep inline accordion expansion for report-side notes. Share content components, not cloned HTML or global element IDs.
- [ ] Implement close button, backdrop, Escape, focus trapping/restoration, scroll locking, accessible title, resize behavior, and reduced-motion fallback.
- [ ] Persist Mark addressed, update card/dialog immediately after confirmed success, show the Addressed badge, and keep details readable afterwards. New genuine observations can reopen the group per stage 08.
- [ ] Keep filters and deep links stable across refresh/Back. Handle removed classes, empty classes, long text, missing student evidence, and large student lists.

Acceptance: each class filter returns only its groups; report links select the correct class; dialog opens/closes safely via mouse/keyboard/touch; addressed status persists and recurrence behaves as defined; count badges and stats are derived from stored observations, not fixture constants.

## 11 — Insights, rubric, and import parity

Depends on 02–03; final insights verification also depends on 09.

Insights (`src/app/insights/page.tsx`):

- [ ] Match stats, scatter geometry/colours, signed correlation bars with centre line and animated width, and phrase-card typography/count alignment.
- [ ] Keep points linked to reports with accessible title/value information. Compute all positions and correlations from actual paired data.
- [ ] Retain synthetic-data, small-sample, and correlation caveats; preserve no-data/no-variation states. Align quadrant boundaries with verdict thresholds or explicitly label them as illustrative.

Rubric (`src/app/rubric/page.tsx`, `src/lib/rubric.ts`):

- [ ] Match dimension headers, evidence summaries, weights, research chips, and four level descriptors, stacking below the reference's approximately 700px breakpoint.
- [ ] Keep rubric definitions/weights as the shared source of truth; do not duplicate prototype arrays or change scoring to force sample-number parity.

Import (`src/app/lessons/new/ImportForm.tsx`):

- [ ] Match compact metadata fields, Transcript/Audio pills, editor, file/example/analyse row, and supported-formats side card.
- [ ] Keep real file parsing, audio upload, capability detection, metadata preservation, and transcription/analysis error states. Prototype placeholder controls become functional through existing APIs.
- [ ] Stack the explicit two-column layout on small screens and make labels/selected-file information accessible.

Acceptance: paired-data mutations refresh insights correctly; rubric matches scoring definitions; each supported import format reaches its newly created report; missing provider configuration and failed network requests leave a usable retry path.

## 12 — Integrated verification and completion

- [ ] Run lint and production build after relevant changes. Add focused tests for new aggregation, recurrence, assessment replacement/deletion, server validation, behaviour idempotency, and day boundaries; avoid tests that merely reproduce CSS implementation.
- [ ] Exercise the complete demo journey: Overview → Live setup → demo → new report → assessment + notes/evidence → class details → Addressed → refresh → new observation → reopened group.
- [ ] Exercise the import journey for timestamped text, plain text, VTT, SRT, and configured audio; verify honest unknown timing/speaker states.
- [ ] Exercise the review journey from both report and global Behaviour: name resolution → approve → tally → undo; deny → no tally increment.
- [ ] Exercise microphone recording manually in a supported browser, including permission denial, final audio capture, provider failure/fallback, and interrupted save. Use stubbed provider responses for repeatable integration checks; real provider calls are conditional on configuration.
- [ ] Compare all screens/states to stage 01 captures at 1440/1024/768/390px and check a 320px narrow layout for overflow. Cover long content and empty databases as well as demo data.
- [ ] Verify keyboard navigation, focus, chart values, modal close, screen-reader status messages, reduced motion, safe-area spacing, and mobile stop-button reachability.
- [ ] Check navigation/reload consistency after every mutation, missing/deleted lesson URLs, retry behavior, and no accidental edits to the user's existing database.
- [ ] Update README with actual new behavior and any deliberate parity differences. Record completed stages and remaining limitations here.

Completion gate: all numbered stages meet their acceptance criteria; every prototype interaction has a working equivalent or a documented intentional difference; real-data workflows remain functional; no fabricated student evidence appears outside demo mode.

## Deliberate differences to confirm during implementation

These are proposed defaults, not blockers to writing this plan. Record any user-directed changes before implementing the affected stage.

| Decision | Proposed default | Reason |
| --- | --- | --- |
| Prototype Lessons opens one sample report | Use real list and per-lesson report routes | Retain multi-lesson behavior and browser navigation |
| Prototype live is always scripted | Retain explicit mic/demo modes | Preserve existing real recording capability |
| Prototype student answers are synthesized | Seed demo evidence; accept explicit evidence in real use | Low scores and counts do not identify specific wrong answers |
| Summed counts labelled Students affected | Label as reported instances/counts unless identities support deduplication | Avoid false unique-student totals |
| Addressed exists only in memory | Persist group state; reopen on new observations | Make follow-up survive refresh and recurrence |
| Prototype report behaviour and queue are separate | Share persisted event decisions | Prevent contradictory approvals and duplicate counts |
| Hidden phone destinations | Contextual links plus minimal secondary access if required | Keep every feature reachable |
| Existing controls missing from prototype | Retain compactly | Avoid losing re-analysis, deletion, configurable assessment, and provider state |
| Prototype hides several failure/empty states | Keep explicit recovery states | Real APIs can fail or return no data |

## Progress tracker

| Stage | Status | Depends on |
| --- | --- | --- |
| 01 Baseline and interaction inventory | Not started | — |
| 02 Design system and feedback | Not started | 01 |
| 03 Shell and navigation | Not started | 02 |
| 04 Overview and lesson list | Not started | 02–03 |
| 05 Live lesson parity | Not started | 02–03 |
| 06 Report and transcript | Not started | 02–03 |
| 07 Praise and sanctions | Not started | 02–03 |
| 08 Misconception persistence | Not started | 01 |
| 09 Assessment and inline detail | Not started | 02, 06, 08 |
| 10 Misconceptions workspace | Not started | 02–03, 08–09 |
| 11 Insights, rubric, import | Not started | 02–03; 09 for outcome checks |
| 12 Integrated verification | Not started | 01–11 |

For each completed stage, add the implementation commit, checks performed, and any deliberate deviation. Keep all stages Not started until implementation is explicitly requested.
