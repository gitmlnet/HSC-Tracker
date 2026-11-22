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
    intro: "Plan your Saturday–Friday week, then work through each day's targets in one place.",
    keywords: "welcome begin overview how it works introduction first time",
    blocks: [
      {
        kind: "steps",
        title: "The four moves",
        items: [
          { title: "Set your profile once", text: "Choose your group, subjects, exam date and a realistic daily goal. You can change all of it later in Settings." },
          { title: "Plan Saturday to Friday", text: "At the start of the week, open Quick Actions with Ctrl+K and choose Plan the week, or add targets from the weekday columns." },
          { title: "Work from Today", text: "Today shows your targets, daily goal, exam countdown and streak. Log a study session or start a timer on a target; finishing the timer records actual elapsed time." },
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
          { title: "Pick your subjects", text: "Tap a subject to add or remove it. Only chosen subjects appear in the planner, guided study flow and insights." },
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
          { title: "Saturday: decide the week", text: "Open Quick Actions with Ctrl+K and choose Plan the week, or add targets from the weekday columns. Review the seven days and adjust the schedule." },
          { title: "Sunday to Thursday: execute and adjust", text: "Work from Today. If something is harder than expected, change the minutes, move the target to another day, or add an extra target whenever you need to." },
          { title: "Friday: lighten and review", text: "Keep Friday manageable by planning only what fits. Use the weekly review to see what is unfinished." },
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
    keywords: "planner fast plan add target drag edit priority review revision board",
    blocks: [
      {
        kind: "steps",
        title: "Create a week",
        items: [
          { title: "Plan the week", text: "Open Quick Actions with Ctrl+K, choose Plan the week, then select dates, subjects, chapters and goals." },
          { title: "Plan one target", text: "Tap Add target beneath a weekday column. Choose one or more dates, a subject, chapter and a time or chapter-progress goal." }
        ]
      },
      {
        kind: "bullets",
        title: "Working inside a day",
        items: [
          "Tap a target (or its edit button) to adjust its date, subject, chapter and goal in the guided flow.",
          "Drag-and-drop can move a target to another day; its editor also lets you change the date.",
          "Time goals track planned and logged minutes. Chapter-progress goals track an overall cumulative chapter estimate and complete only at their saved milestone.",
          "Use the trash button to remove a target; Undo brings it back.",
          "The small bar shows planned minutes against your daily goal. Amber means the day is over capacity.",
          "Fast plan builds a day-by-day schedule from your selected subjects; adjust any target afterward using its edit control."
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
    title: "Guided planning",
    nav: "Planning & logging",
    group: "Planning",
    icon: "sparkles",
    page: "planner",
    intro: "Plan one day or a whole Saturday–Friday week. Select dates, a subject, a built-in chapter and either a time or cumulative chapter-progress goal.",
    keywords: "wizard guided plan week date subject chapter tap progress percentage cumulative log typing",
    blocks: [
      {
        kind: "steps",
        title: "Plan a target",
        items: [
          { title: "Choose the day", text: "Pick one date or expand Repeat this target on other days to select several dates in the same Saturday–Friday week." },
          { title: "Choose subject and chapter", text: "Tap a subject and then a built-in syllabus chapter. Custom topics are optional; subjects without a syllabus include General study and Past paper practice." },
          { title: "Choose a goal", text: "Time uses quick duration buttons and a slider. Chapter progress uses a percentage milestone that completes only when the overall chapter estimate reaches it." },
          { title: "Log progress", text: "Use Log study from Today or the target's circle. Select a chapter and record actual time or its new overall completion percentage." }
        ]
      },
      { kind: "note", tone: "tip", title: "Percentages are cumulative", text: "If a chapter is estimated at 45% and later 70%, its current progress is 70%, not 115%. Finishing a time target does not claim the chapter is complete, and time alone does not complete a progress target." },
      { kind: "text", text: "The command palette still supports page navigation (go planner) and guide topics (help timer). Drag-and-drop on the weekly board is optional; the guided flow is the primary way to plan." }
    ]
  },
  {
    id: "today",
    title: "Today: the execution screen",
    nav: "Today",
    group: "Daily study",
    icon: "target",
    page: "today",
    intro: "Today shows the day's targets, daily goal, week at a glance and study logging controls.",
    keywords: "today targets streak countdown progress week strip quick log checklist execute",
    blocks: [
      {
        kind: "steps",
        title: "Read the screen top to bottom",
        items: [
          { title: "Header", text: "The date, greeting, exam countdown and current streak. The streak counts consecutive days with at least one logged session." },
          { title: "Today at a glance", text: "Targets done, minutes studied against your daily goal, chapter coverage, a progress ring and a daily goal meter." },
          { title: "Today's targets", text: "High-priority targets come first. Use the circle to log study for a target, press play to start a focus timer, or open the target to adjust it in the planner." },
          { title: "Plan and Log study", text: "The guided flows use taps for dates, subjects, chapters, quick durations and progress goals. Custom topic names are optional; you can log study that was not already planned." },
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
          { title: "Finish", text: "Finish logs the time. A full timer finish completes a time-based target; minutes alone never complete a progress-based target. Sessions are rounded to whole minutes, with a minimum of one minute." },
          { title: "Log partial", text: "Use this when you stop early: the minutes are saved but the target stays open so you can continue later." }
        ]
      },
      { kind: "bullets", title: "Good to know", items: ["The timer keeps running while you move between Today, Planner, Insights and Settings.", "Finishing adds a real session to History, linked to the target.", "A target with a running timer is protected from deletion and week-clearing."] },
      { kind: "note", tone: "tip", title: "Logging and timing", text: "The target circle opens its logger for actual time or an absolute chapter estimate. The timer records elapsed minutes; it does not change chapter progress." }
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
          "Chapter coverage: distinct syllabus chapters with an explicit 100% overall chapter estimate, counted only from subjects with a chapter list. Completing a timed target or an intermediate progress milestone does not claim full chapter coverage. Science subjects include the NCTB-style chapter list; custom Commerce and Arts subjects do not have a chapter list yet.",
          "Planned vs studied: eight weeks of planned minutes beside actually studied minutes.",
          "Study consistency: a 12-week heatmap; brighter squares mean more minutes studied that day."
        ]
      },
      { kind: "note", tone: "info", title: "If a number looks wrong", text: "Check History. Sessions can be edited there — date, time, minutes, topic, target completion and absolute chapter percentage — and every insight updates immediately." }
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
          { title: "Edit", text: "Click a row or its pencil button. Change the date, start and end times, minutes, topic, target completion or the absolute chapter percentage (when present), then Save changes." },
          { title: "Delete", text: "The trash button removes a session and offers Undo in the toast." },
          { title: "Export", text: "Export CSV downloads the study log for spreadsheets or your own archive. A full JSON backup is in Settings." }
        ]
      },
      { kind: "note", tone: "warn", title: "Two percentages, two meanings", text: "Target completion controls whether a linked time target is done. Absolute chapter completion updates the chapter estimate; only 100% contributes full chapter coverage. Progress targets complete at their own cumulative goal." }
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
          { title: "Use the Install app button", text: "It is always visible in the top bar. When supported, the app captures the browser's native install prompt before React mounts and launches it directly." },
          { title: "Check browser readiness", text: "Without a native prompt, the dialog checks HTTPS, same-origin manifest scope, standalone display, actual 192/512 PNG icon files and the active service worker. Open the public URL in a supported full browser, not an embedded or private window." },
          { title: "Follow the platform installation flow", text: "Android/Chrome: menu → Install app. iPhone/iPad Safari: Share → Add to Home Screen. Desktop Chrome/Edge: address-bar install icon or menu → Install page as app. Do not use Create shortcut as a substitute." },
          { title: "Open the installed app", text: "After installation, it launches in its own app window and uses the same local data. iOS uses Apple's Add to Home Screen flow instead of beforeinstallprompt." }
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
          { code: "N", text: "Open quick actions when you are not typing in a field" },
          { code: "Enter", text: "Run a matching command or guide search in the palette" },
          { code: "Esc", text: "Close the guide, palette, install dialog or setup" },
          { code: "Tab / Shift + Tab", text: "Move through controls; focus stays inside an open dialog" },
          { code: "Sidebar button", text: "On desktop, collapse or expand the left icon rail. On phones, open the slide-in navigation drawer; Escape also closes it." }
        ]
      },
      {
        kind: "bullets",
        title: "Inclusive details",
        items: [
          "Every dialog traps focus while open and returns focus to its trigger when closed.",
          "Buttons have descriptive labels; smart-input previews are announced politely.",
          "Focus rings are visible, touch targets are enlarged on phones, and target actions do not depend on hover on touchscreens.",
          "The desktop sidebar can collapse to a remembered, labelled icon rail; the mobile drawer remains separately operable with backdrop and Escape.",
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
          "Does chapter progress finish a timed target? No. Time and progress targets use separate completion rules: chapter percentages do not complete timed targets, and logged minutes do not complete progress targets.",
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
