import { Show, createSignal, onCleanup, onMount } from "solid-js";
import type { Project } from "../projects";
import LiquidGlass from "~/components/ui/LiquidGlass";
import {
  isCompactLayout,
  setCompactDockExpanded,
} from "~/lib/desktopBounds";

export type DockRef = {
  getIconPosition: (id: string) => DOMRect | null;
};

/**
 * Mobile UX decision:
 * - Bottom dock (thumb zone), not right — avoids fighting browser back-swipe.
 * - Larger icons when expanded; swipe down / grabber to collapse to a peek.
 * - Swipe up from the bottom edge (or tap grabber) to expand again.
 */
export default function Dock(props: {
  projects: Project[];
  onOpen: (id: string) => void;
  minimizedIds?: string[];
  ref?: (ref: DockRef) => void;
  activeId?: string;
  onLayoutChange?: () => void;
}) {
  let iconRefs: Record<string, HTMLButtonElement | undefined> = {};
  let dockShell: HTMLDivElement | undefined;
  const [compact, setCompact] = createSignal(false);
  const [expanded, setExpanded] = createSignal(true);

  function applyExpanded(next: boolean) {
    setExpanded(next);
    setCompactDockExpanded(next);
    props.onLayoutChange?.();
  }

  onMount(() => {
    const sync = () => {
      const c = isCompactLayout();
      setCompact(c);
      if (!c) {
        // Desktop rail always "expanded"
        setExpanded(true);
        setCompactDockExpanded(true);
      } else {
        setCompactDockExpanded(expanded());
      }
    };
    sync();
    window.addEventListener("resize", sync);

    // Bottom-edge swipe-up to expand (only when compact + collapsed)
    let startY = 0;
    let startX = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      if (!isCompactLayout() || expanded()) return;
      const t = e.touches[0];
      if (!t) return;
      const fromBottom = window.innerHeight - t.clientY;
      // Edge zone ~48px — easy to hit without stealing app scrolls
      if (fromBottom > 48) return;
      tracking = true;
      startY = t.clientY;
      startX = t.clientX;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.touches[0];
      if (!t) return;
      const dy = startY - t.clientY; // up is positive
      const dx = Math.abs(t.clientX - startX);
      if (dy > 36 && dy > dx * 1.2) {
        tracking = false;
        applyExpanded(true);
      }
    };

    const onTouchEnd = () => {
      tracking = false;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    props.ref?.({
      getIconPosition: (id: string) => {
        const btn = iconRefs[id];
        return btn ? btn.getBoundingClientRect() : null;
      },
    });

    onCleanup(() => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    });
  });

  // Swipe down on the dock itself to collapse
  function onDockTouchStart(e: TouchEvent) {
    if (!compact() || !expanded()) return;
    const t = e.touches[0];
    if (!t) return;
    const startY = t.clientY;
    const startX = t.clientX;

    const onMove = (ev: TouchEvent) => {
      const cur = ev.touches[0];
      if (!cur) return;
      const dy = cur.clientY - startY; // down is positive
      const dx = Math.abs(cur.clientX - startX);
      if (dy > 40 && dy > dx * 1.15) {
        cleanup();
        applyExpanded(false);
      }
    };
    const cleanup = () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", cleanup);
      window.removeEventListener("touchcancel", cleanup);
    };
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", cleanup, { passive: true });
    window.addEventListener("touchcancel", cleanup, { passive: true });
  }

  const showFullDock = () => !compact() || expanded();

  return (
    <>
      {/* Invisible bottom hit target when collapsed — helps discover swipe-up */}
      <Show when={compact() && !expanded()}>
        <button
          type="button"
          aria-label="Show dock"
          class="fixed inset-x-0 bottom-0 z-[var(--z-dock)] flex h-10 items-end justify-center pb-[max(0.35rem,env(safe-area-inset-bottom,0px))]"
          onClick={() => applyExpanded(true)}
        >
          <span class="mb-1 flex h-7 items-center gap-2 rounded-full bg-zinc-950/70 px-4 shadow-lg ring-1 ring-white/15 backdrop-blur-md">
            <span class="h-1 w-9 rounded-full bg-white/55" />
            <span class="text-[10px] font-medium tracking-wide text-white/70">
              Apps
            </span>
          </span>
        </button>
      </Show>

      <div
        ref={dockShell}
        class={
          compact()
            ? `fixed inset-x-0 bottom-0 z-[var(--z-dock)] flex justify-center px-3 pt-1 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                expanded()
                  ? "translate-y-0"
                  : "pointer-events-none translate-y-[120%] opacity-0"
              }`
            : "fixed top-1/2 right-3 z-[var(--z-dock)] -translate-y-1/2"
        }
        style={
          compact()
            ? {
                "padding-bottom":
                  "max(0.45rem, env(safe-area-inset-bottom, 0px))",
              }
            : undefined
        }
        onTouchStart={onDockTouchStart}
      >
        <Show when={showFullDock()}>
          <LiquidGlass
            class={compact() ? "px-3 py-2.5" : "p-2.5"}
            radius={24}
            tint="black"
            blur={compact() ? 1 : 2}
            depth={compact() ? 7 : 8}
            strength={compact() ? 70 : 80}
            chromaticAberration={compact() ? 1 : 2}
          >
            <div class="flex flex-col items-center">
              <Show when={compact()}>
                <button
                  type="button"
                  class="mb-1.5 flex w-full flex-col items-center gap-1 py-0.5"
                  aria-label="Hide dock"
                  onClick={() => applyExpanded(false)}
                >
                  <span class="h-1 w-10 rounded-full bg-white/40" />
                  <span class="text-[9px] font-medium tracking-wide text-white/45">
                    Swipe down to hide
                  </span>
                </button>
              </Show>

              <div
                class={
                  compact()
                    ? "flex max-w-[min(100vw-1.25rem,34rem)] items-center justify-center gap-2 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    : "flex flex-col items-center gap-2.5"
                }
              >
                {props.projects.map((project) => (
                  <div class="group relative flex shrink-0 items-center justify-center">
                    <span class="pointer-events-none absolute -inset-1 z-0 rounded-lg bg-white/15 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-80 group-focus-within:opacity-90 group-active:opacity-100" />
                    <button
                      ref={(el) => (iconRefs[project.id] = el)}
                      class={`relative z-10 cursor-pointer overflow-visible rounded-xl bg-white/90 text-4xl transition-all duration-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                        compact()
                          ? "p-1 active:scale-95"
                          : "p-1 hover:scale-110"
                      } ${
                        props.activeId === project.id
                          ? "border-2 border-[var(--accent)]"
                          : props.minimizedIds?.includes(project.id)
                            ? "ring-2 ring-[var(--accent)]/70"
                            : "border-2 border-transparent"
                      }`}
                      style={
                        compact()
                          ? {
                              width: "2.75rem",
                              height: "2.75rem",
                              display: "grid",
                              "place-items": "center",
                            }
                          : undefined
                      }
                      title={project.name}
                      aria-label={project.name}
                      onClick={() => {
                        props.onOpen(project.id);
                        // Keep dock open after launch so users can switch apps
                      }}
                      type="button"
                    >
                      <span
                        class={
                          compact()
                            ? "flex origin-center scale-[0.92] [&_img]:!h-9 [&_img]:!w-9"
                            : "contents"
                        }
                      >
                        {typeof project.icon === "string" ? (
                          <span class="z-10 text-4xl transition-transform group-hover:scale-110">
                            {project.icon}
                          </span>
                        ) : (
                          project.icon()
                        )}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </LiquidGlass>
        </Show>
      </div>
    </>
  );
}
