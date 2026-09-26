import { z } from "zod";
import { getLesson, updateLesson } from "@/lib/store";

const Body = z.object({
  eventId: z.string().min(1),
  status: z.enum(["confirmed", "dismissed", "pending"]),
  /** Lets the teacher pick the right student when detection couldn't resolve one on its own. */
  studentMatch: z.string().trim().max(80).optional(),
});

export async function PATCH(req: Request, ctx: RouteContext<"/api/lessons/[id]/behaviour">) {
  const { id } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });

  const lesson = await getLesson(id);
  if (!lesson) return Response.json({ error: "Not found" }, { status: 404 });

  const event = lesson.behaviourEvents.find((e) => e.id === parsed.data.eventId);
  if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

  event.status = parsed.data.status;
  if (parsed.data.studentMatch) event.studentMatch = parsed.data.studentMatch;
  await updateLesson(id, { behaviourEvents: lesson.behaviourEvents });
  return Response.json(event);
}
