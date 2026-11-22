import { Pause, Play, Square, Timer } from "lucide-react";
import type { AppData } from "../types";
import type { AppActions } from "../lib/appTypes";
import { targetLabel } from "../data/subjects";
import { formatDuration } from "../lib/storage";

export default function TimerDock({ data, actions }: { data: AppData; actions: AppActions }) {
  const timer = actions.timer;
  if (!timer) return null;
  const target = data.targets.find(t => t.id === timer.targetId);
  if (!target) return null;
  return (
    <div className="timer-dock">
      <div className="timer-icon"><Timer size={19} /></div>
      <div className="timer-copy">
        <span>{timer.running ? "Focus session running" : "Session paused"}</span>
        <b>{targetLabel(target, data.settings)}</b>
      </div>
      <strong className="timer-time">{formatDuration(Math.floor(actions.elapsedMs / 60000))}</strong>
      <div className="timer-buttons">
        <button className="icon-btn" onClick={timer.running ? actions.pauseTimer : actions.startTimer.bind(null, timer.targetId)} title={timer.running ? "Pause" : "Resume"}>
          {timer.running ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <button className="btn ghost" onClick={() => actions.stopTimer("partial")}>Log partial</button>
        <button className="btn primary" onClick={() => actions.stopTimer("full")}><Square size={14} /> Finish</button>
      </div>
    </div>
  );
}
