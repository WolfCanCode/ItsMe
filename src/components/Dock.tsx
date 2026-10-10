import { createSignal, onCleanup, onMount } from "solid-js";
import type { Project } from "../projects";
import LiquidGlass from "~/components/ui/LiquidGlass";
import { isCompactLayout } from "~/lib/desktopBounds";

export type DockRef = {
  getIconPosition: (id: string) => DOMRect | null;
};

export default function Dock(props: {
  projects: Project[];
  onOpen: (id: string) => void;
  minimizedIds?: string[];
  ref?: (ref: DockRef) => void;
  activeId?: string;
}) {
  let iconRefs: Record<string, HTMLButtonElement | undefined> = {};
  const [compact, setCompact] = createSignal(false);

  onMount(() => {
    const sync = () => setCompact(isCompactLayout());
    sync();
    window.addEventListener("resize", sync);
    props.ref?.({
      getIconPosition: (id: string) => {
        const btn = iconRefs[id];
        return btn ? btn.getBoundingClientRect() : null;
      },
    });
    onCleanup(() => window.removeEventListener("resize", sync));
  });

  return (
    <div
      class={
        compact()
          ? "fixed inset-x-0 bottom-0 z-[var(--z-dock)] flex justify-center px-3 pt-1"
          : "fixed top-1/2 right-3 z-[var(--z-dock)] -translate-y-1/2"
      }
      style={
        compact()
          ? {
              "padding-bottom":
                "max(0.4rem, env(safe-area-inset-bottom, 0px))",
            }
          : undefined
      }
    >
      <LiquidGlass
        class={compact() ? "px-2.5 py-1.5" : "p-2.5"}
        radius={compact() ? 22 : 22}
        tint="black"
        blur={compact() ? 1 : 2}
        depth={compact() ? 6 : 8}
        strength={compact() ? 60 : 80}
        chromaticAberration={compact() ? 1 : 2}
      >
        <div
          class={
            compact()
              ? "flex max-w-[min(100vw-1.5rem,28rem)] items-center justify-center gap-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                    ? "p-0.5 active:scale-95"
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
                        // Shrink project icons without changing every AppIcon call site
                        width: "2.15rem",
                        height: "2.15rem",
                        display: "grid",
                        "place-items": "center",
                      }
                    : undefined
                }
                title={project.name}
                aria-label={project.name}
                onClick={() => props.onOpen(project.id)}
                type="button"
              >
                <span
                  class={
                    compact()
                      ? "flex origin-center scale-[0.72] [&_img]:!h-7 [&_img]:!w-7"
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
      </LiquidGlass>
    </div>
  );
}
