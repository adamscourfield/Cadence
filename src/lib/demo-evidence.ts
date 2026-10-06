import reference from "./demo-misconceptions.json";
import type { Lesson } from "./types";
/** Hand-authored prototype examples, exclusively for explicitly synthetic demo lessons. */
export function enrichDemoEvidence(lesson: Lesson) {
  if (lesson.source !== "demo" || !lesson.assessment) return;
  const normalise = (s: string) =>
    s.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
  const examples = Object.values(reference).flat();
  for (const note of lesson.assessment.misconceptions) {
    const example = examples.find(
      (e) => normalise(e.text) === normalise(note.text),
    );
    if (!example) continue;
    if (!note.evidence)
      note.evidence = example.students.map((s) => ({
        student: s.name,
        answer: s.answer,
        explanation: s.why,
        provenance: "demo",
      }));
    note.suggestedAction ??= example.fix;
  }
}
