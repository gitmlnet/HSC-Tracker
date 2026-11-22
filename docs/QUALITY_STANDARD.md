# Project-wide quality standard

This is a permanent requirement for every task in this repository — not a one-time design pass. The benchmark is the craftsmanship of iPhone, iPad and MacBook software: refined, quiet, immediate and technically excellent.

## Non-negotiable principles

1. **Extreme attention to detail.** Spacing, alignment, proportions, typography, colour, borders, shadows, radii, icons, transitions and component states are all part of the product. No rough edges, awkward layouts or decorative clutter. Every element has a purpose.
2. **Premium UI/UX.** One cohesive, modern, professional design system across every screen, component, dialog and interaction. Clear hierarchy, restrained decoration, balanced whitespace, precise alignment.
3. **Exceptional smoothness.** Interactions feel immediate, fluid and predictable. Consistent easing, purposeful motion, no jitter, flicker, layout shift or abrupt state changes. Equally polished for touch and pointer input.
4. **Engineering excellence.** Modular, maintainable code; no duplicated logic, hacks or unnecessary dependencies. Correctness, security and performance are not traded away for visuals.
5. **Responsive perfection.** Phones, tablets, laptops and desktop; different orientations and input methods. Layouts adapt intelligently — no overflow, clipping or inaccessible controls. Mobile and tablet get special care.
6. **Component-level refinement.** Every button, input, card, menu, tab, list, dialog, empty state, validation message and notification is finished in default, hover, active, pressed, focus, disabled, loading, success and error states.
7. **Performance and reliability.** Minimal re-renders and network requests; no leaks, runtime errors or broken interactions. Smooth on realistic devices and connections.
8. **Continuous QA.** Verify behaviour, not appearance alone. Test key journeys and edge cases, multiple viewport sizes and input methods. Recheck affected areas after every change.
9. **No superficial completion.** If a meaningfully better solution exists without breaking another requirement, refine it. Do not add complexity to look sophisticated. Decide with evidence, not trends.
10. **Applies to everything.** Every feature, component, page, modification and development session is held to this same bar.

## Completion gate

Before calling any task done, answer each of these from actual verification:

1. Is it functionally correct, including edge cases?
2. Is the implementation technically sound and maintainable?
3. Does it meet the visual standard and match the design system?
4. Are interactions smooth, intuitive and predictable?
5. Is every detail consistent across all affected surfaces?
6. Does it work across supported screen sizes and input methods?
7. Is it performant, accessible, secure and free of console errors?
8. Has it been tested against the production build — and against the live deployment if one was involved?
9. Is there any remaining noticeable imperfection that should be corrected now?

A "no" to any applicable question means continue refining. Record what was checked in [`QA_CHECKLIST.md`](QA_CHECKLIST.md) so the next session starts from evidence rather than assumptions.
