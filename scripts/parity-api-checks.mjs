import assert from "node:assert/strict";
const base = process.env.CADENCE_CHECK_URL || "http://localhost:3002";
if (!/localhost:3002$/.test(base))
  throw new Error(
    "Run these mutation checks only against the isolated validation server on localhost:3002",
  );
async function call(path, method = "GET", body) {
  const res = await fetch(base + path, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: res.status,
    data: res.status === 204 ? null : await res.json(),
  };
}
const initial = await call("/api/lessons");
assert.equal(initial.status, 200);
const initialCount = initial.data.length;
assert.ok(initialCount >= 12);
const a = await call("/api/lessons", "POST", {
  title: "Parity API fixture",
  subject: "Science",
  yearGroup: "Year 9",
  teacher: "Demo tester",
  source: "import",
  rawTranscript:
    "[00:00:01] T: Why is changing a subscript wrong?\n[00:00:10] S: It changes the molecule.\n[00:00:14] T: That is a merit, Jamal.",
});
assert.equal(a.status, 201);
const id = a.data.id,
  path = `/api/lessons/${id}`;
let lesson = (await call(path)).data;
assert.ok(lesson.analysis);
assert.equal(lesson.analysis.metrics.meanWaitTime, null);
const event = lesson.behaviourEvents[0];
assert.ok(event);
assert.equal(
  (
    await call(path + "/behaviour", "PATCH", {
      eventId: event.id,
      status: "confirmed",
      studentMatch: "Unknown student",
    })
  ).status,
  400,
);
const seed = (await call("/api/lessons/demo-11")).data;
const known = seed.behaviourEvents.find((e) => e.studentMatch)?.studentMatch;
assert.ok(known);
const patch = { eventId: event.id, status: "confirmed", studentMatch: known };
assert.equal((await call(path + "/behaviour", "PATCH", patch)).status, 200);
assert.equal((await call(path + "/behaviour", "PATCH", patch)).status, 200);
assert.equal(
  (await call(path)).data.behaviourEvents.filter(
    (e) => e.status === "confirmed",
  ).length,
  1,
);
assert.equal(
  (
    await call(path + "/behaviour", "PATCH", {
      eventId: event.id,
      status: "dismissed",
    })
  ).status,
  200,
);
assert.equal(
  (
    await call(path + "/assessment", "POST", {
      kind: "exit-ticket",
      csv: "student,score,max\nA,99,10",
    })
  ).status,
  400,
);
const body = {
  kind: "exit-ticket",
  csv: "student,score,max\nA,8,10\nB,6,10",
  misconceptions: "Fixture subscript error x2",
};
assert.equal((await call(path + "/assessment", "POST", body)).status, 200);
lesson = (await call(path)).data;
assert.equal(lesson.assessment.masteryPct, 50);
const note = lesson.assessment.misconceptions[0];
assert.equal(
  (
    await call(path + "/misconceptions", "POST", {
      misconceptionId: note.id,
      student: "Nobody",
      answer: "bad",
      explanation: "bad",
    })
  ).status,
  400,
);
assert.equal(
  (
    await call(path + "/misconceptions", "POST", {
      misconceptionId: note.id,
      student: "A",
      answer: "H2O2",
      explanation: "Changed the substance",
    })
  ).status,
  200,
);
const groupId = JSON.stringify(["year 9", "fixture subscript error"]);
assert.equal(
  (await call("/api/misconceptions", "PATCH", { groupId, addressed: true }))
    .status,
  200,
);
const before = (await call(path)).data.assessment;
// Unchanged replacement does not create duplicate observations. Evidence update is independently persisted.
assert.equal(before.misconceptions[0].evidence[0].student, "A");
assert.equal((await call(path + "/assessment", "POST", body)).status, 200);
assert.equal((await call(path)).data.assessment.misconceptions.length, 1);
assert.equal((await call(path + "/assessment", "DELETE")).status, 204);
assert.equal((await call(path)).data.assessment, null);
assert.equal(
  (await call("/api/misconceptions", "PATCH", { groupId, addressed: true }))
    .status,
  404,
);
assert.equal((await call(path, "DELETE")).status, 204);
assert.equal((await call(path)).status, 404);
assert.equal((await call("/api/lessons")).data.length, initialCount);
console.log(
  "API checks passed: isolated seed, real analysis, name validation, approval idempotency, CSV rejection, outcomes, evidence, addressed state, replacement and removal.",
);
