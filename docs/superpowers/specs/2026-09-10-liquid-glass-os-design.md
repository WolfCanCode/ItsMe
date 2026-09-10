# ItsMe Portfolio Refresh — Liquid Glass OS Design

**Date:** 2026-09-10  
**Status:** Approved for planning  
**Approach:** Chrome-first CSS/SVG liquid glass on the existing SolidStart desktop shell

## Goal

Modernize the WolfCanCode macOS-style portfolio so it feels current and premium: real liquid-glass refraction on chrome, reliable window interaction, a proper CV viewer, and a light About Tommy content pass — without rewriting the app architecture.

## Locked decisions

| Topic | Choice |
|-------|--------|
| Visual direction | Liquid glass via SVG displacement refraction (nikdelvin/liquid-glass technique), not milky frost |
| Right-click | Desktop context menu + window title-bar context menu |
| CV viewer | pdf.js in-window viewer with page controls + Download |
| Green traffic light | Maximize / restore (+ title-bar double-click) |
| Content scope | Shell polish + light About Tommy / dock-icon refresh |

## Visual thesis

A luminous liquid-glass macOS desktop. The wallpaper is a sharp, high-contrast visual anchor. Glass panes use near-zero blur with edge refraction and chromatic aberration so background color bends through the chrome. Content inside windows stays sharp and readable. One accent for focus/maximize. Motion is restrained: window open, minimize-to-dock, context-menu appear.

### Liquid glass recipe

Port the MIT-licensed technique from [nikdelvin/liquid-glass](https://github.com/nikdelvin/liquid-glass):

- `getDisplacementMap` / `getDisplacementFilter` utilities
- Apply via `backdrop-filter: url(...)` with ResizeObserver per surface
- Defaults: `blur ≈ 0`, `strength ≈ 100`, `chromaticAberration ≈ 2`, `depth ≈ 10`
- Safari: detect missing `backdrop-filter: url()` support and fall back to frosted glassmorphism
- Credit + MIT notice retained in source

**Do not** pre-blur the wallpaper. If `mywall.png` lacks contrast for refraction to read, replace or add a sharper desktop wallpaper asset.

**Apply LiquidGlass to:** MenuBar, Dock, Window chrome (frame/title bar), ContextMenu panels.  
**Do not apply to:** pdf.js canvas, iframe trainer documents, or dense text body (except optional chip/button accents in About).

### Typography & tokens

- Distinctive display + body pair (avoid Inter / generic system-only UI)
- CSS variables in `app.css`: glass depth/strength defaults, accent, menu/dock heights, z-index scale
- Wallpaper remains full-bleed under all chrome

## Window UX

### Drag & resize

- Drag from title bar only (mouse and touch)
- Remove whole-window `onTouchStart` drag binding that fights iframe/PDF interaction
- Visible corner **and** edge resize handles with clear affordances; avoid overlapping traffic lights
- Clamp position/size to the usable desktop: below menu bar, above dock, within viewport
- During drag/resize, keep the existing interaction overlay so iframes do not steal events
- Key interaction state by **project id**, not window title string

### Traffic lights

- Red: close (existing closing animation)
- Yellow: minimize to dock (existing minimize animation)
- Green: maximize / restore into usable desktop bounds
- Title-bar double-click toggles maximize / restore
- Show classic symbols on hover where helpful; `cursor-grab` / `cursor-grabbing` on title bar

### Layout

- Window root is a flex column: chrome title bar + `flex-1 min-h-0` body
- Body hosts app content without title-bar height overflow/clipping
- Map open windows from the `projects` registry instead of four hard-coded trees
- Delete or stop shipping unused `AppWindow.tsx`

### Right-click menus

**Desktop menu:** Refresh desktop (dismiss menus and clear transient UI selection), About Tommy (open/focus that window), Change wallpaper (cycle assets in `/public/wallpapers/`; ship at least two wallpapers including one sharp high-contrast option for refraction).

**Window menu (title bar / chrome):** Close, Minimize, Maximize / Restore, Bring to Front.

Menus use LiquidGlass panels; dismiss on outside click, Escape, or selecting an action. Do not `preventDefault` without showing a custom menu.

## CV viewer (pdf.js)

Replace the bare `/pdf/myCV.pdf` iframe in `MyCVViewerApp` with pdf.js:

- Render pages to canvas (or pdf.js standard viewer pattern suitable for Solid)
- Controls: previous / next page, page indicator, Download link to `/pdf/myCV.pdf`
- Loading and error states (never a blank frame)
- Lives inside the flex window body so sizing is correct on desktop and mobile

Course Trainer and Interview Trainer remain iframes; only window chrome is glass.

## Light content refresh

- About Tommy: tighten hierarchy (name, role, short bio, tech chips, socials); glass chips/buttons; keep existing facts unless copy is clearly outdated
- Dock / desktop icons: polish hover and glass-adjacent treatment; fix Dock `group` hover bug if still present
- Fix misnamed default export in `InterviewTrainerApp.tsx`
- Meta title/description stay coherent with “WolfCanCode OS”

## Architecture

```
Desktop
├── MenuBar              → LiquidGlass strip
├── DesktopIcons
├── ContextMenu          → shared desktop + window
├── Dock                 → LiquidGlass
└── Window[]             ← from projects registry
    ├── LiquidGlass chrome (lights, title, handles)
    ├── body (flex-1 min-h-0)
    │   ├── MyCVViewer (pdf.js)
    │   ├── AboutTommy (light refresh)
    │   └── iframe apps
    └── ContextMenu (window actions)

src/lib/liquid-glass/           # displacement helpers (MIT credit)
src/components/ui/LiquidGlass.tsx
```

### State

Retain home-route window state with localStorage persistence (`wolfcancode-os-state`):

- Existing: `openIds`, `minimizedIds`, `windowStates`, `windowStatus`, `activeWindow`
- Add: maximized flag / restore rectangle per window
- Interaction ids keyed by project id

### Motion

- Window open scale-in
- Minimize / restore to dock target
- Context menu fade + slight scale
- Optional subtle glass hover brightness — no decorative particle noise

## Out of scope

- New portfolio apps or rewriting Course/Interview trainers
- Auth, CMS, or backend
- Full SolidStart / Vinxi major upgrade as a prerequisite
- Theme toggle (light/dark product switch)
- Pixel-perfect Safari parity for displacement (fallback is acceptable)

## Success criteria

1. On Chromium/Firefox, window/dock/menu chrome show visible edge refraction over a sharp wallpaper (not a foggy white card).
2. Title-bar drag and edge/corner resize feel intentional; mobile can scroll/use PDF without accidental window dragging.
3. Green maximize/restore and title-bar double-click work; geometry clamps to the desktop.
4. Right-click desktop and window chrome open the agreed menus.
5. My CV renders via pdf.js with navigation + download; no clipped empty iframe.
6. About Tommy and chrome feel like one coherent liquid-glass OS.
7. MIT attribution for ported liquid-glass filter code is present.

## Implementation notes (for planning)

Primary touch files: `Window.tsx`, `Dock.tsx`, `MenuBar.tsx`, `Desktop.tsx`, `DesktopIcons.tsx`, `AppIcon.tsx`, `routes/index.tsx`, `MyCVViewerApp.tsx`, `AboutTommyWindow.tsx`, `app.css`, `projects.tsx`.  
Add: `LiquidGlass` component + liquid-glass lib, `ContextMenu` component, pdf.js dependency.
