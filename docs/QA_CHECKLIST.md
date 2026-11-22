# Quality checklist

Verification performed on this branch. Every item below was checked against the production build (`npm run build`), not just the dev server.

## Correctness

- [x] TypeScript strict check and Vite production build pass; `npm audit` reports 0 vulnerabilities (Vite pinned to 8.3.8).
- [x] Production-bundle guided planning/logging flow: select subject and built-in chapter, save time/progress goals, repeat one target on multiple dates, and log an absolute chapter estimate; jsdom interaction run reports no runtime errors.
- [x] Target logging opens directly in the wizard; the focus timer still logs actual elapsed minutes and its stop flow works.
- [x] Progress semantics verified: an overall chapter estimate of 100% does not complete a time target; a progress goal completes at its cumulative milestone; timer minutes alone do not complete a progress target.
- [x] Today target edit controls open the exact target in the guided planner; History displays and edits chapter snapshots separately from target completion.
- [x] Fast plan DOM flow verifies the seven-day rail, day selection, subject/chapter/goal panes, immediate schedule update, multi-target planning, week navigation, Today navigation, and Escape close.
- [x] Weekly Planner keeps weekday headers and week navigation while removing Fast plan, Plan a target, Copy last week, Auto-plan and Clear week from above the columns; each day retains its own Add target control. Target names and metadata stay within their day cards, with planner-only small-text contrast and sizing adjustments.
- [x] Fast Plan's seven-day overview makes every existing task an edit control; saving updates that target (including its date) without duplicating it, and adding a new plan remains available.
- [x] Carry-forward, drag between days and weekly review are wired to the same target store.
- [x] v1 migration preserves plans, sessions, progress and theme; v2 records without tracking-mode fields default to time, completed legacy links gain an absolute 100% chapter snapshot, and session→target links are repaired where possible.
- [x] Multi-date planning creates distinct targets on the selected Saturday–Friday dates; single-date planning remains available.
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

- [x] Typography uses the platform system font stack on Apple devices, including headings; supporting copy, form labels, planning metadata and primary Fast plan controls use a larger, consistent readable type scale, with touch form controls at 16px on mobile.
- [x] Every tinted foreground/background pair used for small text meets at least 4.5:1 contrast (light muted 4.73:1, accent 5.37:1, success 4.81:1, warning 5.01:1, danger 5.14:1).
- [x] Touch controls enlarged on phones; target actions are always visible on touch devices instead of hover-only.
- [x] Subject colour rails make targets scannable without adding text.
- [x] Focus-visible rings, aria labels, dialog roles and polite live hints are in place.
- [x] Every dialog (setup, command palette, install guide, study wizard and Fast plan) traps Tab focus, closes on Escape and returns focus to its trigger; both planning dialogs' open/Escape/focus paths are verified in the production bundle.
- [x] Page, toast, dialog and check transitions respect `prefers-reduced-motion`, including wizard transitions and programmatic scrolls.
- [x] Study wizard has a full-height small-screen layout, independently scrollable content and safe-area padding; physical Android/tablet visual testing was not available in this sandbox.

## Platform limits (by design)

- Browser notifications are checked while the app is open; a static PWA cannot guarantee delivery after the browser is closed.
- Native install UX is browser/platform controlled: Chromium can offer `beforeinstallprompt`; iOS uses Safari Share → Add to Home Screen. If a browser offers only “Create shortcut”, the app no longer describes that as installation and instead shows readiness checks and actionable browser guidance. Native OS installation itself cannot be automated from this headless test environment.
- GitHub Pages must be enabled in repository settings before its workflow can publish.
