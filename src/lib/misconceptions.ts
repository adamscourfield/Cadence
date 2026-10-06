import type {
  LessonSummary,
  MisconceptionEvidence,
  MisconceptionFollowUp,
} from "./types";
export const normalise = (text: string) =>
  text.trim().replace(/\s+/g, " ").toLowerCase();
export const misconceptionGroupId = (yearGroup: string, text: string) =>
  JSON.stringify([normalise(yearGroup || "Unassigned"), normalise(text)]);
export interface MisconceptionGroup {
  id: string;
  yearGroup: string;
  text: string;
  reportedCount: number;
  unknownCounts: number;
  lessons: { id: string; title: string; date: string }[];
  evidence: (MisconceptionEvidence & {
    lessonId: string;
    lessonTitle: string;
  })[];
  suggestedAction: string;
  addressed: boolean;
  observations: string[];
}
export function groupMisconceptions(
  lessons: LessonSummary[],
  followUps: MisconceptionFollowUp[] = [],
): MisconceptionGroup[] {
  const groups = new Map<string, MisconceptionGroup>();
  for (const lesson of lessons) {
    const seen = new Set<string>();
    for (const mc of lesson.assessment?.misconceptions ?? []) {
      const id = misconceptionGroupId(lesson.yearGroup, mc.text);
      let group = groups.get(id);
      if (!group) {
        group = {
          id,
          yearGroup: lesson.yearGroup || "Unassigned",
          text: mc.text,
          reportedCount: 0,
          unknownCounts: 0,
          lessons: [],
          evidence: [],
          suggestedAction:
            mc.suggestedAction ||
            `Re-teach with a worked example contrasting the correct method with “${mc.text}”, then use one check question that isolates the error.`,
          addressed: false,
          observations: [],
        };
        groups.set(id, group);
      }
      group.reportedCount += mc.studentCount ?? 0;
      if (mc.studentCount === undefined) group.unknownCounts++;
      if (!seen.has(id)) {
        group.lessons.push({
          id: lesson.id,
          title: lesson.title,
          date: lesson.date,
        });
        seen.add(id);
      }
      const evidence = (mc.evidence ?? []).filter(
        (e) => e.provenance !== "demo" || lesson.source === "demo",
      );
      group.evidence.push(
        ...evidence.map((e) => ({
          ...e,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
        })),
      );
      group.observations.push(
        JSON.stringify([
          lesson.id,
          normalise(mc.text),
          mc.studentCount ?? null,
          evidence,
          mc.suggestedAction ?? "",
        ]),
      );
    }
  }
  for (const group of groups.values()) {
    const state = followUps.find((f) => f.groupId === group.id);
    group.addressed = Boolean(
      state?.addressedAt &&
        group.observations.every((o) =>
          state.addressedObservations.includes(o),
        ),
    );
  }
  return [...groups.values()].sort(
    (a, b) =>
      a.yearGroup.localeCompare(b.yearGroup) ||
      b.reportedCount - a.reportedCount ||
      a.text.localeCompare(b.text),
  );
}
