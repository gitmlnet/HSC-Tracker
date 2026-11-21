import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Bell, CalendarRange, Command, History as HistoryIcon, LayoutDashboard, Menu, Plus, Settings as SettingsIcon, X } from "lucide-react";
import type { AppData } from "./types";
import type { Page, TimerState } from "./lib/appTypes";
import { emptyData, loadData, saveData, localDate, timeBefore, clockNow, weekStart, weekDates } from "./lib/storage";
import { makeSession } from "./lib/targetActions";
import { weekSummary } from "./lib/selectors";
import TimerDock from "./components/TimerDock";
import CommandPalette from "./components/CommandPalette";
import Today from "./pages/Today";
import Planner from "./pages/Planner";
import Insights from "./pages/Insights";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";
import Setup from "./pages/Setup";

const NAV: [Page, string, typeof LayoutDashboard][] = [
  ["today", "Today", LayoutDashboard],
  ["planner", "Weekly Planner", CalendarRange],
  ["insights", "Insights", BarChart3],
  ["history", "History", HistoryIcon],
  ["settings", "Settings", SettingsIcon]
];

type Toast = { message: string; undo?: () => void };
const TIMER_KEY = "hsc-planner-timer";

export default function App() {
  const [data, setData] = useState<AppData>(emptyData);
  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash.slice(1);
    return NAV.some(([id]) => id === hash) ? hash as Page : "today";
  });
  const [anchor, setAnchor] = useState(localDate());
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [now, setNow] = useState(Date.now());
  const [timer, setTimer] = useState<TimerState | null>(() => {
    try { const raw = localStorage.getItem(TIMER_KEY); return raw ? JSON.parse(raw) as TimerState : null; } catch { return null; }
  });

  useEffect(() => {
    loadData().then(d => { setData(d); document.documentElement.dataset.theme = d.settings.theme; }).finally(() => setReady(true));
  }, []);

  useEffect(() => { if (ready) saveData(data).catch(() => undefined); }, [data, ready]);
  useEffect(() => { document.documentElement.dataset.theme = data.settings.theme; }, [data.settings.theme]);
  useEffect(() => { window.history.replaceState(null, "", `#${page}`); }, [page]);
  useEffect(() => {
    try { timer ? localStorage.setItem(TIMER_KEY, JSON.stringify(timer)) : localStorage.removeItem(TIMER_KEY); } catch { /* ignore */ }
  }, [timer]);
  useEffect(() => {
    if (!timer?.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [timer?.running]);

  const notify = useCallback((message: string, undo?: () => void) => setToast({ message, undo }), []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const go = useCallback((next: Page, date?: string) => {
    if (date) setAnchor(date);
    setPage(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const elapsedMs = timer ? timer.accumulatedMs + (timer.running ? Math.max(0, now - timer.startedAt) : 0) : 0;

  const startTimer = useCallback((targetId: string) => {
    if (timer && timer.targetId !== targetId) { notify("Finish or pause the current timer first"); return; }
    setTimer(prev => prev ? { ...prev, running: true, startedAt: Date.now() } : {
      targetId, startedAt: Date.now(), accumulatedMs: 0, running: true, createdAt: Date.now()
    });
    setNow(Date.now());
  }, [timer, notify]);

  const pauseTimer = useCallback(() => {
    setTimer(prev => prev && prev.running
      ? { ...prev, accumulatedMs: prev.accumulatedMs + Math.max(0, Date.now() - prev.startedAt), running: false }
      : prev);
  }, []);

  const stopTimer = useCallback((mode: "full" | "partial") => {
    if (!timer) return;
    const target = data.targets.find(t => t.id === timer.targetId);
    const duration = Math.max(1, Math.round((timer.accumulatedMs + (timer.running ? Math.max(0, Date.now() - timer.startedAt) : 0)) / 60000));
    if (target) {
      const session = makeSession({
        targetId: target.id,
        date: localDate(),
        subjectId: target.subjectId,
        paperId: target.paperId,
        chapterId: target.chapterId,
        topic: target.topic,
        start: timeBefore(duration),
        end: clockNow(),
        duration,
        ...(mode === "full" ? { progress: 100 } : {})
      });
      setData(prev => ({ ...prev, sessions: [...prev.sessions, session] }));
      notify(mode === "full" ? `${duration} min logged · target complete` : `${duration} min logged`);
    }
    setTimer(null);
  }, [timer, data.targets, notify]);

  const actions = useMemo(() => ({
    setData, notify, timer, elapsedMs, startTimer, pauseTimer, stopTimer, go
  }), [notify, timer, elapsedMs, startTimer, pauseTimer, stopTimer, go]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(v => !v);
      }
      if (!typing && event.key.toLowerCase() === "n" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!ready || !data.settings.reminders.enabled) return;
    const check = () => {
      const today = localDate();
      const key = `hsc-digest-${today}`;
      if (sessionStorage.getItem(key) || !("Notification" in window) || Notification.permission !== "granted") return;
      if (clockNow() < data.settings.reminders.dailyDigest) return;
      sessionStorage.setItem(key, "1");
      const week = weekSummary(weekDates(weekStart(today)), data);
      new Notification("HSC Planner · today's focus", {
        body: week.pending ? `${week.pending} target${week.pending > 1 ? "s" : ""} still waiting this week. Open your planner to refocus.` : "Your weekly targets are complete. Nice work."
      });
    };
    check();
    const id = window.setInterval(check, 60000);
    return () => window.clearInterval(id);
  }, [ready, data.settings.reminders, data]);

  useEffect(() => {
    const onPrompt = (event: Event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!ready) return <div className="boot"><div className="boot-logo">ST</div><b>Opening your planner…</b></div>;

  const currentLabel = NAV.find(([id]) => id === page)?.[1] || "Today";
  return (
    <div className="app-shell">
      {menuOpen && <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand"><div className="brand-mark"><span>ST</span></div><div><strong>HSC Study Planner</strong><small>Plan the week. Own the day.</small></div>
          <button className="icon-btn sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <nav>
          {NAV.map(([id, label, Icon]) => (
            <button key={id} className={page === id ? "active" : ""} onClick={() => go(id)} aria-current={page === id ? "page" : undefined}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="command-link" onClick={() => setPaletteOpen(true)}><Command size={15} /> Quick commands <kbd>Ctrl K</kbd></button>
          <p>Built for one honest plan at a time.</p>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(v => !v)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="topbar-title"><span className="eyebrow">HSC STUDY PLANNER</span><h1>{currentLabel}</h1></div>
          <div className="topbar-actions">
            <button className="icon-btn" onClick={() => setPaletteOpen(true)} title="Quick commands" aria-label="Quick commands"><Command size={18} /></button>
            {installPrompt && <button className="btn ghost install" onClick={async () => {
              const event = installPrompt as Event & { prompt?: () => Promise<void> };
              await event.prompt?.();
              setInstallPrompt(null);
            }}><Plus size={16} /> Install</button>}
            <button className="btn primary" onClick={() => go("planner")}><CalendarRange size={17} /> <span>Plan week</span></button>
          </div>
        </header>

        <main>
          {page === "today" && <Today data={data} actions={actions} />}
          {page === "planner" && <Planner data={data} actions={actions} anchor={anchor} setAnchor={setAnchor} />}
          {page === "insights" && <Insights data={data} />}
          {page === "history" && <HistoryPage data={data} actions={actions} />}
          {page === "settings" && <SettingsPage data={data} actions={actions} />}
        </main>
      </div>

      {!data.settings.onboarded && <Setup data={data} actions={actions} />}
      {paletteOpen && <CommandPalette data={data} actions={actions} onClose={() => setPaletteOpen(false)} />}
      <TimerDock data={data} actions={actions} />
      {toast && (
        <div className="toast" role="status">
          <Bell size={16} /><span>{toast.message}</span>
          {toast.undo && <button onClick={() => { toast.undo?.(); setToast(null); }}>Undo</button>}
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}
