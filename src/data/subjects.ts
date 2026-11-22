import type { Group, Settings } from "../types";
import { GROUP_SUBJECTS } from "../lib/storage";
import { syllabus } from "./syllabus";

export const GROUP_LABELS: Record<Group, string> = {
  science: "Science",
  commerce: "Commerce",
  arts: "Arts & Humanities"
};

export type SubjectOption = { id: string; name: string; papers: { id: string; name: string; chapters: { id: string; name: string }[] }[] };

/** Official syllabus for science subjects; simple named subjects for commerce/arts. */
export function subjectOptions(settings: Settings): SubjectOption[] {
  const all = [
    ...syllabus.map(s => ({ id: s.id, name: s.name, papers: s.papers })),
    ...settings.customSubjects.map(s => ({ id: s.id, name: s.name, papers: [] as SubjectOption["papers"] }))
  ];
  const chosen = new Set(settings.subjects.length ? settings.subjects : GROUP_SUBJECTS[settings.group]);
  return all.filter(s => chosen.has(s.id));
}

export function findSubject(id: string, settings: Settings): SubjectOption | undefined {
  return subjectOptions(settings).find(s => s.id === id);
}

export function subjectName(id: string, settings: Settings): string {
  return findSubject(id, settings)?.name ||
    syllabus.find(s => s.id === id)?.name ||
    settings.customSubjects.find(s => s.id === id)?.name ||
    (id ? id.replace(/^.-/, "").replace(/-/g, " ") : "Subject");
}

export function chapterName(target: { subjectId: string; paperId: string; chapterId: string }, settings: Settings): string {
  const subject = findSubject(target.subjectId, settings);
  const paper = subject?.papers.find(p => p.id === target.paperId);
  const chapter = paper?.chapters.find(c => c.id === target.chapterId);
  return chapter?.name || "";
}

export function targetLabel(target: { subjectId: string; paperId: string; chapterId: string; topic: string }, settings: Settings): string {
  const subject = subjectName(target.subjectId, settings);
  const paper = findSubject(target.subjectId, settings)?.papers.find(p => p.id === target.paperId);
  const paperShort = paper?.name.includes("1") ? "I" : paper?.name.includes("2") ? "II" : "";
  const chapter = chapterName(target, settings);
  return [paperShort ? `${subject} ${paperShort}` : subject, chapter || target.topic].filter(Boolean).join(" · ");
}
