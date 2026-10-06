"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "./Feedback";
export function MisconceptionEvidenceEditor({
  lessonId,
  noteId,
  students,
}: {
  lessonId: string;
  noteId: string;
  students: string[];
}) {
  const router = useRouter(),
    notify = useFeedback();
  const [student, setStudent] = useState(""),
    [answer, setAnswer] = useState(""),
    [explanation, setExplanation] = useState(""),
    [suggestedAction, setSuggestedAction] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/lessons/${lessonId}/misconceptions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          misconceptionId: noteId,
          student,
          answer,
          explanation,
          suggestedAction,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      notify("Student evidence saved");
      setAnswer("");
      setExplanation("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="border-t border-line pt-3 mt-3 text-xs text-muted">
      <summary>Record or update student evidence</summary>
      <div className="grid gap-2 mt-3">
        <select
          aria-label="Student evidence name"
          className="field"
          value={student}
          onChange={(e) => setStudent(e.target.value)}
        >
          <option value="">Pick a student…</option>
          {students.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <textarea
          aria-label="Actual student answer"
          className="field"
          rows={2}
          placeholder="Actual answer from the student's work"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <textarea
          aria-label="Why the answer is wrong"
          className="field"
          rows={2}
          placeholder="Why this answer reflects the misconception"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
        <textarea
          aria-label="Suggested teaching action"
          className="field"
          rows={2}
          placeholder="Suggested teaching action (optional)"
          value={suggestedAction}
          onChange={(e) => setSuggestedAction(e.target.value)}
        />
        <button
          className="btn btn-ghost"
          disabled={busy || !student || !answer.trim() || !explanation.trim()}
          onClick={save}
        >
          {busy ? "Saving…" : "Save evidence"}
        </button>
        {error && (
          <p role="alert" className="text-red">
            {error}
          </p>
        )}
      </div>
    </details>
  );
}
