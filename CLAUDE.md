# CLAUDE.md — Agent Rules for Wien U-Bahn Anzeigetafel

## Project Overview

A browser-based recreation of authentic Vienna U-Bahn departure boards (Anzeigetafel).
Single-page app, vanilla TypeScript + Vite, no framework. Displays real-time departures
from the Wiener Linien API with WU3 segment display font.

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Build:** Vite 6.x
- **Package manager:** pnpm (considering bun migration)
- **Styling:** Plain CSS with custom properties (no preprocessor)
- **No framework** — vanilla DOM manipulation
- **Font:** WU3 Segments (custom 7-segment display font)

## Project Structure

```
src/
  main.ts        — App entry point, init, state wiring
  api.ts         — Wiener Linien API fetching + parsing
  types.ts       — TypeScript interfaces
  stations.ts    — U-Bahn station data with RBL IDs
  style.css      — All styles
scripts/         — One-off helper scripts (not part of the app)
public/fonts/    — WU3 segment font files
```

## Code Practices

### TypeScript
- Strict mode is ON (`noUnusedLocals`, `noUnusedParameters`)
- Use explicit return types on exported functions
- Prefer `interface` over `type` for object shapes
- No `any` — use `unknown` + type narrowing when needed
- Use `as const` for literal arrays/objects where appropriate

### DOM & Rendering
- Cache DOM elements at module top in an `elements` object
- Use the cached references consistently — never mix `elements.foo` with `document.getElementById('foo')` for the same element
- Prefer `textContent` over `innerHTML` when not inserting HTML structure
- When building complex DOM, prefer small helper functions over monolithic builders
- Always check for `null` when querying optional elements

### CSS
- All dimensions derive from `--H` (base height unit) for proportional scaling
- Use CSS custom properties for all colors and repeated values
- BEM-ish naming: `.block__element--modifier`
- Never leave commented-out code in CSS — delete it or put it behind a flag
- Keep debug styles in a separate section, gated by `body.debug-mode`

### State Management
- App state lives in module-scope variables in `main.ts`
- localStorage for persistence only — never as source of truth during runtime
- Always define a TypeScript type for localStorage schema
- Clear intervals/timeouts explicitly before setting new ones (prevent leaks)

### API & Data
- All API calls go through `api.ts` — no direct `fetch()` elsewhere
- Parse and validate API responses before using
- Always handle errors with user-facing feedback (not just console.log)
- Sort and limit departures at the API layer, not in rendering

### File Organization
- One concern per module — if a file does more than one thing, split it
- Keep `main.ts` thin: init + wiring only
- Constants in `constants.ts` (poll intervals, cell counts, storage keys)
- Types in `types.ts` — co-locate only when the type is truly module-private

### General
- No `console.log` in production code (use only in error handlers, remove debug logs)
- Prefer `const` over `let`; never use `var`
- Use template literals for string building, not concatenation
- Prefer early returns over deep nesting
- Don't add comments for obvious code — comment the "why", not the "what"
- Keep functions under 30 lines where possible
- No dead code — if it's not used, delete it. Don't comment it out "for later"

## Commands

```bash
pnpm run dev      # Start dev server (localhost:5173)
pnpm run build    # Type-check + production build
pnpm run preview  # Preview production build
```

## Known Limitations

- CORS proxy (`corsproxy.io`) is a fragile third-party dependency
- U3 line data may not return results (under construction)
- Some RBL IDs are shared across multiple stations — API limitation
- No mobile layout — designed for ambient/kiosk fullscreen display
- No tests yet
