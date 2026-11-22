import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, Bell, BookOpen, CalendarRange, Command, Download, History as HistoryIcon, LayoutDashboard, Menu, PanelLeftClose, PanelLeftOpen, Settings as SettingsIcon, X } from "lucide-react";
import type { AppData } from "./types";
import type { Page, TimerState } from "./lib/appTypes";
import { emptyData, loadData, saveData, localDate, timeBefore, clockNow, weekStart, weekDates, reducedMotion } from "./lib/storage";
import { makeSession } from "./lib/targetActions";
import { weekSummary } from "./lib/selectors";
import TimerDock from "./components/TimerDock";
import CommandPalette from "./components/CommandPalette";
import InstallDialog from "./components/InstallDialog";
import GuideDialog from "./components/GuideDialog";
import { PAGE_GUIDE } from "./data/guide";
import { promptInstall, usePwaInstall } from "./lib/pwaInstall";
import StudyWizard from "./components/StudyWizard";
import FastPlan from "./components/FastPlan";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem("hsc-sidebar-collapsed") === "true"; } catch { return false; }
  });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [installInfoOpen, setInstallInfoOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideSection, setGuideSection] = useState("start");
  const [studyWizard, setStudyWizard] = useState<{ mode: "plan" | "log"; date: string; targetId?: string } | null>(null);
  const [fastPlanDate, setFastPlanDate] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const installState = usePwaInstall();
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

  const openGuide = useCallback((section?: string) => {
    setGuideSection(section || "start");
    setGuideOpen(true);
    setMenuOpen(false);
    setPaletteOpen(false);
  }, []);

  const openStudyWizard = useCallback((mode: "plan" | "log", date?: string, targetId?: string) => {
    setStudyWizard({ mode, date: date || (mode === "plan" ? weekStart(anchor) : localDate()), targetId });
    setMenuOpen(false);
    setPaletteOpen(false);
  }, [anchor]);

  const openFastPlan = useCallback((date?: string) => {
    setFastPlanDate(date || weekStart(anchor));
    setMenuOpen(false);
    setPaletteOpen(false);
  }, [anchor]);

  const go = useCallback((next: Page, date?: string) => {
    if (date) setAnchor(date);
    setPage(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
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
    const elapsedMs = timer.accumulatedMs + (timer.running ? Math.max(0, Date.now() - timer.startedAt) : 0);
    const duration = Math.floor(elapsedMs / 60000);
    if (!target) {
      notify("That target is no longer in the plan — no session was logged");
      setTimer(null);
      return;
    }
    if (duration < 1) {
      notify("Timer was under one minute — no study time was logged");
      setTimer(null);
      return;
    }
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
      ...(mode === "full" && target.trackingMode !== "progress" ? { progress: 100 } : {})
    });
    setData(prev => ({ ...prev, sessions: [...prev.sessions, session] }));
    notify(mode === "full" && target.trackingMode !== "progress" ? `${duration} min logged · target complete` : `${duration} min logged`);
    setTimer(null);
  }, [timer, data.targets, notify]);

  const actions = useMemo(() => ({
    setData, notify, timer, elapsedMs, startTimer, pauseTimer, stopTimer, go, openGuide, openStudyWizard, openFastPlan
  }), [notify, timer, elapsedMs, startTimer, pauseTimer, stopTimer, go, openGuide, openStudyWizard, openFastPlan]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement;
      const otherDialog = installInfoOpen || guideOpen || Boolean(studyWizard) || Boolean(fastPlanDate) || !data.settings.onboarded;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" && !otherDialog) {
        event.preventDefault();
        setPaletteOpen(v => !v);
      }
      if (!typing && !paletteOpen && !otherDialog && event.key.toLowerCase() === "n" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === "Escape") { setPaletteOpen(false); setGuideOpen(false); setMenuOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, installInfoOpen, guideOpen, studyWizard, fastPlanDate, data.settings.onboarded]);

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
    try { localStorage.setItem("hsc-sidebar-collapsed", String(sidebarCollapsed)); } catch { /* Keep the current layout for this session. */ }
  }, [sidebarCollapsed]);

  if (!ready) return <div className="boot"><div className="boot-logo">ST</div><b>Opening your planner…</b></div>;

  const currentLabel = NAV.find(([id]) => id === page)?.[1] || "Today";
  return (
    <div className="app-shell">
      {menuOpen && <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      <aside id="primary-sidebar" className={`sidebar${menuOpen ? " open" : ""}${sidebarCollapsed ? " collapsed" : ""}`} aria-label="Primary navigation">
        <div className="brand"><div className="brand-mark" aria-hidden="true"><span>ST</span></div><div className="brand-copy"><strong>HSC Study Planner</strong><small>Plan the week. Own the day.</small></div>
          <button className="icon-btn sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <nav>
          {NAV.map(([id, label, Icon]) => (
            <button key={id} className={page === id ? "active" : ""} onClick={() => go(id)} aria-label={label} title={sidebarCollapsed ? label : undefined} aria-current={page === id ? "page" : undefined}>
              <Icon size={18} aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="command-link" onClick={() => setPaletteOpen(true)} aria-label="Quick commands" title={sidebarCollapsed ? "Quick commands" : undefined}><Command size={15} aria-hidden="true" /><span className="command-text">Quick commands</span><kbd>Ctrl K</kbd></button>
          <button className="command-link guide-link" onClick={() => openGuide("start")} aria-label="User guide" title={sidebarCollapsed ? "User guide" : undefined}><BookOpen size={15} aria-hidden="true" /><span className="command-text">User guide</span><ArrowRight className="guide-arrow" size={14} /></button>
          <p>Built for one honest plan at a time.</p>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}><Menu size={20} /></button>
          <button className="icon-btn sidebar-toggle" onClick={() => setSidebarCollapsed(value => !value)} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-controls="primary-sidebar" aria-expanded={!sidebarCollapsed}>
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <div className="topbar-title"><span className="eyebrow">HSC STUDY PLANNER</span><h1>{currentLabel}</h1></div>
          <div className="topbar-actions">
            <button className="btn ghost guide-btn" onClick={() => openGuide(PAGE_GUIDE[page])} title={`${currentLabel} guide`} aria-label="Open user guide"><BookOpen size={16} /> <span>Guide</span></button>
            <button className="icon-btn" onClick={() => setPaletteOpen(true)} title="Quick commands" aria-label="Quick commands"><Command size={18} /></button>
            <button className="btn ghost install" onClick={() => {
              if (installState.prompt) void promptInstall();
              else setInstallInfoOpen(true);
            }} aria-label={installState.installed ? "App is installed" : "Install app"} title={installState.installed ? "App is installed" : undefined}><Download size={16} /> <span>{installState.installed ? "Installed" : "Install app"}</span></button>
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
      {paletteOpen && <CommandPalette actions={actions} onClose={() => setPaletteOpen(false)} />}
      {guideOpen && <GuideDialog initialSection={guideSection} actions={actions} onClose={() => setGuideOpen(false)} />}
      {installInfoOpen && <InstallDialog canInstall={Boolean(installState.prompt)} installed={installState.installed} onClose={() => setInstallInfoOpen(false)} onInstall={async () => {
        const result = await promptInstall();
        if (result === "accepted") setInstallInfoOpen(false);
      }} />}
      {studyWizard && <StudyWizard
        key={`${studyWizard.mode}:${studyWizard.targetId || "new"}:${studyWizard.date}`}
        data={data}
        actions={actions}
        mode={studyWizard.mode}
        initialDate={studyWizard.date}
        target={studyWizard.targetId ? data.targets.find(target => target.id === studyWizard.targetId) : undefined}
        onClose={() => setStudyWizard(null)}
      />}
      {fastPlanDate && <FastPlan data={data} actions={actions} initialDate={fastPlanDate} onClose={() => setFastPlanDate(null)} />}
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
