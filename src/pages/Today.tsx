import { ArrowRight, BookOpen, CalendarPlus, Clock3, Flame, Plus, Target, Timer, TrendingUp } from "lucide-react";
import type { AppData } from "../types";
import type { AppActions } from "../lib/appTypes";
import { DAY_NAMES, daysBetween, formatDuration, localDate, prettyDate, weekDates, weekStart } from "../lib/storage";
import { coverage, daySummary, streakDays, weekSummary } from "../lib/selectors";
import { Card, EmptyState, Meter, ProgressRing, SectionTitle, TargetRow } from "../components/UI";

export default function Today({ data, actions }: { data: AppData; actions: AppActions }) {
  const today = localDate();
  const dates = weekDates(weekStart(today));
  const summary = daySummary(today, data);
  const week = weekSummary(dates, data);
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
          <p>{summary.count ? `${summary.done} of ${summary.count} targets done today. Keep the rhythm.` : "A clear plan makes a calm mind. Start with today."}</p>
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
        <ProgressRing value={summary.count ? summary.done / summary.count * 100 : 0} size={132} sub="targets done" />
      </Card>

      {week.count === 0 && (
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
              detail="Tap a target to log actual time or update chapter progress."
              action={<button className="btn ghost" onClick={() => actions.go("planner")}>Open planner <ArrowRight size={15} /></button>}
            />
            {targets.length ? (
              <div className="target-list">
                {targets.map(t => <TargetRow key={t.id} target={t} data={data} actions={actions} onEdit={() => actions.openStudyWizard("plan", t.date, t.id)} />)}
              </div>
            ) : (
              <EmptyState icon={Target} title="Nothing planned for today" text="Choose a subject, chapter and goal—no typing required." />
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
          <Card>
            <SectionTitle eyebrow="THIS WEEK" title={`${week.done}/${week.count} targets`} detail={`${formatDuration(week.loggedMinutes)} studied so far`} />
            <div className="week-strip">
              {dates.map(date => {
                const s = daySummary(date, data);
                const isToday = date === today;
                return (
                  <button key={date} className={`week-strip-day ${isToday ? "today" : ""}`} onClick={() => actions.go("planner", date)} title={prettyDate(date)}>
                    <small>{DAY_NAMES[dates.indexOf(date)]}</small>
                    <b>{new Date(`${date}T12:00:00`).getDate()}</b>
                    <i style={{ height: Math.min(100, s.plannedMinutes ? s.loggedMinutes / s.plannedMinutes * 100 : 0) + "%" }} />
                    <span>{s.done}/{s.count}</span>
                  </button>
                );
              })}
            </div>
          </Card>
          <Card className="side-note">
            <div><Timer size={19} /></div>
            <div><b>Timer tip</b><p>Press <kbd>Ctrl</kbd> + <kbd>K</kbd> anywhere to plan, log or jump to a page without leaving your keyboard.</p></div>
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
