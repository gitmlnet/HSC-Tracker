# HSC Study Planner & Tracker — Complete System Blueprint

**Goal:** one calm, premium place where a student can plan a whole week in about a minute, log study in about five seconds, and immediately see what matters today — without clicking through five forms.

**Design targets**

| Action | Target |
| --- | --- |
| Create a full week plan | under 2 minutes, from one screen |
| Log a study session | under 5 seconds, one tap if it was planned |
| Check status (today / week / exam readiness) | one glance, above the fold on mobile |
| Data entry | never more than one screen deep |

---

## 1. Where the app is today (honest audit)

The existing app has a solid seed: React + TypeScript + Vite, offline IndexedDB storage, an NCTB-based chapter syllabus for four science subjects, a weekly dashboard, separate "Add plan" and "Add study session" forms, history, analytics, backup, theme, and PWA support.

The problems are structural, not cosmetic:

1. **Planning is a form, not a planner.** You visit a separate page, fill date → subject → paper → chapter → topic → reminder, save, and repeat. Planning seven days means a dozen round trips.
2. **Logging is slower than the paper notebook it replaces.** Date, two pickers, start, end, topic, progress slider, save.
3. **Targets are not real entities.** A plan is matched to sessions by `date + subject + paper + chapter` string keys, recomputed in four different places. Rename a date or add a second session and status gets fragile.
4. **No student context.** No group (Science / Commerce / Arts), no exam date, no daily study goal, so the app cannot tell "on track" from "hopelessly behind".
5. **Tracking stops at "time studied".** No chapter mastery, revision queue, weak-topic detection, or consistency signal.
6. **Progress page is four numbers and one bar chart** — no weekly review, no trends, no actionable insight.
7. **UI is functional but generic** — small dense forms, page-per-action navigation, no command palette, no timer, no shortcuts, no polished empty states or feedback loop.

Everything below is built on top of the existing stack; nothing needs a backend for v1.

---

## 2. Product principles

1. **One screen for the truth.** *Today* is the default and contains countdown, targets, timer, quick capture, week strip, and due revisions.
2. **Plan in bulk, adjust individually.** Fast plan and auto-plan build the week; the guided editor adjusts each target.
3. **Log from the target, not from a form.** Every planned target has Start / Done / +Time right on it.
4. **Text first, pickers second.** "Physics ch 3 45m tomorrow" beats five dropdowns.
5. **Local-first, offline, private.** No account required; JSON backup for portability; optional cloud sync is a later phase only.
6. **Honest motivation.** Streaks, countdown, and readiness score based on real logs — no fake gamification.

---

## 3. The system — modules

### G1 — Foundation & setup (the skeleton)

- One-time **30-second setup**: student group (Science / Commerce / Arts) → subjects auto-filled and editable → HSC exam date → daily study goal → reminder preference. Skippable; can be changed in Settings later.
- **Data model v2** with a real `Target` entity and stable IDs. Sessions link to a target with `targetId`; status is derived once in a selector, never by string keys scattered across pages.
- **Migration** from current v1 data: existing `plans` → targets (default 30 min), existing sessions back-linked by the old key, settings preserved. No student loses data.
- Storage layer: debounced autosave, in-memory cache, `undo` for destructive actions with a toast, schema validation on import.
- Design tokens and a component library (chips, rows, progress ring, stat cards, mini bars, toasts, sheet/modal) shared by every screen.

**Files:** `src/types.ts`, `src/lib/storage.ts` (+ `migrate.ts`, `selectors.ts`), `src/components/*`, new `src/pages/Setup.tsx`.

### G2 — Today Command Center + fast capture (the speed layer)

Single scrollable screen, no nested navigation for logging:

```
┌──────────────────────────────────────────────────────────────┐
│ Fri, 21 Nov     HSC in 138 days     🔥 12-day streak    ⚙     │
│ Good evening. 3 of 5 targets done · 2h 10m / 3h goal          │
│ ◕━━━━━━━━━━━━━━━ 72% of today's plan                           │
├──────────────────────────────────────────────────────────────┤
│ TODAY'S TARGETS                              + Add target      │
│ ● Physics 1st · Vector · 45m planned · 50m done   [■ Stop] [✓]│
│ ○ Chem 2nd · Organic · 60m planned              [▶ Start] [⋯]│
│ ○ Math 1st · Integration · 30m planned          [▶ Start] [⋯]│
│ ✓ Biology 1st · Cell Division · 35m         +25m · 100%       │
├──────────────────────────────────────────────────────────────┤
│ ⌨ Quick log: [ Physics ch 3, 45 min        ] [Enter]          │
│ S T  W  T  F  S  S   ← 7-day strip, tap to jump to that day   │
│ REVISION DUE: 2 items  ·  Coverage 34%  ·  Weak: 3 chapters    │
└──────────────────────────────────────────────────────────────┘
```

