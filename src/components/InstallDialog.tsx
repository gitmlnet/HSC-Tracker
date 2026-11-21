import { useState } from "react";
import { Check, Copy, Download, Monitor, Smartphone, Tablet, X } from "lucide-react";

export default function InstallDialog({ prompt, onClose, onInstall }: {
  prompt: Event | null;
  onClose: () => void;
  onInstall: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setCopied(true);
    } catch { /* Clipboard may be blocked; the URL is visible in the address bar. */ }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="install-dialog" onMouseDown={e => e.stopPropagation()} role="dialog" aria-label="Install the app">
        <button className="icon-btn dialog-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <div className="install-badge"><Download size={24} /></div>
        <span className="eyebrow">INSTALL THE PWA</span>
        <h2>HSC Study Planner on your home screen</h2>
        <p>This installs a real offline-capable app — not a browser shortcut. It opens full-screen and keeps your study data on this device.</p>

        {prompt && (
          <button className="btn primary install-now" onClick={onInstall}><Download size={17} /> Install app now</button>
        )}

        <div className="install-steps">
          <div><Smartphone size={18} /><span><b>Android · Chrome</b><small>Open the three-dot menu → <strong>Install app</strong> or <strong>Add to Home screen</strong>.</small></span></div>
          <div><Tablet size={18} /><span><b>iPhone / iPad · Safari</b><small>Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>.</small></span></div>
          <div><Monitor size={18} /><span><b>Desktop · Chrome / Edge</b><small>Use the install icon in the address bar, or menu → <strong>Cast, save &amp; share</strong> → <strong>Install page as app</strong>.</small></span></div>
        </div>

        <div className="install-foot">
          <button className="btn secondary" onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Link copied" : "Copy app link"}</button>
          <small>If your browser only shows "Create shortcut", use another browser or install from the address bar — the app itself is a valid installable PWA.</small>
        </div>
      </div>
    </div>
  );
}
