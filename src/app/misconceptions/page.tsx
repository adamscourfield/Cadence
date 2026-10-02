import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { listLessons } from "@/lib/store";
import { classSlug, misconceptionsByClass } from "@/lib/triangulate";
import { EmptyState, PageHeader, formatDate } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Misconceptions · Cadence" };

export default async function MisconceptionsPage() {
  const lessons = await listLessons();
  const byClass = misconceptionsByClass(lessons);

  return (
    <>
      <PageHeader
        eyebrow="Misconceptions"
        title={<>What your classes keep <span className="glow-text">getting wrong.</span></>}
      />

      {byClass.length === 0 ? (
        <EmptyState title="No misconceptions noted yet">
          When you upload an exit ticket, jot down what students got wrong — they&apos;ll be grouped here by class so
          patterns across lessons are easy to spot.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {byClass.map(({ yearGroup, items }) => (
            <section key={yearGroup} id={classSlug(yearGroup)} className="glass p-5 scroll-mt-24">
              <div className="eyebrow mb-3">{yearGroup}</div>
              <div className="flex flex-col gap-3">
                {items.map((mc) => (
                  <div key={mc.text} className="rounded-xl border border-line bg-panel p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb size={14} className="text-amber shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">{mc.text}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="chip">{mc.totalStudentCount} student{mc.totalStudentCount === 1 ? "" : "s"}</span>
                          <span className="chip">
                            {mc.occurrences} lesson{mc.occurrences === 1 ? "" : "s"}
                          </span>
                          {mc.lessons.map((l) => (
                            <Link key={l.id} href={`/lessons/${l.id}#outcomes`} className="chip hover:border-line-strong" title={formatDate(l.date)}>
                              {l.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-dim leading-relaxed max-w-2xl">
        Grouped by exact wording — phrase a recurring misconception the same way each time you note it and it&apos;ll
        merge here automatically.
      </p>
    </>
  );
}
