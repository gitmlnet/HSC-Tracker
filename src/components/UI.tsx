import type { DragEvent, ElementType, KeyboardEvent, ReactNode } from "react";
import { ArrowUpRight, Check, Circle, CornerDownLeft, Pause, Play, Square, Trash2, WandSparkles } from "lucide-react";
import type { AppData, Target } from "../types";
import type { AppActions } from "../lib/appTypes";
import { targetLabel } from "../data/subjects";
import { formatDuration, localDate } from "../lib/storage";
import { chapterProgressOf, isDone, loggedMinutes, progressOf, sessionsFor } from "../lib/selectors";
import { uncompleteTarget } from "../lib/targetActions";
import { parseSmartInput, type Draft } from "../lib/parser";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function SectionTitle({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressRing({ value, size = 104, label, sub }: { value: number; size?: number; label?: string; sub?: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} className="ring-track" />
        <circle cx={size / 2} cy={size / 2} r={radius} className="ring-value" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="ring-copy">
        <strong>{label ?? `${Math.round(value)}%`}</strong>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  );
}

export function Meter({ value, max, tone = "accent" }: { value: number; max: number; tone?: string }) {
  const percent = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0;
  return <div className={`meter tone-${tone}`}><i style={{ width: percent + "%" }} /></div>;
}

export function Pill({ children, tone = "" }: { children: ReactNode; tone?: string }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

export function EmptyState({ icon: Icon, title, text, action, onAction }: { icon: ElementType; title: string; text: string; action?: string; onAction?: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={22} /></div>
      <h4>{title}</h4>
      <p>{text}</p>
      {action && <button className="btn primary" onClick={onAction}>{action}</button>}
    </div>
  );
}

/** One-line natural-language input used on Today and in the weekly board. */
export function SmartInput({ settings, value, onChange, onSubmit, placeholder, defaultIntent = "plan", autoFocus = false }: {
  settings: AppData["settings"];
  value: string;
  onChange: (value: string) => void;
  onSubmit: (draft: Draft) => void;
  placeholder?: string;
  defaultIntent?: "plan" | "log";
  autoFocus?: boolean;
}) {
  const draft = parseSmartInput(value, settings, { defaultIntent });
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !draft) return;
    event.preventDefault();
    onSubmit(draft);
    onChange("");
  };
  return (
    <div className={`smart-input ${draft ? "has-draft" : ""}`}>
      <div className="smart-input-row">
        <WandSparkles size={17} />
        <input
          value={value}
          autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder || "e.g. Physics chapter 3, 45 min"}
          aria-label="Quick entry"
        />
        <button className="btn ghost send" disabled={!draft} onClick={() => { if (draft) { onSubmit(draft); onChange(""); } }} aria-label="Add entry">
          <CornerDownLeft size={16} />
        </button>
      </div>
      <div className={`smart-hint ${draft ? "valid" : ""}`} aria-live="polite">
        {draft ? (
          <>
            <Check size={13} /> {draft.intent === "log" ? "Log" : "Plan"}: {targetLabel({ ...draft, topic: draft.topic }, settings)}
            · {formatDuration(draft.minutes)} · {draft.date === localDate() ? "today" : draft.date}
          </>
        ) : "Type a subject and duration — pickers are optional."}
      </div>
    </div>
  );
}

export function TargetRow({ target, data, actions, onEdit, onDelete, onDragStart, compact = false }: {
  target: Target;
  data: AppData;
  actions: AppActions;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  compact?: boolean;
}) {
  const progress = progressOf(target, data.sessions);
  const done = isDone(target, data.sessions);
  const minutes = loggedMinutes(target, data.sessions);
  const timerHere = actions.timer?.targetId === target.id;
  const label = targetLabel(target, data.settings);

  const chapterProgress = chapterProgressOf(target, data.sessions);
  const toggle = () => {
    if (done && target.trackingMode !== "progress") {
      const progressBefore = sessionsFor(target, data.sessions).map(s => ({ id: s.id, progress: s.progress }));
      actions.setData(prev => uncompleteTarget(prev, target));
      actions.notify("Target reopened", () => actions.setData(prev => ({
        ...prev,
        sessions: prev.sessions.map(s => {
          const old = progressBefore.find(item => item.id === s.id);
          return old && old.progress !== s.progress ? { ...s, progress: old.progress } : s;
        })
      })));
      return;
    }
    actions.openStudyWizard("log", target.date, target.id);
  };

  return (
    <div
      className={`target-row ${done ? "done" : ""} ${timerHere ? "running" : ""} ${compact ? "compact" : ""}`}
      data-subject={target.subjectId}
      draggable={Boolean(onDragStart)}
      onDragStart={onDragStart}
      aria-label={label}
    >
      <button className={`check ${done ? "checked" : ""}`} onClick={toggle} aria-label={done && target.trackingMode !== "progress" ? `Reopen ${label}` : `Log study for ${label}`} title={done && target.trackingMode !== "progress" ? "Reopen target" : "Log study"}>
        {done ? <Check size={14} /> : <Circle size={15} />}
      </button>
      <div className="target-main" onClick={onEdit} role={onEdit ? "button" : undefined} tabIndex={onEdit ? 0 : undefined} onKeyDown={e => { if (onEdit && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onEdit(); } }}>
        <div className="target-name">
          <strong>{targetLabel(target, data.settings)}</strong>
          {target.priority === "high" && <span className="priority-dot" title="Priority" />}
        </div>
        <div className="target-meta">
          {target.trackingMode === "progress" ? <span className="progress-text">{chapterProgress}% chapter · goal {target.progressGoal ?? 100}%</span> : <span>{formatDuration(target.plannedMinutes)} time goal</span>}
          {target.trackingMode !== "progress" && chapterProgress > 0 && <span className="progress-text">· {chapterProgress}% chapter</span>}
          {minutes > 0 && <span className="logged">· {formatDuration(minutes)} logged</span>}
          {target.trackingMode !== "progress" && progress > 0 && !done && <span className="progress-text">· {progress}%</span>}
          {target.topic && !target.chapterId && <span className="topic">· {target.topic}</span>}
        </div>
      </div>
      <div className="target-actions">
        {timerHere ? (
          <>
            <button className="icon-btn" onClick={actions.pauseTimer} title="Pause timer" aria-label="Pause timer"><Pause size={15} /></button>
            <button className="icon-btn stop" onClick={() => actions.stopTimer("full")} title="Finish and log" aria-label="Finish and log"><Square size={14} /></button>
          </>
        ) : (
          <button className="icon-btn" onClick={() => actions.startTimer(target.id)} title="Start timer" aria-label="Start timer"><Play size={15} /></button>
        )}
        {onEdit && <button className="icon-btn" onClick={onEdit} title="Edit target" aria-label="Edit target"><ArrowUpRight size={15} /></button>}
        {onDelete && <button className="icon-btn danger" onClick={onDelete} title="Delete target" aria-label="Delete target"><Trash2 size={15} /></button>}
      </div>
    </div>
  );
}
