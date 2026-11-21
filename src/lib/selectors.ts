import type { AppData, Settings, StudySession, Target } from "../types";
import { syllabus } from "../data/syllabus";

const legacyKey = (x: { date: string; subjectId: string; paperId: string; chapterId: string }) =>
  [x.date, x.subjectId, x.paperId, x.chapterId].join("|");

export function sessionsFor(target: Target, sessions: StudySession[]): StudySession[] {
  return sessions.filter(s => s.targetId ? s.targetId === target.id : !s.targetId && legacyKey(s) === legacyKey(target));
}

export function progressOf(target: Target, sessions: StudySession[]): number {
  return sessionsFor(target, sessions).reduce((max, s) => Math.max(max, s.progress ?? 0), 0);
}

export function isDone(target: Target, sessions: StudySession[]): boolean {
  return progressOf(target, sessions) >= 100;
}

export function loggedMinutes(target: Target, sessions: StudySession[]): number {
  return sessionsFor(target, sessions).reduce((sum, s) => sum + s.duration, 0);
}

export type DaySummary = {
  date: string;
  count: number;
  done: number;
  plannedMinutes: number;
  loggedMinutes: number;
};

export function daySummary(date: string, data: AppData): DaySummary {
  const targets = data.targets.filter(t => t.date === date);
  const sessions = data.sessions.filter(s => s.date === date);
  return {
    date,
    count: targets.length,
    done: targets.filter(t => isDone(t, sessions)).length,
    plannedMinutes: targets.reduce((sum, t) => sum + t.plannedMinutes, 0),
    loggedMinutes: sessions.reduce((sum, s) => sum + s.duration, 0)
  };
}

export function weekSummary(dates: string[], data: AppData) {
  const targets = data.targets.filter(t => dates.includes(t.date));
  const sessions = data.sessions.filter(s => dates.includes(s.date));
  const done = targets.filter(t => isDone(t, sessions)).length;
  const plannedMinutes = targets.reduce((sum, t) => sum + t.plannedMinutes, 0);
  const loggedMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  return {
    targets, sessions, done, count: targets.length, plannedMinutes, loggedMinutes,
    pending: targets.length - done,
    rate: targets.length ? Math.round(done / targets.length * 100) : 0
  };
}

export function completedChapterKeys(data: AppData): Set<string> {
  const keys = new Set<string>();
  for (const target of data.targets) {
    if (isDone(target, data.sessions) && target.chapterId) {
      keys.add(`${target.subjectId}|${target.paperId}|${target.chapterId}`);
    }
  }
  return keys;
}

export function coverage(settings: Settings, data: AppData): { covered: number; total: number; percent: number } {
  const done = completedChapterKeys(data);
  let total = 0, covered = 0;
  for (const subject of settings.subjects) {
    const all = syllabus.find(s => s.id === subject);
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
  const active = new Set(sessions.filter(s => s.duration > 0).map(s => s.date));
  if (!active.size) return 0;
  let cursor: string | undefined = active.has(today) ? today : undefined;
  if (!cursor) return 0;
  let streak = 0;
  while (cursor && active.has(cursor)) {
    streak++;
    const d: Date = new Date(`${cursor}T12:00:00`);
    d.setDate(d.getDate() - 1);
    cursor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return streak;
}
