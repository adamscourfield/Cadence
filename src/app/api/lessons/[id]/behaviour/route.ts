import { z } from "zod";
import { mutateLesson } from "@/lib/store";
import { getRoster } from "@/lib/roster";
const Body=z.object({eventId:z.string().min(1),status:z.enum(["confirmed","dismissed","pending"]),studentMatch:z.string().trim().max(80).optional()});
export async function PATCH(req:Request,ctx:RouteContext<"/api/lessons/[id]/behaviour">){
  const {id}=await ctx.params;const parsed=Body.safeParse(await req.json().catch(()=>null));if(!parsed.success)return Response.json({error:"Invalid event update"},{status:400});
  const result=await mutateLesson(id,lesson=>{
    const event=lesson.behaviourEvents.find(e=>e.id===parsed.data.eventId);if(!event)return {error:"Event not found",status:404};
    const name=parsed.data.studentMatch??event.studentMatch;
    if(parsed.data.status==="confirmed"&&(!name||!getRoster(lesson.yearGroup).includes(name)))return {error:"Pick a student from this class before approving",status:400};
    if(parsed.data.studentMatch&&!getRoster(lesson.yearGroup).includes(parsed.data.studentMatch))return {error:"Student is not on this class roster",status:400};
    if(parsed.data.studentMatch)event.studentMatch=parsed.data.studentMatch;event.status=parsed.data.status;return {event,status:200};
  });
  if(!result)return Response.json({error:"Lesson not found"},{status:404});return Response.json(result.event??{error:result.error},{status:result.status});
}
