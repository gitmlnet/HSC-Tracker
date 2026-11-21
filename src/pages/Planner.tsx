import { useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCopy, Copy, Layers3, Plus, RotateCcw, Sparkles, Trash2, WandSparkles } from "lucide-react";
import type { AppData, Target } from "../types";
import type { AppActions } from "../lib/appTypes";
import type { Draft } from "../lib/parser";
import type { PlanStyle } from "../lib/autoPlan";
import { DAY_NAMES, addDays, formatDuration, localDate, prettyDate, uid, weekDates, weekStart } from "../lib/storage";
import { buildWeek, copyWeek, STYLE_INFO } from "../lib/autoPlan";
import { daySummary, isDone, weekSummary } from "../lib/selectors";
import { Card, Meter, SectionTitle, SmartInput, TargetRow } from "../components/UI";

const STYLES: PlanStyle[] = ["balanced", "exam", "revision", "light"];

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
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dismissedSetup, setDismissedSetup] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => { setDismissedSetup(false); setEditingId(null); }, [start]);

  const showSetup = week.count === 0 && !dismissedSetup;

  const replaceWeek = (targets: Target[], message: string, undoTargets?: Target[]) => {
    const previous = undoTargets || data.targets.filter(t => dates.includes(t.date));
    actions.setData(prev => ({
      ...prev,
      targets: [...prev.targets.filter(t => !dates.includes(t.date)), ...targets]
    }));
    setDismissedSetup(true);
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
    setDismissedSetup(true);
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

  const addTarget = (date: string, draft: Draft) => {
    const now = new Date().toISOString();
    const target: Target = {
      id: uid(),
      date,
      subjectId: draft.subjectId,
      paperId: draft.paperId,
      chapterId: draft.chapterId,
      topic: draft.topic,
      plannedMinutes: draft.minutes,
      priority: "normal",
      source: "manual",
      createdAt: now,
      updatedAt: now
    };
    actions.setData(prev => ({ ...prev, targets: [...prev.targets, target] }));
    setDismissedSetup(true);
    actions.notify("Target added to the week", () => actions.setData(prev => ({ ...prev, targets: prev.targets.filter(t => t.id !== target.id) })));
  };

  const patchTarget = (id: string, patch: Partial<Target>) => {
    actions.setData(prev => ({
      ...prev,
      targets: prev.targets.map(t => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)
    }));
  };

  const removeTarget = (id: string) => {
    const target = data.targets.find(t => t.id === id);
    if (!target) return;
    actions.setData(prev => ({ ...prev, targets: prev.targets.filter(t => t.id !== id) }));
    setEditingId(null);
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
      <div className="planner-head">
        <div>
          <span className="eyebrow">WEEKLY PLANNER</span>
          <h1>Plan once. Follow it all week.</h1>
          <p>Saturday to Friday, in one board. Add, move or change any target whenever you need to.</p>
        </div>
        <div className="week-nav">
          <button className="icon-btn" onClick={() => setAnchor(addDays(start, -7))} aria-label="Previous week"><ArrowLeft size={18} /></button>
          <button className={`btn secondary ${start === weekStart(today) ? "selected" : ""}`} onClick={() => setAnchor(today)}>This week</button>
          <button className="icon-btn" onClick={() => setAnchor(addDays(start, 7))} aria-label="Next week"><ArrowRight size={18} /></button>
        </div>
      </div>

      <Card className="week-summary-card">
        <div className="week-range">
          <span className="eyebrow">{prettyDate(dates[0])} — {prettyDate(dates[6])}</span>
          <h2>{week.count ? `${week.count} targets planned` : "An open week"}</h2>
          <p>{week.count ? `${week.done} completed · ${formatDuration(week.plannedMinutes)} planned · ${formatDuration(week.loggedMinutes)} studied` : "Choose a starting point below or build the week target by target."}</p>
        </div>
        <div className="week-toolbar">
          <button className="btn secondary" onClick={copyPrevious}><Copy size={15} /> Copy last week</button>
          <button className="btn secondary" onClick={() => applyStyle("balanced")}><WandSparkles size={15} /> Auto-plan</button>
          <button className={`btn ghost danger ${confirmClear ? "confirm" : ""}`} onClick={clearWeek} onBlur={() => setConfirmClear(false)}>
            <Trash2 size={15} /> {confirmClear ? "Click again to clear" : "Clear week"}
          </button>
        </div>
      </Card>

      {showSetup && (
        <Card className="setup-panel">
          <SectionTitle eyebrow="WEEK SETUP" title="How do you want this week to look?" detail="Everything below is editable after you apply it." />
          <div className="template-grid">
            {STYLES.map(style => (
              <button key={style} className="template" onClick={() => applyStyle(style)}>
                <span className="template-icon"><Layers3 size={19} /></span>
                <b>{STYLE_INFO[style].name}</b>
                <small>{STYLE_INFO[style].detail}</small>
                <span className="template-apply">Use template <ArrowRight size={14} /></span>
              </button>
            ))}
          </div>
          <button className="btn ghost" onClick={() => setDismissedSetup(true)}>Start with a blank week</button>
        </Card>
      )}

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
              <div className="day-capacity">{formatDuration(s.plannedMinutes)} of {formatDuration(data.settings.dailyGoalMinutes)} goal</div>

              <div className="day-targets">
                {targets.map(target => (
                  <div key={target.id}>
                    <TargetRow
                      target={target}
                      data={data}
                      actions={actions}
                      compact
                      onEdit={() => setEditingId(editingId === target.id ? null : target.id)}
                      onDelete={() => removeTarget(target.id)}
                      onDragStart={e => e.dataTransfer.setData("text/plain", target.id)}
                    />
                    {editingId === target.id && (
                      <div className="target-editor">
                        <label>Minutes<input type="number" min="5" max="480" step="5" value={target.plannedMinutes} onChange={e => patchTarget(target.id, { plannedMinutes: Math.max(5, Number(e.target.value) || 5) })} /></label>
                        <label>Topic<input value={target.topic} placeholder="Optional detail" onChange={e => patchTarget(target.id, { topic: e.target.value })} /></label>
                        <label>Day<select value={target.date} onChange={e => patchTarget(target.id, { date: e.target.value })}>{dates.map(d => <option key={d} value={d}>{DAY_NAMES[dates.indexOf(d)]}, {prettyDate(d)}</option>)}</select></label>
                        <label className="editor-check"><input type="checkbox" checked={target.priority === "high"} onChange={e => patchTarget(target.id, { priority: e.target.checked ? "high" : "normal" })} /> Priority target</label>
                      </div>
                    )}
                  </div>
                ))}
                {!targets.length && <div className="day-empty">No targets yet</div>}
              </div>

              <div className="day-add">
                <SmartInput
                  settings={data.settings}
                  value={texts[date] || ""}
                  onChange={value => setTexts(prev => ({ ...prev, [date]: value }))}
                  onSubmit={draft => addTarget(date, draft)}
                  placeholder="+ type a target…"
                />
              </div>
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
