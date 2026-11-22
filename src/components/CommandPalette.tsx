import { useRef, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, CalendarPlus, Clock3, Command, CornerDownLeft, Search, Sparkles } from "lucide-react";
import type { AppActions, Page } from "../lib/appTypes";
import { useDialogFocus } from "../lib/dialogFocus";

export default function CommandPalette({ actions, onClose }: { actions: AppActions; onClose: () => void }) {
  const [text, setText] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, onClose);
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

  const openPlan = () => { actions.openStudyWizard("plan"); onClose(); };
  const openFastPlan = () => { actions.openFastPlan(); onClose(); };
  const openLog = () => { actions.openStudyWizard("log"); onClose(); };
  const run = () => {
    if (guideMatch) { actions.openGuide(guideTarget); onClose(); return; }
    if (navMatch) { actions.go(navMatch[2].toLowerCase() as Page); onClose(); }
  };

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div ref={dialogRef} className="command-palette" onMouseDown={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Quick actions" tabIndex={-1}>
        <div className="palette-input"><Search size={19} /><input value={text} onChange={event => setText(event.target.value)} onKeyDown={event => {
          if (event.key === "Enter") { event.preventDefault(); run(); }
        }} placeholder="Find a page or type help timer…" aria-label="Find a page or guide topic" /></div>
        <div className="palette-body">
          {guideMatch ? (
            <button className="palette-result" onClick={run}>
              <BookOpen size={17} />
              <span><b>Open the user guide</b><small>Complete, searchable instructions for every part of the app</small></span>
              <CornerDownLeft size={15} />
            </button>
          ) : navMatch ? (
            <button className="palette-result" onClick={run}><ArrowRight size={17} /><span><b>Go to {navMatch[2]}</b><small>Switch page</small></span><CornerDownLeft size={15} /></button>
          ) : (
            <div className="palette-actions">
              <span className="palette-label"><Command size={14} /> QUICK ACTIONS</span>
              <button className="palette-result" onClick={openFastPlan}><CalendarDays size={17} /><span><b>Plan the week</b><small>Schedule targets across seven days</small></span><ArrowRight size={15} /></button>
              <button className="palette-result" onClick={openPlan}><CalendarPlus size={17} /><span><b>Add a target</b><small>Set a date, subject, chapter and goal</small></span><ArrowRight size={15} /></button>
              <button className="palette-result" onClick={openLog}><Clock3 size={17} /><span><b>Log study</b><small>Record time or chapter progress</small></span><ArrowRight size={15} /></button>
              <div className="palette-hint"><Sparkles size={15} /><p>Type <code>go planner</code> to switch screens, or <code>help timer</code> for guidance.</p></div>
            </div>
          )}
        </div>
        <div className="palette-foot"><span><kbd>Ctrl</kbd> + <kbd>K</kbd> anywhere</span><span><kbd>Esc</kbd> to close</span></div>
      </div>
    </div>
  );
}
