# Quality checklist

Verification performed on this branch. Every item below was checked against the production build (`npm run build`), not just the dev server.

## Correctness

- [x] TypeScript strict check and Vite production build pass; `npm audit` reports 0 vulnerabilities (Vite pinned to 8.3.8).
- [x] Setup → week template → inline quick add → timer start/finish → history → insights flow passes with no console or runtime errors.
- [x] Completing a target logs a session and shows an Undo toast; Undo restores the previous state.
- [x] Clicking a target on Today opens that exact target's editor in the weekly planner.
- [x] Copy last week, carry-forward, drag between days and weekly review are wired to the same target store.
- [x] v1 → v2 migration preserves plans, sessions, progress, theme and session→target links; original v1 payload is kept in localStorage.
- [x] JSON backup/restore, CSV export and clear-workspace undo remain functional.

## PWA

- [x] Manifest served at `/manifest.webmanifest` with `standalone` display, 192/512 PNG icons, shortcuts and relative scope.
- [x] Service worker registers in production from first load and contains a `fetch` handler.
- [x] Cache version bumped when the shell changes; old caches are removed on activate.
- [x] Stable Vercel alias serves the current manifest and service worker; per-deployment URLs are SSO-protected by the Vercel team.
- [x] Relative Vite base verified by serving `dist/` at `/HSC-Tracker/`: HTML, manifest, icons, JS/CSS and SW all resolve.

## Interface

- [x] Typography uses the platform system font stack on Apple devices, including headings.
- [x] Every tinted foreground/background pair used for small text meets at least 4.5:1 contrast (light muted 4.73:1, accent 5.37:1, success 4.81:1, warning 5.01:1, danger 5.14:1).
- [x] Touch controls enlarged on phones; target actions are always visible on touch devices instead of hover-only.
- [x] Subject colour rails make targets scannable without adding text.
- [x] Focus-visible rings, aria labels, dialog roles, Escape-to-close and polite live hints are in place.
- [x] Page, toast, dialog and check transitions use one easing curve and respect `prefers-reduced-motion`.

## Platform limits (by design)

- Browser notifications are checked while the app is open; a static PWA cannot guarantee delivery after the browser is closed.
- The native install prompt appears only when the browser offers `beforeinstallprompt`; the in-app Install button falls back to exact platform instructions.
- GitHub Pages must be enabled in repository settings before its workflow can publish.
