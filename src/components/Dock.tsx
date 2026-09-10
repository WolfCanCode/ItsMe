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
    <div
      class="absolute bottom-6 left-1/2 -translate-x-1/2 z-[var(--z-dock)]"
    >
      <LiquidGlass
        class="px-8 py-3"
        radius={20}
        tint="black"
        blur={2}
        depth={8}
        strength={80}
      >
        <div class="flex items-center">
          {props.projects.map((project) => (
            <div
              class="group relative mx-3 flex flex-col items-center"
              style="min-width: 3rem;"
            >
              <span class="pointer-events-none absolute -inset-2 z-0 rounded-lg bg-white/15 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-80 group-focus-within:opacity-90 group-active:opacity-100" />
              <button
                ref={(el) => (iconRefs[project.id] = el)}
                class={`relative z-10 cursor-pointer overflow-visible rounded-xl bg-white/90 p-1 text-4xl transition-all duration-200 hover:scale-125 hover:shadow-lg focus:outline-none ${
                  props.activeId === project.id
                    ? "border-2 border-[var(--accent)]"
                    : props.minimizedIds?.includes(project.id)
                      ? "border-b-2 border-[var(--accent)]"
                      : "border-b-2 border-transparent"
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
