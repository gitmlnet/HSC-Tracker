import type { AppData, StudySession, Target } from "../types";
import type { Draft } from "./parser";
import { clockNow, timeBefore, uid } from "./storage";
import { sessionsFor } from "./selectors";

export function makeSession(base: Omit<StudySession, "id" | "createdAt" | "updatedAt">): StudySession {
  const now = new Date().toISOString();
  return { ...base, id: uid(), createdAt: now, updatedAt: now };
}

export function quickLogSession(draft: Draft): StudySession {
  return makeSession({
    targetId: undefined,
    date: draft.date,
    subjectId: draft.subjectId,
    paperId: draft.paperId,
    chapterId: draft.chapterId,
    topic: draft.topic,
    start: timeBefore(draft.minutes),
    end: clockNow(),
    duration: draft.minutes,
    progress: 100
  });
}

export function completeTarget(data: AppData, target: Target): AppData {
  const linked = sessionsFor(target, data.sessions);
  if (linked.some(s => (s.progress ?? 0) >= 100)) return data;
  return {
    ...data,
    sessions: [...data.sessions, makeSession({
      targetId: target.id,
      date: target.date,
      subjectId: target.subjectId,
      paperId: target.paperId,
      chapterId: target.chapterId,
      topic: target.topic,
      start: timeBefore(target.plannedMinutes),
      end: clockNow(),
      duration: target.plannedMinutes,
      progress: 100
    })]
  };
}

export function uncompleteTarget(data: AppData, target: Target): AppData {
  const ids = new Set(sessionsFor(target, data.sessions).map(s => s.id));
  return {
    ...data,
    sessions: data.sessions.map(s => ids.has(s.id) ? { ...s, progress: 0 } : s)
  };
}
