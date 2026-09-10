# Liquid Glass OS Portfolio Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the ItsMe SolidStart desktop portfolio with nikdelvin-style liquid-glass chrome, fixed window UX (drag/resize/maximize/context menus), a pdf.js CV viewer, and a light About Tommy polish.

**Architecture:** Keep the existing SolidStart window manager in `src/routes/index.tsx`. Add a reusable `LiquidGlass` Solid component backed by ported SVG displacement helpers. Apply glass to MenuBar, Dock, Window chrome, and ContextMenu only. Map windows from `projects` and fix layout/interaction bugs in `Window.tsx`.

**Tech Stack:** SolidJS / SolidStart (Vinxi), Tailwind CSS v4, pdf.js (`pdfjs-dist`), ported MIT liquid-glass SVG filters, Vitest for pure helper tests.

**Spec:** `docs/superpowers/specs/2026-09-10-liquid-glass-os-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `src/lib/liquid-glass/displacement.ts` | `getDisplacementMap` / `getDisplacementFilter` (MIT port + credit) |
| `src/lib/liquid-glass/supports.ts` | Detect `backdrop-filter: url()` support |
| `src/lib/liquid-glass/ATTRIBUTION.md` | MIT notice for nikdelvin/liquid-glass |
| `src/components/ui/LiquidGlass.tsx` | Solid wrapper: overlay + filter layer + ResizeObserver |
| `src/components/ui/ContextMenu.tsx` | Shared desktop/window context menu panel |
| `src/lib/desktopBounds.ts` | Usable desktop clamp helpers (menu/dock insets) |
| `src/lib/wallpapers.ts` | Wallpaper asset list + cycle helper |
| `src/app.css` | Design tokens, fonts, glass fallback utilities |
| `src/components/Window.tsx` | Glass chrome, title-only drag, edges, maximize, menus |
| `src/components/MenuBar.tsx` | LiquidGlass menu strip |
| `src/components/Dock.tsx` | LiquidGlass dock + hover `group` fix |
| `src/components/Desktop.tsx` | Wallpaper cycle + desktop context menu |
| `src/components/DesktopIcons.tsx` | Icon polish |
| `src/components/AppIcon.tsx` | Glass-adjacent icon plate polish |
| `src/routes/index.tsx` | Map windows from projects; maximize state; id-keyed interaction |
| `src/components/apps/MyCVViewerApp.tsx` | pdf.js viewer |
| `src/components/apps/AboutTommyWindow.tsx` | Light content refresh |
| `src/components/apps/InterviewTrainerApp.tsx` | Fix export name |
| `src/components/AppWindow.tsx` | Delete (unused) |
| `public/wallpapers/*` | Add sharp high-contrast wallpaper |
| `package.json` | Add `pdfjs-dist`, `vitest`, test script |
| `src/lib/liquid-glass/displacement.test.ts` | Unit tests for filter URL generation |

---

### Task 1: Liquid-glass displacement helpers + tests

**Files:**
- Create: `src/lib/liquid-glass/displacement.ts`
- Create: `src/lib/liquid-glass/supports.ts`
- Create: `src/lib/liquid-glass/ATTRIBUTION.md`
- Create: `src/lib/liquid-glass/displacement.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Add Vitest and a test script**

```bash
pnpm add -D vitest
```

In `package.json` scripts add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Write failing tests for displacement helpers**

Create `src/lib/liquid-glass/displacement.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  getDisplacementFilter,
  getDisplacementMap,
} from "./displacement";

describe("liquid-glass displacement", () => {
  it("builds a data-URI displacement map SVG", () => {
    const map = getDisplacementMap({
      height: 120,
      width: 200,
      radius: 16,
      depth: 10,
    });
    expect(map.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(decodeURIComponent(map)).toContain("<svg");
    expect(decodeURIComponent(map)).toContain('height="120"');
    expect(decodeURIComponent(map)).toContain('width="200"');
  });

  it("builds a backdrop-filter url targeting #displace", () => {
    const filter = getDisplacementFilter({
      height: 120,
      width: 200,
      radius: 16,
      depth: 10,
      strength: 100,
      chromaticAberration: 2,
    });
    expect(filter.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(filter.endsWith("#displace")).toBe(true);
    expect(decodeURIComponent(filter)).toContain("feDisplacementMap");
  });
});
```

- [ ] **Step 3: Run tests — expect FAIL (module missing)**

Run: `pnpm test`
Expected: FAIL resolving `./displacement`

- [ ] **Step 4: Port helpers from nikdelvin (keep API above)**

Create `src/lib/liquid-glass/displacement.ts` with the MIT-ported `getDisplacementMap` and `getDisplacementFilter` from https://github.com/nikdelvin/liquid-glass `src/utils/liquidGlass.ts` (same algorithm: gray base, X/Y gradients, inset blurred rect, RGB split displacement).

Header comment:

```ts
/**
 * SVG displacement helpers for liquid glass.
 * Ported from https://github.com/nikdelvin/liquid-glass (MIT)
 * See ./ATTRIBUTION.md
 */
