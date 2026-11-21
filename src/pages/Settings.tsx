import { useState } from "react";
import type { ChangeEvent } from "react";
import { Bell, Download, Moon, ShieldCheck, Sun, Trash2, Upload } from "lucide-react";
import type { AppData, Group } from "../types";
import type { AppActions } from "../lib/appTypes";
import { exportCsv, exportJson, parseBackup } from "../lib/backup";
import { defaultSettings, emptyData, GROUP_SUBJECTS } from "../lib/storage";
import { GROUP_LABELS, subjectName } from "../data/subjects";
import { Card, SectionTitle } from "../components/UI";

export default function SettingsPage({ data, actions }: { data: AppData; actions: AppActions }) {
  const [status, setStatus] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const s = data.settings;
  const patch = (values: Partial<AppData["settings"]>) => actions.setData(prev => ({ ...prev, settings: { ...prev.settings, ...values } }));

  const setGroup = (group: Group) => patch({ group, subjects: [...GROUP_SUBJECTS[group]] });
  const toggleSubject = (id: string) => patch({
    subjects: s.subjects.includes(id) ? s.subjects.filter(x => x !== id) : [...s.subjects, id]
  });

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const next = parseBackup(await file.text());
      const before = data;
      actions.setData(next);
      actions.notify("Backup restored", () => actions.setData(before));
      setStatus("Backup restored successfully. You can undo with the toast.");
    } catch {
      setStatus("That file is not a valid HSC Planner backup.");
    }
    event.target.value = "";
  };

  const clearAll = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    const before = data;
    actions.setData({ ...emptyData, settings: { ...defaultSettings(), theme: s.theme, onboarded: true, group: s.group, subjects: s.subjects } });
    setConfirmClear(false);
    actions.notify("All plans and sessions cleared", () => actions.setData(before));
    setStatus("Workspace cleared. Undo is available in the toast.");
  };

  return (
    <div className="page settings-page">
      <div className="page-head">
        <span className="eyebrow">SETTINGS</span>
        <h1>Make the planner yours</h1>
        <p>Your group, subjects, exam date and goals shape every recommendation.</p>
      </div>

      <Card>
        <SectionTitle eyebrow="STUDENT PROFILE" title="Your setup" detail="Change this whenever your plan needs to change." />
        <div className="settings-grid">
          <label>Student group
            <select value={s.group} onChange={e => setGroup(e.target.value as Group)}>
              {(Object.keys(GROUP_LABELS) as Group[]).map(g => <option key={g} value={g}>{GROUP_LABELS[g]}</option>)}
            </select>
          </label>
          <label>HSC exam date<input type="date" value={s.examDate} onChange={e => patch({ examDate: e.target.value })} /></label>
          <label>Daily study goal (minutes)<input type="number" min="15" max="720" step="15" value={s.dailyGoalMinutes} onChange={e => patch({ dailyGoalMinutes: Math.max(15, Number(e.target.value) || 150) })} /></label>
        </div>
        <div className="subject-picker">
          <span className="field-label">Subjects in your plan</span>
          <div className="chips">
            {[...new Set([...s.subjects, ...GROUP_SUBJECTS[s.group]])].map(id => (
              <button key={id} className={`chip ${s.subjects.includes(id) ? "selected" : ""}`} onClick={() => toggleSubject(id)}>
                {subjectName(id, s)} {s.subjects.includes(id) ? "✓" : "+"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="PREFERENCES" title="Appearance & reminders" />
        <div className="pref-row">
          <div><b>Theme</b><p>A calm dark mode for late-night sessions.</p></div>
          <div className="segmented">
            <button className={s.theme === "light" ? "selected" : ""} onClick={() => patch({ theme: "light" })}><Sun size={15} /> Light</button>
            <button className={s.theme === "dark" ? "selected" : ""} onClick={() => patch({ theme: "dark" })}><Moon size={15} /> Dark</button>
          </div>
        </div>
        <div className="pref-row">
          <div><b>Gentle reminders</b><p>Notification while the app is open; browsers cannot guarantee delivery after they are closed.</p></div>
          <label className="switch"><input type="checkbox" checked={s.reminders.enabled} onChange={e => patch({ reminders: { ...s.reminders, enabled: e.target.checked } })} /><span /></label>
        </div>
        {s.reminders.enabled && (
          <div className="settings-grid">
            <label>Daily digest time<input type="time" value={s.reminders.dailyDigest} onChange={e => patch({ reminders: { ...s.reminders, dailyDigest: e.target.value } })} /></label>
            <button className="btn secondary" onClick={async () => {
              if (!("Notification" in window)) { setStatus("This browser does not support notifications."); return; }
              const result = await Notification.requestPermission();
              setStatus(result === "granted" ? "Notifications enabled." : "Notification permission was not granted.");
            }}><Bell size={15} /> Enable browser permission</button>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle eyebrow="YOUR DATA" title="Backup & safety" detail="Everything stays on this device unless you export it." />
        <div className="backup-actions">
          <button className="btn secondary" onClick={() => exportJson(data)}><Download size={16} /> Export backup</button>
          <button className="btn secondary" onClick={() => exportCsv(data)}><Download size={16} /> Export study CSV</button>
          <label className="btn secondary file-btn"><Upload size={16} /> Import backup<input type="file" accept=".json,application/json" onChange={importBackup} /></label>
          <button className={`btn ghost danger ${confirmClear ? "confirm" : ""}`} onClick={clearAll} onBlur={() => setConfirmClear(false)}><Trash2 size={16} /> {confirmClear ? "Click again to erase everything" : "Clear workspace"}</button>
        </div>
        {status && <p className="status-note">{status}</p>}
        <p className="privacy-note"><ShieldCheck size={16} /> No account, no tracking, no records sent anywhere. Export a backup before clearing browser data.</p>
      </Card>
    </div>
  );
}
