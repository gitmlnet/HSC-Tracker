import type { Settings } from "../types";
import { subjectOptions } from "../data/subjects";
import { addDays, localDate, weekStart } from "./storage";

export type Draft = {
  intent: "log" | "plan";
  date: string;
  subjectId: string;
  paperId: string;
  chapterId: string;
  topic: string;
  minutes: number;
};

const ALIASES: Record<string, string[]> = {
  physics: ["physics", "phy"],
  chemistry: ["chemistry", "chem"],
  biology: ["biology", "bio"],
  "higher-math": ["higher math", "higher mathematics", "math", "maths", "mathematics"]
};

const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const STOP = new Set(["the", "of", "and", "for", "to", "in", "a", "an", "with", "on", "from", "chapter", "ch", "paper"]);

function findSubject(text: string, settings: Settings): { id: string; name: string; from: string } | undefined {
  const candidates: { id: string; name: string; from: string }[] = [];
  for (const option of subjectOptions(settings)) {
    candidates.push({ id: option.id, name: option.name, from: option.name });
    for (const alias of ALIASES[option.id] || []) candidates.push({ id: option.id, name: option.name, from: alias });
  }
  candidates.sort((a, b) => b.from.length - a.from.length);
  return candidates.find(c => text.includes(norm(c.from)));
}

function findDate(text: string, today: string): string {
  const iso = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  if (/\b(today|tonight)\b/.test(text)) return today;
  if (/\b(tomorrow|tmrw|tmr)\b/.test(text)) return addDays(today, 1);
  const dayNames = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];
  const named = dayNames.findIndex(name => new RegExp(`\\b${name}\\b`).test(text));
  if (named >= 0) {
    const start = weekStart(today);
    const thisWeek = addDays(start, named);
    return thisWeek >= today ? thisWeek : addDays(thisWeek, 7);
  }
  return today;
}

function findDuration(text: string): number | undefined {
  const combined = text.match(/\b(\d{1,2}(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\s*(\d{1,2})?\s*(?:m|min|mins|minutes?)?\b/);
  if (combined) return Math.min(480, Math.round(Number(combined[1]) * 60 + Number(combined[2] || 0) * (combined[2] ? 1 : 0)));
  const hours = text.match(/\b(\d{1,2})\s*(?:h|hr|hrs|hour|hours)\b/);
  if (hours) return Math.min(480, Number(hours[1]) * 60);
  const mins = text.match(/\b(\d{1,3})\s*(?:m|min|mins|minute|minutes)\b/);
  if (mins) return Math.min(480, Math.max(5, Number(mins[1])));
  return undefined;
}

function findPaper(text: string): number | undefined {
  if (/\b(1st|first|paper\s*1|p1|paper\s*one)\b/.test(text)) return 1;
  if (/\b(2nd|second|paper\s*2|p2|paper\s*two)\b/.test(text)) return 2;
  return undefined;
}

/** Turns one typed line into a complete plan/session draft. */
export function parseSmartInput(
  input: string,
  settings: Settings,
  options: { today?: string; defaultIntent?: "log" | "plan" } = {}
): Draft | null {
  const today = options.today || localDate();
  const raw = input.trim();
  if (!raw) return null;
  let text = ` ${norm(raw)} `;

  let intent = options.defaultIntent || "plan";
  if (/^\s*(log|studied|did|spent)\b/.test(text)) intent = "log";
  else if (/^\s*(plan|schedule|target)\b/.test(text)) intent = "plan";
  text = text.replace(/^\s*(log|study|studied|did|spent|plan|schedule|target|add)\b\s*/, " ");

  const subject = findSubject(text, settings);
  if (!subject) return null;
  let subjectId = subject.id;

  // A paper hint applies to whichever paper actually owns the matched chapter.
  const paperHint = findPaper(text);
  const chapterNumber = text.match(/\bch(?:apter)?\.?\s*#?(\d{1,2})\b/);
  const words = norm(text.replace(norm(subject.from), " ")).split(" ").filter(w => w && !STOP.has(w));
  const optionsList = subjectOptions(settings).find(s => s.id === subjectId)?.papers || [];
  let paperId = paperHint ? (optionsList.length >= 2 ? `${subjectId}-${paperHint}` : optionsList[0]?.id || "") : optionsList[0]?.id || "";
  let chapterId = "";
  let chapterLabel = "";

  const papersToSearch = paperHint && optionsList.length >= 2
    ? optionsList.filter(p => p.id === `${subjectId}-${paperHint}`)
    : optionsList;
  for (const paper of papersToSearch) {
    const byNumber = chapterNumber && paper.chapters[Number(chapterNumber[1]) - 1];
    const byName = paper.chapters.find(chapter => {
      const tokens = norm(chapter.name).split(" ").filter(t => t.length > 2 && !STOP.has(t));
      return tokens.length > 0 && tokens.filter(t => words.includes(t)).length >= Math.min(2, tokens.length);
    });
    const match = byNumber || byName;
    if (match) {
      chapterId = match.id;
      paperId = paper.id;
      chapterLabel = match.name;
      break;
    }
  }

  const minutes = findDuration(text) || 45;
  const date = findDate(text, today);

  let leftover = norm(text
    .replace(norm(subject.from), " ")
    .replace(/\b(ch(?:apter)?\.?\s*#?\d{1,2}|1st|2nd|first|second|paper\s*[12]|p[12]|today|tomorrow|tmrw|tmr|tonight|\d{4}-\d{2}-\d{2})\b/g, " ")
    .replace(/\b\d{1,3}\s*(?:minutes?|mins?|m|hours?|hrs?|h)\b/g, " "));
  if (chapterLabel) leftover = leftover.replace(norm(chapterLabel), " ");
  const topic = leftover.replace(/\b(log|study|plan|add|for|about|on|some)\b/g, " ").replace(/\s+/g, " ").trim();

  return { intent, date, subjectId, paperId, chapterId, topic, minutes };
}
