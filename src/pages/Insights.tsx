import { BarChart3, Clock3, Flame, Target } from "lucide-react";
import type { AppData } from "../types";
import { addDays, formatDuration, localDate, prettyDate, weekDates, weekStart } from "../lib/storage";
import { coverage, isDone, streakDays, weekSummary } from "../lib/selectors";
import { subjectName } from "../data/subjects";
import { Card, EmptyState, Meter, ProgressRing, SectionTitle } from "../components/UI";

export default function Insights({ data }: { data: AppData }) {
  const today = localDate();
  const total = data.sessions.reduce((n, s) => n + s.duration, 0);
  const completed = data.targets.filter(t => isDone(t, data.sessions)).length;
  const rate = data.targets.length ? Math.round(completed / data.targets.length * 100) : 0;
  const streak = streakDays(data.sessions, today);
  const cov = coverage(data.settings, data);
  const bySubject = data.settings.subjects.map(id => ({
    id,
    name: subjectName(id, data.settings),
    minutes: data.sessions.filter(s => s.subjectId === id).reduce((n, s) => n + s.duration, 0)
  })).filter(s => s.minutes > 0).sort((a, b) => b.minutes - a.minutes);
  const maxSubject = Math.max(1, ...bySubject.map(s => s.minutes));

  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = addDays(weekStart(today), (i - 7) * 7);
    const summary = weekSummary(weekDates(start), data);
    return { start, ...summary };
  });
  const maxWeek = Math.max(1, ...weeks.flatMap(w => [w.loggedMinutes, w.plannedMinutes]));

  const heatStart = addDays(today, -83);
  const heatDates = Array.from({ length: 84 }, (_, i) => addDays(heatStart, i));
  const minutesByDay = new Map<string, number>();
  for (const s of data.sessions) minutesByDay.set(s.date, (minutesByDay.get(s.date) || 0) + s.duration);
  const maxDay = Math.max(60, ...minutesByDay.values());

  return (
    <div className="page insights-page">
      <div className="page-head">
        <span className="eyebrow">INSIGHTS</span>
        <h1>What your effort is adding up to</h1>
        <p>Honest numbers from your own logs — no guesses, no artificial scores.</p>
      </div>

      <div className="metrics">
        <div className="metric"><Clock3 size={19} /><span>Total study</span><strong>{formatDuration(total)}</strong></div>
        <div className="metric"><BarChart3 size={19} /><span>Sessions logged</span><strong>{data.sessions.length}</strong></div>
        <div className="metric"><Target size={19} /><span>Target completion</span><strong>{rate}%</strong></div>
        <div className="metric"><Flame size={19} /><span>Current streak</span><strong>{streak} days</strong></div>
      </div>

      <div className="insights-grid">
        <Card>
          <SectionTitle eyebrow="SUBJECTS" title="Where your time goes" />
          {bySubject.length ? (
            <div className="bar-list">
              {bySubject.map(s => (
                <div className="bar-row" key={s.id}>
                  <span>{s.name}</span>
                  <Meter value={s.minutes} max={maxSubject} />
                  <b>{formatDuration(s.minutes)}</b>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={BarChart3} title="No study time yet" text="Your first logged session will show up here." />}
        </Card>

        <Card>
          <SectionTitle eyebrow="SYLLABUS" title="Chapter coverage" detail={`${cov.covered} of ${cov.total} chapters completed at least once`} />
          <div className="coverage-block">
            <ProgressRing value={cov.percent} size={116} sub="covered" />
            <div className="coverage-copy">
              <p>Completion means a chapter had a planned target that reached 100% and was logged. Chapters are counted from your chosen subjects only.</p>
              <Meter value={cov.covered} max={cov.total || 1} />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle eyebrow="8 WEEKS" title="Planned vs studied" detail="The pink bar is the plan; the solid bar is what you actually logged." />
        <div className="trend-chart">
          {weeks.map(w => (
            <div className="trend-week" key={w.start} title={`${prettyDate(w.start)} · planned ${formatDuration(w.plannedMinutes)} · studied ${formatDuration(w.loggedMinutes)}`}>
              <div className="trend-bars">
                <i className="planned" style={{ height: `${w.plannedMinutes / maxWeek * 100}%` }} />
                <i className="logged" style={{ height: `${w.loggedMinutes / maxWeek * 100}%` }} />
              </div>
              <span>{prettyDate(w.start, { day: "numeric", month: "numeric" })}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="LAST 12 WEEKS" title="Study consistency" detail="Each square is a day; brighter days mean more study time." />
        <div className="heatmap">
          {heatDates.map(date => {
            const minutes = minutesByDay.get(date) || 0;
            const level = minutes === 0 ? 0 : minutes < 30 ? 1 : minutes < 60 ? 2 : minutes < 120 ? 3 : 4;
            return <span key={date} className={`heat heat-${level}`} title={`${prettyDate(date)} · ${formatDuration(minutes)}`} />;
          })}
        </div>
      </Card>
    </div>
  );
}
