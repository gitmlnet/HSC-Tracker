import type { Settings, StudySession, Target } from "../types";
import { syllabus } from "../data/syllabus";

const legacyKey = (x: { date: string; subjectId: string; paperId: string; chapterId: string }) =>
  [x.date, x.subjectId, x.paperId, x.chapterId].join("|");

const chapterKey = (x: Pick<Target, "subjectId" | "paperId" | "chapterId" | "topic">) =>
  [x.subjectId, x.paperId, x.chapterId, x.chapterId ? "" : x.topic].join("|");

export function sessionsFor(target: Target, sessions: StudySession[]): StudySession[] {
  return sessions.filter(s => s.targetId ? s.targetId === target.id : !s.targetId && legacyKey(s) === legacyKey(target));
}

/** Latest explicit estimate for a chapter; older sessions without one are ignored. */
export function chapterProgressOf(target: Pick<Target, "subjectId" | "paperId" | "chapterId" | "topic" | "progressStart">, sessions: StudySession[]): number {
  const key = chapterKey(target);
  const estimates = sessions
    .filter(session => session.chapterProgress !== undefined && chapterKey(session) === key)
    .sort((a, b) => `${a.date}${a.end}${a.createdAt}`.localeCompare(`${b.date}${b.end}${b.createdAt}`));
  const latest = estimates[estimates.length - 1];
  return Math.max(0, Math.min(100, latest?.chapterProgress ?? target.progressStart ?? 0));
}

/** Completion shown for this target, distinct from a chapter's absolute progress. */
export function progressOf(target: Target, sessions: StudySession[]): number {
  if (target.trackingMode === "progress") {
    const start = Math.max(0, Math.min(100, target.progressStart ?? 0));
    const goal = Math.max(start, Math.min(100, target.progressGoal ?? 100));
    const current = chapterProgressOf(target, sessions);
    if (current >= goal || goal <= start) return 100;
    return Math.max(0, Math.min(99, Math.round((current - start) / (goal - start) * 100)));
  }

  const linked = sessionsFor(target, sessions);
  const explicit = linked.reduce((max, session) => Math.max(max, session.progress ?? 0), 0);
  if (explicit >= 100) return 100;
  const logged = linked.reduce((sum, session) => sum + session.duration, 0);
  return target.plannedMinutes > 0 ? Math.min(99, Math.round(logged / target.plannedMinutes * 100)) : 0;
}

export function isDone(target: Target, sessions: StudySession[]): boolean {
  if (target.trackingMode === "progress") {
    return chapterProgressOf(target, sessions) >= (target.progressGoal ?? 100);
  }
  return sessionsFor(target, sessions).some(session => (session.progress ?? 0) >= 100);
}

export function loggedMinutes(target: Target, sessions: StudySession[]): number {
  return sessionsFor(target, sessions).reduce((sum, session) => sum + session.duration, 0);
}

export type DaySummary = {
  date: string;
  count: number;
  done: number;
  plannedMinutes: number;
  progressCount: number;
  loggedMinutes: number;
};

export function daySummary(date: string, data: { targets: Target[]; sessions: StudySession[] }): DaySummary {
  const targets = data.targets.filter(target => target.date === date);
  const sessions = data.sessions.filter(session => session.date === date);
  return {
    date,
    count: targets.length,
    done: targets.filter(target => isDone(target, data.sessions)).length,
    plannedMinutes: targets.reduce((sum, target) => sum + (target.trackingMode === "progress" ? 0 : target.plannedMinutes), 0),
    progressCount: targets.filter(target => target.trackingMode === "progress").length,
    loggedMinutes: sessions.reduce((sum, session) => sum + session.duration, 0)
  };
}

export function weekSummary(dates: string[], data: { targets: Target[]; sessions: StudySession[] }) {
  const targets = data.targets.filter(target => dates.includes(target.date));
  const sessions = data.sessions.filter(session => dates.includes(session.date));
  const done = targets.filter(target => isDone(target, data.sessions)).length;
  const plannedMinutes = targets.reduce((sum, target) => sum + (target.trackingMode === "progress" ? 0 : target.plannedMinutes), 0);
  const progressCount = targets.filter(target => target.trackingMode === "progress").length;
  const loggedMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
  return {
    targets, sessions, done, count: targets.length, plannedMinutes, progressCount, loggedMinutes,
    pending: targets.length - done,
    rate: targets.length ? Math.round(done / targets.length * 100) : 0
  };
}

export function completedChapterKeys(data: { targets: Target[]; sessions: StudySession[] }): Set<string> {
  const keys = new Set<string>();
  // Chapter coverage is based on an explicit absolute chapter estimate, never
  // merely on finishing a timed target or reaching an intermediate milestone.
  const seen = new Map<string, StudySession>();
  for (const session of data.sessions) {
    if (session.chapterProgress === undefined || !session.chapterId) continue;
    const key = `${session.subjectId}|${session.paperId}|${session.chapterId}`;
    const current = seen.get(key);
    if (!current || `${session.date}${session.end}${session.createdAt}` > `${current.date}${current.end}${current.createdAt}`) seen.set(key, session);
  }
  for (const [key, session] of seen) if ((session.chapterProgress ?? 0) >= 100) keys.add(key);
  return keys;
}

export function coverage(settings: Settings, data: { targets: Target[]; sessions: StudySession[] }): { covered: number; total: number; percent: number } {
  const done = completedChapterKeys(data);
  let total = 0, covered = 0;
  for (const subject of settings.subjects) {
    const all = syllabus.find(item => item.id === subject);
    for (const paper of all?.papers || []) {
      for (const chapter of paper.chapters) {
        total++;
        if (done.has(`${subject}|${paper.id}|${chapter.id}`)) covered++;
      }
    }
  }
  return { covered, total, percent: total ? Math.round(covered / total * 100) : 0 };
}

export function streakDays(sessions: StudySession[], today: string): number {
  const active = new Set(sessions.filter(session => session.duration > 0 || session.chapterProgress !== undefined).map(session => session.date));
  if (!active.size) return 0;
  let cursor: string | undefined = active.has(today) ? today : undefined;
  if (!cursor) return 0;
  let streak = 0;
  while (cursor && active.has(cursor)) {
    streak++;
    const date: Date = new Date(`${cursor}T12:00:00`);
    date.setDate(date.getDate() - 1);
    cursor = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  return streak;
}
