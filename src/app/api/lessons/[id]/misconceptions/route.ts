import { z } from "zod";
import { mutateLesson } from "@/lib/store";
const Body = z.object({
  misconceptionId: z.string(),
  student: z.string().trim().min(1).max(120),
  answer: z.string().trim().min(1).max(2000),
  explanation: z.string().trim().min(1).max(2000),
  suggestedAction: z.string().trim().max(2000).optional(),
});
export async function POST(
  req: Request,
  ctx: RouteContext<"/api/lessons/[id]/misconceptions">,
) {
  const { id } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Enter a student, answer and explanation" },
      { status: 400 },
    );
  const result = await mutateLesson(id, (l) => {
    const mc = l.assessment?.misconceptions.find(
      (m) => m.id === parsed.data.misconceptionId,
    );
    if (!mc) return { error: "Note not found", status: 404 };
    if (!l.assessment?.results.some((r) => r.student === parsed.data.student))
      return { error: "Choose a student from this assessment", status: 400 };
    mc.evidence ??= [];
    const { student, answer, explanation } = parsed.data;
    const index = mc.evidence.findIndex((e) => e.student === student);
    const evidence = {
      student,
      answer,
      explanation,
      provenance: "teacher" as const,
    };
    if (index < 0) mc.evidence.push(evidence);
    else mc.evidence[index] = evidence;
    if (parsed.data.suggestedAction)
      mc.suggestedAction = parsed.data.suggestedAction;
    return { misconception: mc, status: 200 };
  });
  return result
    ? Response.json(result.misconception ?? { error: result.error }, {
        status: result.status,
      })
    : Response.json({ error: "Lesson not found" }, { status: 404 });
}
