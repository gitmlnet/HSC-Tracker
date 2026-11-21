import type { Page } from "../lib/appTypes";

export type GuideBlock =
  | { kind: "text"; text: string }
  | { kind: "steps"; title?: string; items: { title: string; text: string }[] }
  | { kind: "bullets"; title?: string; items: string[] }
  | { kind: "examples"; title?: string; items: { code: string; text: string }[] }
  | { kind: "note"; tone: "tip" | "warn" | "info"; title?: string; text: string };

export type GuideSection = {
  id: string;
  title: string;
  nav: string;
  group: "Getting started" | "Planning" | "Daily study" | "Understanding" | "Device & data";
  icon: "compass" | "route" | "calendar" | "sparkles" | "target" | "timer" | "chart" | "history" | "settings" | "download" | "keyboard" | "help";
  page?: Page;
  intro: string;
  blocks: GuideBlock[];
  keywords: string;
};

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "start",
    title: "Start here: the whole method in four moves",
    nav: "Start here",
    group: "Getting started",
    icon: "compass",
    intro: "HSC Study Planner is built around one idea: decide the whole week once, then work from a calm, single screen every day. Nothing is locked — every target can be changed at any moment.",
    keywords: "welcome begin overview how it works introduction first time",
    blocks: [
      {
        kind: "steps",
        title: "The four moves",
        items: [
          { title: "Set your profile once", text: "Choose your group, subjects, exam date and a realistic daily goal. You can change all of it later in Settings." },
          { title: "Plan Saturday to Friday", text: "At the start of the week, open Weekly Planner and apply a template, auto-plan, copy last week, or add targets one by one. The whole week lives on one board." },
          { title: "Work from Today", text: "Today shows only what matters now: your targets, the daily goal, the exam countdown, your streak, and a one-line quick entry. Start a timer on a target and finish to log it." },
          { title: "Review and adjust", text: "Insights shows the honest numbers; History lets you correct any session. Unfinished targets can be carried into next week from the planner's weekly review." }
        ]
      },
      { kind: "note", tone: "tip", title: "The promise of this app", text: "A week is a plan, not a prison. Move a target, change its minutes, add something for today, or delete it — the plan serves you, not the reverse." },
      { kind: "text", text: "Use the headings on the left to learn any part in detail. Every section has a button that takes you straight to the screen it describes." }
    ]
  },
  {
    id: "setup",
    title: "First-time setup",
    nav: "Setup",
    group: "Getting started",
    icon: "settings",
    page: "settings",
    intro: "The first screen asks three short questions so the planner can suggest the right subjects and a sensible daily goal. It takes under a minute.",
    keywords: "setup first time group subjects exam goal skip",
    blocks: [
      {
        kind: "steps",
        title: "The three steps",
        items: [
          { title: "Choose your group", text: "Science, Commerce, or Arts & Humanities. This fills in the usual subjects for that group." },
          { title: "Pick your subjects", text: "Tap a subject to add or remove it. Only chosen subjects appear in plans, quick entry and insights." },
          { title: "Set the exam date and daily goal", text: "The date powers the countdown. The goal powers the daily progress meter and the capacity bar on each planner day. 150 minutes a day is a reasonable starting point." }
        ]
      },
      { kind: "note", tone: "info", title: "Skip for now", text: "You can skip setup and explore immediately. Defaults are applied; open Settings whenever you are ready to personalise them." },
      { kind: "text", text: "Changing your group in Settings replaces the subject list. You can still select any subject from any group." }
    ]
  },
  {
    id: "workflow",
    title: "The Saturday → Friday weekly method",
    nav: "Weekly method",
    group: "Planning",
    icon: "route",
    page: "planner",
    intro: "The planner week always begins on Saturday and ends on Friday, matching a typical HSC study week. Plan it at the start, then let Today execute it.",
    keywords: "weekly method saturday friday plan review carry forward rhythm",
    blocks: [
      {
        kind: "steps",
        title: "A good weekly rhythm",
        items: [
          { title: "Saturday: decide the week", text: "Pick a template or auto-plan, then scan the seven columns. Remove what is unrealistic and add what absolutely must happen." },
          { title: "Sunday to Thursday: execute and adjust", text: "Work from Today. If something is harder than expected, change the minutes, move the target to another day, or add an extra target whenever you need to." },
          { title: "Friday: lighten and review", text: "The planner automatically makes Friday lighter. Use the weekly review to see what is unfinished." },
          { title: "At the next week: carry forward", text: "Carry unfinished targets into next week so nothing quietly disappears. Their history stays in the original week." }
        ]
      },
      { kind: "note", tone: "tip", title: "Why one board?", text: "Scrolling between several screens breaks concentration. The seven days are visible together so a plan can be judged at a glance." }
    ]
  },
  {
    id: "weekly",
    title: "Weekly Planner: build and change the week",
    nav: "Weekly Planner",
    group: "Planning",
    icon: "calendar",
    page: "planner",
    intro: "This is the heart of the app: seven day columns, each with a capacity bar against your daily goal and a list of targets. Every target is editable.",
    keywords: "planner template auto plan copy clear drag edit priority review revision board",
    blocks: [
      {
        kind: "steps",
        title: "Create a week",
        items: [
          { title: "Start with a shape", text: "When the week is empty, choose Balanced week, Exam sprint, Revision week, or Light week. Auto-plan applies the balanced shape immediately." },
          { title: "Copy if you prefer continuity", text: "Copy last week duplicates the previous week's targets into the same weekdays with new IDs." },
          { title: "Build it yourself", text: "Dismiss the setup panel and type targets directly into any day's input line. Press Enter or the return-arrow button." },
          { title: "Clear and restart", text: "Clear week needs two clicks to protect against accidents. Undo is available in the toast for five seconds." }
        ]
      },
      {
        kind: "bullets",
        title: "Working inside a day",
        items: [
          "Click a target (or its arrow button) to edit minutes, topic, day and priority. Priority targets sort to the top and show a dot.",
          "Drag a target onto another day column to move it. The day dropdown in the editor does the same thing with a keyboard or on touch.",
          "Use the trash button to remove a target; Undo brings it back.",
          "The small bar shows planned minutes against your daily goal. Amber means the day is over capacity.",
          "The Friday column is deliberately lighter than the other days."
        ]
      },
      {
        kind: "note",
        tone: "warn",
        title: "Active timer protection",
        text: "You cannot delete a target, clear the week, replace the week, or clear the workspace while a timer is running on one of its targets. Finish the timer first so its minutes are never lost."
      },
      {
        kind: "steps",
        title: "Weekly review",
        items: [
          { title: "Read the numbers", text: "Completion rate, completed targets, studied time and pending targets summarise the week; the small day bars show where momentum existed." },
          { title: "Carry unfinished work forward", text: "Copies unfinished targets into next week. The originals stay where they are, so history remains truthful." },
          { title: "Add a revision day", text: "Finds the lightest day and adds short revision targets there." }
        ]
      }
    ]
  },
  {
    id: "quick-entry",
    title: "Quick entry: type one line, get a full target or session",
    nav: "Quick entry",
    group: "Planning",
    icon: "sparkles",
    page: "planner",
    intro: "The magic-wand input understands a subject, a chapter, a duration, an intent and a day from plain language. A live preview shows exactly what will be created before you press Enter.",
    keywords: "smart input parser alias chapter duration intent date examples type",
    blocks: [
      {
        kind: "examples",
        title: "Try these",
        items: [
          { code: "Physics ch 3 45m", text: "Plans a 45-minute Physics chapter 3 target" },
          { code: "log Chemistry organic 30 min", text: "Logs 30 minutes of study and links it to a matching target" },
          { code: "plan Math ch 4 1h tomorrow", text: "Plans an hour of mathematics for tomorrow" },
          { code: "Bio 1.5h Sunday", text: "Plans a 90-minute Biology target on Sunday" },
          { code: "go planner", text: "Jumps to the weekly planner (inside the command palette)" }
        ]
      },
      {
        kind: "bullets",
        title: "What the parser understands",
        items: [
          "Subjects by full name or short alias: phy, chem, bio, math / maths / higher math.",
          "Chapters by number (ch 3, chapter 3) or by a couple of recognisable name words.",
          "Paper hints: 1st / p1 / paper one, or 2nd / p2 / paper two. If no hint is given, the chapter is searched across papers.",
          "Durations: 45m, 45 min, 1h, 1.5h, 1h 30m. Values are capped at 8 hours and default to 45 minutes when omitted.",
          "Days: today, tomorrow, Saturday through Friday, or an exact YYYY-MM-DD date. A named weekday means the next occurrence from today.",
          "Intent: log / studied / did / spent creates a study session; plan / schedule / target creates a target. The input you are typing in sets the default when no prefix is used."
        ]
      },
      {
        kind: "note",
        tone: "tip",
        title: "One rule to remember",
        text: "If the preview line is green and shows the right intent, subject, duration and day, pressing Enter will do exactly that. If you change your mind, edit the text instead of cleaning up afterwards."
      },
      { kind: "text", text: "In Today there are two separate inputs: Add a target and Quick log. In a planner day column, the input plans by default but a log prefix creates a session on that day. The command palette accepts both plus page navigation." }
    ]
  },
  {
    id: "today",
    title: "Today: the execution screen",
    nav: "Today",
    group: "Daily study",
    icon: "target",
    page: "today",
    intro: "Today is the only screen you need while studying. It shows the day's targets, the daily goal, the week at a glance, and both quick entry lines in one place.",
    keywords: "today targets streak countdown progress week strip quick log checklist execute",
    blocks: [
      {
        kind: "steps",
        title: "Read the screen top to bottom",
        items: [
          { title: "Header", text: "The date, greeting, exam countdown and current streak. The streak counts consecutive days with at least one logged session." },
          { title: "Today at a glance", text: "Targets done, minutes studied against your daily goal, chapter coverage, a progress ring and a daily goal meter." },
          { title: "Today's targets", text: "High-priority targets come first. Tick the circle to mark a target complete — a session is logged automatically and Undo is offered. Press play to start a focus timer. Click the target text to open its editor in the planner." },
          { title: "Quick add and Quick log", text: "Add a target for today (or a named day) with one line, or log study that was not in the plan. Both use the same natural language parser." },
          { title: "This week strip", text: "Seven small day cards show done/total and a fill bar for studied versus planned minutes. Click any day to open that day in the planner." }
        ]
      },
      { kind: "note", tone: "info", title: "When the week is empty", text: "A banner invites you to plan the whole week. A week with targets but no plan yet does not block you from adding targets for today." }
    ]
  },
  {
    id: "timer",
    title: "The focus timer and logging minutes",
    nav: "Focus timer",
    group: "Daily study",
    icon: "timer",
    intro: "The timer is attached to a specific target. It follows you across pages, survives a refresh, and turns real elapsed time into a study session.",
    keywords: "focus pause resume finish partial minutes dock stopwatch session",
    blocks: [
      {
        kind: "steps",
        title: "Use it",
        items: [
          { title: "Start", text: "Press the play button on a target. The floating dock shows the target and elapsed time. Only one timer can run at a time." },
          { title: "Pause and resume", text: "Pause keeps the accumulated time; the pause button in the dock or on the target row becomes a resume button." },
          { title: "Finish", text: "Finish logs the time and marks the target complete. Sessions are rounded to whole minutes, with a minimum of one minute." },
          { title: "Log partial", text: "Use this when you stop early: the minutes are saved but the target stays open so you can continue later." }
        ]
      },
      { kind: "bullets", title: "Good to know", items: ["The timer keeps running while you move between Today, Planner, Insights and Settings.", "Finishing adds a real session to History, linked to the target.", "A target with a running timer is protected from deletion and week-clearing."] },
      { kind: "note", tone: "tip", title: "Ticking the circle is different", text: "Manually completing a target logs that target's planned minutes as a completion session. The timer logs the minutes you actually spent." }
    ]
  },
  {
    id: "insights",
    title: "Insights: read your progress honestly",
    nav: "Insights",
    group: "Understanding",
    icon: "chart",
    page: "insights",
    intro: "Every number here is calculated from your own targets and sessions. There are no invented scores or motivational guesses.",
    keywords: "stats chart heatmap coverage completion trend streak subject time analytics",
    blocks: [
      {
        kind: "bullets",
        title: "What each part means",
        items: [
          "Total study: sum of all logged session minutes.",
          "Sessions logged: number of individual study records, including quick logs and timer sessions.",
          "Target completion: percentage of all targets that reached 100%.",
          "Current streak: consecutive days ending today with at least one session.",
          "Where your time goes: minutes per subject, largest first.",
          "Chapter coverage: distinct chapters with a completed target, counted only from subjects with a chapter list. Science subjects include the NCTB-style chapter list; custom Commerce and Arts subjects do not have a chapter list yet, so they show 0% until chapter data is added. Their study time is still tracked everywhere else.",
          "Planned vs studied: eight weeks of planned minutes beside actually studied minutes.",
          "Study consistency: a 12-week heatmap; brighter squares mean more minutes studied that day."
        ]
      },
      { kind: "note", tone: "info", title: "If a number looks wrong", text: "Check History. Sessions can be edited there — date, time, minutes, topic and completion percentage — and every insight updates immediately." }
    ]
  },
  {
    id: "history",
    title: "History: correct and export your study log",
    nav: "History",
    group: "Understanding",
    icon: "history",
    page: "history",
    intro: "History is the ledger behind every statistic. Search it, fix a mistake, delete a record, or export everything as CSV.",
    keywords: "log filter search edit delete csv export session correction",
    blocks: [
      {
        kind: "steps",
        title: "Find and fix a session",
        items: [
          { title: "Filter", text: "Combine free-text search with date, subject, chapter, a minimum number of minutes, and newest/longest sorting." },
          { title: "Edit", text: "Click a row or its pencil button. Change the date, start and end times, minutes, topic, and completion percentage, then Save changes." },
          { title: "Delete", text: "The trash button removes a session and offers Undo in the toast." },
          { title: "Export", text: "Export CSV downloads the study log for spreadsheets or your own archive. A full JSON backup is in Settings." }
        ]
      },
      { kind: "note", tone: "warn", title: "Completion percentage matters", text: "A session at 100% marks its linked target complete. Lowering it in History reopens that target and changes coverage and completion statistics." }
    ]
  },
  {
    id: "settings",
    title: "Settings: profile, preferences and backup",
    nav: "Settings & data",
    group: "Device & data",
    icon: "settings",
    page: "settings",
    intro: "Settings controls what the planner recommends, how it looks, and how your data is protected.",
    keywords: "profile theme reminder backup restore export import clear privacy",
    blocks: [
      {
        kind: "bullets",
        title: "What lives here",
        items: [
          "Student group, exam date and daily study goal — change them whenever your situation changes.",
          "Subjects in your plan — tap chips to add or remove a subject.",
          "Theme — calm light or dark, applied instantly.",
          "Gentle reminders — a daily digest checked while the app is open. Browser permission is requested explicitly.",
          "Export backup (JSON), export study CSV, import backup, and clear workspace with two-click confirmation and Undo."
        ]
      },
      { kind: "note", tone: "warn", title: "Back up before you clear", text: "Clearing the workspace removes all local plans and sessions. Undo is available for five seconds, and an exported JSON backup is the durable safety net. Clearing browser/site data also removes the local database." },
      { kind: "text", text: "Restoring a backup replaces the current workspace; Undo is offered immediately afterwards. Backups are portable across devices because the app has no account or server." }
    ]
  },
  {
    id: "pwa",
    title: "Install the PWA and use it offline",
    nav: "Install & offline",
    group: "Device & data",
    icon: "download",
    intro: "This is a real installable web app, not a browser shortcut. Installing gives it an app icon, a full-screen window and an offline app shell.",
    keywords: "install offline service worker app shortcut home screen android ios desktop",
    blocks: [
      {
        kind: "steps",
        title: "Install",
        items: [
          { title: "Use the Install app button", text: "It is always visible in the top bar. If the browser supports the install prompt, the native dialog opens." },
          { title: "Follow the platform steps otherwise", text: "Android/Chrome: three-dot menu → Install app. iPhone/iPad Safari: Share → Add to Home Screen. Desktop Chrome/Edge: address-bar install icon or menu → Cast, save & share → Install page as app." },
          { title: "Open from the home screen", text: "The app launches full-screen, without the browser toolbar, and uses the same local data." }
        ]
      },
      { kind: "bullets", title: "Offline behaviour", items: ["The interface, icons, manifest, CSS and JavaScript are cached by a versioned service worker.", "All study data is stored on the device in IndexedDB, with a localStorage fallback.", "Planning and logging work with no connection; anything exported can be moved to another device manually."] },
      { kind: "note", tone: "info", title: "Why no notifications when closed?", text: "A static web app cannot reliably run in the background. Reminders are checked while the app is open; browsers may still show installed-app notifications, but delivery is not guaranteed." }
    ]
  },
  {
    id: "keyboard",
    title: "Keyboard, touch and accessibility",
    nav: "Keyboard & access",
    group: "Device & data",
    icon: "keyboard",
    intro: "The planner is designed to be usable quickly from a keyboard and comfortably on a phone or tablet.",
    keywords: "shortcuts ctrl command k escape tab accessibility focus touch reduced motion",
    blocks: [
      {
        kind: "examples",
        title: "Shortcuts",
        items: [
          { code: "Ctrl / ⌘ + K", text: "Open or close the command palette from anywhere" },
          { code: "N", text: "Open quick entry when you are not typing in a field" },
          { code: "Enter", text: "Submit the line you are typing in any smart input" },
          { code: "Esc", text: "Close the guide, palette, install dialog or setup" },
          { code: "Tab / Shift + Tab", text: "Move through controls; focus stays inside an open dialog" }
        ]
      },
      {
        kind: "bullets",
        title: "Inclusive details",
        items: [
          "Every dialog traps focus while open and returns focus to its trigger when closed.",
          "Buttons have descriptive labels; smart-input previews are announced politely.",
          "Focus rings are visible, touch targets are enlarged on phones, and target actions do not depend on hover on touchscreens.",
          "All motion respects the system Reduce Motion setting, including programmatic scrolling.",
          "Text and status colours meet at least 4.5:1 contrast on their backgrounds."
        ]
      }
    ]
  },
  {
    id: "faq",
    title: "FAQ and troubleshooting",
    nav: "FAQ & help",
    group: "Device & data",
    icon: "help",
    intro: "Quick answers to the questions that most often come up while planning or installing the app.",
    keywords: "questions troubleshooting shortcut data migration coverage sync notifications",
    blocks: [
      {
        kind: "bullets",
        title: "Common questions",
        items: [
          "Why does Chrome say Create shortcut? Use the in-app Install button or install from the address bar; the manifest and service worker are valid, but some managed browsers hide full installation.",
          "Where did my old data go? Version 1 plans and sessions were migrated automatically into targets and sessions. A copy of the original record is kept in localStorage.",
          "Why is chapter coverage 0% for Commerce or Arts? Only subjects with a chapter list can be counted. Time, targets, streaks and insights still work normally.",
          "Can I use it on two devices? Yes — export a JSON backup on one device and import it on the other. There is no automatic cloud sync.",
          "Why did a completion add minutes I did not study? Ticking the circle is a shortcut that logs the target's planned minutes. Use the timer for real elapsed time, or edit/delete the session in History.",
          "Can I move a target to a day outside this week? Yes, edit its day; the weekly board follows the week you are viewing.",
          "Is anything sent online? No. There is no account, tracking or server-side study data."
        ]
      },
      { kind: "note", tone: "tip", title: "Still stuck?", text: "Open Settings → Backup & safety and export a backup before trying anything destructive. Then use the guide search above for the word you are looking for." }
    ]
  }
];

export const PAGE_GUIDE: Record<Page, string> = {
  today: "today",
  planner: "weekly",
  insights: "insights",
  history: "history",
  settings: "settings"
};

export const findGuideSection = (id?: string | null) => GUIDE_SECTIONS.find(section => section.id === id);

export function guideSearch(query: string): GuideSection[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return GUIDE_SECTIONS;
  return GUIDE_SECTIONS.filter(section => {
    const haystack = [
      section.title, section.nav, section.group, section.intro, section.keywords,
      ...section.blocks.flatMap(block => {
        if (block.kind === "text") return [block.text];
        if (block.kind === "note") return [block.text, block.title || ""];
        if (block.kind === "examples") return [block.title || "", ...block.items.flatMap(item => [item.code, item.text])];
        if (block.kind === "bullets") return [block.title || "", ...block.items];
        return [block.title || "", ...block.items.flatMap(item => [item.title, item.text])];
      })
    ].join(" ").toLowerCase();
    return terms.every(term => haystack.includes(term));
  });
}
