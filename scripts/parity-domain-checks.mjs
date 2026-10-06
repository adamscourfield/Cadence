// Run after: npx tsc --module commonjs --moduleResolution node --target es2022 --esModuleInterop --skipLibCheck --outDir /tmp/cadence-domain src/lib/misconceptions.ts src/lib/triangulate.ts src/lib/behaviour.ts
import assert from "node:assert/strict";
const root = process.env.CADENCE_CHECK_DIR || "/tmp/cadence-domain";
const { parseResults, buildAssessment, parseMisconceptions, triangulate } =
  await import(root + "/triangulate.js");
const { groupMisconceptions } = await import(root + "/misconceptions.js");
const { dailyTally, schoolDay } = await import(root + "/behaviour.js");
const results = parseResults("student,score,max\nA,7,10\nB,6,10", 10);
const assessment = buildAssessment(
  "exit-ticket",
  results,
  70,
  parseMisconceptions("Error x6"),
);
assert.equal(assessment.masteryPct, 50);
assert.equal(assessment.meanPct, 65);
for (const csv of [
  "A,11,10",
  "A,-1,10",
  "A,3,0",
  "A,Infinity,10",
  "A,3junk,10",
  "A,3,10\na,4,10",
  "A,3,10,extra",
])
  assert.throws(() => parseResults(csv, 10));
assert.equal(parseResults("student\tscore\tmax\nA\t3\t5", 10)[0].score, 3);
assert.deepEqual(parseMisconceptions("Wrong (4 students)")[0].studentCount, 4);
const lesson = {
  id: "one",
  yearGroup: "9A",
  title: "Test",
  date: "2026-10-06T12:00:00Z",
  source: "import",
  assessment,
  behaviourEvents: [],
};
let groups = groupMisconceptions([lesson]);
assert.equal(groups.length, 1);
assert.equal(groups[0].reportedCount, 6);
assert.equal(groups[0].evidence.length, 0);
const followUp = {
  groupId: groups[0].id,
  addressedAt: "2026-10-06T13:00:00Z",
  addressedObservations: groups[0].observations,
};
assert.equal(groupMisconceptions([lesson], [followUp])[0].addressed, true);
assert.equal(
  groupMisconceptions(
    [
      {
        ...lesson,
        assessment: { ...assessment, uploadedAt: "2026-10-07T00:00:00Z" },
      },
    ],
    [followUp],
  )[0].addressed,
  true,
);
assert.equal(
  groupMisconceptions([lesson, { ...lesson, id: "two" }], [followUp])[0]
    .addressed,
  false,
);
assert.equal(
  groupMisconceptions([{ ...lesson, assessment: null }], [followUp]).length,
  0,
);
assert.equal(
  groupMisconceptions([
    {
      ...lesson,
      assessment: {
        ...assessment,
        misconceptions: parseMisconceptions("Unknown"),
      },
    },
  ])[0].reportedCount,
  0,
);
assert.equal(
  groupMisconceptions([lesson, { ...lesson, id: "other", yearGroup: "9B" }])
    .length,
  2,
);
const malicious = {
  ...lesson,
  assessment: {
    ...assessment,
    misconceptions: [
      {
        id: "m",
        text: "Error",
        evidence: [
          {
            student: "A",
            answer: "invented",
            explanation: "invented",
            provenance: "demo",
          },
        ],
      },
    ],
  },
};
assert.equal(groupMisconceptions([malicious])[0].evidence.length, 0);
assert.equal(schoolDay("2026-06-01T23:30:00Z"), "2026-06-02");
assert.equal(schoolDay("2026-12-01T23:30:00Z"), "2026-12-01");
const event = {
  id: "e",
  type: "merit",
  studentMatch: "Alex",
  status: "confirmed",
};
const rows = dailyTally(
  [
    { date: lesson.date, yearGroup: "9A", behaviourEvents: [event] },
    {
      date: lesson.date,
      yearGroup: "9B",
      behaviourEvents: [event, { ...event, id: "p", status: "pending" }],
    },
  ],
  "2026-10-06",
);
assert.equal(rows.length, 2);
assert.equal(
  rows.reduce((n, r) => n + r.merit, 0),
  2,
);
assert.equal(triangulate(55, 60).verdict, "aligned-strong");
assert.equal(triangulate(54, 59).verdict, "aligned-weak");
assert.equal(triangulate(55, 59).verdict, "delivery-not-landing");
assert.equal(triangulate(54, 60).verdict, "outcomes-beat-delivery");
console.log(
  "Domain checks passed: CSV validation, outcomes, class scoping, recurrence, removal, demo evidence and London day boundaries.",
);

const { parseTranscript } = await import(root + "/transcript.js");
const { extractQuestions, computeMetrics } = await import(
  root + "/analysis/heuristic.js"
);
for (const raw of [
  "T: Why does the molecule change?\nS: The atoms change.",
  "[00:00:01] T: Why does the molecule change?\n[00:00:09] S: The atoms change.",
]) {
  const segs = parseTranscript(raw);
  assert.equal(segs[0].timing, "estimated");
  assert.equal(computeMetrics(segs, extractQuestions(segs)).meanWaitTime, null);
}
for (const prefix of ["WEBVTT\n\n", "1\n"]) {
  const segs = parseTranscript(
    prefix +
      "00:00:01.000 --> 00:00:03.000\nT: Why does the molecule change?\n\n2\n00:00:07.000 --> 00:00:09.000\nS: The atoms change.",
  );
  assert.equal(segs[0].timing, "measured");
  assert.equal(computeMetrics(segs, extractQuestions(segs)).meanWaitTime, 4);
  assert.equal(segs[1].speaker, "student");
}
assert.equal(parseResults("\nstudent,score\nA,3", 10).length, 1);
console.log(
  "Transcript checks passed: plain/timestamped estimates, VTT/SRT measured pauses and speaker labels.",
);
