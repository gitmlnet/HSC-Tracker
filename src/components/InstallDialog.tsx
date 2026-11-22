import { useEffect, useRef, useState } from "react";
import { Check, CircleAlert, Copy, Download, Monitor, Smartphone, Tablet, X } from "lucide-react";
import { useDialogFocus } from "../lib/dialogFocus";

type Checks = { secure: boolean; manifest: boolean | null; icons: boolean | null; worker: boolean | null };

export default function InstallDialog({ canInstall, installed, onClose, onInstall }: {
  canInstall: boolean;
  installed: boolean;
  onClose: () => void;
  onInstall: () => void | Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [checks, setChecks] = useState<Checks>({
    secure: window.isSecureContext,
    manifest: null,
    icons: null,
    worker: null
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, onClose);

  useEffect(() => {
    let cancelled = false;
    const checkPwa = async () => {
      const secure = window.isSecureContext;
      let manifest: boolean | null = false;
      let icons: boolean | null = false;
      try {
        const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
        if (!link?.href) throw new Error("Manifest link is missing");
        const response = await fetch(link.href, { cache: "no-store" });
        if (!response.ok) throw new Error("Manifest request failed");
        const data = await response.json() as {
          start_url?: string; scope?: string; display?: string;
          icons?: Array<{ src: string; sizes: string; type?: string; purpose?: string }>;
        };
        const start = data.start_url ? new URL(data.start_url, response.url) : null;
        const scope = data.scope ? new URL(data.scope, response.url) : null;
        const inScope = Boolean(start && scope && start.origin === scope.origin && start.pathname.startsWith(scope.pathname));
        const icon192 = data.icons?.find(icon => icon.type === "image/png" && /(?:^|\s)192x192(?:\s|$)/.test(icon.sizes) && (!icon.purpose || icon.purpose.split(/\s+/).includes("any")));
        const icon512 = data.icons?.find(icon => icon.type === "image/png" && /(?:^|\s)512x512(?:\s|$)/.test(icon.sizes) && (!icon.purpose || icon.purpose.split(/\s+/).includes("any")));
        manifest = Boolean(inScope && data.display === "standalone" && icon192 && icon512);
        const requiredIcons = [icon192, icon512].filter((icon): icon is NonNullable<typeof icon> => Boolean(icon));
        try {
          const iconResponses = await Promise.all(requiredIcons.map(async icon => {
            const iconUrl = new URL(icon.src, response.url);
            if (iconUrl.origin !== window.location.origin) return false;
            const iconResponse = await fetch(iconUrl, { cache: "no-store" });
            if (!iconResponse.ok || !iconResponse.headers.get("content-type")?.includes("image/png")) return false;
            const bytes = new Uint8Array(await iconResponse.arrayBuffer());
            const validPng = bytes.length >= 24 && bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
            if (!validPng) return false;
            const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
            const expected = icon.sizes.includes("512x512") ? 512 : 192;
            return view.getUint32(16) === expected && view.getUint32(20) === expected;
          }));
          icons = requiredIcons.length === 2 && iconResponses.every(Boolean);
        } catch { icons = false; }
      } catch {
        manifest = false;
        icons = false;
      }

      let worker: boolean | null = false;
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          worker = registration?.active?.state === "activated";
        } catch { worker = false; }
      }
      if (!cancelled) setChecks({ secure, manifest, icons, worker });
    };
    void checkPwa();
    return () => { cancelled = true; };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setCopied(true);
    } catch { /* Clipboard may be blocked; the URL is visible in the address bar. */ }
  };
  const ua = navigator.userAgent;
  const isAppleMobile = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div ref={dialogRef} className="install-dialog" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Install the app" tabIndex={-1}>
        <button className="icon-btn dialog-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <div className="install-badge"><Download size={24} /></div>
        <span className="eyebrow">INSTALL THE PWA</span>
        <h2>{installed ? "HSC Study Planner is installed" : "HSC Study Planner on your device"}</h2>
        <p>{installed
          ? "This browser reports the app is already installed. Open it from your home screen or apps list for the full-screen experience."
          : "Install the website as a real app. The browser's native install flow creates the app entry; a browser bookmark or shortcut is not the same thing."}</p>

        {canInstall && !installed && (
          <button className="btn primary install-now" onClick={() => void onInstall()}><Download size={17} /> Install app now</button>
        )}

        {!installed && !canInstall && (
          <div className="install-diagnostics" aria-live="polite">
            <div className="install-diagnostics-title"><b>Checking this browser</b><span>These checks help explain why the native install prompt may not be available.</span></div>
            <CheckRow label="Secure HTTPS connection" passed={checks.secure} />
            <CheckRow label="Web app manifest and standalone display" passed={checks.manifest} />
            <CheckRow label="192 px and 512 px app icons load correctly" passed={checks.icons} />
            <CheckRow label="Offline service worker is active" passed={checks.worker} />
          </div>
        )}

        <div className="install-steps">
          {!isAppleMobile && <div><Smartphone size={18} /><span><b>Android · Chrome</b><small>Open this address directly in Chrome (not inside another app). Use the browser menu → <strong>Install app</strong>. If Chrome says only “Create shortcut”, update Chrome, exit Incognito, reload this page and wait for the checks above to finish.</small></span></div>}
          {isAppleMobile && <div><Tablet size={18} /><span><b>iPhone / iPad · Safari</b><small>Open this page in Safari → tap <strong>Share</strong> → <strong>Add to Home Screen</strong> → <strong>Add</strong>. iOS does not show the Chromium install prompt; Add to Home Screen is Apple's PWA installation flow.</small></span></div>}
          {!isAppleMobile && !isAndroid && <div><Monitor size={18} /><span><b>Desktop · Chrome / Edge</b><small>Use the install icon at the right of the address bar, or the browser menu → <strong>Install HSC Study Planner</strong> / <strong>Install page as app</strong>. Do not choose “Create shortcut” if you want an installed PWA.</small></span></div>}
        </div>

        {!installed && !canInstall && <p className="install-browser-note"><CircleAlert size={15} /> If the checks pass but your browser still offers only a shortcut, it is not exposing native PWA installation for this visit. Open the exact site URL in the latest full Chrome or Edge browser (not an in-app browser, guest profile or private window), then reload. Installation availability is controlled by the browser and cannot be forced by a webpage.</p>}

        <div className="install-foot">
          <button className="btn secondary" onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Link copied" : "Copy app link"}</button>
          <small>Study data remains stored on this device. Install does not upload or sync it.</small>
        </div>
      </div>
    </div>
  );
}

function CheckRow({ label, passed }: { label: string; passed: boolean | null }) {
  return <div className={`install-check${passed === true ? " pass" : passed === false ? " fail" : " pending"}`}>
    {passed === true ? <Check size={14} /> : passed === false ? <CircleAlert size={14} /> : <span className="install-check-dot" />}
    <span>{label}</span><b>{passed === true ? "Ready" : passed === false ? "Needs attention" : "Checking"}</b>
  </div>;
}
