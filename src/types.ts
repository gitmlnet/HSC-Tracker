export type SyllabusEntry = { id: string; name: string; papers: { id: string; name: string; chapters: { id: string; name: string }[] }[] };

export type Theme = "light" | "dark";
export type Group = "science" | "commerce" | "arts";
export type TargetSource = "manual" | "template" | "auto" | "copy" | "quick";

export type CustomSubject = { id: string; name: string };

export type Settings = {
  group: Group;
  subjects: string[];
  customSubjects: CustomSubject[];
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
  plannedMinutes: number;
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
  progress?: number;
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
