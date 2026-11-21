# HSC Study Planner — complete user guide

This manual explains every screen, control and concept in the app. The same guide is available inside the product: press **Guide** in the top bar, open the sidebar's **User guide**, type `help` in the command palette, or press `Ctrl/⌘ + K` and type `help timer` (or any topic).

## Contents

1. [The idea and the weekly method](#1-the-idea-and-the-weekly-method)
2. [First-time setup](#2-first-time-setup)
3. [Weekly Planner](#3-weekly-planner)
4. [Quick entry syntax](#4-quick-entry-syntax)
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

1. **Saturday — decide the week.** Apply a template or auto-plan, then remove unrealistic items and add what must happen.
2. **Sunday to Thursday — execute and adjust.** Work from **Today**. If a subject takes longer than expected, change its minutes, move it to another day or add an extra target. Nothing is locked.
3. **Friday — lighter review.** The planner automatically gives Friday fewer targets. Use the weekly review to see what is unfinished.
4. **Next week — carry forward.** Copy unfinished targets into next week. The originals remain in the current week so history stays truthful.

The point is concentration: you should never have to hunt across screens to know **what is next**.

---

## 2. First-time setup

The first screen asks three things:

| Step | What you choose | Why it matters |
| --- | --- | --- |
| 1 | Student group — Science, Commerce, or Arts & Humanities | Fills in the usual subjects |
| 2 | Subjects | Only chosen subjects appear in plans, quick entry and insights |
| 3 | HSC exam date and daily study goal | Powers the countdown, daily meter and each day's capacity bar |

**Skip for now** applies defaults (Science subjects, 150 minutes a day) and drops you straight into the planner. Everything can be changed later in **Settings**.

---

## 3. Weekly Planner

The planner is the heart of the app. Each of the seven day columns shows:

- the weekday and date, with a **Today** tag on the current day;
- completed / total targets;
- a capacity bar comparing planned minutes with your daily goal (amber means over capacity);
- target rows, with high-priority targets first;
- a one-line input for adding to that day.

### Creating a week

| Control | What it does |
| --- | --- |
| **Balanced week** | Two targets on most days, spread across chosen subjects |
| **Exam sprint** | Three heavier targets per day |
| **Revision week** | Short recall-focused targets |
| **Light week** | One calm target per day |
| **Auto-plan** | Applies the balanced shape immediately |
| **Copy last week** | Duplicates the previous week's targets on the same weekdays with new IDs |
| **Clear week** | Requires a second click; Undo is offered in the toast |
| **Start with a blank week** | Dismisses the setup panel so you can add targets manually |

The shape uses your subjects and daily goal to pick chapters and minutes. Friday always receives one fewer target.

### Working with a target

- **Click the row or its arrow** to edit minutes, topic, day and priority. Priority targets sort to the top and show a dot.
- **Drag the row** onto another day, or use the **Day** dropdown in the editor — useful on touch and with a keyboard.
- **Trash** removes the target; **Undo** restores it for five seconds.
- **Circle** marks it complete and logs a session automatically; **Undo** reopens it.
- **Play** starts the focus timer on that target.
- The coloured rail on the left of each row identifies the subject at a glance.

### Weekly review

At the bottom of the planner:

- completion rate, completed / total targets, studied minutes and pending targets;
- seven small bars showing daily completion;
- **Carry unfinished to next week** — copies pending targets into next week;
- **Add a revision day** — puts short revision targets on the lightest day;
- a reminder that nothing is locked in.

> **Timer protection:** while a timer is running on a target, you cannot delete that target, clear or replace its week, or clear the whole workspace. Finish the timer first so its minutes are never lost.

---

## 4. Quick entry syntax

Any input with the magic-wand icon understands one plain sentence. A live hint previews the intent, subject, duration and day before you press **Enter**.

### Examples

| Type | Result |
| --- | --- |
| `Physics ch 3 45m` | 45-minute Physics chapter 3 target |
| `log Chemistry organic 30 min` | 30-minute logged session, linked to a matching target |
| `plan Math ch 4 1h tomorrow` | One-hour mathematics target tomorrow |
| `Bio 1.5h Sunday` | 90-minute Biology target on Sunday |
| `go planner` | Switches to the planner (command palette only) |
| `help timer` | Opens the guide at the timer chapter |

### What is recognised

- **Subjects:** full names and aliases — `phy`, `chem`, `bio`, `math`, `maths`, `higher math`.
- **Chapters:** number (`ch 3`, `chapter 3`) or at least two distinctive name words. If no paper is specified, all papers are searched.
- **Papers:** `1st`, `p1`, `paper one`, `2nd`, `p2`, `paper two`.
- **Durations:** `45m`, `45 min`, `1h`, `1.5h`, `1h 30m`. Capped at 8 hours; defaults to 45 minutes.
- **Days:** `today`, `tomorrow`, any weekday name, or `YYYY-MM-DD`. A weekday means the next occurrence from today.
- **Intent:** `log / studied / did / spent` creates a session; `plan / schedule / target` creates a target. The input you are using supplies the default when no prefix is typed.

**Today** has two inputs: **Add a target** and **Quick log**. A planner day input plans by default but respects a `log` prefix. The command palette accepts both plus page navigation.

---

## 5. Today

Today is the execution screen — the only one you need while studying.

| Area | What it shows |
| --- | --- |
| Header | Date, greeting, exam countdown, consecutive-day streak |
| Today at a glance | Targets done, minutes studied vs daily goal, chapter coverage, progress ring, daily goal meter |
| Today's targets | Priority-sorted checklist with complete, timer, edit and quick-add |
| Quick log | One-line capture for study outside the plan |
| This week | Seven day cards with done/total and studied-vs-planned fill; click one to open that day in the planner |
| Setup banner | Appears when the week is empty and invites you to plan Saturday to Friday |

Clicking a target's text opens **that exact target's editor** in the weekly planner. There is also a guide card in the side column for a full walkthrough.

---

## 6. Focus timer and logging

A timer belongs to one target and follows you across pages. It survives a refresh because its state is stored locally.

1. **Start** with the play button on a target. The floating dock shows the target and elapsed time. Only one timer can run at a time.
2. **Pause / resume** keeps accumulated time. The dock and the target row both offer this control.
3. **Finish** logs the real elapsed time and marks the target complete.
4. **Log partial** saves the minutes but leaves the target open for later.

Sessions are rounded to whole minutes with a minimum of one minute. Finishing creates a real, editable session in History. Manually ticking a target's circle is different: it logs the target's **planned** minutes as a completion shortcut. Use the timer when you want honest elapsed time.

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
| Chapter coverage | Distinct chapters with a completed target, from subjects with a chapter list |
| Planned vs studied | Eight-week comparison of planned and logged minutes |
| Study consistency | 12-week daily heatmap; brighter means more minutes |

Science subjects include an NCTB-style chapter list. Custom Commerce and Arts subjects do not have a chapter list yet, so chapter coverage shows 0% for them — all other tracking still works. If a number looks wrong, correct the underlying session in History.

---

## 8. History

History is the ledger behind every statistic.

- **Filter** by text, date, subject, chapter, minimum minutes, and newest / longest sorting.
- **Edit** a session's date, start and end time, minutes, topic and completion percentage. Every insight recalculates immediately.
- **Delete** a session; Undo appears in the toast.
- **Export CSV** for spreadsheets. A full JSON backup is in Settings.

A session at **100%** marks its linked target complete. Lowering that percentage reopens the target and changes completion and coverage figures.

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

The **Install app** button is always visible in the top bar. If the browser offers its native install prompt, the button opens it. Otherwise the dialog gives exact steps:

- **Android / Chrome:** three-dot menu → **Install app** or **Add to Home Screen**.
- **iPhone / iPad / Safari:** **Share** → **Add to Home Screen**.
- **Desktop Chrome / Edge:** address-bar install icon, or menu → **Cast, save & share** → **Install page as app**.

This is a real PWA: manifest, standalone display, 192/512 PNG icons, shortcuts and a versioned service worker. It opens full-screen without a browser toolbar. If a browser only offers **Create shortcut**, use the address-bar install option or another browser.

### Offline

The app shell, icons, CSS and JavaScript are cached by a versioned service worker. Planning and logging work without a connection. Study data is local, and JSON export is how you move it between devices.

### Notifications

A static web app cannot reliably run in the background. Reminders are checked while the app is open; delivery after it is closed is not guaranteed.

---

## 11. Keyboard, touch and accessibility

| Shortcut | Action |
| --- | --- |
| `Ctrl/⌘ + K` | Open or close the command palette anywhere |
| `N` | Open quick entry when no field is being edited |
| `Enter` | Submit the current smart input line |
| `Esc` | Close the guide, palette, install dialog or setup |
| `Tab` / `Shift + Tab` | Move between controls; focus stays inside dialogs |

Accessibility details: descriptive button labels, polite announcements for smart-input previews, visible focus rings, enlarged phone touch targets, target actions that do not depend on hover, system Reduce Motion support for all animations and scrolls, and at least 4.5:1 contrast for small text.

---

## 12. FAQ and troubleshooting

**Why does Chrome only say "Create shortcut"?** Use the in-app Install button or the address-bar install icon. Some managed browsers hide full installation even for a valid PWA.

**Where did my old data go?** Version 1 plans and sessions were migrated into targets and sessions. The original record is kept in localStorage.

**Why is chapter coverage 0% for Commerce or Arts?** Only subjects with a chapter list can be counted. Study time, targets, streaks and insights still work.

**Can I use two devices?** Yes — export JSON on one and import it on the other. There is no automatic cloud sync.

**Why did completing a target add minutes I did not study?** Ticking the circle is a shortcut that logs the planned minutes. Use the timer for real time, or edit/delete the session in History.

**Can I move a target outside this week?** Yes — edit its day; navigate to that week on the planner board.

**Is anything sent online?** No. There is no account, tracking or server-side study data.

**Something still looks wrong.** Export a backup from Settings before trying anything destructive, then use the guide's search field with a single keyword such as `timer`, `backup` or `chapter`.

---

Live app: https://hsc-study-planner-nine.vercel.app · Deployment notes: [DEPLOYMENT.md](DEPLOYMENT.md) · Quality standard: [QUALITY_STANDARD.md](QUALITY_STANDARD.md)
