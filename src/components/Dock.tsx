import { onMount } from "solid-js";
import type { Project } from "../projects";
import LiquidGlass from "~/components/ui/LiquidGlass";

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

  onMount(() => {
    props.ref?.({
      getIconPosition: (id: string) => {
        const btn = iconRefs[id];
        return btn ? btn.getBoundingClientRect() : null;
      },
    });
  });

  return (
    <div class="fixed top-1/2 right-3 z-[var(--z-dock)] -translate-y-1/2">
      <LiquidGlass
        class="p-2.5"
        radius={22}
        tint="black"
        blur={2}
        depth={8}
        strength={80}
        chromaticAberration={2}
      >
        <div class="flex flex-col items-center gap-2.5">
          {props.projects.map((project) => (
            <div class="group relative flex items-center justify-center">
              <span class="pointer-events-none absolute -inset-1 z-0 rounded-lg bg-white/15 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-80 group-focus-within:opacity-90 group-active:opacity-100" />
              <button
                ref={(el) => (iconRefs[project.id] = el)}
                class={`relative z-10 cursor-pointer overflow-visible rounded-xl bg-white/90 p-1 text-4xl transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none ${
                  props.activeId === project.id
                    ? "border-2 border-[var(--accent)]"
                    : props.minimizedIds?.includes(project.id)
                      ? "ring-2 ring-[var(--accent)]/70"
                      : "border-2 border-transparent"
                }`}
                title={project.name}
                onClick={() => props.onOpen(project.id)}
                type="button"
              >
                {typeof project.icon === "string" ? (
                  <span class="z-10 text-4xl transition-transform group-hover:scale-110">
                    {project.icon}
                  </span>
                ) : (
                  project.icon()
                )}
              </button>
            </div>
          ))}
        </div>
      </LiquidGlass>
    </div>
  );
}
