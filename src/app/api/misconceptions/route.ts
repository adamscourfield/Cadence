import { z } from "zod";
import {
  getMisconceptionFollowUps,
  listLessons,
  setMisconceptionFollowUp,
} from "@/lib/store";
import { groupMisconceptions } from "@/lib/misconceptions";
const Body = z.object({
  groupId: z.string().max(2000),
  addressed: z.boolean(),
});
export async function PATCH(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "Invalid update" }, { status: 400 });
  const groups = groupMisconceptions(
      await listLessons(),
      await getMisconceptionFollowUps(),
    ),
    group = groups.find((g) => g.id === parsed.data.groupId);
  if (!group)
    return Response.json(
      { error: "Misconception no longer exists" },
      { status: 404 },
    );
  return Response.json(
    await setMisconceptionFollowUp({
      groupId: group.id,
      addressedAt: parsed.data.addressed ? new Date().toISOString() : null,
      addressedObservations: parsed.data.addressed ? group.observations : [],
    }),
  );
}
