# Quality checklist

Verification performed on this branch. Every item below was checked against the production build (`npm run build`), not just the dev server.

## Correctness

- [x] TypeScript strict check and Vite production build pass; `npm audit` reports 0 vulnerabilities (Vite pinned to 8.3.8).
- [x] Setup → week template → inline quick add → timer start/finish → history → insights flow passes with no console or runtime errors.
- [x] Completing a target logs a session and shows an Undo toast; Undo restores the previous state.
- [x] Clicking a target on Today opens that exact target's editor in the weekly planner.
- [x] Copy last week, carry-forward, drag between days and weekly review are wired to the same target store.
- [x] v1 → v2 migration preserves plans, sessions, progress, theme and session→target links; original v1 payload is kept in localStorage.
- [x] A named day in quick entry is honoured on Today and in the weekly board; a logged line is never silently turned into a plan (or vice versa).
- [x] Undo is surgical: reversing a completion no longer overwrites unrelated edits made while the toast is visible.
- [x] A target with an active timer cannot be deleted or removed by clearing/replacing its week; no logged minutes are silently lost.
- [x] Past-dated logs use a timestamp from that day instead of the current time.
- [x] The in-app user guide has 13 searchable chapters, opens contextually from every page, supports next/previous navigation, deep links to the described screen, and is reachable from the sidebar, Today promo and `help <topic>` palette command.
- [x] The written manual in `docs/USER_GUIDE.md` matches the implemented behaviour, including honest notes on chapter coverage, reminders and local-only data.
- [x] JSON backup/restore, CSV export and clear-workspace undo remain functional.

## PWA

- [x] Manifest served at `/manifest.webmanifest` with `standalone` display, 192/512 PNG icons, shortcuts and relative scope.
- [x] The `beforeinstallprompt` event is captured at module load (before React effects), retained until the user clicks Install, and its accepted/dismissed result is handled without losing the native prompt.
- [x] The Install dialog checks HTTPS, same-origin manifest scope, standalone display, both actual PNG icon dimensions/content types, and an activated service worker; it gives platform-correct install steps and explains that a webpage cannot force an unsupported browser to install.
- [x] Service worker registers in production with a versioned, cache-busted script URL and contains a `fetch` handler; offline shell and assets are cached under the matching versioned cache and old caches are removed on activate.
- [x] Stable Vercel alias serves the current manifest and service worker; per-deployment URLs are SSO-protected by the Vercel team.
- [x] Relative Vite base verified by serving `dist/` at `/HSC-Tracker/`: HTML, manifest, icons, JS/CSS and SW all resolve.

## Interface

- [x] Desktop sidebar collapses to a persistent, keyboard-accessible icon rail and expands from the top-bar control; mobile retains its independent slide-in drawer, backdrop, close control and Escape handling.

- [x] Typography uses the platform system font stack on Apple devices, including headings.
- [x] Every tinted foreground/background pair used for small text meets at least 4.5:1 contrast (light muted 4.73:1, accent 5.37:1, success 4.81:1, warning 5.01:1, danger 5.14:1).
- [x] Touch controls enlarged on phones; target actions are always visible on touch devices instead of hover-only.
- [x] Subject colour rails make targets scannable without adding text.
- [x] Focus-visible rings, aria labels, dialog roles and polite live hints are in place.
- [x] Every dialog (setup, command palette, install guide) traps Tab focus, closes on Escape and returns focus to its trigger; global shortcuts stay quiet while a dialog is open.
- [x] Page, toast, dialog and check transitions use one easing curve and respect `prefers-reduced-motion`, including programmatic scrolls.

## Platform limits (by design)

- Browser notifications are checked while the app is open; a static PWA cannot guarantee delivery after the browser is closed.
- Native install UX is browser/platform controlled: Chromium can offer `beforeinstallprompt`; iOS uses Safari Share → Add to Home Screen. If a browser offers only “Create shortcut”, the app no longer describes that as installation and instead shows readiness checks and actionable browser guidance. Native OS installation itself cannot be automated from this headless test environment.
- GitHub Pages must be enabled in repository settings before its workflow can publish.