- **Start / Stop timer** directly on a target. Wall-clock based (safe after reload); pause/resume; Stop creates a linked session automatically with no form. Manual "add time" for offline studying.
- **Smart quick capture** parses one line into subject → paper → chapter → duration → date, using fuzzy chapter matching and last-used defaults. Ambiguity resolved inline with one tap, never a multi-step wizard.
- **Command palette** `Ctrl/Cmd + K`: `plan ...`, `log ...`, `start ...`, `go to ...`; keyboard shortcuts `N` new log, `Space` start/stop focused timer, `1–9` select target, `/` search.
- **Sticky timer dock** remains visible on every page; a full-screen focus timer is an optional mode.
- Empty states are actionable ("Plan my first week" / "Log my first session"), with one-tap seed actions.

**Files:** new `src/pages/Today.tsx`, `src/components/QuickCapture.tsx`, `src/components/TimerDock.tsx`, `src/lib/parser.ts`.

### G3 — Weekly Planner (plan the whole week in one place)

```
Sat        Sun        Mon        Tue        Wed        Thu        Fri
3 targets  2 targets  4 targets  3 targets  + Add     2 targets  Review
[3h 10m]   [2h 30m]   [4h 05m]   [2h 45m]  [1h 20m]   [2h 00m]  [—]
+ Add      + Add      + Add      + Add      + Add      + Add      + Add
```

- Seven-day board, Saturday–Friday (HSC routine), with a **capacity bar** per day vs the daily goal. Overloaded days warn gently; empty days offer "Fill this day".
- **Fast plan**: select a day, subject, syllabus chapter and time or progress goal in one screen; scheduled targets appear in the day rail immediately.
- **Guided add**: use Plan a target for one date or repeat the target across selected dates.
- **Fast plan**: a full-screen Saturday–Friday scheduling surface with a day rail and subject, chapter, and goal panes.
- **Auto-plan**: choose hours/day + subjects + "focus weak chapters" → generates the week using coverage, weak topics, and revision gaps. Every generated target is editable/movable.
- **Copy last week**, "repeat this target weekly", drag to another day, bulk select/delete, and "carry forward unfinished targets" at week end.
- **Weekly review prompt** at the end of the week: planned vs completed, best day, missed targets, one-click "roll over" to next week.

**Files:** new `src/pages/Planner.tsx`, `src/lib/autoPlan.ts`, `src/data/templates.ts`.

### G4 — Progress intelligence (from logging to knowing)

- **Chapter mastery map**: subject → paper → chapter grid with status (Not started / Learning / Practised / Strong), driven by completed targets, logged time, and revisions — one consistent selector.
- **Coverage and weak topics** sorted by low mastery and proximity to the exam date; "weak first" feeds auto-plan and revision.
- **Revision engine**: when a target hits 100%, schedule reviews at +1, +3, +7, +14 days (configurable). Due revisions appear on Today with **Revised ✓** / **Still weak** (pulls the review closer). Last 30 days before exam auto-prioritises revision.
- **Insights**: weekly review card, study heatmap and streaks, subject/time distribution, best study hours, planned-vs-actual trend over 8 weeks.
- **Readiness score** explained in plain language (coverage + consistency + revision health), with "what to do next" rather than a mysterious number.
- Custom topics under chapters (coaching notes, model tests) without breaking the official syllabus IDs.

**Files:** new `src/pages/Subjects.tsx`, `src/pages/Review.tsx`, `src/pages/Insights.tsx`, `src/lib/mastery.ts`, `src/lib/revision.ts`.

### G5 — Polish, safety, and shipping

- Premium design pass: subject colour coding, soft depth, compact one-line rows, ring progress, subtle motion (120–200 ms), skeleton loading, optimistic updates, undo toasts, fully responsive down to 360 px, reduced-motion and keyboard support.
- Honest notifications: per-target reminders and a daily digest while the app is active, quiet hours, clear note about browser limitations; no promises the platform cannot keep.
- Backup v2 (JSON with settings, targets, revisions), CSV export, import validation, "export reminder" before clearing data.
- PWA install, versioned offline cache, update check; deploy through the existing GitHub Pages workflow or the connected Vercel project.

---

## 4. Information architecture

```
HSC Study Tracker
├── Today          (default — countdown, targets, timer, quick capture, week strip, revisions)
├── Planner        (weekly board, fast plan, auto-plan, review)
├── Subjects       (syllabus map, chapter mastery, weak topics, custom topics)
├── Review          (due revisions, weak-first queue, weekly review)
├── Insights       (trends, heatmap, distribution, readiness)
├── History        (searchable sessions, edit, CSV)
└── Settings       (setup, goals, reminders, theme, backup)
```

