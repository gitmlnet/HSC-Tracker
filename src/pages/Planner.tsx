import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ClipboardCopy, Copy, Plus, Sparkles, Trash2, WandSparkles, Zap } from "lucide-react";
import type { AppData, Target } from "../types";
import type { AppActions } from "../lib/appTypes";
import type { PlanStyle } from "../lib/autoPlan";
import { DAY_NAMES, addDays, formatDuration, localDate, prettyDate, uid, weekDates, weekStart } from "../lib/storage";
import { buildWeek, copyWeek, STYLE_INFO } from "../lib/autoPlan";
import { daySummary, isDone, weekSummary } from "../lib/selectors";
import { Card, Meter, SectionTitle, TargetRow } from "../components/UI";

export default function Planner({ data, actions, anchor, setAnchor }: {
  data: AppData;
  actions: AppActions;
  anchor: string;
  setAnchor: (date: string) => void;
}) {
  const start = weekStart(anchor);
  const dates = useMemo(() => weekDates(start), [start]);
  const today = localDate();
  const week = weekSummary(dates, data);
  const [confirmClear, setConfirmClear] = useState(false);

  // A target with a live timer holds unsaved minutes; never remove it silently.
  const protectsTimer = (targets: Target[]) => {
    const activeId = actions.timer?.targetId;
    if (activeId && targets.some(t => t.id === activeId)) {
      actions.notify("Finish the active timer before changing that target");
      return true;
    }
    return false;
  };

  const replaceWeek = (targets: Target[], message: string, undoTargets?: Target[]) => {
    const previous = undoTargets || data.targets.filter(t => dates.includes(t.date));
    if (protectsTimer(previous)) return;
    actions.setData(prev => ({
      ...prev,
      targets: [...prev.targets.filter(t => !dates.includes(t.date)), ...targets]
    }));
    actions.notify(message, () => actions.setData(prev => ({
      ...prev,
      targets: [...prev.targets.filter(t => !dates.includes(t.date)), ...previous]
    })));
  };

  const applyStyle = (style: PlanStyle) => {
    const result = buildWeek(style, dates, data);
    replaceWeek(result.targets, `${STYLE_INFO[style].name} applied to this week`);
  };

  const addRevisionDay = () => {
    const quietest = dates.reduce((best, date) => daySummary(date, data).plannedMinutes < daySummary(best, data).plannedMinutes ? date : best, dates[6]);
    const additions = buildWeek("revision", [quietest], data, false).targets;
    actions.setData(prev => ({ ...prev, targets: [...prev.targets, ...additions] }));
    actions.notify(`Revision targets added to ${prettyDate(quietest)}`);
  };

  const copyPrevious = () => {
    const previous = copyWeek(addDays(start, -7), dates, data);
    if (!previous.length) { actions.notify("No targets found in the previous week"); return; }
    replaceWeek(previous, "Last week's plan copied");
  };

  const clearWeek = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    const previous = data.targets.filter(t => dates.includes(t.date));
    if (protectsTimer(previous)) { setConfirmClear(false); return; }
    actions.setData(prev => ({ ...prev, targets: prev.targets.filter(t => !dates.includes(t.date)) }));
    setConfirmClear(false);
    actions.notify("Week cleared", () => actions.setData(prev => ({ ...prev, targets: [...prev.targets, ...previous] })));
  };

  const carryForward = () => {
    const unfinished = data.targets.filter(t => dates.includes(t.date) && !isDone(t, data.sessions));
    if (!unfinished.length) { actions.notify("Nothing left to carry forward"); return; }
    const nextDates = weekDates(addDays(start, 7));
    const now = new Date().toISOString();
    const copies = unfinished.map((t, i) => ({
      ...t,
      id: uid(),
      date: nextDates[Math.min(6, dates.indexOf(t.date) + (i % 2))],
      source: "copy" as Target["source"],
      createdAt: now,
      updatedAt: now
    }));
    actions.setData(prev => ({ ...prev, targets: [...prev.targets, ...copies] }));
    actions.notify(`${copies.length} unfinished target${copies.length > 1 ? "s" : ""} moved to next week`);
  };


  const patchTarget = (id: string, patch: Partial<Target>) => {
    actions.setData(prev => ({
      ...prev,
      targets: prev.targets.map(t => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)
    }));
  };

  const removeTarget = (id: string) => {
    const target = data.targets.find(t => t.id === id);
    if (!target || protectsTimer([target])) return;
    actions.setData(prev => ({ ...prev, targets: prev.targets.filter(t => t.id !== id) }));
    actions.notify("Target removed", () => actions.setData(prev => ({ ...prev, targets: [...prev.targets, target] })));
  };

  const onDrop = (event: DragEvent<HTMLDivElement>, date: string) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    if (!id || !data.targets.some(t => t.id === id)) return;
    patchTarget(id, { date });
    actions.notify(`Target moved to ${prettyDate(date)}`);
  };

  return (
    <div className="page planner-page">
      <div className="planner-controls">
        <div className="week-nav" aria-label="Week navigation">
          <button className="icon-btn" onClick={() => setAnchor(addDays(start, -7))} aria-label="Previous week" title="Previous week"><ArrowLeft size={18} /></button>
          <button className={`icon-btn planner-current-week ${start === weekStart(today) ? "selected" : ""}`} onClick={() => setAnchor(today)} aria-label="Go to current week" title="Go to current week"><CalendarDays size={17} /></button>
          <button className="icon-btn" onClick={() => setAnchor(addDays(start, 7))} aria-label="Next week" title="Next week"><ArrowRight size={18} /></button>
        </div>
        <div className="week-toolbar">
          <button className="btn primary fast-plan-launch" onClick={() => actions.openFastPlan(dates[0])}><Zap size={16} /> Fast plan</button>
          <button className="btn secondary" onClick={() => actions.openStudyWizard("plan", dates[0])}><Plus size={16} /> Plan a target</button>
          <button className="btn secondary" onClick={copyPrevious}><Copy size={15} /> Copy last week</button>
          <button className="btn secondary" onClick={() => applyStyle("balanced")}><WandSparkles size={15} /> Auto-plan</button>
          <button className={`btn ghost danger ${confirmClear ? "confirm" : ""}`} onClick={clearWeek} onBlur={() => setConfirmClear(false)}>
            <Trash2 size={15} /> {confirmClear ? "Click again to clear" : "Clear week"}
          </button>
        </div>
      </div>

      <div className="planner-board">
        {dates.map((date, index) => {
          const s = daySummary(date, data);
          const isToday = date === today;
          const targets = data.targets.filter(t => t.date === date).sort((a, b) => Number(b.priority === "high") - Number(a.priority === "high"));
          return (
            <div
              key={date}
              className={`day-column ${isToday ? "is-today" : ""}`}
              onDragOver={e => e.preventDefault()}
              onDrop={e => onDrop(e, date)}
            >
              <div className="day-head">
                <div><small>{DAY_NAMES[index]}</small><b>{prettyDate(date)}</b>{isToday && <span className="today-tag">Today</span>}</div>
                <span className="day-count">{s.done}/{s.count}</span>
              </div>
              <Meter value={s.plannedMinutes} max={data.settings.dailyGoalMinutes} tone={s.plannedMinutes > data.settings.dailyGoalMinutes ? "warn" : "accent"} />
              <div className="day-capacity">{s.plannedMinutes ? `${formatDuration(s.plannedMinutes)} timed · ${formatDuration(data.settings.dailyGoalMinutes)} daily goal` : s.progressCount ? `${s.progressCount} chapter progress goal${s.progressCount === 1 ? "" : "s"}` : `No timed study planned`}</div>

              <div className="day-targets">
                {targets.map(target => (
                  <div key={target.id}>
                    <TargetRow
                      target={target}
                      data={data}
                      actions={actions}
                      compact
                      onEdit={() => actions.openStudyWizard("plan", target.date, target.id)}
                      onDelete={() => removeTarget(target.id)}
                      onDragStart={e => e.dataTransfer.setData("text/plain", target.id)}
                    />

                  </div>
                ))}
                {!targets.length && <div className="day-empty">No targets yet</div>}
              </div>

              <button className="day-add-button" onClick={() => actions.openStudyWizard("plan", date)} aria-label={`Add a target for ${DAY_NAMES[index]}, ${prettyDate(date)}`}><Plus size={15} /> Add target</button>
              {isToday && (
                <button className="day-jump" onClick={() => actions.go("today")}>Go to today <ArrowRight size={13} /></button>
              )}
            </div>
          );
        })}
      </div>

      <Card className="week-review">
        <SectionTitle eyebrow="WEEKLY REVIEW" title="How the week is going" detail="A quick check before you move on — unfinished targets can follow you into next week." />
        <div className="review-stats">
          <div><b>{week.rate}%</b><span>targets complete</span></div>
          <div><b>{week.done}</b><span>of {week.count} done</span></div>
          <div><b>{formatDuration(week.loggedMinutes)}</b><span>studied this week</span></div>
          <div><b>{week.pending}</b><span>still to finish</span></div>
        </div>
        <div className="review-days">
          {dates.map(date => {
            const s = daySummary(date, data);
            return <div key={date} className="review-day" title={`${prettyDate(date)} · ${s.done}/${s.count}`}><i style={{ height: `${s.count ? Math.max(8, s.done / s.count * 100) : 4}%` }} /><span>{DAY_NAMES[dates.indexOf(date)]}</span></div>;
          })}
        </div>
        <div className="review-actions">
          <button className="btn secondary" onClick={carryForward}><ClipboardCopy size={16} /> Carry unfinished to next week</button>
          <button className="btn ghost" onClick={addRevisionDay}><Sparkles size={16} /> Add a revision day</button>
          <span className="review-hint"><CheckCircle2 size={15} /> Change any target by clicking it — nothing is locked in.</span>
        </div>
      </Card>
    </div>
  );
}
