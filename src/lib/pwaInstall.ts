import { useSyncExternalStore } from "react";

export type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallState = {
  prompt: DeferredInstallPrompt | null;
  installed: boolean;
};

const listeners = new Set<() => void>();
const isStandalone = () => typeof window !== "undefined" && (
  window.matchMedia?.("(display-mode: standalone)").matches === true ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true
);
let snapshot: InstallState = { prompt: null, installed: isStandalone() };

function publish(next: InstallState) {
  snapshot = next;
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

if (typeof window !== "undefined") {
  // Installability events may fire before React effects mount; capture them at
  // module evaluation so the native prompt is never missed.
  window.addEventListener("beforeinstallprompt", event => {
    const prompt = event as DeferredInstallPrompt;
    event.preventDefault();
    publish({ ...snapshot, prompt });
  });
  window.addEventListener("appinstalled", () => publish({ prompt: null, installed: true }));

  const displayMode = window.matchMedia?.("(display-mode: standalone)");
  displayMode?.addEventListener?.("change", event => {
    if (event.matches) publish({ prompt: null, installed: true });
  });
}

export function usePwaInstall() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const prompt = snapshot.prompt;
  if (!prompt) return "unavailable";
  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    publish({ ...snapshot, prompt: null, installed: choice.outcome === "accepted" || snapshot.installed });
    return choice.outcome;
  } catch {
    publish({ ...snapshot, prompt: null });
    return "unavailable";
  }
}
