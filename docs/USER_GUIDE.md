# HSC Study Planner — complete user guide

This manual explains every screen, control and concept in the app. The same guide is available inside the product: press **Guide** in the top bar, open the sidebar's **User guide**, type `help` in the command palette, or press `Ctrl/⌘ + K` and type `help timer` (or any topic).

## Contents

1. [The idea and the weekly method](#1-the-idea-and-the-weekly-method)
2. [First-time setup](#2-first-time-setup)
3. [Weekly Planner](#3-weekly-planner)
4. [Planning and logging](#4-planning-and-logging)
5. [Today](#5-today)
6. [Focus timer and logging](#6-focus-timer-and-logging)
7. [Insights](#7-insights)
8. [History](#8-history)
9. [Settings, backup and privacy](#9-settings-backup-and-privacy)
10. [Install, offline use and notifications](#10-install-offline-use-and-notifications)
11. [Keyboard, touch and accessibility](#11-keyboard-touch-and-accessibility)
12. [FAQ and troubleshooting](#12-faq-and-troubleshooting)

---

## 1. The idea and the weekly method

HSC Study Planner is built around a single workflow: **decide the whole week once, then work from one calm screen every day.**

A planning week always runs **Saturday → Friday**. That matches a typical HSC study week and keeps the seven days visible together on one board.

1. **Saturday — decide the week.** Open Quick Actions with **Ctrl+K** and choose **Plan the week**, or add targets directly from the weekday columns.
2. **Sunday to Thursday — execute and adjust.** Work from **Today**. If a subject takes longer than expected, change its minutes, move it to another day or add an extra target.
3. **Friday — review.** Use the weekly review to see what is unfinished and carry targets forward when useful.
4. **Next week — carry forward.** Copy unfinished targets into next week. The originals remain in the current week so history stays truthful.

The point is concentration: you should never have to hunt across screens to know **what is next**.

---

## 2. First-time setup

The first screen asks three things:

| Step | What you choose | Why it matters |
| --- | --- | --- |
| 1 | Student group — Science, Commerce, or Arts & Humanities | Fills in the usual subjects |
| 2 | Subjects | Only chosen subjects appear in plans, guided logging and insights |
| 3 | HSC exam date and daily study goal | Powers the countdown, daily meter and each day's capacity bar |

**Skip for now** applies defaults (Science subjects, 150 minutes a day) and drops you straight into the planner. Everything can be changed later in **Settings**.

---

## 3. Weekly Planner

The planner is the heart of the app. On desktop, use the panel control beside the page title to collapse the left navigation to an icon rail or expand it again; the preference is remembered locally. Icon buttons retain accessible names and hover/focus labels. On phones, the separate menu button opens a slide-in navigation drawer; tap outside it, choose a destination or press Escape to close it. Each of the seven day columns shows:

- the weekday and date, with a **Today** tag on the current day;
- completed / total targets;
- a capacity bar comparing planned minutes with your daily goal (amber means over capacity);
- target rows, with high-priority targets first;
- an **Add target** button for adding to that day.

### Creating a week

| Control | What it does |
| --- | --- |
| **Plan the week** | Open from Quick Actions (**Ctrl+K**): choose days, subjects, chapters and goals. Select a task in the week strip to edit it. |
| **Add target** | Each weekday column opens the guided flow for a single target; Today also supports repeated dates. |
| **Week navigation** | Move between weeks or return to the current week without changing any targets. |

Fast plan supports day-by-day scheduling. Each day's Add target control remains available on the Weekly Planner.

### Working with a target

- **Tap the row or its edit button** to adjust its date, subject, chapter and goal in the guided flow.
- **Drag the row** onto another day if you prefer; drag-and-drop is optional.
- **Trash** removes the target; **Undo** restores it for five seconds.
- **Circle** opens the target's logging flow for actual time or chapter progress.
- **Play** starts the focus timer on that target.
- The coloured rail on the left of each row identifies the subject at a glance.

### Weekly review

At the bottom of the planner:

- completion rate, completed / total targets, studied minutes and pending targets;
- seven small bars showing daily completion;
- **Carry unfinished to next week** — copies pending targets into next week;
- **Add a revision day** — puts short revision targets on the lightest day;
- a reminder that targets can be edited.

> **Timer protection:** while a timer is running on a target, you cannot delete that target. Finish the timer first so its minutes are never lost.

---

## 4. Planning and logging

Use **Plan the week** for day-by-day scheduling, **Add a target** for the guided flow, or **Log study** to record a session. Custom topics are optional.

### Plan one day or several days

1. Pick a day from the current Saturday–Friday week.
2. Optionally expand **Repeat this target on other days** and tap any additional dates.
3. Tap a subject, then a syllabus chapter or built-in study block.
4. Choose a **Time** goal or a **Chapter progress** milestone. Time goals have quick duration buttons and a 15-minute slider; progress goals use percentage buttons and a slider.
5. Save. The repeated dates each get their own target.

Custom topic names are optional. For subjects without a built-in syllabus, choose General study or Past paper practice. Drag-and-drop in the weekly board remains optional; all planning controls also work by tap.

### Log a study session

Tap **Log study** on Today or the circle beside a target. A linked target keeps its planned metric as the primary log; optionally add the other metric too (time plus chapter progress, or chapter progress plus time). For an unplanned session, choose either metric first and optionally include the other. The timer remains available on any target.

A chapter percentage is **cumulative**: logging 45% and later 70% means the current estimate is 70%, not 115%. A progress target completes when the chapter reaches its saved percentage goal. A time target completes only when its planned time is explicitly completed; chapter progress does not complete it, and logged minutes do not complete a progress target.

The command palette still supports page navigation (`go planner`) and guide topics (`help timer`).

---

## 5. Today

Today is the execution screen — the only one you need while studying.

| Area | What it shows |
| --- | --- |
| Header | Date, greeting, exam countdown, consecutive-day streak |
| Today at a glance | Targets done, minutes studied vs daily goal, chapter coverage, progress ring, daily goal meter |
| Today's targets | Priority-sorted checklist with logging, timer and target-edit controls |
| Quick log | One-line capture for study outside the plan |
| This week | Seven day cards with done/total and studied-vs-planned fill; click one to open that day in the planner |
| Setup banner | Appears when the week is empty and invites you to plan Saturday to Friday |

Clicking a target's text opens **that exact target's editor** in the weekly planner. There is also a guide card in the side column for a full walkthrough.

---

## 6. Focus timer and logging

A timer belongs to one target and follows you across pages. It survives a refresh because its state is stored locally.

1. **Start** with the play button on a target. The floating dock shows the target and elapsed time. Only one timer can run at a time.
2. **Pause / resume** keeps accumulated time. The dock and the target row both offer this control.
3. **Finish** logs the real elapsed time. On a time-based target, a full timer finish also marks the target complete; on a progress-based target, minutes alone never complete it.
4. **Log partial** saves the minutes but leaves the target open for later.

Sessions are rounded to whole minutes with a minimum of one minute. Finishing creates a real, editable session in History. Use the target's circle to open the guided logger and record actual time or cumulative chapter progress.

---

## 7. Insights

Every number comes from your own targets and sessions.

| Item | Definition |
| --- | --- |
| Total study | Sum of all logged minutes |
| Sessions logged | Count of all study records |
| Target completion | Percentage of targets that reached 100% |
| Current streak | Consecutive days ending today with at least one session |
| Where your time goes | Minutes per subject, largest first |
| Chapter coverage | Distinct syllabus chapters with an explicit 100% overall chapter estimate; finishing a time target or intermediate progress milestone does not claim full coverage |
| Planned vs studied | Eight-week comparison of planned and logged minutes |
| Study consistency | 12-week daily heatmap; brighter means more minutes |

Science subjects include an NCTB-style chapter list. Custom Commerce and Arts subjects do not have a chapter list yet, so chapter coverage shows 0% for them — all other tracking still works. If a number looks wrong, correct the underlying session in History.

---

## 8. History

History is the ledger behind every statistic.

- **Filter** by text, date, subject, chapter, minimum minutes, and newest / longest sorting.
- **Edit** a session's date, start and end time, minutes, topic, target completion and (when present) absolute chapter completion. Every insight recalculates immediately.
- **Delete** a session; Undo appears in the toast.
- **Export CSV** for spreadsheets. A full JSON backup is in Settings.

Target completion and chapter completion are separate. A target-completion value can complete a timed target; chapter coverage changes only when an absolute chapter estimate reaches 100%. Progress-goal targets complete when the chapter's current overall estimate reaches that target's goal.

---

## 9. Settings, backup and privacy

### Profile and preferences

- Student group, exam date and daily study goal.
- Subject chips: tap to add or remove.
- Light / dark theme, applied instantly.
- Gentle reminders: a daily digest checked **while the app is open**, with explicit browser permission.

### Data safety

| Control | Purpose |
| --- | --- |
| Export backup | JSON copy of settings, targets, sessions and revisions |
| Export study CSV | Spreadsheet-friendly session log |
| Import backup | Restores a JSON backup; Undo is offered |
| Clear workspace | Two-click confirmation; removes all local plans and sessions, with Undo |

Everything stays on the device in IndexedDB, with a localStorage fallback. There is no account, tracking or server-side study data. Clearing browser/site data removes the local database — export a backup first. Version 1 records are migrated automatically and a copy of the original payload is kept in localStorage.

---

## 10. Install, offline use and notifications

### Install as a real app

The **Install app** button is always visible in the top bar. When the browser exposes its native install prompt, the button opens that real install flow directly. Otherwise the dialog checks HTTPS, the manifest and start URL/scope, both downloaded PNG icons and the active service worker, then gives platform-specific steps and browser troubleshooting. A web page cannot force a browser to expose an install prompt:

- **Android / Chrome:** open the URL directly in Chrome → three-dot menu → **Install app**.
- **iPhone / iPad / Safari:** open in Safari → **Share** → **Add to Home Screen**.
- **Desktop Chrome / Edge:** use the address-bar install icon, or the menu action named **Install HSC Study Planner** / **Install page as app**.

The site is configured as a PWA with a manifest, standalone display, 192/512 PNG icons, shortcuts and a versioned service worker. A successful install opens full-screen without a browser toolbar. If a browser only offers **Create shortcut**, do not choose that as a substitute: open the public site in the latest supported full browser (not an embedded or private window), confirm the in-app checks pass, reload and use the browser's **Install app / Install page as app** action. On iPhone and iPad, **Share → Add to Home Screen** in Safari is Apple's PWA installation flow.

### Offline

The app shell, icons, CSS and JavaScript are cached by a versioned service worker. Planning and logging work without a connection. Study data is local, and JSON export is how you move it between devices.

### Notifications

A static web app cannot reliably run in the background. Reminders are checked while the app is open; delivery after it is closed is not guaranteed.

---

## 11. Keyboard, touch and accessibility

| Shortcut | Action |
| --- | --- |
| `Ctrl/⌘ + K` | Open or close the command palette anywhere |
| Sidebar control beside the page title | Collapse/expand the desktop sidebar; the choice is remembered on this device |
| `N` | Open the quick-actions palette when no field is being edited |
| `Enter` | Run a matching command or guide search in the palette |
| `Esc` | Close the guide, palette, install dialog or setup |
| `Tab` / `Shift + Tab` | Move between controls; focus stays inside dialogs |

Accessibility details: descriptive button labels, polite announcements for smart-input previews, visible focus rings, enlarged phone touch targets, target actions that do not depend on hover, system Reduce Motion support for all animations and scrolls, and at least 4.5:1 contrast for small text.

---

## 12. FAQ and troubleshooting

**Why does Chrome only say "Create shortcut"?** Open the public URL directly in a current full Chrome browser (not an embedded or private window), use the in-app **Install app** checks, reload, and look for **Install app / Install page as app**. Do not choose **Create shortcut** as a replacement. The browser controls whether it exposes PWA installation.

**Where did my old data go?** Version 1 plans and sessions were migrated into targets and sessions. The original record is kept in localStorage.

**Why is chapter coverage 0% for Commerce or Arts?** Only subjects with a chapter list can be counted. Study time, targets, streaks and insights still work.

**Can I use two devices?** Yes — export JSON on one and import it on the other. There is no automatic cloud sync.

**Does chapter progress finish a timed target?** No. Time targets and chapter-progress targets use separate completion rules: percentage updates never finish a time target, and minutes alone never finish a progress target.

**Can I move a target outside this week?** Yes — edit its day; navigate to that week on the planner board.

**Is anything sent online?** No. There is no account, tracking or server-side study data.

**Something still looks wrong.** Export a backup from Settings before trying anything destructive, then use the guide's search field with a single keyword such as `timer`, `backup` or `chapter`.

---

Live app: https://hsc-study-planner-nine.vercel.app · Deployment notes: [DEPLOYMENT.md](DEPLOYMENT.md) · Quality standard: [QUALITY_STANDARD.md](QUALITY_STANDARD.md)
