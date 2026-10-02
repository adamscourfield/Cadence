export type Speaker = "teacher" | "student" | "unknown";

export interface TranscriptSegment {
  id: string;
  /** Seconds from lesson start. */
  start: number;
  end: number;
  speaker: Speaker;
  text: string;
}

export type QuestionType = "closed" | "open" | "higher-order" | "procedural" | "rhetorical";

/**
 * Who the question was actually aimed at — orthogonal to QuestionType (which captures cognitive
 * demand). "cold-call" names a specific student rather than opening the floor; per Lemov (Teach
 * Like a Champion) this is what makes a check-for-understanding sample the whole class rather
 * than just confident volunteers, which is Rosenshine's Principle 6 ("check the responses of all
 * students, not just those who initially raise their hands").
 */
export type QuestionTarget = "cold-call" | "hands-up" | "unspecified";

export interface ClassifiedQuestion {
  segmentId: string;
  text: string;
  type: QuestionType;
  target: QuestionTarget;
  /** Seconds between the question ending and the next utterance. null when unknowable. */
  waitTime: number | null;
}

export type DimensionId =
  | "questioning"
  | "checking"
  | "explanation"
  | "retrieval"
  | "feedback"
  | "waitTime"
  | "practice";

export interface DimensionScore {
  id: DimensionId;
  /** 1 (emerging) – 4 (exemplary). */
  score: number;
  rationale: string;
  evidence: { segmentId: string; quote: string }[];
}

export interface LessonMetrics {
  durationSec: number;
  teacherWords: number;
  studentWords: number;
  wordsPerMinute: number;
  /** % of words spoken by the teacher; null when speaker labels are unavailable. */
  teacherTalkPct: number | null;
  questionCount: number;
  questionsPerTenMin: number;
  openQuestionPct: number;
  /** % of substantive questions aimed at a named student rather than the whole class/volunteers. */
  coldCallPct: number;
  meanWaitTime: number | null;
  checksForUnderstanding: number;
  genericPraise: number;
  specificPraise: number;
}

export interface LessonAnalysis {
  engine: "claude" | "heuristic";
  analysedAt: string;
  /** 0–100 composite of dimension scores. */
  overall: number;
  dimensions: DimensionScore[];
  questions: ClassifiedQuestion[];
  metrics: LessonMetrics;
  strengths: string[];
  nextSteps: string[];
  summary: string;
}

export interface StudentResult {
  student: string;
  score: number;
  max: number;
}

export interface Assessment {
  kind: "exit-ticket" | "worksheet" | "assessment";
  uploadedAt: string;
  results: StudentResult[];
  /** Mean % score across students. */
  meanPct: number;
  /** % of students at or above the mastery threshold. */
  masteryPct: number;
  masteryThreshold: number;
}

export type BehaviourType = "merit" | "demerit" | "detention" | "room-removal";

export interface BehaviourEvent {
  id: string;
  type: BehaviourType;
  /** Seconds from lesson start. */
  at: number;
  segmentId: string;
  /** The sentence the trigger phrase was detected in. */
  quote: string;
  /** Name as heard in the transcript, before roster matching. Null if nothing nameable was found nearby. */
  studentRaw: string | null;
  /** Roster name this was resolved to, when the raw name matched exactly one student in the class. */
  studentMatch: string | null;
  /** Other roster names the raw name could equally have meant — surfaced so the teacher can pick. */
  candidates: string[];
  /** Detection always needs a human to confirm before it counts against a student's record. */
  status: "pending" | "confirmed" | "dismissed";
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  yearGroup: string;
  teacher: string;
  /** What students should know or be able to do by the end of the lesson. */
  objective?: string;
  date: string;
  source: "live" | "import" | "demo";
  segments: TranscriptSegment[];
  analysis: LessonAnalysis | null;
  assessment: Assessment | null;
  /** Merits/sanctions detected from the transcript. Empty until confirmed by the teacher. */
  behaviourEvents: BehaviourEvent[];
}

export type LessonSummary = Omit<Lesson, "segments">;
