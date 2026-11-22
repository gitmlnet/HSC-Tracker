import type { AppData } from "../types";
import { chapterName, subjectName } from "../data/subjects";
import { defaultSettings, migrate } from "./storage";

function download(name: string, body: string, type: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}

export function exportJson(data: AppData) {
  download(`hsc-study-planner-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), "application/json");
}

export function exportCsv(data: AppData) {
  const head = ["Date", "Subject", "Paper", "Chapter", "From", "To", "Duration (min)", "Target completion (%)", "Chapter completion (%)", "Topic"];
  const q = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const rows = [...data.sessions].sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start)).map(s => [
    s.date,
    subjectName(s.subjectId, data.settings),
    s.paperId.includes("-2") || s.paperId.endsWith("-2") ? "2nd Paper" : s.paperId ? "1st Paper" : "",
    chapterName(s, data.settings),
    s.start,
    s.end,
    s.duration,
    s.progress ?? "",
    s.chapterProgress ?? "",
    s.topic
  ].map(q).join(","));
  download(`hsc-study-history-${new Date().toISOString().slice(0, 10)}.csv`, [head.map(q).join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
}

export function parseBackup(raw: string): AppData {
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid backup");
  if (parsed.version !== 2 && parsed.version !== 1) throw new Error("Unsupported backup version");
  if (!Array.isArray(parsed.sessions) || !(Array.isArray(parsed.plans) || Array.isArray(parsed.targets))) throw new Error("Invalid backup structure");
  const migrated = migrate(parsed);
  const valid = migrated.targets.every(t => t && typeof t.id === "string" && typeof t.date === "string" && typeof t.subjectId === "string" && typeof t.plannedMinutes === "number")
    && migrated.sessions.every(s => s && typeof s.id === "string" && typeof s.date === "string" && typeof s.duration === "number");
  if (!valid) throw new Error("Backup contains invalid records");
  return { ...migrated, settings: { ...defaultSettings(), ...migrated.settings, onboarded: true } };
}
