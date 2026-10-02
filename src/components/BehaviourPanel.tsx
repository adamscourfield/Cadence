"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Award, Check, Clock, DoorOpen, ShieldAlert, Undo2, X } from "lucide-react";
import { formatClock } from "@/lib/transcript";
import type { BehaviourEvent, BehaviourType } from "@/lib/types";

const META: Record<BehaviourType, { label: string; color: string; icon: typeof Award }> = {
  merit: { label: "Merit", color: "var(--lime)", icon: Award },
  demerit: { label: "Demerit", color: "var(--amber)", icon: ShieldAlert },
  detention: { label: "Detention", color: "var(--red)", icon: Clock },
  "room-removal": { label: "Room removal", color: "var(--red)", icon: DoorOpen },
};

export function BehaviourPanel({ lessonId, events, roster }: { lessonId: string; events: BehaviourEvent[]; roster: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function update(eventId: string, patch: { status: BehaviourEvent["status"]; studentMatch?: string }) {
    setBusy(eventId);
    await fetch(`/api/lessons/${lessonId}/behaviour`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventId, ...patch }),
    });
    setBusy(null);
    router.refresh();
  }

  if (!events.length) {
    return (
      <div className="glass p-5 text-sm text-muted">
        No merits or sanctions detected in this transcript. Cadence listens for phrases like “that&apos;s a merit” or
        “detention” — it never requires a teacher to log these by hand.
      </div>
    );
  }

  const pending = events.filter((e) => e.status === "pending");
  const decided = events.filter((e) => e.status !== "pending");

  return (
    <div className="flex flex-col gap-3">
      {pending.length > 0 && (
        <p className="text-xs text-dim">
          Detected from what was said — nothing counts toward a student&apos;s record until you confirm it.
        </p>
      )}
      {[...pending, ...decided].map((e) => {
        const m = META[e.type];
        const Icon = m.icon;
        const name = e.studentMatch ?? e.studentRaw;
        return (
          <div key={e.id} className={`glass p-4 flex items-start gap-3 ${e.status === "dismissed" ? "opacity-50" : ""}`}>
            <span className="size-8 shrink-0 grid place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${m.color} 15%, transparent)`, color: m.color }}>
              <Icon size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium" style={{ color: m.color }}>{m.label}</span>
                <span className="font-mono text-[11px] text-dim">{formatClock(e.at)}</span>
                {name ? (
                  <span className="chip">{name}{!e.studentMatch && " · unconfirmed name"}</span>
                ) : (
                  <span className="chip">no name heard</span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">“{e.quote}”</p>

              {e.status === "pending" && !e.studentMatch && roster.length > 0 && (
                <select
                  className="field mt-2 h-9 text-xs max-w-[220px]"
                  defaultValue=""
                  onChange={(ev) => ev.target.value && update(e.id, { status: "confirmed", studentMatch: ev.target.value })}
                >
                  <option value="" disabled>
                    {e.candidates.length ? "Which one?" : "Pick student…"}
                  </option>
                  {(e.candidates.length ? e.candidates : roster).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              )}
            </div>

            {e.status === "pending" ? (
              <div className="flex gap-1.5 shrink-0">
                <button
                  className="btn btn-ghost !h-9 !px-3 !text-lime !border-lime/30"
                  disabled={busy === e.id || !e.studentMatch}
                  title={e.studentMatch ? "Confirm" : "Pick a student first"}
                  onClick={() => update(e.id, { status: "confirmed" })}
                >
                  <Check size={14} />
                </button>
                <button className="btn btn-ghost !h-9 !px-3 !text-dim" disabled={busy === e.id} onClick={() => update(e.id, { status: "dismissed" })}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                className="btn btn-ghost !h-9 !px-3 !text-dim shrink-0"
                disabled={busy === e.id}
                onClick={() => update(e.id, { status: "pending" })}
                title="Undo"
              >
                <Undo2 size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
