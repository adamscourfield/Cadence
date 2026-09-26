// Detects merit/sanction language in a lesson transcript. Runs automatically on every
// lesson — teachers award these verbally ("that's a merit, Jamal"), they don't click a
// button for it. Every detection is "pending" until a teacher confirms it: transcription
// errors and ambiguous names mean this must never write to a student's record unchecked.
import { splitSentences } from "./analysis/patterns";
import { resolveStudent } from "./roster";
import type { BehaviourEvent, BehaviourType, TranscriptSegment } from "./types";

const TRIGGERS: [BehaviourType, RegExp][] = [
  ["merit", /\b(merit|merit point|house point|credit point)s?\b/i],
  ["demerit", /\b(demerit|behaviour point|behavior point)s?\b/i],
  ["detention", /\bdetention\b/i],
  ["room-removal", /\b(leave the room|removed from (the )?(lesson|class)|go to (the )?(isolation|reflection room|refocus room)|internal exclusion)\b/i],
];

const NAME_TOKEN = /\b[A-Z][a-z]+\b/g;
const NOT_A_NAME = new Set([
  "I", "You", "We", "They", "The", "This", "That", "Now", "Right", "Okay", "So", "Everyone", "Well",
  "Today", "Yes", "No", "Good", "Great", "Thank", "Thanks", "Miss", "Sir", "Mr", "Mrs", "Ms", "Class",
]);

function extractName(sentence: string, yearGroup: string): { raw: string | null; match: string | null; candidates: string[] } {
  const tokens = [...sentence.matchAll(NAME_TOKEN)].map((m) => m[0]).filter((t) => !NOT_A_NAME.has(t));
  if (!tokens.length) return { raw: null, match: null, candidates: [] };
  // Prefer a token that's actually on the class roster over the first capitalised word.
  for (const t of tokens) {
    const r = resolveStudent(t, yearGroup);
    if (r.match) return { raw: t, match: r.match, candidates: [] };
  }
  return { raw: tokens[0], match: null, candidates: resolveStudent(tokens[0], yearGroup).candidates };
}

export interface TallyRow {
  student: string;
  merit: number;
  demerit: number;
  detention: number;
  roomRemoval: number;
  total: number;
}

/** Confirmed behaviour events for one day, aggregated per student. Unconfirmed detections never count. */
export function dailyTally(lessons: { date: string; behaviourEvents: BehaviourEvent[] }[], day: string): TallyRow[] {
  const rows = new Map<string, TallyRow>();
  for (const lesson of lessons) {
    if (lesson.date.slice(0, 10) !== day) continue;
    for (const e of lesson.behaviourEvents) {
      if (e.status !== "confirmed" || !e.studentMatch) continue;
      const row = rows.get(e.studentMatch) ?? { student: e.studentMatch, merit: 0, demerit: 0, detention: 0, roomRemoval: 0, total: 0 };
      if (e.type === "merit") row.merit += 1;
      else if (e.type === "demerit") row.demerit += 1;
      else if (e.type === "detention") row.detention += 1;
      else row.roomRemoval += 1;
      row.total += 1;
      rows.set(e.studentMatch, row);
    }
  }
  return [...rows.values()].sort((a, b) => b.total - a.total);
}

export function detectBehaviourEvents(segments: TranscriptSegment[], yearGroup: string): BehaviourEvent[] {
  const events: BehaviourEvent[] = [];
  let n = 0;
  for (const seg of segments) {
    if (seg.speaker === "student") continue; // students don't award their own merits/sanctions
    for (const sentence of splitSentences(seg.text)) {
      for (const [type, re] of TRIGGERS) {
        if (!re.test(sentence)) continue;
        const { raw, match, candidates } = extractName(sentence, yearGroup);
        n += 1;
        events.push({
          id: `b${n}`,
          type,
          at: seg.start,
          segmentId: seg.id,
          quote: sentence.trim(),
          studentRaw: raw,
          studentMatch: match,
          candidates,
          status: "pending",
        });
        break; // one trigger per sentence is enough
      }
    }
  }
  return events;
}
