import type { AppData, StudySession, Target } from "../types";
import type { Draft } from "./parser";
import { clockNow, localDate, timeBefore, uid } from "./storage";
import { sessionsFor } from "./selectors";

export function makeSession(base: Omit<StudySession, "id" | "createdAt" | "updatedAt">): StudySession {
  const now = new Date().toISOString();
  return { ...base, id: uid(), createdAt: now, updatedAt: now };
}

export function quickLogSession(draft: Draft): StudySession {
  // A past-dated log should carry a timestamp from that day, not from right now.
  const at = draft.date === localDate() ? new Date() : new Date(`${draft.date}T12:00:00`);
  return makeSession({
    targetId: undefined,
    date: draft.date,
    subjectId: draft.subjectId,
    paperId: draft.paperId,
    chapterId: draft.chapterId,
    topic: draft.topic,
    start: timeBefore(draft.minutes, at),
    end: clockNow(at),
    duration: draft.minutes,
    progress: 100
  });
}

/** The single source of truth for the session created when a target is ticked complete. */
export function completionSession(target: Target): StudySession {
  return makeSession({
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
  });
}

export function completeTarget(data: AppData, target: Target): AppData {
  const linked = sessionsFor(target, data.sessions);
  if (linked.some(s => (s.progress ?? 0) >= 100)) return data;
  return { ...data, sessions: [...data.sessions, completionSession(target)] };
}

export function uncompleteTarget(data: AppData, target: Target): AppData {
  const ids = new Set(sessionsFor(target, data.sessions).map(s => s.id));
  return {
    ...data,
    sessions: data.sessions.map(s => ids.has(s.id) ? { ...s, progress: 0 } : s)
  };
}