Six/seven destinations instead of today's six, but 90% of daily use never leaves *Today*.

---

## 5. Proposed data model (v2)

```ts
type Group = "science" | "commerce" | "arts";

type Settings = {
  group: Group;
  subjects: string[];
  examDate: string;
  dailyGoalMinutes: number;
  theme: "light" | "dark";
  reminders: { enabled: boolean; quietHours?: [string, string]; dailyDigest?: string };
  revisionOffsets: number[];          // default [1, 3, 7, 14]
  onboarded: boolean;
};

type Target = {                      // one planned commitment, a first-class entity
  id: string;
  date: string;
  subjectId: string; paperId: string; chapterId: string;
  topic: string;
  plannedMinutes: number;
  priority: "normal" | "high";
  source: "manual" | "template" | "auto";
  createdAt: string; updatedAt: string;
};

type Session = {
  id: string;
  targetId?: string;                 // linked, no string-key guessing
  date: string;
  subjectId: string; paperId: string; chapterId: string;
  start: string; end: string; duration: number;
  topic: string;
  focusRating?: 1 | 2 | 3;
  createdAt: string; updatedAt: string;
};

type Revision = {
  id: string;
  targetId?: string;
  subjectId: string; paperId: string; chapterId: string;
  stage: number; dueDate: string; status: "due" | "done" | "snoozed";
};

type AppDataV2 = {
  version: 2;
  settings: Settings;
  targets: Target[];
  sessions: Session[];
  revisions: Revision[];
};
```

Migration runs once on load: v1 `plans` → `targets`, sessions matched to a target by the legacy key, old reminder settings carried into v2, theme preserved. A backup of the v1 state is kept in localStorage before migration.

---

## 6. Build groups (pick what to work on)

| Group | What it delivers | Why it matters |
| --- | --- | --- |
| **G1 — Foundation** | Setup, v2 data model + migration, selectors, design system | Everything else depends on it; no more fragile key matching |
| **G2 — Speed** | Today screen, one-tap timer, smart quick capture, command palette, shortcuts | This is the "doesn't take long to log" requirement |
| **G3 — Planner** | Weekly board, tap-first Fast plan, auto-plan, copy/carry forward | This is the "plan a week easily in one place" requirement |
| **G4 — Intelligence** | Mastery map, revision engine, insights, readiness, weak topics | This is what makes it an *effective* study system, not a diary |
| **G5 — Polish & ship** | Premium UI pass, reminders, backup v2, PWA, deploy | Makes it feel professional and safe to trust |

**My recommendation:** build **G1 + G2 + G3** as the first release, with the visual language applied as we go (so it looks premium from day one), then **G4**, then **G5**. That order gives a usable, fast product soonest and avoids rebuilding pages twice.

---

## 7. Definition of done for the first release

- [ ] A new student can set up in under a minute and plan a full week from one screen.
- [ ] A planned target can be started and completed with two taps; time is logged automatically.
- [ ] A free-text log can be entered from one line without touching a dropdown.
- [ ] Today's status, week progress, and exam countdown are visible without navigation.
- [ ] All current data migrates safely; JSON backup still works.
- [ ] Works offline, installs as a PWA, and feels fast on a mid-range phone.

---

## 8. Implementation status (this branch)

- **G1 — Foundation:** done. v2 schema with first-class targets, automatic v1 migration (including session back-linking and a saved v1 snapshot), selectors, shared UI kit, setup wizard.
- **G2 — Speed:** done. Today command center, one-tap wall-clock timer with pause/partial/finish, natural-language quick capture, `Ctrl/Cmd + K` palette, `N` shortcut, undo toasts.
- **G3 — Planner:** done. Saturday–Friday board, full-screen Fast plan, guided target editor, auto-plan, copy last week, optional drag between days, carry-forward, weekly review.
- **G4 — Intelligence:** partially done. Coverage, subject distribution, 8-week trend and consistency heatmap are in Insights; the spaced revision queue, mastery map and weak-topic engine are still to build.
- **G5 — Polish & ship:** done to a high standard. Responsive premium UI with platform-native typography, subject colour coding, touch-sized controls, accessible dialogs, motion with reduced-motion support, contrast-checked tokens, PWA install prompt + fallback guide, notification digest, v2 backup with undo. Vercel alias is live; GitHub Pages workflow is ready but Pages must be enabled in repository settings. See `docs/QA_CHECKLIST.md`.

Verified with a production build plus scripted browser-DOM flows: setup → template → quick add → timer finish → history → insights, and a v1 data migration check.
