import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CalendarPlus, Clock3, Flame, Plus, Target, Timer, TrendingUp } from "lucide-react";
import type { AppData } from "../types";
import type { AppActions } from "../lib/appTypes";
import { DAY_NAMES, addDays, daysBetween, formatDuration, localDate, prettyDate, weekDates, weekStart } from "../lib/storage";
import { coverage, daySummary, isDone, loggedMinutes, progressOf, streakDays, weekSummary } from "../lib/selectors";
import { targetLabel } from "../data/subjects";
import { Card, EmptyState, Meter, ProgressRing, SectionTitle, TargetRow } from "../components/UI";

export default function Today({ data, actions }: { data: AppData; actions: AppActions }) {
  const today = localDate();
  const [dashboardWeek, setDashboardWeek] = useState(today);
  const [selectedWeekDay, setSelectedWeekDay] = useState(today);
  const dates = weekDates(weekStart(dashboardWeek));
  const summary = daySummary(today, data);
  const week = weekSummary(dates, data);
  const currentWeekSummary = weekSummary(weekDates(weekStart(today)), data);
  const selectedSummary = daySummary(selectedWeekDay, data);
  const selectedTargets = data.targets.filter(target => target.date === selectedWeekDay).sort((a, b) => Number(b.priority === "high") - Number(a.priority === "high"));
  const changeDashboardWeek = (offset: number) => {
    const nextStart = addDays(weekStart(dashboardWeek), offset * 7);
    setDashboardWeek(nextStart);
    setSelectedWeekDay(nextStart);
  };
  const showCurrentDashboardWeek = () => {
    setDashboardWeek(today);
    setSelectedWeekDay(today);
  };
  const targets = data.targets.filter(t => t.date === today).sort((a, b) => Number(b.priority === "high") - Number(a.priority === "high"));
  const streak = streakDays(data.sessions, today);
  const cov = coverage(data.settings, data);
  const examDays = data.settings.examDate ? daysBetween(today, data.settings.examDate) : null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";


  return (
    <div className="page today-page">
      <div className="today-head">
        <div>
          <span className="eyebrow">{prettyDate(today, { weekday: "long", day: "numeric", month: "long" })}</span>
          <h1>{greeting}{data.settings.subjects.length ? "" : ", future scholar"}.</h1>
          <p>{summary.count ? `${summary.progressPercent}% average progress across ${summary.count} target${summary.count === 1 ? "" : "s"} today.` : "A clear plan makes a calm mind. Start with today."}</p>
        </div>
        <div className="head-pills">
          {examDays !== null && <span className="countdown"><b>{examDays > 0 ? examDays : 0}</b> days to HSC</span>}
          <span className="streak-pill"><Flame size={16} /> {streak}-day streak</span>
        </div>
      </div>

      <Card className="hero-card">
        <div className="hero-left">
          <span className="eyebrow">TODAY AT A GLANCE</span>
          <h2>{summary.count ? `${summary.count} targets on your plate` : "No targets for today yet"}</h2>
          <p>{summary.loggedMinutes > 0
            ? `You have studied ${formatDuration(summary.loggedMinutes)} against a ${formatDuration(data.settings.dailyGoalMinutes)} daily goal.`
            : `Your daily goal is ${formatDuration(data.settings.dailyGoalMinutes)}. One session is enough to begin.`}</p>
          <div className="hero-stats">
            <div><Target size={17} /><span><b>{summary.done}/{summary.count}</b> complete</span></div>
            <div><Clock3 size={17} /><span><b>{formatDuration(summary.loggedMinutes)}</b> studied</span></div>
            <div><TrendingUp size={17} /><span><b>{cov.percent}%</b> syllabus covered</span></div>
          </div>
          <Meter value={summary.loggedMinutes} max={data.settings.dailyGoalMinutes} />
        </div>
        <ProgressRing value={summary.progressPercent} size={132} sub="average progress" />
      </Card>

      {currentWeekSummary.count === 0 && (
        <button className="setup-banner" onClick={() => actions.openStudyWizard("plan")}>
          <span className="banner-icon"><CalendarPlus size={22} /></span>
          <span><b>Your week is still open</b><small>Plan Saturday to Friday in one sitting — you can change anything, anytime.</small></span>
          <span className="banner-cta">Plan this week <ArrowRight size={16} /></span>
        </button>
      )}

      <div className="today-grid">
        <div className="today-main">
          <Card>
            <SectionTitle
              eyebrow="EXECUTE"
              title="Today's targets"
              detail="Tap the check to log; tap target details to adjust the plan."
              action={<button className="btn ghost" onClick={() => actions.go("planner")}>Open planner <ArrowRight size={15} /></button>}
            />
            {targets.length ? (
              <div className="target-list">
                {targets.map(t => <TargetRow key={t.id} target={t} data={data} actions={actions} onEdit={() => actions.openStudyWizard("plan", t.date, t.id)} />)}
              </div>
            ) : (
              <EmptyState icon={Target} title="Nothing planned for today" text="Add a target to schedule today's study." />
            )}
            <div className="inline-add">
              <button className="today-plan-cta" onClick={() => actions.openStudyWizard("plan", today)}>
                <span className="today-action-icon plan"><Plus size={20} /></span>
                <span className="today-action-copy"><b>Plan a session</b><small>Choose a day, subject, chapter and goal</small></span>
                <ArrowRight size={18} />
              </button>
            </div>
          </Card>

          <Card>
            <SectionTitle eyebrow="CAPTURE" title="Quick log" detail="For study outside your plan." />
            <button className="quick-log-cta" onClick={() => actions.openStudyWizard("log", today)}>
              <span className="today-action-icon log"><Clock3 size={19} /></span>
              <span className="today-action-copy"><b>Log study</b><small>Record time or chapter progress</small></span>
              <span className="quick-log-pill">QUICK LOG</span>
              <ArrowRight size={18} />
            </button>
          </Card>
        </div>

        <aside className="today-side">
          <Card className="weekly-dashboard-card">
            <SectionTitle eyebrow="WEEKLY DASHBOARD" title={weekStart(dashboardWeek) === weekStart(today) ? "Your week at a glance" : "Weekly overview"} detail={`${prettyDate(dates[0], { day: "numeric", month: "short" })} – ${prettyDate(dates[6], { day: "numeric", month: "short" })}`} action={<div className="dashboard-week-nav" aria-label="Choose dashboard week"><button className="icon-btn" onClick={() => changeDashboardWeek(-1)} aria-label="Previous week"><ArrowLeft size={15} /></button><button className="icon-btn" onClick={showCurrentDashboardWeek} aria-label="Current week" title="Current week"><CalendarPlus size={14} /></button><button className="icon-btn" onClick={() => changeDashboardWeek(1)} aria-label="Next week"><ArrowRight size={15} /></button></div>} />
            <div className="dashboard-week-stats">
              <div><b>{week.rate}%</b><span>complete</span></div>
              <div><b>{week.done}/{week.count}</b><span>targets done</span></div>
              <div><b>{formatDuration(week.loggedMinutes)}</b><span>study time</span></div>
            </div>
            <div className="week-strip week-strip-dashboard">
              {dates.map(date => {
                const s = daySummary(date, data);
                const isToday = date === today;
                const selected = date === selectedWeekDay;
                return (
                  <button key={date} className={`week-strip-day ${isToday ? "today" : ""} ${selected ? "selected" : ""}`} onClick={() => setSelectedWeekDay(date)} aria-pressed={selected} aria-label={`${DAY_NAMES[dates.indexOf(date)]}, ${prettyDate(date)}: ${s.done} of ${s.count} complete, ${s.progressPercent}% progress`} title="Select day details">
                    <small>{DAY_NAMES[dates.indexOf(date)]}</small>
                    <b>{new Date(`${date}T12:00:00`).getDate()}</b>
                    <i style={{ height: `${Math.max(4, s.progressPercent)}%` }} />
                    <span>{s.done}/{s.count}</span>
                    <em>{s.count ? `${s.progressPercent}%` : "—"}</em>
                  </button>
                );
              })}
            </div>
            <div className="dashboard-day-detail">
              <div className="dashboard-day-summary">
                <div><small>{selectedWeekDay === today ? "TODAY" : DAY_NAMES[dates.indexOf(selectedWeekDay)]}</small><b>{prettyDate(selectedWeekDay, { day: "numeric", month: "short" })}</b></div>
                <div><strong>{selectedSummary.done}/{selectedSummary.count}</strong><small>{formatDuration(selectedSummary.loggedMinutes)} studied · {selectedSummary.progressPercent}% average</small></div>
              </div>
              {selectedTargets.length ? <div className="dashboard-target-list">
                {selectedTargets.slice(0, 4).map(target => <button key={target.id} className="dashboard-target" onClick={() => actions.openStudyWizard("log", selectedWeekDay, target.id)}>
                  <span className={`dashboard-target-dot ${isDone(target, data.sessions) ? "done" : ""}`} />
                  <span><b>{targetLabel(target, data.settings)}</b><small>{isDone(target, data.sessions) ? "Complete" : `${progressOf(target, data.sessions)}% complete`} · {formatDuration(loggedMinutes(target, data.sessions))} logged</small></span>
                  <ArrowRight size={14} />
                </button>)}
                {selectedTargets.length > 4 && <small className="dashboard-more-targets">+{selectedTargets.length - 4} more targets · open planner to see all</small>}
              </div> : <p className="dashboard-empty">No targets planned for this day yet. Add one or log a study session.</p>}
              <div className="dashboard-day-actions">
                <button className="btn primary" onClick={() => actions.openStudyWizard("plan", selectedWeekDay)}><Plus size={14} /> Plan target</button>
                <button className="btn secondary" onClick={() => actions.openStudyWizard("log", selectedWeekDay)}><Clock3 size={14} /> Log study</button>
                <button className="btn ghost" onClick={() => actions.go("planner", selectedWeekDay)}>Planner <ArrowRight size={14} /></button>
              </div>
            </div>
          </Card>
          <Card className="side-note">
            <div><Timer size={19} /></div>
            <div><b>Timer tip</b><p>Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to plan, log or jump to a page.</p></div>
          </Card>
          <Card className="side-note guide-promo">
            <div><BookOpen size={19} /></div>
            <div><b>New here? Read the guide</b><p>From planning the whole week to reading your insights — every feature is explained step by step.</p>
              <button className="btn ghost guide-promo-btn" onClick={() => actions.openGuide("start")}>Open user guide <ArrowRight size={14} /></button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
