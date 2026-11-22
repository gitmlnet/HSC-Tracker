import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Check, Clock3, Percent, Sparkles, Star, X, Zap } from "lucide-react";
import type { AppData, Target, TrackingMode } from "../types";
import type { AppActions } from "../lib/appTypes";
import { subjectOptions, targetLabel } from "../data/subjects";
import { chapterProgressOf, isDone } from "../lib/selectors";
import { addDays, DAY_NAMES, formatDuration, FULL_DAY_NAMES, localDate, prettyDate, uid, weekDates, weekStart } from "../lib/storage";
import { useDialogFocus } from "../lib/dialogFocus";

export default function FastPlan({ data, actions, initialDate, onClose }: {
  data: AppData;
  actions: AppActions;
  initialDate: string;
  onClose: () => void;
}) {
  const subjects = useMemo(() => subjectOptions(data.settings), [data.settings]);
  const initialSubject = subjects[0];
  const [weekAnchor, setWeekAnchor] = useState(() => weekStart(initialDate));
  const [date, setDate] = useState(initialDate);
  const [subjectId, setSubjectId] = useState(initialSubject?.id || "");
  const [paperId, setPaperId] = useState(initialSubject?.papers[0]?.id || "");
  const [chapterId, setChapterId] = useState("");
  const [topic, setTopic] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [trackingMode, setTrackingMode] = useState<TrackingMode>("time");
  const [minutes, setMinutes] = useState(60);
  const [progressGoal, setProgressGoal] = useState(25);
  const [priority, setPriority] = useState<Target["priority"]>("normal");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(dialogRef, onClose);

  const days = weekDates(weekAnchor);
  const subject = subjects.find(item => item.id === subjectId);
  const papers = subject?.papers || [];
  const paper = papers.find(item => item.id === paperId) || papers[0];
  const chapters = paper?.chapters || [];
  const selectedChapter = chapters.find(chapter => chapter.id === chapterId);
  const chosenTopic = customOpen ? customTopic.trim() : topic;
  const chapterProgress = chapterProgressOf({ subjectId, paperId, chapterId, topic: chosenTopic }, data.sessions);
  const hasSelection = Boolean(subjectId && (chapterId || chosenTopic));
  const canPlan = hasSelection && (trackingMode !== "progress" || (chapterProgress < 100 && progressGoal > chapterProgress));
  const dayIndex = days.indexOf(date);
  const goalSummary = trackingMode === "time" ? `${formatDuration(minutes)} planned` : `${progressGoal}% chapter goal`;

  const changeWeek = (offset: number) => {
    const next = addDays(weekAnchor, offset * 7);
    setWeekAnchor(next);
    setDate(weekDates(next)[0]);
    setFeedback("");
    setError("");
  };

  const goToToday = () => {
    const today = localDate();
    setWeekAnchor(weekStart(today));
    setDate(today);
    setFeedback("");
    setError("");
  };

  const chooseSubject = (id: string) => {
    const selected = subjects.find(item => item.id === id);
    setSubjectId(id);
    setPaperId(selected?.papers[0]?.id || "");
    setChapterId("");
    setTopic("");
    setCustomOpen(false);
    setCustomTopic("");
    setError("");
    setFeedback("");
  };

  const chooseChapter = (nextChapterId: string, nextPaperId: string, nextTopic = "") => {
    setChapterId(nextChapterId);
    setPaperId(nextPaperId);
    setTopic(nextTopic);
    setCustomOpen(false);
    setCustomTopic("");
    setError("");
    setFeedback("");
    const current = chapterProgressOf({ subjectId, paperId: nextPaperId, chapterId: nextChapterId, topic: nextTopic }, data.sessions);
    setProgressGoal(Math.min(100, Math.max(current + 5, current + 25)));
  };

  const createPlan = () => {
    if (!canPlan) {
      setError(trackingMode === "progress" && chapterProgress >= 100
        ? "This chapter is already at 100%. Choose a time goal instead."
        : trackingMode === "progress" && progressGoal <= chapterProgress
          ? `Set a goal above the current ${chapterProgress}% chapter estimate.`
          : "Choose a subject and chapter or study block first.");
      return;
    }
    const now = new Date().toISOString();
    const newTarget: Target = {
      id: uid(),
      date,
      subjectId,
      paperId,
      chapterId,
      topic: chosenTopic,
      trackingMode,
      plannedMinutes: trackingMode === "time" ? minutes : 0,
      ...(trackingMode === "progress" ? { progressStart: chapterProgress, progressGoal } : {}),
      priority,
      source: "manual",
      createdAt: now,
      updatedAt: now
    };
    actions.setData(previous => ({ ...previous, targets: [...previous.targets, newTarget] }));
    setFeedback(`${targetLabel(newTarget, data.settings)} added to ${FULL_DAY_NAMES[dayIndex]}`);
    setError("");
  };

  return (
    <div className="fast-plan-backdrop" onMouseDown={onClose}>
      <section ref={dialogRef} className="fast-plan-dialog" role="dialog" aria-modal="true" aria-labelledby="fast-plan-title" tabIndex={-1} onMouseDown={event => event.stopPropagation()}>
        <div className="fast-plan-top">
          <header className="fast-plan-header">
            <div className="fast-plan-heading">
              <span className="fast-plan-mark"><Zap size={19} fill="currentColor" /></span>
              <div><span className="eyebrow">FAST PLAN</span><h2 id="fast-plan-title">Build your week in one place</h2><p>Choose a day above, then select a subject, chapter and goal below.</p></div>
            </div>
            <div className="fast-plan-week-nav" aria-label="Change planning week">
              <button className="icon-btn" onClick={() => changeWeek(-1)} aria-label="Previous week"><ArrowLeft size={17} /></button>
              <button className="btn secondary fast-plan-today" onClick={goToToday}>Today</button>
              <button className="icon-btn" onClick={() => changeWeek(1)} aria-label="Next week"><ArrowRight size={17} /></button>
              <button className="icon-btn fast-plan-close" onClick={onClose} aria-label="Close fast plan"><X size={18} /></button>
            </div>
          </header>

          <div className="fast-plan-days" role="group" aria-label="Choose a day and review its planned targets">
            {days.map((day, index) => {
              const targets = data.targets.filter(target => target.date === day).sort((a, b) => Number(b.priority === "high") - Number(a.priority === "high"));
              const isToday = day === localDate();
              return (
                <article key={day} className={`fast-plan-day ${day === date ? "selected" : ""} ${isToday ? "is-today" : ""}`}>
                  <button className="fast-plan-day-button" onClick={() => { setDate(day); setFeedback(""); setError(""); }} aria-pressed={day === date}>
                    <span>{DAY_NAMES[index]}</span><b>{new Date(`${day}T12:00:00`).getDate()}</b><small>{targets.length ? `${targets.length} planned` : "Open day"}</small>
                  </button>
                  <div className="fast-plan-day-tasks" role="list" aria-label={`${FULL_DAY_NAMES[index]} planned targets`}>
                    {targets.slice(0, 4).map(target => (
                      <div key={target.id} role="listitem" className={`fast-plan-task ${isDone(target, data.sessions) ? "done" : ""}`} title={targetLabel(target, data.settings)}>
                        <span className="fast-plan-task-dot" />
                        <span className="fast-plan-task-name">{targetLabel(target, data.settings)}</span>
                        <small>{target.trackingMode === "progress" ? `${target.progressGoal ?? 100}%` : formatDuration(target.plannedMinutes)}</small>
                      </div>
                    ))}
                    {targets.length > 4 && <span className="fast-plan-more">+{targets.length - 4} more</span>}
                    {!targets.length && <span className="fast-plan-empty">Nothing planned yet</span>}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="fast-plan-workspace">
          <section className="fast-plan-pane fast-plan-subjects" aria-labelledby="fast-subject-title">
            <div className="fast-plan-pane-title"><span>01</span><div><h3 id="fast-subject-title">Subject</h3><small>Choose what to study</small></div></div>
            <div className="fast-plan-subject-list">
              {subjects.length ? subjects.map(item => <button key={item.id} className={`fast-plan-subject ${subjectId === item.id ? "selected" : ""}`} onClick={() => chooseSubject(item.id)} aria-pressed={subjectId === item.id}>
                <span className="fast-plan-subject-icon">{item.name.slice(0, 1)}</span><span><b>{item.name}</b><small>{item.papers.length ? `${item.papers.reduce((sum, row) => sum + row.chapters.length, 0)} chapters` : "Study blocks available"}</small></span><Check size={15} />
              </button>) : <p className="fast-plan-empty-state">Add subjects in Settings to begin planning.</p>}
            </div>
          </section>

          <section className="fast-plan-pane fast-plan-chapters" aria-labelledby="fast-chapter-title">
            <div className="fast-plan-pane-title"><span>02</span><div><h3 id="fast-chapter-title">Chapter</h3><small>{subject?.name || "Choose a subject first"}</small></div></div>
            {papers.length > 1 && <div className="fast-plan-paper-tabs" role="group" aria-label="Choose paper">{papers.map(item => <button key={item.id} className={paperId === item.id ? "selected" : ""} aria-pressed={paperId === item.id} onClick={() => { setPaperId(item.id); setChapterId(""); setTopic(""); setError(""); }}>{item.name}</button>)}</div>}
            {chapters.length ? <div className="fast-plan-chapter-list">
              {chapters.map((chapter, index) => <button key={chapter.id} className={`fast-plan-chapter ${chapterId === chapter.id && !customOpen ? "selected" : ""}`} onClick={() => chooseChapter(chapter.id, paper?.id || "")} aria-pressed={chapterId === chapter.id && !customOpen}>
                <span>{String(index + 1).padStart(2, "0")}</span><b>{chapter.name}</b><Check size={15} />
              </button>)}
            </div> : <div className="fast-plan-study-blocks">
              <button className={`fast-plan-chapter ${topic === "General study" && !customOpen ? "selected" : ""}`} onClick={() => chooseChapter("", "", "General study")} aria-pressed={topic === "General study" && !customOpen}><span>01</span><b>General study</b><Check size={15} /></button>
              <button className={`fast-plan-chapter ${topic === "Past paper practice" && !customOpen ? "selected" : ""}`} onClick={() => chooseChapter("", "", "Past paper practice")} aria-pressed={topic === "Past paper practice" && !customOpen}><span>02</span><b>Past paper practice</b><Check size={15} /></button>
            </div>}
            <div className="fast-plan-custom">
              <button className="fast-plan-custom-toggle" onClick={() => { setCustomOpen(value => !value); setChapterId(""); setTopic(""); setCustomTopic(""); setError(""); }}>{customOpen ? "Cancel custom topic" : "+ Custom topic (optional)"}</button>
              {customOpen && <label><span>Topic name</span><input value={customTopic} onChange={event => { setCustomTopic(event.target.value); setError(""); }} placeholder="Add a short topic name" autoFocus /></label>}
            </div>
          </section>

          <section className="fast-plan-pane fast-plan-goals" aria-labelledby="fast-goal-title">
            <div className="fast-plan-pane-title"><span>03</span><div><h3 id="fast-goal-title">Study goal</h3><small>{date === localDate() ? "Today" : prettyDate(date, { weekday: "long", day: "numeric", month: "short" })}</small></div></div>
            <div className="fast-plan-mode-toggle" role="group" aria-label="Goal type">
              <button className={trackingMode === "time" ? "selected" : ""} aria-pressed={trackingMode === "time"} onClick={() => { setTrackingMode("time"); setError(""); }}><Clock3 size={16} /> Time</button>
              <button className={trackingMode === "progress" ? "selected" : ""} aria-pressed={trackingMode === "progress"} onClick={() => { setTrackingMode("progress"); setError(""); }}><Percent size={16} /> Progress</button>
            </div>

            {trackingMode === "time" ? <div className="fast-plan-goal-control">
              <div className="fast-plan-goal-value"><b>{formatDuration(minutes)}</b><span>study time</span></div>
              <div className="fast-plan-quick-values">{[30, 45, 60, 90, 120].map(value => <button key={value} className={minutes === value ? "selected" : ""} aria-pressed={minutes === value} onClick={() => setMinutes(value)}>{formatDuration(value)}</button>)}</div>
              <label className="fast-plan-range">Adjust time<input type="range" min="15" max="300" step="15" value={minutes} onChange={event => setMinutes(Number(event.target.value))} aria-label="Planned study time in minutes" /></label>
            </div> : <div className="fast-plan-goal-control">
              <div className="fast-plan-goal-value"><b>{progressGoal}%</b><span>overall chapter progress</span></div>
              <p className="fast-plan-current">Current estimate <strong>{chapterProgress}%</strong> · this target marks where you want to reach.</p>
              <div className="fast-plan-quick-values">{[20, 40, 60, 80, 100].map(value => <button key={value} className={progressGoal === value ? "selected" : ""} disabled={value <= chapterProgress} aria-pressed={progressGoal === value} onClick={() => setProgressGoal(value)}>{value}%</button>)}</div>
              <label className="fast-plan-range">Chapter completion goal<input type="range" min={Math.min(100, Math.ceil((chapterProgress + 1) / 5) * 5)} max="100" step="5" value={progressGoal} onChange={event => setProgressGoal(Number(event.target.value))} aria-label="Overall chapter progress goal" disabled={chapterProgress >= 100} /></label>
            </div>}

            <button className={`fast-plan-priority ${priority === "high" ? "selected" : ""}`} aria-pressed={priority === "high"} onClick={() => setPriority(value => value === "high" ? "normal" : "high")}><Star size={15} /> High priority</button>
            <div className="fast-plan-submit-area">
              {error && <p className="fast-plan-error" role="alert">{error}</p>}
              {feedback && <p className="fast-plan-feedback" role="status">{feedback}</p>}
              <button className="btn primary fast-plan-submit" disabled={!canPlan} onClick={createPlan}><CalendarDays size={17} /><span>Plan for {DAY_NAMES[Math.max(0, dayIndex)]}</span><small>{goalSummary}</small></button>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
