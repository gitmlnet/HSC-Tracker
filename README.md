# HSC Study Planner

An offline-first weekly study planner for Bangladesh HSC students. The whole week (Saturday → Friday) is planned from one board, and daily study is captured from a single line or a one-tap timer.

## The idea

1. **Plan the week before it starts.** Pick a template or auto-plan, then adjust any target inline.
2. **Work from Today.** Your targets, timer, quick capture and week strip are on one screen.
3. **Log in seconds.** Start a timer on a planned target and press Finish — the session is saved and the target is completed automatically.

## What is built

- **Setup:** student group (Science / Commerce / Arts), subjects, exam date, daily study goal.
- **Today:** exam countdown, streak, daily progress ring, target checklist with Start/Pause/Finish, inline quick capture, 7-day strip, and a week-open nudge.
- **Weekly Planner:** 7-day board with daily capacity bars, inline "type + Enter" target adding, templates (Balanced / Exam sprint / Revision / Light), auto-plan from your goals, copy last week, drag targets between days, inline editing, carry-forward of unfinished targets, and a weekly review.
- **Quick entry:** natural language such as `Physics ch 3 45m`, `log Chemistry 30 min`, `plan Math ch 4 1h`; global `Ctrl/Cmd + K` command palette and `N` shortcut.
- **Insights:** total time, completion rate, subject distribution, chapter coverage, 8-week planned-vs-studied trend, and a 12-week consistency heatmap.
- **History:** searchable/filterable sessions with inline editing and CSV export.
- **Data:** IndexedDB with localStorage fallback, automatic migration from the older v1 format (no data loss), JSON backup/restore with undo, CSV export.
- **PWA:** installable, offline app shell, versioned service worker, theme-aware UI, keyboard and touch support.

The spaced revision queue and mock-test tracking from the [system blueprint](docs/SYSTEM_BLUEPRINT.md) are designed but not implemented yet.

## Technology

React 19, TypeScript, Vite 8, Lucide React. No backend; study records never leave the device unless exported.

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

The Vite base is relative, so the same build works at a domain root (Vercel) or a repository path such as `/daily/` (GitHub Pages). The existing `.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on pushes to `main`.

## Data model

`src/types.ts` defines version 2: `Settings`, `Target` (a planned commitment with its own id and planned minutes), `StudySession` (linked to a target by `targetId`), and `Revision` (reserved for the next phase). `src/lib/storage.ts` migrates any v1 `plans`/`sessions` into this model and keeps a copy of the original record in localStorage before migrating.

Status is derived in `src/lib/selectors.ts`, and natural-language entry lives in `src/lib/parser.ts`. Weekly templates and auto-planning live in `src/lib/autoPlan.ts`.

## Backup and privacy

Use **Settings → Backup & safety** to export JSON, export study history as CSV, or import a backup. Destructive actions show an Undo toast. Clearing browser/site data removes the local database, so export a backup first. Browser notifications, where permitted, are checked only while the app is open.

## Structure

```
src/
  components/  UI kit, smart input, timer dock, command palette
  data/        NCTB-based syllabus, subject presets
  lib/         storage + migration, selectors, parser, auto-plan, backup
  pages/       Today, Planner, Insights, History, Settings, Setup
  App.tsx      shell, navigation, timer, notifications, toasts
docs/
  SYSTEM_BLUEPRINT.md  full product and architecture plan
```
