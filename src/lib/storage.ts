import type { AppData, Group, Settings, StudySession, Target } from "../types";

const DB_NAME = "hsc-study-tracker";
const STORE = "state";
const KEY = "app";
const FALLBACK = "hsc-study-tracker-fallback";
const LEGACY_BACKUP = "hsc-study-tracker-v1-backup";

export const DEFAULT_GOAL = 150;

export const GROUP_SUBJECTS: Record<Group, string[]> = {
  science: ["physics", "chemistry", "biology", "higher-math"],
  commerce: ["c-accounting", "c-business", "c-economics", "c-finance"],
  arts: ["a-bangla", "a-english", "a-history", "a-civics"]
};

export const defaultSettings = (overrides: Partial<Settings> = {}): Settings => ({
  group: "science",
  subjects: [...GROUP_SUBJECTS.science],
  customSubjects: [
    { id: "c-accounting", name: "Accountancy" },
    { id: "c-business", name: "Business Studies" },
    { id: "c-economics", name: "Economics" },
    { id: "c-finance", name: "Finance & Banking" },
    { id: "a-bangla", name: "Bangla" },
    { id: "a-english", name: "English" },
    { id: "a-history", name: "History" },
    { id: "a-civics", name: "Civics & Social Science" }
  ],
  examDate: "",
  dailyGoalMinutes: DEFAULT_GOAL,
  theme: "light",
  reminders: { enabled: false, dailyDigest: "19:00", quietHours: false },
  revisionOffsets: [1, 3, 7, 14],
  onboarded: false,
  ...overrides
});

export const emptyData: AppData = {
  version: 2,
  settings: defaultSettings(),
  targets: [],
  sessions: [],
  revisions: []
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readRaw(): Promise<unknown> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveData(data: AppData): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const req = db.transaction(STORE, "readwrite").objectStore(STORE).put(data, KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    localStorage.setItem(FALLBACK, JSON.stringify(data));
  }
}

export async function loadData(): Promise<AppData> {
  try {
    return migrate(await readRaw());
  } catch {
    try {
      const raw = localStorage.getItem(FALLBACK);
      return migrate(raw ? JSON.parse(raw) : null);
    } catch {
      return emptyData;
    }
  }
}

const legacyKey = (x: { date: string; subjectId: string; paperId: string; chapterId: string }) =>
  [x.date, x.subjectId, x.paperId, x.chapterId].join("|");

const str = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;

/** Converts the original v1 shape into the v2 model without losing any record. */
export function migrate(raw: unknown): AppData {
  if (!raw || typeof raw !== "object") return emptyData;
  const source = raw as Record<string, unknown>;
  if (source.version === 2 && Array.isArray(source.targets) && Array.isArray(source.sessions)) {
    const s = (source.settings || {}) as Partial<Settings>;
    const defaults = defaultSettings();
    return {
      version: 2,
      settings: {
        ...defaults,
        ...s,
        group: s.group && s.group in GROUP_SUBJECTS ? s.group : defaults.group,
        subjects: Array.isArray(s.subjects) ? s.subjects : defaults.subjects,
        customSubjects: Array.isArray(s.customSubjects) ? s.customSubjects : defaults.customSubjects,
        revisionOffsets: Array.isArray(s.revisionOffsets) ? s.revisionOffsets : defaults.revisionOffsets,
        reminders: { ...defaults.reminders, ...(s.reminders || {}) },
        onboarded: s.onboarded !== false
      },
      targets: source.targets as Target[],
      sessions: source.sessions as StudySession[],
      revisions: Array.isArray(source.revisions) ? source.revisions as AppData["revisions"] : []
    };
  }

  const legacyPlans = Array.isArray(source.plans) ? source.plans as Record<string, unknown>[] : [];
  const legacySessions = Array.isArray(source.sessions) ? source.sessions as Record<string, unknown>[] : [];
  const targets: Target[] = legacyPlans.map(p => ({
    id: str(p.id, uid()),
    date: str(p.date),
    subjectId: str(p.subjectId),
    paperId: str(p.paperId),
    chapterId: str(p.chapterId),
    topic: str(p.topic),
    plannedMinutes: 45,
    priority: "normal",
    source: "manual",
    createdAt: str(p.createdAt, new Date().toISOString()),
    updatedAt: str(p.updatedAt, new Date().toISOString())
  }));
  const sessions: StudySession[] = legacySessions.map(s => {
    const legacy = { date: str(s.date), subjectId: str(s.subjectId), paperId: str(s.paperId), chapterId: str(s.chapterId) };
    const linked = targets.find(t => legacyKey(t) === legacyKey(legacy));
    const progress = typeof s.progress === "number" ? s.progress : undefined;
    return {
      id: str(s.id, uid()),
      targetId: linked?.id,
      ...legacy,
      start: str(s.start, "00:00"),
      end: str(s.end, "00:00"),
      duration: Number(s.duration) || 0,
      topic: str(s.topic),
      ...(progress !== undefined ? { progress } : {}),
      createdAt: str(s.createdAt, new Date().toISOString()),
      updatedAt: str(s.updatedAt, new Date().toISOString())
    };
  });
  const oldSettings = (source.settings || {}) as Record<string, unknown>;
  try { localStorage.setItem(LEGACY_BACKUP, JSON.stringify(source)); } catch { /* storage may be unavailable */ }
  return {
    version: 2,
    settings: defaultSettings({
      theme: oldSettings.theme === "dark" ? "dark" : "light",
      onboarded: targets.length > 0 || sessions.length > 0
    }),
    targets,
    sessions,
    revisions: []
  };
}

export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Respects the OS accessibility setting for every programmatic scroll. */
export const reducedMotion = () =>
  typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localDate(d);
}

/** HSC planning weeks run Saturday → Friday. */
export function weekStart(date: string): string {
  const day = new Date(`${date}T12:00:00`).getDay();
  return addDays(date, -((day + 1) % 7));
}

export const weekDates = (start: string) => Array.from({ length: 7 }, (_, i) => addDays(start, i));

export function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let a = sh * 60 + sm, b = eh * 60 + em;
  if (b === a) return 0;
  if (b < a) b += 1440;
  return b - a;
}

export function formatDuration(total: number): string {
  const h = Math.floor(total / 60), m = Math.round(total % 60);
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatTime(value: string): string {
  const [h, m] = value.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function clockNow(date = new Date()): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function timeBefore(minutes: number, date = new Date()): string {
  return clockNow(new Date(date.getTime() - minutes * 60000));
}

export function prettyDate(date: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, options);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((new Date(`${to}T12:00:00`).getTime() - new Date(`${from}T12:00:00`).getTime()) / 86400000);
}

export const DAY_NAMES = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
export const FULL_DAY_NAMES = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
