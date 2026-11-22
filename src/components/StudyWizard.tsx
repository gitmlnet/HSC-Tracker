import { useMemo, useRef, useState } from "react";
import { BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Percent, Plus, Sparkles, Star, Trash2, X } from "lucide-react";
import type { AppData, Target, TrackingMode } from "../types";
import type { AppActions } from "../lib/appTypes";
import { subjectOptions, targetLabel } from "../data/subjects";
import { chapterProgressOf, sessionsFor } from "../lib/selectors";
import { addDays, clockNow, formatDuration, localDate, prettyDate, timeBefore, uid, weekDates, weekStart } from "../lib/storage";
import { makeSession } from "../lib/targetActions";
import { useDialogFocus } from "../lib/dialogFocus";

type Step = 0 | 1 | 2 | 3;
type QuickChoice = { chapterId: string; paperId: string; topic: string };

export default function StudyWizard({
  data, actions, mode, initialDate, target, onClose
}: {
  data: AppData;
  actions: AppActions;
  mode: "plan" | "log";
  initialDate: string;
  target?: Target;
  onClose: () => void;
}) {
  const subjectList = useMemo(() => subjectOptions(data.settings), [data.settings]);
  const initialSubject = target?.subjectId || subjectList[0]?.id || "";
  const initialSubjectOption = subjectList.find(subject => subject.id === initialSubject);
  const initialPaper = target?.paperId || initialSubjectOption?.papers[0]?.id || "";
  const existingLoggedMinutes = mode === "log" && target
    ? sessionsFor(target, data.sessions).reduce((sum, session) => sum + session.duration, 0)
    : 0;
  const [step, setStep] = useState<Step>(target && mode === "log" ? 3 : 0);
  const [date, setDate] = useState(target?.date || initialDate);
  const [subjectId, setSubjectId] = useState(initialSubject);
  const [paperId, setPaperId] = useState(initialPaper);
  const [chapterId, setChapterId] = useState(target?.chapterId || "");
  const [topic, setTopic] = useState(target?.topic || "");
  const [showCustom, setShowCustom] = useState(Boolean(target?.topic && !target?.chapterId));
  const [repeatDates, setRepeatDates] = useState<string[]>([]);
  const [repeatOpen, setRepeatOpen] = useState(false);
  const [trackingMode, setTrackingMode] = useState<TrackingMode>(target?.trackingMode || "time");
  const [priority, setPriority] = useState<Target["priority"]>(target?.priority || "normal");
  const [minutes, setMinutes] = useState(() => {
    if (mode !== "log") return target?.plannedMinutes || 60;
    if (existingLoggedMinutes > 0) return existingLoggedMinutes;
    return Math.min(60, Math.max(15, target?.plannedMinutes || 30));
  });
  const [progressGoal, setProgressGoal] = useState(() => target && mode === "log"
    ? chapterProgressOf(target, data.sessions)
    : mode === "log" ? 0 : target?.progressGoal || 25);
  const [quickKind, setQuickKind] = useState<TrackingMode>(target?.trackingMode || "time");
  const [secondaryEnabled, setSecondaryEnabled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [customInput, setCustomInput] = useState(target?.topic || "");
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, onClose);

  const subject = subjectList.find(item => item.id === subjectId);
  const papers = subject?.papers || [];
  const paper = papers.find(item => item.id === paperId) || papers[0];
  const chapters = paper?.chapters || [];
  const selectedChapter = chapters.find(item => item.id === chapterId);
  const currentChapterProgress = chapterProgressOf({ subjectId, paperId, chapterId, topic, progressStart: target?.progressStart }, data.sessions);
  const activeMode = mode === "log" ? target?.trackingMode || quickKind : trackingMode;
  const secondaryMode: TrackingMode = activeMode === "time" ? "progress" : "time";
  const recordsTime = activeMode === "time" || (mode === "log" && secondaryEnabled && secondaryMode === "time");
  const recordsProgress = activeMode === "progress" || (mode === "log" && secondaryEnabled && secondaryMode === "progress");
  const isEdit = mode === "plan" && Boolean(target);
  const hasLoggedTarget = Boolean(target && sessionsFor(target, data.sessions).length);
  const steps = mode === "log" && target ? [3] as Step[] : hasLoggedTarget ? [0, 3] as Step[] : [0, 1, 2, 3] as Step[];
  const stepIndex = steps.indexOf(step);
  const week = weekDates(weekStart(date));
  const dates = mode === "plan" ? week : [date];
  const chosenDates = [...new Set([date, ...repeatDates])].sort();
  const activeChapterLabel = selectedChapter?.name || topic || "General study";
  const title = mode === "log" ? (target ? "Log this target" : "Log study") : isEdit ? "Adjust this target" : "Plan a study target";

  const chooseSubject = (id: string) => {
    const selected = subjectList.find(item => item.id === id);
    setSubjectId(id);
    setPaperId(selected?.papers[0]?.id || "");
    setChapterId("");
    setTopic("");
    setShowCustom(false);
    setError("");
    if (!hasLoggedTarget) setStep(2);
  };

  const chooseChapter = (choice: QuickChoice) => {
    setChapterId(choice.chapterId);
    setPaperId(choice.paperId);
    setTopic(choice.topic);
    setShowCustom(false);
    setError("");
    if (mode === "log") setStep(3);
    else setStep(3);
    const current = chapterProgressOf({ subjectId, ...choice, progressStart: target?.progressStart }, data.sessions);
    setProgressGoal(mode === "log" ? current : Math.min(100, Math.max(current + 5, target?.progressGoal || current + 25)));
  };

  const selectCustomTopic = () => {
    setChapterId("");
    setPaperId(paperId || "");
    setTopic("");
    setShowCustom(true);
    setCustomInput("");
    setError("");
  };

  const toggleRepeat = (day: string) => {
    setRepeatDates(current => current.includes(day) ? current.filter(item => item !== day) : [...current, day]);
  };

  const goBack = () => {
    if (saved) { setSaved(false); setStep(0); return; }
    const previous = steps[Math.max(0, stepIndex - 1)];
    setStep(previous);
    setError("");
  };

  const save = () => {
    if (!subjectId) { setError("Choose a subject to continue."); setStep(1); return; }
    let resolvedChapterId = chapterId;
    let resolvedTopic = topic;
    if (showCustom) {
      resolvedTopic = customInput.trim();
      if (!resolvedTopic) { setError("Enter a short name for this custom topic, or choose a built-in topic."); return; }
      resolvedChapterId = "";
    }
    if (mode === "plan" && trackingMode === "progress" && progressGoal <= currentChapterProgress) {
      setError(currentChapterProgress >= 100
        ? "This chapter is already at 100%. Choose Time, or adjust its progress in a log."
        : `Choose a milestone above the current ${currentChapterProgress}% chapter estimate.`);
      return;
    }
    const now = new Date().toISOString();
    if (mode === "plan") {
      const newTarget = (targetDate: string): Target => ({
        id: target?.id || uid(),
        date: targetDate,
        subjectId,
        paperId,
        chapterId: resolvedChapterId,
        topic: resolvedTopic,
        trackingMode,
        plannedMinutes: trackingMode === "time" ? minutes : 0,
        ...(trackingMode === "progress" ? {
          progressStart: isEdit ? target?.progressStart ?? currentChapterProgress : currentChapterProgress,
          progressGoal
        } : {}),
        priority,
        source: target?.source || "manual",
        createdAt: target?.createdAt || now,
        updatedAt: now
      });
      if (target) {
        actions.setData(previous => ({ ...previous, targets: previous.targets.map(item => item.id === target.id ? newTarget(date) : item) }));
        actions.notify("Study target updated");
        onClose();
        return;
      }
      const created = chosenDates.map(targetDate => newTarget(targetDate));
      actions.setData(previous => ({ ...previous, targets: [...previous.targets, ...created] }));
      actions.notify(`${created.length} target${created.length === 1 ? "" : "s"} added to your plan`);
      setTopic(resolvedTopic);
      setChapterId(resolvedChapterId);
      setSaved(true);
      return;
    }

    const logDate = target ? localDate() : date;
    if (target && recordsTime && minutes < existingLoggedMinutes) {
      setError(`This target already has ${formatDuration(existingLoggedMinutes)} logged. Adjust the total here or edit individual sessions in History.`);
      return;
    }
    const logMinutes = recordsTime
      ? target ? Math.max(0, minutes - existingLoggedMinutes) : minutes
      : 0;
    if (target && recordsTime && logMinutes === 0 && !recordsProgress) {
      setError(`No new time to add — ${formatDuration(existingLoggedMinutes)} is already logged. Increase the total or add a progress update.`);
      return;
    }
    const start = logMinutes > 0 ? timeBefore(logMinutes) : clockNow();
    const taskProgress = target && target.trackingMode !== "progress" && logMinutes > 0
      && existingLoggedMinutes + logMinutes >= target.plannedMinutes ? 100 : undefined;
    const chapterSnapshot = recordsProgress ? progressGoal : undefined;
    const session = makeSession({
      ...(target ? { targetId: target.id } : {}),
      date: logDate,
      subjectId: target?.subjectId || subjectId,
      paperId: target?.paperId || paperId,
      chapterId: target?.chapterId || resolvedChapterId,
      topic: target?.topic || resolvedTopic,
      start,
      end: clockNow(),
      duration: logMinutes,
      ...(taskProgress !== undefined ? { progress: taskProgress } : {}),
      ...(chapterSnapshot !== undefined ? { chapterProgress: chapterSnapshot } : {})
    });
    actions.setData(previous => ({ ...previous, sessions: [...previous.sessions, session] }));
    const totalLogged = target ? existingLoggedMinutes + logMinutes : logMinutes;
    actions.notify(recordsTime && recordsProgress
      ? logMinutes > 0
        ? `${formatDuration(logMinutes)} added · ${formatDuration(totalLogged)} total, chapter progress ${progressGoal}%`
        : `Chapter progress saved at ${progressGoal}%`
      : recordsTime
        ? target ? `${formatDuration(logMinutes)} added · ${formatDuration(totalLogged)} total logged` : `${formatDuration(logMinutes)} logged`
        : `Chapter progress saved at ${progressGoal}%`);
    onClose();
  };

  const deleteTarget = () => {
    if (!target) return;
    if (actions.timer?.targetId === target.id) {
      actions.notify("Finish or pause the active timer before deleting this target");
      setDeleteConfirm(false);
      return;
    }
    actions.setData(previous => ({ ...previous, targets: previous.targets.filter(item => item.id !== target.id) }));
    actions.notify("Target deleted", () => actions.setData(previous => ({ ...previous, targets: [...previous.targets, target] })));
    setDeleteConfirm(false);
    onClose();
  };

  const loggedTargetMinutes = existingLoggedMinutes;
  const labels = mode === "plan" ? ["Day", "Subject", "Chapter", "Goal"] : ["Day", "Subject", "Chapter", "Log"];

  return (
    <div className="study-wizard-backdrop" onMouseDown={onClose}>
      <div ref={dialogRef} className={`study-wizard ${mode === "log" ? "study-wizard-log" : ""}`} role="dialog" aria-modal="true" aria-labelledby="study-wizard-title" onMouseDown={event => event.stopPropagation()} tabIndex={-1}>
        <button className="icon-btn study-wizard-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <header className="study-wizard-head">
          <div className="study-wizard-mark"><BookOpen size={20} /></div>
          <span className="eyebrow">{mode === "plan" ? "PLAN" : "LOG STUDY"}</span>
          <h2 id="study-wizard-title">{saved ? "Added to your week" : title}</h2>
          <p>{saved ? "Your plan is saved. Add another target or finish planning." : mode === "plan" ? "Set a date, study target and goal." : "Record study time or chapter progress."}</p>
        </header>

        {!saved && <div className="study-wizard-progress" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
          {steps.map((item, index) => <div key={item} className={index < stepIndex ? "complete" : index === stepIndex ? "active" : ""}>
            <i>{index < stepIndex ? <Check size={13} /> : index + 1}</i><span>{labels[item]}</span>
          </div>)}
        </div>}

        <div className="study-wizard-body">
          {saved ? (
            <div className="wizard-success">
              <div className="wizard-success-icon"><Check size={25} /></div>
              <h3>{targetLabel({ subjectId, paperId, chapterId, topic }, data.settings)}</h3>
              <p>{activeMode === "time" ? formatDuration(minutes) : `Goal: ${progressGoal}% chapter progress`} · {chosenDates.map(day => prettyDate(day)).join(", ")}</p>
              <div className="wizard-success-actions">
                <button className="btn secondary" onClick={() => { setSaved(false); setStep(1); setShowCustom(false); setError(""); }}>Add another target to {prettyDate(date)}</button>
                <button className="btn primary" onClick={onClose}>Finish planning</button>
              </div>
              <button className="btn ghost" onClick={() => { setSaved(false); setDate(date === week[6] ? week[0] : week[(week.indexOf(date) + 1) % 7]); setRepeatDates([]); setStep(0); setError(""); }}>Choose another day <ChevronRight size={15} /></button>
            </div>
          ) : (
            <>
              {step === 0 && (
                <section className="wizard-step-content">
                  <div className="wizard-step-title"><CalendarDays size={17} /><div><b>{mode === "plan" ? "Choose a study day" : "Which day did you study?"}</b><small>{mode === "plan" ? "Your week runs Saturday to Friday." : "Choose today or a recent day."}</small></div></div>
                  {mode === "plan" ? (
                    <div className="wizard-day-grid">
                      {week.map((day, index) => <button key={day} className={`wizard-day ${date === day ? "selected" : ""}`} onClick={() => { setDate(day); setRepeatDates(current => current.filter(item => item !== day)); }} aria-pressed={date === day}>
                        <small>{["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"][index]}</small><b>{new Date(`${day}T12:00:00`).getDate()}</b><span>{data.targets.filter(item => item.date === day).length} planned</span>
                      </button>)}
                    </div>
                  ) : <div className="wizard-date-picks">
                    {[date, localDate(), ...Array.from({ length: 6 }, (_, index) => addDays(localDate(), -(index + 1)))]
                      .filter((item, index, list) => list.indexOf(item) === index).slice(0, 7).map(day => <button key={day} className={`wizard-date-pill ${date === day ? "selected" : ""}`} onClick={() => setDate(day)} aria-pressed={date === day}>{day === localDate() ? "Today" : prettyDate(day, { weekday: "short", day: "numeric", month: "short" })}</button>)}
                  </div>}
                  {mode === "plan" && !target && <div className="wizard-repeat">
                    <button className="wizard-repeat-toggle" onClick={() => setRepeatOpen(value => !value)} aria-expanded={repeatOpen}><Plus size={15} /> Repeat this target on other days <span>{repeatDates.length ? `${repeatDates.length} selected` : "Optional"}</span></button>
                    {repeatOpen && <div className="wizard-repeat-days">{week.filter(day => day !== date).map(day => <button key={day} className={`wizard-date-pill ${repeatDates.includes(day) ? "selected" : ""}`} onClick={() => toggleRepeat(day)} aria-pressed={repeatDates.includes(day)}>{prettyDate(day, { weekday: "short", day: "numeric" })}</button>)}</div>}
                  </div>}
                  {error && <p className="wizard-error" role="alert">{error}</p>}
                </section>
              )}

              {step === 1 && (
                <section className="wizard-step-content">
                  <div className="wizard-step-title"><BookOpen size={17} /><div><b>Choose a subject</b><small>{prettyDate(date)}{hasLoggedTarget ? " · keep its logged study history linked" : " · tap one to continue"}</small></div></div>
                  {hasLoggedTarget && <p className="wizard-note">This target already has study logs. Its subject and chapter are kept fixed so those records stay correctly linked.</p>}
                  <div className="wizard-choice-grid subject-choice-grid">{subjectList.map(item => <button key={item.id} className={`wizard-choice ${subjectId === item.id ? "selected" : ""}`} onClick={() => chooseSubject(item.id)} aria-pressed={subjectId === item.id}>
                    <span className="wizard-choice-icon">{item.name.slice(0, 1)}</span><span><b>{item.name}</b><small>{item.papers.length ? `${item.papers.reduce((sum, row) => sum + row.chapters.length, 0)} chapters` : "Tap-select topics"}</small></span>
                  </button>)}</div>
                </section>
              )}

              {step === 2 && (
                <section className="wizard-step-content">
                  <div className="wizard-step-title"><BookOpen size={17} /><div><b>Choose a chapter</b><small>{subject?.name || "Subject"} · tap a chapter or a built-in study block</small></div></div>
                  {hasLoggedTarget && <p className="wizard-note">This target already has study logs. Its subject and chapter are kept fixed.</p>}
                  {papers.length > 1 && <div className="wizard-paper-tabs" role="group" aria-label="Paper">{papers.map(item => <button key={item.id} type="button" aria-pressed={paperId === item.id} className={paperId === item.id ? "selected" : ""} onClick={() => { setPaperId(item.id); setChapterId(""); }}>{item.name}</button>)}</div>}
                  {chapters.length ? <div className="wizard-chapter-grid">{chapters.map((chapter, index) => <button key={chapter.id} className={`wizard-chapter ${chapterId === chapter.id ? "selected" : ""}`} onClick={() => chooseChapter({ chapterId: chapter.id, paperId: paper?.id || "", topic: "" })} aria-pressed={chapterId === chapter.id}><span>{String(index + 1).padStart(2, "0")}</span><b>{chapter.name}</b><ChevronRight size={15} /></button>)}</div> : <div className="wizard-topic-presets"><button className="wizard-choice" onClick={() => chooseChapter({ chapterId: "", paperId: "", topic: "General study" })}><span className="wizard-choice-icon"><Sparkles size={17} /></span><span><b>General study</b><small>A flexible target for any topic</small></span></button><button className="wizard-choice" onClick={() => chooseChapter({ chapterId: "", paperId: "", topic: "Past paper practice" })}><span className="wizard-choice-icon"><Check size={17} /></span><span><b>Past paper practice</b><small>Practice questions and exam technique</small></span></button></div>}
                  <div className="wizard-custom-topic">
                    <button className="wizard-text-link" onClick={() => {
                      if (showCustom) { setShowCustom(false); setCustomInput(""); setTopic(""); setError(""); }
                      else selectCustomTopic();
                    }}>{showCustom ? "Use a listed chapter instead" : "＋ Add a custom topic (optional)"}</button>
                    {showCustom && <label>Custom topic<input value={customInput} onChange={event => { setCustomInput(event.target.value); setTopic(event.target.value); }} placeholder="e.g. coaching worksheet 4" autoFocus /></label>}
                  </div>
                  {error && <p className="wizard-error" role="alert">{error}</p>}
                  {hasLoggedTarget && <button className="btn primary wizard-next" onClick={() => setStep(3)}>Continue <ChevronRight size={16} /></button>}
                </section>
              )}

              {step === 3 && (
                <section className="wizard-step-content">
                  <div className="wizard-step-title"><Clock3 size={17} /><div><b>{mode === "plan" ? "Choose your goal" : "What did you achieve?"}</b><small>{mode === "plan" ? "Pick a time commitment or a chapter-progress goal." : target ? `${targetLabel(target, data.settings)} · primary: planned ${activeMode === "time" ? "time" : "chapter progress"}` : `${subject?.name || "Subject"} · ${activeChapterLabel}`}</small></div></div>
                  {mode === "plan" && !hasLoggedTarget && <div className="wizard-mode-toggle" role="group" aria-label="Goal type">
                    <button type="button" aria-pressed={trackingMode === "time"} className={trackingMode === "time" ? "selected" : ""} onClick={() => { setTrackingMode("time"); setError(""); }}><Clock3 size={17} /><b>Time</b><small>Plan how long to study</small></button>
                    <button type="button" aria-pressed={trackingMode === "progress"} className={trackingMode === "progress" ? "selected" : ""} onClick={() => { setTrackingMode("progress"); setError(""); }}><Percent size={17} /><b>Chapter progress</b><small>Plan a completion milestone</small></button>
                  </div>}
                  {mode === "log" && !target && <div className="wizard-mode-toggle" role="group" aria-label="Primary log type">
                    <button type="button" aria-pressed={quickKind === "time"} className={quickKind === "time" ? "selected" : ""} onClick={() => setQuickKind("time")}><Clock3 size={17} /><b>Study time</b><small>Primary log</small></button>
                    <button type="button" aria-pressed={quickKind === "progress"} className={quickKind === "progress" ? "selected" : ""} onClick={() => setQuickKind("progress")}><Percent size={17} /><b>Chapter progress</b><small>Primary log</small></button>
                  </div>}
                  {mode === "log" ? <div className="wizard-measures-grid">
                    <div className="wizard-measure-panel wizard-primary-measure">
                      <div className="wizard-secondary-heading">Primary · {activeMode === "time" ? target ? "total study time" : "study time" : "chapter progress"}</div>
                      {activeMode === "time" ? <>
                        <div className="wizard-value-display"><b>{formatDuration(minutes)}</b><span>{target ? "total time after this log" : "actual study time"}</span></div>
                        <div className="wizard-preset-row">{[15, 30, 45, 60, 90, 120].map(value => <button key={value} disabled={Boolean(target && value < existingLoggedMinutes)} className={minutes === value ? "selected" : ""} onClick={() => setMinutes(value)} aria-pressed={minutes === value}>{formatDuration(value)}</button>)}</div>
                        <label className="wizard-slider-label">{target ? "Set total time logged" : "Adjust time"}<input type="range" min={target ? existingLoggedMinutes : 15} max={Math.max(300, existingLoggedMinutes + 300)} step="15" value={minutes} onChange={event => setMinutes(Number(event.target.value))} aria-label={target ? "Total study minutes" : "Actual study minutes"} /></label>
                        {target && <p className="wizard-measure-note">Already logged {formatDuration(existingLoggedMinutes)}. Set the total; only the difference is added.</p>}
                      </> : <>
                        <div className="wizard-value-display"><b>{progressGoal}%</b><span>chapter progress now</span></div>
                        <p className="wizard-measure-note">Current chapter estimate: <strong>{currentChapterProgress}%</strong></p>
                        <div className="wizard-percent-picks">{[0, 20, 40, 60, 80, 100].map(value => <button key={value} className={progressGoal === value ? "selected" : ""} onClick={() => setProgressGoal(value)} aria-pressed={progressGoal === value}>{value}%</button>)}</div>
                        <label className="wizard-slider-label">Chapter completion<input type="range" min="0" max="100" step="5" value={progressGoal} onChange={event => setProgressGoal(Number(event.target.value))} aria-label="Current chapter completion" /></label>
                      </>}
                    </div>
                    <div className="wizard-measure-panel wizard-secondary-measure">
                      <div className="wizard-secondary-heading">Secondary · {secondaryMode === "time" ? target ? "total study time" : "study time" : "chapter progress"} <span>optional · adjust to include</span></div>
                      {secondaryMode === "time" ? <>
                        <div className="wizard-value-display"><b>{formatDuration(minutes)}</b><span>{target ? "total time after this log" : "actual study time"}</span></div>
                        <div className="wizard-preset-row">{[15, 30, 45, 60, 90, 120].map(value => <button key={value} disabled={Boolean(target && value < existingLoggedMinutes)} className={minutes === value ? "selected" : ""} onClick={() => { setMinutes(value); setSecondaryEnabled(true); }} aria-pressed={minutes === value}>{formatDuration(value)}</button>)}</div>
                        <label className="wizard-slider-label">{target ? "Set total time logged" : "Adjust time"}<input type="range" min={target ? existingLoggedMinutes : 15} max={Math.max(300, existingLoggedMinutes + 300)} step="15" value={minutes} onChange={event => { setMinutes(Number(event.target.value)); setSecondaryEnabled(true); }} aria-label={target ? "Secondary total study minutes" : "Secondary actual study minutes"} /></label>
                        {target && <p className="wizard-measure-note">Already logged {formatDuration(existingLoggedMinutes)}. Only the difference is added.</p>}
                      </> : <>
                        <div className="wizard-value-display"><b>{progressGoal}%</b><span>overall chapter completion</span></div>
                        <p className="wizard-measure-note">Current estimate: <strong>{currentChapterProgress}%</strong></p>
                        <div className="wizard-percent-picks">{[0, 20, 40, 60, 80, 100].map(value => <button key={value} className={progressGoal === value ? "selected" : ""} onClick={() => { setProgressGoal(value); setSecondaryEnabled(true); }} aria-pressed={progressGoal === value}>{value}%</button>)}</div>
                        <label className="wizard-slider-label">Chapter completion<input type="range" min="0" max="100" step="5" value={progressGoal} onChange={event => { setProgressGoal(Number(event.target.value)); setSecondaryEnabled(true); }} aria-label="Secondary chapter completion" /></label>
                      </>}
                    </div>
                  </div> : activeMode === "time" ? <div className="wizard-time-goal">
                    <div className="wizard-value-display"><b>{formatDuration(minutes)}</b><span>planned study time</span></div>
                    <div className="wizard-preset-row">{[30, 45, 60, 90, 120, 150].map(value => <button key={value} className={minutes === value ? "selected" : ""} onClick={() => setMinutes(value)} aria-pressed={minutes === value}>{formatDuration(value)}</button>)}</div>
                    <label className="wizard-slider-label">Adjust in 15-minute steps<input type="range" min="15" max="300" step="15" value={minutes} onChange={event => setMinutes(Number(event.target.value))} aria-label="Planned minutes" /></label>
                  </div> : <div className="wizard-progress-goal">
                    <div className="wizard-value-display"><b>{progressGoal}%</b><span>chapter progress goal</span></div>
                    <p>Current chapter estimate: <strong>{currentChapterProgress}%</strong> · set where you want to reach</p>
                    <div className="wizard-percent-picks">{[20, 40, 60, 80, 100].map(value => <button key={value} className={progressGoal === value ? "selected" : ""} onClick={() => setProgressGoal(value)} aria-pressed={progressGoal === value}>{value}%</button>)}</div>
                    <label className="wizard-slider-label">Target chapter completion<input type="range" min="0" max="100" step="5" value={progressGoal} onChange={event => setProgressGoal(Number(event.target.value))} aria-label="Chapter progress goal" /></label>
                    <p className="wizard-note">This is the chapter's overall completion—not a percentage to add every time. Your target completes once the logged chapter estimate reaches {progressGoal}%.</p>
                  </div>}
                  {mode === "plan" && <button type="button" className={`wizard-priority-toggle ${priority === "high" ? "selected" : ""}`} aria-pressed={priority === "high"} onClick={() => setPriority(value => value === "high" ? "normal" : "high")}><Star size={15} /> High priority <small>{priority === "high" ? "Shown first in your plan" : "Optional · shown first in your plan"}</small></button>}
                  {error && <p className="wizard-error" role="alert">{error}</p>}
                </section>
              )}
            </>
          )}
        </div>

        {deleteConfirm && <div className="wizard-delete-overlay">
          <section className="wizard-delete-confirm" role="alertdialog" aria-modal="true" aria-labelledby="wizard-delete-title" aria-describedby="wizard-delete-description">
            <div className="wizard-delete-icon"><Trash2 size={20} /></div>
            <h3 id="wizard-delete-title">Delete this target?</h3>
            <p id="wizard-delete-description">“{target ? targetLabel(target, data.settings) : "This target"}” will be removed from your plan. Existing study logs will remain in History.</p>
            <div className="wizard-delete-buttons"><button className="btn ghost" onClick={() => setDeleteConfirm(false)}>Keep target</button><button className="btn danger" onClick={deleteTarget}>Delete target</button></div>
          </section>
        </div>}

        {!saved && <footer className="study-wizard-footer">
          <button className="btn ghost" onClick={stepIndex > 0 ? goBack : onClose}>{stepIndex > 0 ? <><ChevronLeft size={15} /> Back</> : "Cancel"}</button>
          {mode === "plan" && target && <button className="btn ghost danger wizard-delete-button" onClick={() => setDeleteConfirm(true)}><Trash2 size={14} /> Delete</button>}
          <span>{mode === "plan" ? `${prettyDate(date)}${repeatDates.length ? ` + ${repeatDates.length} day${repeatDates.length > 1 ? "s" : ""}` : ""}` : prettyDate(date)}</span>
          {step === 3 ? <button className="btn primary" onClick={save} disabled={mode === "plan" && trackingMode === "progress" && progressGoal <= currentChapterProgress}>{mode === "plan" ? isEdit ? "Save target" : "Add target" : "Save log"}<Check size={15} /></button>
            : step === 0 ? <button className="btn primary" onClick={() => { setError(""); setStep(hasLoggedTarget ? 3 : 1); }}>Next <ChevronRight size={15} /></button>
            : step === 2 ? <button className="btn primary" onClick={() => { if (chapterId || (showCustom && customInput.trim())) setStep(3); else setError("Choose a chapter or study block."); }}>Continue <ChevronRight size={15} /></button>
            : <button className="btn ghost" onClick={() => setStep(2)} disabled={!subjectId}>Choose chapter <ChevronRight size={15} /></button>}
        </footer>}
      </div>
    </div>
  );
}
