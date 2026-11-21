import type { AppData, Target } from "../types";
import { subjectOptions } from "../data/subjects";
import { addDays, uid } from "./storage";

export type PlanStyle = "balanced" | "exam" | "revision" | "light";

export const STYLE_INFO: Record<PlanStyle, { name: string; detail: string; perDay: number; minutes: number }> = {
  balanced: { name: "Balanced week", detail: "2 focused targets a day across your subjects", perDay: 2, minutes: 45 },
  exam: { name: "Exam sprint", detail: "3 heavier targets a day, exam mode", perDay: 3, minutes: 60 },
  revision: { name: "Revision week", detail: "Short daily sessions, chapter recall first", perDay: 2, minutes: 30 },
  light: { name: "Light week", detail: "One calm target a day when life is busy", perDay: 1, minutes: 30 }
};

const makeTarget = (date: string, subjectId: string, paperId: string, chapterId: string, minutes: number, source: Target["source"]): Target => ({
  id: uid(),
  date,
  subjectId,
  paperId,
  chapterId,
  topic: "",
  plannedMinutes: minutes,
  priority: "normal",
  source,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

/** Builds a complete week from the student's subjects and daily goal. */
export function buildWeek(style: PlanStyle, dates: string[], data: AppData, replace = true): { targets: Target[]; removed: Target[] } {
  const { settings } = data;
  const subjects = subjectOptions(settings);
  const info = STYLE_INFO[style];
  if (!subjects.length || !dates.length) return { targets: [], removed: [] };

  const finished = new Set(data.targets.filter(t => {
    const logged = data.sessions.filter(s => s.targetId === t.id);
    return logged.some(s => (s.progress ?? 0) >= 100);
  }).map(t => `${t.subjectId}|${t.paperId}|${t.chapterId}`));

  const pool: { subjectId: string; paperId: string; chapterId: string }[] = [];
  for (const subject of subjects) {
    for (const paper of subject.papers) {
      const chapters = style === "revision" || style === "exam"
        ? [...paper.chapters].sort((a, b) => Number(finished.has(`${subject.id}|${paper.id}|${a.id}`)) - Number(finished.has(`${subject.id}|${paper.id}|${b.id}`)))
        : paper.chapters;
      for (const chapter of chapters) pool.push({ subjectId: subject.id, paperId: paper.id, chapterId: chapter.id });
    }
    if (!subject.papers.length) pool.push({ subjectId: subject.id, paperId: "", chapterId: "" });
  }
  if (!pool.length) pool.push({ subjectId: subjects[0].id, paperId: "", chapterId: "" });

  const targets: Target[] = [];
  let cursor = 0;
  const goal = Math.max(30, settings.dailyGoalMinutes);
  dates.forEach((date, dayIndex) => {
    const count = dayIndex === 6 ? Math.max(1, info.perDay - 1) : info.perDay; // Friday stays lighter
    const perTarget = style === "light"
      ? Math.min(90, goal)
      : style === "revision"
        ? Math.min(info.minutes, Math.max(30, Math.floor(goal / count)))
        : Math.min(info.minutes === 45 ? 75 : 60, Math.floor(goal / count));
    for (let i = 0; i < count; i++) {
      const subject = subjects[(dayIndex + i) % subjects.length];
      const subjectItems = pool.filter(item => item.subjectId === subject.id);
      const candidates = subjectItems.length ? subjectItems : pool;
      const item = candidates[cursor % candidates.length];
      cursor++;
      const minutes = perTarget;
      targets.push(makeTarget(date, item.subjectId, item.paperId, item.chapterId, minutes, "auto"));
    }
  });

  return {
    targets,
    removed: replace ? data.targets.filter(t => dates.includes(t.date)) : []
  };
}

export function copyWeek(sourceStart: string, dates: string[], data: AppData): Target[] {
  const sourceDates = Array.from({ length: 7 }, (_, i) => addDays(sourceStart, i));
  const byOffset = new Map<number, Target[]>();
  data.targets.forEach(t => {
    const index = sourceDates.indexOf(t.date);
    if (index >= 0) byOffset.set(index, [...(byOffset.get(index) || []), t]);
  });
  const now = new Date().toISOString();
  return dates.flatMap((date, index) => (byOffset.get(index) || []).map(t => ({
    ...t,
    id: uid(),
    date,
    source: "copy" as const,
    createdAt: now,
    updatedAt: now
  })));
}
