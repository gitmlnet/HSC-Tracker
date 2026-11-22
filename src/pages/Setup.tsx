import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { AppData, Group } from "../types";
import type { AppActions } from "../lib/appTypes";
import { useDialogFocus } from "../lib/dialogFocus";
import { GROUP_SUBJECTS } from "../lib/storage";
import { GROUP_LABELS, subjectName } from "../data/subjects";

export default function Setup({ data, actions }: { data: AppData; actions: AppActions }) {
  const [step, setStep] = useState(0);
  const [group, setGroup] = useState<Group>(data.settings.group);
  const [subjects, setSubjects] = useState<string[]>(data.settings.subjects);
  const [examDate, setExamDate] = useState(data.settings.examDate);
  const [goal, setGoal] = useState(data.settings.dailyGoalMinutes);
  const dialogRef = useRef<HTMLDivElement>(null);
  const finish = () => actions.setData(prev => ({
    ...prev,
    settings: { ...prev.settings, group, subjects: subjects.length ? subjects : GROUP_SUBJECTS[group], examDate, dailyGoalMinutes: goal, onboarded: true }
  }));
  useDialogFocus(dialogRef, finish);

  return (
    <div className="setup-screen" role="dialog" aria-modal="true" aria-label="Initial setup">
      <div ref={dialogRef} className="setup-card" tabIndex={-1}>
        <span className="eyebrow">WELCOME · STEP {step + 1} OF 3</span>
        {step === 0 && <>
          <h1>Which group are you in?</h1>
          <p>This sets up the right subjects for your HSC plan. You can change everything later.</p>
          <div className="setup-groups">
            {(Object.keys(GROUP_LABELS) as Group[]).map(g => (
              <button key={g} className={`setup-group ${group === g ? "selected" : ""}`} onClick={() => { setGroup(g); setSubjects(GROUP_SUBJECTS[g]); }}>
                <b>{GROUP_LABELS[g]}</b><small>{GROUP_SUBJECTS[g].map(id => subjectName(id, data.settings)).join(", ")}</small>
                {group === g && <Check size={18} />}
              </button>
            ))}
          </div>
        </>}
        {step === 1 && <>
          <h1>Pick your subjects</h1>
          <p>Choose what you actually study. Tap again to remove.</p>
          <div className="chips large">
            {[...new Set([...GROUP_SUBJECTS[group], ...subjects])].map(id => (
              <button key={id} className={`chip ${subjects.includes(id) ? "selected" : ""}`} onClick={() => setSubjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}>
                {subjectName(id, data.settings)} {subjects.includes(id) ? "✓" : "+"}
              </button>
            ))}
          </div>
        </>}
        {step === 2 && <>
          <h1>When is your exam?</h1>
          <p>A countdown and a realistic daily goal keep the plan honest.</p>
          <div className="setup-final">
            <label>HSC exam date<input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} /></label>
            <label>Daily study goal<input type="number" min="15" max="720" step="15" value={goal} onChange={e => setGoal(Number(e.target.value) || 150)} /><small>minutes a day · around {Math.round(goal / 60 * 10) / 10} hours</small></label>
          </div>
        </>}
        <div className="setup-actions">
          {step > 0 ? <button className="btn ghost" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button> : <button className="btn ghost" onClick={finish}>Skip for now</button>}
          {step < 2 ? <button className="btn primary" onClick={() => setStep(step + 1)}>Continue <ArrowRight size={16} /></button> : <button className="btn primary" onClick={finish}>Open my planner <ArrowRight size={16} /></button>}
        </div>
      </div>
    </div>
  );
}
