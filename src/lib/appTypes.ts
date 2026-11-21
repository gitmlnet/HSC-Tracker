import type { Dispatch, SetStateAction } from "react";
import type { AppData } from "../types";

export type Page = "today" | "planner" | "insights" | "history" | "settings";

export type TimerState = {
  targetId: string;
  startedAt: number;
  accumulatedMs: number;
  running: boolean;
  createdAt: number;
};

export type AppActions = {
  setData: Dispatch<SetStateAction<AppData>>;
  notify: (message: string, undo?: () => void) => void;
  timer: TimerState | null;
  elapsedMs: number;
  startTimer: (targetId: string) => void;
  pauseTimer: () => void;
  stopTimer: (mode: "full" | "partial") => void;
  go: (page: Page, date?: string, targetId?: string) => void;
  openGuide: (section?: string) => void;
};
