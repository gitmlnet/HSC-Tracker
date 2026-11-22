import { useMemo, useState } from "react";
import { Download, History as HistoryIcon, Pencil, Trash2 } from "lucide-react";
import type { AppData, StudySession } from "../types";
import type { AppActions } from "../lib/appTypes";
import { exportCsv } from "../lib/backup";
import { formatDuration, formatTime, localDate } from "../lib/storage";
import { chapterName, subjectName, subjectOptions } from "../data/subjects";
import { Card, EmptyState, SectionTitle } from "../components/UI";

export default function HistoryPage({ data, actions }: { data: AppData; actions: AppActions }) {
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [min, setMin] = useState("");
  const [sort, setSort] = useState("newest");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<StudySession | null>(null);

  const options = subjectOptions(data.settings);
  const papers = options.find(s => s.id === subject)?.papers || [];
  const rows = useMemo(() => [...data.sessions].filter(s => {
    const name = [subjectName(s.subjectId, data.settings), chapterName(s, data.settings), s.topic].join(" ").toLowerCase();
    return (!q || name.includes(q.toLowerCase())) && (!date || s.date === date) && (!subject || s.subjectId === subject)
      && (!chapter || s.chapterId === chapter) && (!min || s.duration >= Number(min));
  }).sort((a, b) => sort === "longest" ? b.duration - a.duration : (b.date + b.start).localeCompare(a.date + a.start)),
    [data.sessions, data.settings, q, date, subject, chapter, min, sort]);

  const startEdit = (session: StudySession) => { setEditingId(session.id); setDraft({ ...session }); };
  const saveEdit = () => {
    if (!draft) return;
    actions.setData(prev => ({ ...prev, sessions: prev.sessions.map(s => s.id === draft.id ? draft : s) }));
    setEditingId(null);
    setDraft(null);
    actions.notify("Session updated");
  };
  const remove = (session: StudySession) => {
    actions.setData(prev => ({ ...prev, sessions: prev.sessions.filter(s => s.id !== session.id) }));
    actions.notify("Session deleted", () => actions.setData(prev => ({ ...prev, sessions: [...prev.sessions, session] })));
  };

  return (
    <div className="page history-page">
      <div className="page-head">
        <span className="eyebrow">HISTORY</span>
        <h1>Every minute you invested</h1>
        <p>Search, correct or export your study log at any time.</p>
      </div>

      <Card>
        <SectionTitle eyebrow="FILTERS" title="Find a session" action={<button className="btn secondary" onClick={() => exportCsv(data)}><Download size={15} /> Export CSV</button>} />
        <div className="filters-grid">
          <label>Search<input value={q} onChange={e => setQ(e.target.value)} placeholder="Subject, chapter or topic" /></label>
          <label>Date<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
          <label>Subject<select value={subject} onChange={e => { setSubject(e.target.value); setChapter(""); setDraft(null); }}><option value="">All subjects</option>{options.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Chapter<select value={chapter} onChange={e => setChapter(e.target.value)} disabled={!subject}><option value="">All chapters</option>{papers.flatMap(p => p.chapters).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Min minutes<input type="number" min="1" value={min} onChange={e => setMin(e.target.value)} placeholder="Any" /></label>
          <label>Sort<select value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="longest">Longest first</option></select></label>
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="STUDY LOG" title={`${rows.length} session${rows.length === 1 ? "" : "s"}`} />
        {rows.length ? (
          <div className="history-list">
            {rows.map(s => (
              <div className="history-item" key={s.id}>
                <div className="history-main" onClick={() => startEdit(s)}>
                  <div className="history-title"><b>{subjectName(s.subjectId, data.settings)}</b><span>{chapterName(s, data.settings) || s.topic || "Custom topic"}</span></div>
                  <div className="history-meta"><span>{s.date}</span><span>{formatTime(s.start)} – {formatTime(s.end)}</span><span>{formatDuration(s.duration)}</span>{s.progress !== undefined && <span>{s.progress}% target</span>}{s.chapterProgress !== undefined && <span>{s.chapterProgress}% chapter</span>}</div>
                </div>
                <div className="row-actions">
                  <button className="icon-btn" onClick={() => startEdit(s)} aria-label="Edit session"><Pencil size={16} /></button>
                  <button className="icon-btn danger" onClick={() => remove(s)} aria-label="Delete session"><Trash2 size={16} /></button>
                </div>
                {editingId === s.id && draft && (
                  <div className="history-editor">
                    <label>Date<input type="date" value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })} /></label>
                    <label>From<input type="time" value={draft.start} onChange={e => setDraft({ ...draft, start: e.target.value })} /></label>
                    <label>To<input type="time" value={draft.end} onChange={e => setDraft({ ...draft, end: e.target.value })} /></label>
                    <label>Minutes<input type="number" min="0" value={draft.duration} onChange={e => setDraft({ ...draft, duration: Math.max(0, Number(e.target.value) || 0) })} /></label>
                    <label>Topic<input value={draft.topic} onChange={e => setDraft({ ...draft, topic: e.target.value })} /></label>
                    {draft.progress !== undefined && <label>Target completion (%)<input type="range" min="0" max="100" step="5" value={draft.progress} onChange={e => setDraft({ ...draft, progress: Number(e.target.value) })} /></label>}
                    {draft.chapterProgress !== undefined && <label>Chapter completion (%)<input type="range" min="0" max="100" step="5" value={draft.chapterProgress} onChange={e => setDraft({ ...draft, chapterProgress: Number(e.target.value) })} /></label>}
                    <div className="editor-actions"><button className="btn ghost" onClick={() => { setEditingId(null); setDraft(null); }}>Cancel</button><button className="btn primary" onClick={saveEdit}>Save changes</button></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : <EmptyState icon={HistoryIcon} title="No matching sessions" text="Try a different filter — or log a session from Today." />}
      </Card>
    </div>
  );
}
