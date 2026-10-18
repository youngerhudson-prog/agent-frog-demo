# Moving the demo into AGENT FROG as a dashboard tab

The demo was built to drop into `offerready/` without a rebuild. Nothing in `offerready/` has been changed yet; these are the steps for when you decide to do it.

## What to move

Everything the demo draws lives in `src/demo/`:

| Path | What it is |
|---|---|
| `DemoExperience.tsx` | **The entry component.** Renders the whole demo. No props. |
| `opening/` | The cut: `OpeningCut.tsx` (scroll timeline, cloth, wordmark, still version for reduced motion) and `Shears.tsx` (SVG). |
| `walkthrough/` | `Walkthrough.tsx` (section order, stitched thread and needle, tape measure, progress chip), `Reveal.tsx`, `Toggle.tsx`. |
| `sections/` | One file per section A–I. |
| `data/sample.ts`, `data/journey.ts` | All sample content. Fictional, local, no fetches. |
| `demo.css`, `walkthrough.css`, `sections.css` | All styles, each rule scoped under `.af-demo`. Imported by `DemoExperience.tsx`. |
| `usePrefersReducedMotion.ts` | Hydration-safe reduced-motion hook. |

`src/app/` in this folder is only a host page for running the demo on its own. Don't move it.

## Steps

1. Copy `src/demo/` to `offerready/src/demo/` (or `src/components/demo/`; imports inside the folder are all relative, so the location doesn't matter).
2. Add a route, for example `offerready/src/app/(app)/demo/page.tsx`:
   ```tsx
   import { DemoExperience } from "@/demo/DemoExperience";
   export const metadata = { title: "How AGENT FROG works" };
   export default function DemoPage() {
     return <DemoExperience />;
   }
   ```
3. Add a nav item in `src/components/shell/Nav.tsx` (the `NAV` list), for example `{ href: "/demo", label: "Tour", icon: … }`.
4. Work through **Things to watch** below, then run the Playwright scripts listed in the last section against the new route.

## Dependencies

There's nothing to install. The demo uses `next`, `react`, `react-dom` and `motion` at exactly the versions `offerready` already has (Next 16.4.2, React 19.3.0, Motion 14.3). It doesn't use Tailwind classes or `lucide-react`. Both are listed in this folder's `package.json` only so its setup matches the app.

**Fonts:** the demo reads `--font-caslon` and `--font-public-sans`, which the app's root layout already defines with the same names, so no font changes are needed. Documents use Times New Roman from the system, like the app's resume preview.

## Styles

- Every selector starts with `.af-demo` or a class prefixed `af-`, so nothing leaks into the app and the app's utility classes don't reach in.
- The design tokens (`--desk`, `--paper`, `--ink`, `--frog` and the rest) are re-declared on `.af-demo` with the app's values. If the app's tokens change, update the top of `demo.css` to match, or delete the copies and let the app's `:root` tokens apply.
- The host page sets three things outside `.af-demo` (`src/app/globals.css` here). The app already has the first two:
  - `color-scheme: dark`
  - the page background `#1b1512`
  - `html { scroll-padding: 5rem 0 6rem; }`, which keeps keyboard-focused controls clear of the fixed progress chip. Add this to the demo route only, or accept that focused controls can sit behind the chip.

## Things to watch

1. **Full-bleed layout.** The opening is meant to fill the screen. The app's `<main>` adds side padding and top padding (`px-[var(--page-gutter)] pt-6 md:pt-8 xl:pt-10`). Wrap `DemoExperience` in a div with matching negative margins, or let the route opt out of that padding. Without this, the cloth sits inside a padded box, which still works but looks framed.
2. **The app's sticky headers.**
   - On phones the app shows a 56px sticky header (`Nav.tsx`), which will cover the top of the pinned cloth and the demo's progress chip (`.af-progress`, top-left under 900px). Add `top: calc(3.5rem + 0.75rem)` to `.af-progress` in the narrow media query, and consider `top: 3.5rem` on `.af-cut-sticky`.
   - The studio header in `StudioChrome.tsx` is 64px; check the same if the tab lives there.
3. **Two skip links.** The app already has "Skip to main content". The demo adds its own "Skip to the walkthrough" (`DemoExperience.tsx`). That's useful here because the opening is 230% of the screen height of scroll. Keep both, but check they don't overlap visually when focused, since both sit at the top-left.
4. **The route transition's transform.** `RouteTransition` animates the page wrapper with `y: 8 → 0` over 220ms. While a transform is active, `position: fixed` children (the progress chip, the skip link) position against the wrapper instead of the screen. It settles at `y: 0`, so it should be harmless. Confirm that the chip doesn't jump on arrival.
5. **The scroll container.** The opening, the thread and the tape measure use Motion's `useScroll` against the window. The app shell scrolls the window today (`min-h-dvh`, no `overflow` on `<main>`). If that ever becomes an inner scrolling panel, pass that element to every `useScroll` as `container`.
6. **Section anchors.** The progress chip and the skip link use `href="#materials"`-style anchors and `id="top"`. Those ids must stay unique on the page, so don't render the demo twice on one route.
7. **Mobile cut width.** `useGapPercent` in `OpeningCut.tsx` measures `innerWidth`. Inside a column narrower than the window (desktop nav rail), the minimum gap comes out a little smaller than intended. Measure the stage element instead if it looks thin.
8. **Copy that says "this page".** The demo notes say things like "Changes stay on this page". That's still true inside the app, but if the demo is ever wired to a real profile, those notes and the "Preview only" export must change at the same time.

## Honesty constraints to keep

- All data is fictional: Jordan Reyes is the app's own fixture (`offerready/src/domain/__tests__/sampleProfile.ts`), and the employers are invented.
- Labels, statuses and messages are copied from the app, apart from changes made so nothing claims to have saved or sent anything:
  - the profile answer says "Saved to the sample profile"
  - Download PDF says it's a preview and makes no file
- If an app label changes, update the matching string in `data/` or the section file so the demo doesn't describe an older product.
- Section G copies the app's typed-answer STAR check (`ruleFeedback` in `offerready/src/domain/interview.ts`) rather than importing it, so the demo stays standalone. After integrating you can import the real function instead.

## Retesting after the move

The Checkpoint 4 scripts are in `tests/playwright/`. They are plain `playwright-cli run-code --filename=<script>` scripts that drive the page by role and visible text.

| Script | What it checks |
|---|---|
| `full.js` | Every section's interaction and its reversal, the opening down and up, failed or external requests, broken images, overflow, clipping, headline length. Saves screenshots to the `OUT` path at its top; change that first. |
| `keytrap.js` | Tabs through the whole page: order, focus rings, no traps, Escape out of an editor. |
| `perf.js` | Frame times through the opening and the walkthrough, layout shift, animations still running when idle. |
| `crossings.js` | The stitched thread never runs behind text. |
| `contrast.js` | WCAG AA contrast for every visible text element. |
| `skip.js` | The skip link. |

To rerun after the move:
- Change `http://localhost:3100/` in each script to the new route.
- Run at 1440×900, 820×1180 and 390×844, then once more with `playwright-cli set-reduced-motion reduce`.
- Run with the app's real chrome in place, since items 1–4 above only show up there.
