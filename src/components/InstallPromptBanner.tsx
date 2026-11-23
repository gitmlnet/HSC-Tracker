import { Download, X } from "lucide-react";

export default function InstallPromptBanner({ canInstall, onInstall, onDismiss }: {
  canInstall: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}) {
  return (
    <aside className="install-prompt-banner" aria-label="Install HSC Study Planner">
      <div className="install-prompt-copy">
        <span className="install-prompt-icon"><Download size={19} aria-hidden="true" /></span>
        <span className="install-prompt-text">
          <strong>Install HSC Study Planner?</strong>
          <small>Get quick access and a focused, app-like experience on this device.</small>
        </span>
      </div>
      <div className="install-prompt-actions">
        <button className="btn primary" onClick={onInstall}>{canInstall ? "Install app" : "How to install"}</button>
        <button className="icon-btn" onClick={onDismiss} aria-label="Dismiss install invitation" title="Not now"><X size={17} /></button>
      </div>
    </aside>
  );
}
