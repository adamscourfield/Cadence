import Link from "next/link";
import { Award, ArrowRight, Clock, DoorOpen, ShieldAlert } from "lucide-react";
import { listLessons } from "@/lib/store";
import { dailyTally } from "@/lib/behaviour";
import { EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Behaviour · Cadence" };

export default async function BehaviourPage() {
  const lessons = await listLessons();
  const today = new Date().toISOString().slice(0, 10);
  const tally = dailyTally(lessons, today);
  const pendingByLesson = lessons
    .map((l) => ({ lesson: l, pending: l.behaviourEvents.filter((e) => e.status === "pending").length }))
    .filter((x) => x.pending > 0)
    .sort((a, b) => b.pending - a.pending);

  return (
    <>
      <PageHeader
        eyebrow="Behaviour"
        title={<>Merits and sanctions, <span className="glow-text">heard not clicked.</span></>}
      />

      {pendingByLesson.length > 0 && (
        <section className="glass p-5 mb-4 rise">
          <div className="eyebrow mb-3">Needs review</div>
          <div className="flex flex-col gap-2">
            {pendingByLesson.map(({ lesson, pending }) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="flex items-center justify-between text-sm rounded-xl px-3 py-2.5 bg-panel border border-line hover:border-line-strong"
              >
                <span className="min-w-0 truncate">
                  {lesson.title} <span className="text-dim">· {lesson.subject}{lesson.yearGroup && ` · ${lesson.yearGroup}`}</span>
                </span>
                <span className="chip shrink-0 ml-3">
                  {pending} pending <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="eyebrow mb-3">Today · confirmed only</div>
      {tally.length === 0 ? (
        <EmptyState title="Nothing confirmed for today yet">
          Detections wait on the lesson report until a teacher confirms them — nothing here counts against a
          student until then. {pendingByLesson.length === 0 && "Record or import a lesson to see it working."}
        </EmptyState>
      ) : (
        <div className="glass overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-line">
                <th className="px-5 py-3 eyebrow !text-[10px] font-normal">Student</th>
                <th className="px-3 py-3 eyebrow !text-[10px] font-normal text-center"><Award size={13} className="inline text-lime" /> Merit</th>
                <th className="px-3 py-3 eyebrow !text-[10px] font-normal text-center"><ShieldAlert size={13} className="inline text-amber" /> Demerit</th>
                <th className="px-3 py-3 eyebrow !text-[10px] font-normal text-center"><Clock size={13} className="inline text-red" /> Detention</th>
                <th className="px-3 py-3 eyebrow !text-[10px] font-normal text-center"><DoorOpen size={13} className="inline text-red" /> Removal</th>
              </tr>
            </thead>
            <tbody>
              {tally.map((row) => (
                <tr key={row.student} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-medium">{row.student}</td>
                  <td className="px-3 py-3 text-center tabular-nums">{row.merit || <span className="text-dim">—</span>}</td>
                  <td className="px-3 py-3 text-center tabular-nums">{row.demerit || <span className="text-dim">—</span>}</td>
                  <td className="px-3 py-3 text-center tabular-nums">{row.detention || <span className="text-dim">—</span>}</td>
                  <td className="px-3 py-3 text-center tabular-nums">{row.roomRemoval || <span className="text-dim">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-dim leading-relaxed max-w-2xl">
        This is a placeholder roster and tally — Cadence has no real student records of its own. It&apos;s built to be
        replaced by the actual roster and behaviour log once this becomes a module inside Anaxi.
      </p>
    </>
  );
}
