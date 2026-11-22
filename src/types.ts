export type SyllabusEntry = { id: string; name: string; papers: { id: string; name: string; chapters: { id: string; name: string }[] }[] };

export type Theme = "light" | "dark";
export type Group = "science" | "commerce" | "arts";
export type TargetSource = "manual" | "template" | "auto" | "copy" | "quick";
export type TrackingMode = "time" | "progress";

export type CustomSubject = { id: string; name: string };

export type Settings = {
  group: Group;
  subjects: string[];
  customSubjects: CustomSubject[];
  examStartDate: string;
  /** HSC exam period end date; kept under examDate for existing backup compatibility. */
  examDate: string;
  dailyGoalMinutes: number;
  theme: Theme;
  reminders: { enabled: boolean; dailyDigest: string; quietHours: boolean };
  revisionOffsets: number[];
  onboarded: boolean;
};

/** A planned commitment — the core unit of the weekly plan. */
export type Target = {
  id: string;
  date: string;
  subjectId: string;
  paperId: string;
  chapterId: string;
  topic: string;
  /** Old targets omit this and are treated as time-based. */
  trackingMode?: TrackingMode;
  plannedMinutes: number;
  /** Absolute chapter completion goal for progress-based targets. */
  progressStart?: number;
  progressGoal?: number;
  priority: "normal" | "high";
  source: TargetSource;
  createdAt: string;
  updatedAt: string;
};

/** A real study session. Linked to its target by id whenever possible. */
export type StudySession = {
  id: string;
  targetId?: string;
  date: string;
  subjectId: string;
  paperId: string;
  chapterId: string;
  start: string;
  end: string;
  duration: number;
  topic: string;
  /** Completion of this planned target, from 0–100. */
  progress?: number;
  /** Absolute chapter completion snapshot, from 0–100. */
  chapterProgress?: number;
  focusRating?: 1 | 2 | 3;
  createdAt: string;
  updatedAt: string;
};

/** Reserved for the spaced-revision phase; kept in the schema now so data stays portable. */
export type Revision = {
  id: string;
  targetId?: string;
  subjectId: string;
  paperId: string;
  chapterId: string;
  stage: number;
  dueDate: string;
  status: "due" | "done" | "snoozed";
};

export type AppData = {
  version: 2;
  settings: Settings;
  targets: Target[];
  sessions: StudySession[];
  revisions: Revision[];
};