```

Create `src/lib/liquid-glass/supports.ts`:

```ts
export function supportsBackdropFilterUrl(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.createElement("div");
  el.style.cssText = "backdrop-filter: url(#test)";
  return (
    el.style.backdropFilter === "url(#test)" ||
    el.style.backdropFilter === 'url("#test")'
  );
}
```

Create `src/lib/liquid-glass/ATTRIBUTION.md` noting Nikita Stadnik / nikdelvin/liquid-glass MIT License 2025.

- [ ] **Step 5: Run tests — expect PASS**

Run: `pnpm test`
Expected: PASS both tests

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/liquid-glass/
git commit -m "feat: add liquid-glass displacement helpers with tests"
```

---

### Task 2: Solid `LiquidGlass` component

**Files:**
- Create: `src/components/ui/LiquidGlass.tsx`

- [ ] **Step 1: Implement `LiquidGlass`**

```tsx
import {
  JSX,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
} from "solid-js";
import { getDisplacementFilter } from "~/lib/liquid-glass/displacement";
import { supportsBackdropFilterUrl } from "~/lib/liquid-glass/supports";

type Props = {
  class?: string;
  depth?: number;
  strength?: number;
  chromaticAberration?: number;
  blur?: number;
  radius?: number;
  tint?: "black" | "white" | "transparent";
  children?: JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>;

export default function LiquidGlass(props: Props) {
  const [local, rest] = splitProps(props, [
    "class",
    "depth",
    "strength",
    "chromaticAberration",
    "blur",
    "radius",
    "tint",
    "children",
  ]);
  let root!: HTMLDivElement;
  let filterEl!: HTMLDivElement;
  const [supported] = createSignal(
    typeof document !== "undefined" && supportsBackdropFilterUrl(),
  );

  function redraw() {
    if (!root || !filterEl) return;
    const rect = root.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const depth = local.depth ?? 10;
    const strength = local.strength ?? 100;
    const chromaticAberration = local.chromaticAberration ?? 2;
    const blur = local.blur ?? 0;
    const radius = local.radius ?? 16;
    filterEl.style.width = `${width}px`;
    filterEl.style.height = `${height}px`;
    if (supported()) {
      filterEl.style.backdropFilter = `blur(${blur / 2}px) url('${getDisplacementFilter(
        { height, width, radius, depth, strength, chromaticAberration },
      )}') blur(${blur}px) brightness(1.1) saturate(1.5)`;
    } else {
      filterEl.style.backdropFilter = `blur(${Math.max(12, width / 40)}px) saturate(180%)`;
      (filterEl.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter =
        filterEl.style.backdropFilter;
    }
  }

  onMount(() => {
    redraw();
    const ro = new ResizeObserver(() => redraw());
    ro.observe(root);
    onCleanup(() => ro.disconnect());
  });

  const tintBg =
    local.tint === "white"
      ? "rgba(250,250,250,0.5)"
      : local.tint === "black"
        ? "rgba(9,9,11,0.45)"
        : "rgba(9,9,11,0.18)";

  return (
    <div
      {...rest}
      ref={root}
      class={`liquid-glass relative overflow-hidden ${local.class ?? ""}`}
      style={{ "border-radius": `${local.radius ?? 16}px` }}
    >
      <div
        class="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: tintBg,
          "box-shadow": "inset 0 0 4px 0 rgba(250,250,250,0.5)",
        }}
      />
      <div class="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
        <div ref={filterEl} class="glass-filter-layer m-0" />
      </div>
      <div class="relative z-[3]">{local.children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Smoke-check TypeScript**

Run: `pnpm exec tsc --noEmit` (or project equivalent). Fix any path/`~` alias issues.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/LiquidGlass.tsx
git commit -m "feat: add Solid LiquidGlass wrapper component"
```

---

### Task 3: Design tokens, fonts, wallpaper assets

**Files:**
- Modify: `src/app.css`
- Modify: `src/app.tsx` (font link if needed)
- Create: `public/wallpapers/liquid-sharp.webp` (or `.jpg`) — sharp high-contrast abstract suitable for refraction
- Create: `src/lib/wallpapers.ts`
- Create: `src/lib/desktopBounds.ts`

- [ ] **Step 1: Add CSS variables and font imports in `app.css`**

Use a distinctive pair, e.g. **Syne** (display) + **DM Sans** (body) via `@import` from Google Fonts or local files. Define:

```css
:root {
  --font-display: "Syne", sans-serif;
  --font-body: "DM Sans", sans-serif;
  --menu-height: 40px;
  --dock-clearance: 96px;
  --glass-depth: 10;
  --glass-strength: 100;
  --glass-cab: 2;
  --accent: #28c840;
  --z-menubar: 1000;
  --z-dock: 900;
  --z-context: 1100;
  --z-interact: 9999;
}
body {
  font-family: var(--font-body);
}
```

Keep existing `user-select: none` / overscroll rules.

- [ ] **Step 2: Wallpaper registry**

```ts
// src/lib/wallpapers.ts
export const WALLPAPERS = [
  { id: "classic", src: "/wallpapers/mywall.png", mobileSrc: "/wallpapers/mywall-mobile.jpg" },
  { id: "liquid-sharp", src: "/wallpapers/liquid-sharp.webp", mobileSrc: "/wallpapers/liquid-sharp.webp" },
] as const;

export type WallpaperId = (typeof WALLPAPERS)[number]["id"];

export function nextWallpaperId(current: WallpaperId): WallpaperId {
  const i = WALLPAPERS.findIndex((w) => w.id === current);
  return WALLPAPERS[(i + 1) % WALLPAPERS.length]!.id;
}
```

Add a real sharp high-contrast wallpaper file under `public/wallpapers/` (generate or source a rights-clear abstract; do not soft-blur it).

- [ ] **Step 3: Desktop bounds helpers**

```ts
// src/lib/desktopBounds.ts
export const MENU_HEIGHT = 40;
export const DOCK_CLEARANCE = 96;
export const MIN_W = 280;
export const MIN_H = 180;

export function usableBounds(vw = window.innerWidth, vh = window.innerHeight) {
  return {
    minX: 0,
    minY: MENU_HEIGHT,
    maxX: vw,
    maxY: vh - DOCK_CLEARANCE,
  };
}

export function clampWindow(
  x: number,
  y: number,
  width: number,
  height: number,
  vw = window.innerWidth,
  vh = window.innerHeight,
) {
  const b = usableBounds(vw, vh);
  const w = Math.min(Math.max(width, MIN_W), b.maxX - b.minX);
  const h = Math.min(Math.max(height, MIN_H), b.maxY - b.minY);
  const nx = Math.min(Math.max(x, b.minX), b.maxX - w);
  const ny = Math.min(Math.max(y, b.minY), b.maxY - h);
  return { x: nx, y: ny, width: w, height: h };
}

export function maximizedRect(vw = window.innerWidth, vh = window.innerHeight) {
  const b = usableBounds(vw, vh);
  return {
    x: b.minX,
    y: b.minY,
    width: b.maxX - b.minX,
    height: b.maxY - b.minY,
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app.css src/lib/wallpapers.ts src/lib/desktopBounds.ts public/wallpapers/
git commit -m "feat: add glass design tokens, wallpaper registry, and bounds helpers"
```

---

### Task 4: Context menu component

**Files:**
- Create: `src/components/ui/ContextMenu.tsx`

- [ ] **Step 1: Implement shared menu**

```tsx
import { For, Show, onCleanup, onMount } from "solid-js";
import LiquidGlass from "./LiquidGlass";

export type ContextMenuItem = {
  id: string;
  label: string;
  disabled?: boolean;
  danger?: boolean;
};

export default function ContextMenu(props: {
  open: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-context-menu]")) props.onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    onCleanup(() => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    });
  });

  return (
    <Show when={props.open}>
      <div
        data-context-menu
        class="fixed z-[1100] min-w-[180px] origin-top-left animate-[ctx_120ms_ease-out]"
        style={{ left: `${props.x}px`, top: `${props.y}px` }}
      >
        <LiquidGlass class="p-1.5" radius={14} tint="black" blur={0}>
          <ul class="m-0 list-none p-0 text-sm text-white">
            <For each={props.items}>
              {(item) => (
                <li>
                  <button
                    type="button"
                    disabled={item.disabled}
                    class={`w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/10 disabled:opacity-40 ${
                      item.danger ? "text-red-300" : ""
                    }`}
                    onClick={() => {
                      if (item.disabled) return;
                      props.onSelect(item.id);
                      props.onClose();
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              )}
            </For>
          </ul>
        </LiquidGlass>
      </div>
    </Show>
  );
}
```

Add a tiny `@keyframes ctx` in `app.css` for fade+scale.

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ContextMenu.tsx src/app.css
git commit -m "feat: add LiquidGlass context menu component"
```

---

### Task 5: Window chrome UX overhaul

**Files:**
- Modify: `src/components/Window.tsx`
- Delete: `src/components/AppWindow.tsx`

- [ ] **Step 1: Extend props**

Add to `Window` props:

```ts
id: string; // project id — use for interaction keying
onMaximize?: () => void;
maximized?: boolean;
onContextMenuRequest?: (x: number, y: number) => void;
```

- [ ] **Step 2: Layout + drag/resize behavior**

- Root: absolute positioned box; inner flex column `h-full`
- Wrap shell in / compose with `LiquidGlass` for chrome (title bar glass; body opaque/clear for content)
- Title bar: only element with `onMouseDown`/`onTouchStart` drag; `cursor-grab` / `grabbing`
- Remove root `onTouchStart={onTouchStart}` drag
- Red / yellow / green buttons; green calls `onMaximize`
- Title bar `onDblClick` → `onMaximize`
- Title bar `onContextMenu` → preventDefault + `onContextMenuRequest(clientX, clientY)`
- Resize: 4 corners + 4 edges; visible grips; use `clampWindow` when applying move/resize
- Body: `<div class="relative min-h-0 flex-1 overflow-hidden">{props.children}</div>`
- Pass `setInteractingWindowId?.(props.id)` (not title)

- [ ] **Step 3: Delete unused `AppWindow.tsx`**

- [ ] **Step 4: Manual verify in `pnpm dev`**

Expected: drag only from title; edges resize; content not clipped; no accidental drag on PDF area.

- [ ] **Step 5: Commit**

```bash
git add src/components/Window.tsx
git rm src/components/AppWindow.tsx
git commit -m "feat: overhaul Window chrome, handles, and title-only drag"
```

---

### Task 6: Home route — projects map, maximize, menus wiring

**Files:**
- Modify: `src/routes/index.tsx`
- Modify: `src/components/Desktop.tsx`
- Modify: `src/components/MenuBar.tsx`
- Modify: `src/components/Dock.tsx`

- [ ] **Step 1: State additions in `index.tsx`**

```ts
const [maximizedIds, setMaximizedIds] = createSignal<string[]>([]);
const [restoreRects, setRestoreRects] = createSignal<Record<string, WindowState>>({});
const [ctx, setCtx] = createSignal<null | {
  kind: "desktop" | "window";
  windowId?: string;
  x: number;
  y: number;
}>(null);
const [wallpaperId, setWallpaperId] = createSignal<WallpaperId>("liquid-sharp");
```

Persist `maximizedIds`, `restoreRects`, `wallpaperId` in localStorage alongside existing fields.

- [ ] **Step 2: Maximize / restore helpers**

```ts
function toggleMaximize(id: string) {
  if (maximizedIds().includes(id)) {
    const prev = restoreRects()[id];
    if (prev) updateWindowState(id, prev);
    setMaximizedIds((ids) => ids.filter((x) => x !== id));
  } else {
    const cur = windowStates()[id];
    if (cur) setRestoreRects((r) => ({ ...r, [id]: cur }));
    updateWindowState(id, maximizedRect());
    setMaximizedIds((ids) => [...ids, id]);
  }
  bringToFront(id);
}
```

Clamp on every `updateWindowState` via `clampWindow`.

- [ ] **Step 3: Render windows from `projects`**

Replace the four hard-coded `<Window>` blocks with:

```tsx
<For each={openIds()}>
  {(id) => {
    const project = () => projects.find((p) => p.id === id)!;
    const Comp = () => project().component;
    const state = () => windowStates()[id] || DEFAULT_STATE;
    return (
      <Show when={!minimizedIds().includes(id) || windowStatus()[id]?.status === "minimizing"}>
        <Window
          id={id}
          title={project().name}
          /* ...existing handlers... */
          maximized={maximizedIds().includes(id)}
          onMaximize={() => toggleMaximize(id)}
          onContextMenuRequest={(x, y) => setCtx({ kind: "window", windowId: id, x, y })}
        >
          <Comp />
        </Window>
      </Show>
    );
  }}
</For>
```

(Adapt to existing minimize/close animation conditions already in the file.)

- [ ] **Step 4: Wire ContextMenu**

Window items: Close, Minimize, Maximize/Restore, Bring to Front.  
Desktop items: Refresh, About Tommy, Change wallpaper.

Pass wallpaper id into `Desktop`; on Change wallpaper call `setWallpaperId(nextWallpaperId(...))`.

- [ ] **Step 5: Apply LiquidGlass to MenuBar + Dock**

Replace opaque/frost classes with `<LiquidGlass>` wrappers. Fix Dock parent `group` class for hover overlay.

- [ ] **Step 6: Manual verify**

Expected: open any app from dock/icons; maximize; right-click desktop + window; wallpaper cycles; state restores after refresh.

- [ ] **Step 7: Commit**

```bash
git add src/routes/index.tsx src/components/Desktop.tsx src/components/MenuBar.tsx src/components/Dock.tsx
git commit -m "feat: wire liquid glass chrome, maximize, and context menus"
```

---

### Task 7: pdf.js CV viewer

**Files:**
- Modify: `package.json`
- Modify: `src/components/apps/MyCVViewerApp.tsx`

- [ ] **Step 1: Install pdf.js**

```bash
pnpm add pdfjs-dist
```

- [ ] **Step 2: Replace iframe with canvas viewer**

Implement Solid component that:

1. Sets `pdfjsLib.GlobalWorkerOptions.workerSrc` to the package worker (CDN or bundled worker URL compatible with Vinxi)
2. Loads `/pdf/myCV.pdf`
3. Renders current page to `<canvas>`
4. Shows Prev / Next / `Page N / M` / Download (`<a href="/pdf/myCV.pdf" download>`)
5. Shows loading text and error message with Download fallback

Keep root `class="flex h-full min-h-0 flex-col bg-neutral-900 text-white"` so it fills the window body.

- [ ] **Step 3: Manual verify**

Open My CV on desktop and narrow mobile width; pages navigate; download works; no clipped empty iframe.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/apps/MyCVViewerApp.tsx
git commit -m "feat: replace CV iframe with pdf.js viewer"
```

---

### Task 8: About Tommy + icons polish + export fix

**Files:**
- Modify: `src/components/apps/AboutTommyWindow.tsx`
- Modify: `src/components/DesktopIcons.tsx`
- Modify: `src/components/AppIcon.tsx`
- Modify: `src/components/apps/InterviewTrainerApp.tsx`
- Modify: `src/app.tsx` (meta if needed)

- [ ] **Step 1: Refresh About Tommy layout**

Keep facts; tighten hierarchy: avatar, name (display font), role, short bio, tech chips (compact glass pills), GitHub/LinkedIn as LiquidGlass or glass-styled buttons. Remove heavy opaque card look that fights the OS chrome.

- [ ] **Step 2: Icon polish**

Subtle specular border on `AppIcon`; ensure DesktopIcons labels remain readable on sharp wallpapers.

- [ ] **Step 3: Fix InterviewTrainer export**

Rename default export function from `MyCVViewer` to `InterviewTrainerApp` (or anonymous default matching file purpose).

- [ ] **Step 4: Commit**

```bash
git add src/components/apps/AboutTommyWindow.tsx src/components/DesktopIcons.tsx src/components/AppIcon.tsx src/components/apps/InterviewTrainerApp.tsx src/app.tsx
git commit -m "feat: polish About Tommy and icons; fix InterviewTrainer export"
```

---

### Task 9: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Run unit tests**

Run: `pnpm test`  
Expected: PASS

- [ ] **Step 2: Production build**

Run: `pnpm build`  
Expected: success

- [ ] **Step 3: Spec checklist in browser (`pnpm dev`)**

1. Chrome/Firefox: visible edge refraction on window/dock/menu over sharp wallpaper  
2. Title-only drag; edge/corner resize; no accidental content drag  
3. Green maximize/restore + double-click title  
4. Desktop + window context menus  
5. pdf.js CV with nav + download  
6. About Tommy coherent with glass OS  
7. Attribution file present  

- [ ] **Step 4: Final commit if verification fixes were needed**

```bash
git add -A
git commit -m "fix: address liquid-glass OS verification findings"
```

(Only if there are changes.)

---

## Spec coverage self-check

| Spec requirement | Task |
|------------------|------|
| Liquid glass SVG displacement + MIT credit | 1–2 |
| Sharp wallpaper / tokens / fonts | 3 |
| Title-only drag, edges, clamp | 5–6 |
| Maximize / double-click | 5–6 |
| Desktop + window context menus | 4, 6 |
| pdf.js CV | 7 |
| About + icons polish | 8 |
| Map windows from projects; delete AppWindow | 5–6 |
| Safari fallback | 2 |
| Success criteria verification | 9 |

## Placeholder / consistency scan

- No TBD steps; APIs use `id` for windows, `WallpaperId`, `clampWindow` / `maximizedRect` consistently.
- Interaction keyed by project `id` everywhere after Task 5–6.
