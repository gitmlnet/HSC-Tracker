import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, CalendarRange, CircleHelp, Compass, Download,
  History, Info, Keyboard, Lightbulb, Route, Search, Settings2, Sparkles, Target, Timer,
  TriangleAlert, X
} from "lucide-react";
import type { GuideBlock, GuideSection } from "../data/guide";
import { GUIDE_SECTIONS, guideSearch } from "../data/guide";
import type { AppActions } from "../lib/appTypes";
import { useDialogFocus } from "../lib/dialogFocus";
import { reducedMotion } from "../lib/storage";

const ICONS: Record<GuideSection["icon"], typeof BookOpen> = {
  compass: Compass, route: Route, calendar: CalendarRange, sparkles: Sparkles, target: Target,
  timer: Timer, chart: BarChart3, history: History, settings: Settings2, download: Download,
  keyboard: Keyboard, help: CircleHelp
};

function GuideBlockView({ block }: { block: GuideBlock }) {
  if (block.kind === "text") return <p className="guide-p">{block.text}</p>;

  if (block.kind === "steps") return (
    <div className="guide-block">
      {block.title && <h4>{block.title}</h4>}
      <ol className="guide-steps">
        {block.items.map(item => (
          <li key={item.title}><b>{item.title}</b><span>{item.text}</span></li>
        ))}
      </ol>
    </div>
  );

  if (block.kind === "bullets") return (
    <div className="guide-block">
      {block.title && <h4>{block.title}</h4>}
      <ul className="guide-bullets">{block.items.map(item => <li key={item}>{item}</li>)}</ul>
    </div>
  );

  if (block.kind === "examples") return (
    <div className="guide-block">
      {block.title && <h4>{block.title}</h4>}
      <div className="guide-examples">
        {block.items.map(item => (
          <div key={item.code}><code>{item.code}</code><span>{item.text}</span></div>
        ))}
      </div>
    </div>
  );

  const NoteIcon = block.tone === "warn" ? TriangleAlert : block.tone === "tip" ? Lightbulb : Info;
  return (
    <div className={`guide-note ${block.tone}`}>
      <NoteIcon size={17} />
      <p>{block.title && <b>{block.title} </b>}{block.text}</p>
    </div>
  );
}

export default function GuideDialog({ initialSection, onClose, actions }: {
  initialSection?: string;
  onClose: () => void;
  actions: AppActions;
}) {
  const [activeId, setActiveId] = useState(() => GUIDE_SECTIONS.find(s => s.id === initialSection)?.id || GUIDE_SECTIONS[0].id);
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  useDialogFocus(dialogRef, onClose);

  const results = useMemo(() => guideSearch(query), [query]);
  const active = GUIDE_SECTIONS.find(section => section.id === activeId) || GUIDE_SECTIONS[0];
  const index = GUIDE_SECTIONS.findIndex(section => section.id === active.id);
  const sectionLabel = active.page ? active.page === "today" ? "Today" : active.page === "planner" ? "Weekly Planner" : active.page === "insights" ? "Insights" : active.page === "history" ? "History" : "Settings" : "";

  useEffect(() => {
    articleRef.current?.scrollTo?.({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [activeId]);

  const move = (delta: number) => {
    const next = GUIDE_SECTIONS[(index + delta + GUIDE_SECTIONS.length) % GUIDE_SECTIONS.length];
    setActiveId(next.id);
  };

  const openPage = () => {
    if (active.page) actions.go(active.page);
    onClose();
  };

  return (
    <div className="modal-backdrop guide-backdrop" onMouseDown={onClose}>
      <div ref={dialogRef} className="guide-dialog" role="dialog" aria-modal="true" aria-label="User guide" tabIndex={-1} onMouseDown={event => event.stopPropagation()}>
        <header className="guide-header">
          <div className="guide-brand">
            <span className="guide-mark"><BookOpen size={23} /></span>
            <div>
              <span className="eyebrow">USER GUIDE · HSC STUDY PLANNER</span>
              <h2>Everything you can do, step by step</h2>
              <p>Plan the week, own the day, understand your progress.</p>
            </div>
          </div>
          <button className="icon-btn dialog-close" onClick={onClose} aria-label="Close guide"><X size={18} /></button>
          <div className="guide-search">
            <Search size={17} />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the guide — timer, backup, chapter, shortcut…" aria-label="Search the user guide" />
            {query && <button className="icon-btn guide-clear" onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}
          </div>
        </header>

        <div className="guide-body">
          <nav className="guide-nav" aria-label="Guide sections">
            <small className="guide-nav-label">{query ? `${results.length} result${results.length === 1 ? "" : "s"}` : "CONTENTS"}</small>
            {results.map(section => {
              const Icon = ICONS[section.icon];
              return (
                <button key={section.id} className={section.id === active.id ? "selected" : ""} onClick={() => setActiveId(section.id)} aria-current={section.id === active.id ? "true" : undefined}>
                  <Icon size={16} /><span>{section.nav}</span>
                </button>
              );
            })}
            {!results.length && <p className="guide-no-results">No matches. Try a shorter word like “timer” or “backup”.</p>}
          </nav>

          <article className="guide-article" ref={articleRef}>
            <span className="eyebrow">{active.group} · GUIDE</span>
            <h3>{active.title}</h3>
            <p className="guide-intro">{active.intro}</p>
            {active.blocks.map((block, i) => <GuideBlockView key={i} block={block} />)}
          </article>
        </div>

        <footer className="guide-footer">
          <button className="btn ghost" onClick={() => move(-1)}><ArrowLeft size={15} /> Previous</button>
          <span className="guide-count">{index + 1} of {GUIDE_SECTIONS.length}</span>
          <div className="guide-footer-right">
            {sectionLabel && <button className="btn secondary" onClick={openPage}>Open {sectionLabel} <ArrowRight size={15} /></button>}
            <button className="btn primary" onClick={() => move(1)}>Next <ArrowRight size={15} /></button>
          </div>
        </footer>
      </div>
    </div>
  );
}
