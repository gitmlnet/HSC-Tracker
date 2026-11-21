import { useRef, useState } from "react";
import { ArrowRight, BookOpen, CalendarPlus, Clock3, CornerDownLeft, Search, Sparkles } from "lucide-react";
import type { AppData } from "../types";
import type { AppActions, Page } from "../lib/appTypes";
import { useDialogFocus } from "../lib/dialogFocus";
import { parseSmartInput } from "../lib/parser";
import { quickLogSession } from "../lib/targetActions";
import { formatDuration, uid } from "../lib/storage";
import { isDone } from "../lib/selectors";
import { targetLabel } from "../data/subjects";

export default function CommandPalette({ data, actions, onClose }: { data: AppData; actions: AppActions; onClose: () => void }) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, onClose);
  const draft = parseSmartInput(text, data.settings);
  const navMatch = /^(go\s+)?(today|planner|insights|history|settings)$/i.exec(text.trim());
  const guideMatch = /^(guide|help)(?:\s+(start|setup|week|planner|today|quick|entry|timer|insights|history|settings|install|pwa|offline|keyboard|faq|help))?$/i.exec(text.trim());
  const guideSection = guideMatch?.[2]?.toLowerCase();
  const guideTarget = !guideSection || guideSection === "help" ? "start"
    : ["week", "planner"].includes(guideSection) ? "weekly"
    : ["quick", "entry"].includes(guideSection) ? "quick-entry"
    : ["install", "pwa", "offline"].includes(guideSection) ? "pwa"
    : guideSection === "keyboard" ? "keyboard"
    : guideSection === "faq" ? "faq"
    : guideSection === "setup" ? "setup"
    : guideSection === "timer" ? "timer"
    : guideSection === "insights" ? "insights"
    : guideSection === "history" ? "history"
    : guideSection === "settings" ? "settings"
    : guideSection === "today" ? "today" : "start";

  const run = () => {
    if (guideMatch) {
      actions.openGuide(guideTarget);
      onClose();
      return;
    }
    if (navMatch) {
      actions.go(navMatch[2].toLowerCase() as Page);
      onClose();
      return;
    }
    if (!draft) return;
    if (draft.intent === "log") {
      const session = quickLogSession(draft);
      const match = data.targets.find(t => t.date === draft.date && !isDone(t, data.sessions)
        && t.subjectId === draft.subjectId && t.paperId === draft.paperId && t.chapterId === draft.chapterId);
      actions.setData(prev => ({ ...prev, sessions: [...prev.sessions, match ? { ...session, targetId: match.id } : session] }));
      actions.notify(`${formatDuration(draft.minutes)} logged`);
    } else {
      const now = new Date().toISOString();
      actions.setData(prev => ({ ...prev, targets: [...prev.targets, {
        id: uid(),
        date: draft.date,
        subjectId: draft.subjectId,
        paperId: draft.paperId,
        chapterId: draft.chapterId,
        topic: draft.topic,
        plannedMinutes: draft.minutes,
        priority: "normal" as const,
        source: "quick" as const,
        createdAt: now,
        updatedAt: now
      }] }));
      actions.notify("Target added to the plan");
    }
    onClose();
  };

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div ref={dialogRef} className="command-palette" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Command palette" tabIndex={-1}>
        <div className="palette-input"><Search size={19} /><input ref={inputRef} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => {
          if (e.key === "Enter") { e.preventDefault(); run(); }
        }} placeholder="Type a command, target or session…" /></div>
        <div className="palette-body">
          {guideMatch ? (
            <button className="palette-result" onClick={run}>
              <BookOpen size={17} />
              <span><b>Open the user guide</b><small>Complete, searchable instructions for every part of the app</small></span>
              <CornerDownLeft size={15} />
            </button>
          ) : draft ? (
            <button className="palette-result" onClick={run}>
              {draft.intent === "log" ? <Clock3 size={17} /> : <CalendarPlus size={17} />}
              <span><b>{draft.intent === "log" ? "Log study" : "Add target"}</b><small>{targetLabel(draft, data.settings)} · {formatDuration(draft.minutes)} · {draft.date}</small></span>
              <CornerDownLeft size={15} />
            </button>
          ) : navMatch ? (
            <button className="palette-result" onClick={run}><ArrowRight size={17} /><span><b>Go to {navMatch[2]}</b><small>Switch page</small></span><CornerDownLeft size={15} /></button>
          ) : (
            <div className="palette-empty">
              <Sparkles size={18} />
              <p>Try <code>plan Physics ch 3 45m</code>, <code>log Biology 30 min</code>, <code>go planner</code> or <code>help timer</code>.</p>
              <p>Chapter names, numbers and subject shortcuts all work.</p>
            </div>
          )}
        </div>
        <div className="palette-foot"><span><kbd>Ctrl</kbd> + <kbd>K</kbd> anywhere</span><span><kbd>Esc</kbd> to close</span></div>
      </div>
    </div>
  );
}
