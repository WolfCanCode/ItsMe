import { onMount } from "solid-js";
import type { Project } from "../projects";

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

  // Expose getIconPosition via ref
  onMount(() => {
    props.ref?.({
      getIconPosition: (id: string) => {
        const btn = iconRefs[id];
        return btn ? btn.getBoundingClientRect() : null;
      },
    });
  });

  return (
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/30 backdrop-blur-md rounded-2xl px-8 py-3 flex shadow-2xl z-50 border border-white/40">
      {props.projects.map((project) => (
        <div
          class="flex flex-col items-center mx-3 relative"
          style="min-width: 3rem;"
        >
          {/* Overlay for hover/focus, but never blocks pointer events */}
          <span class="absolute -inset-2 rounded-lg bg-blue-100 opacity-0 group-hover:opacity-80 group-focus:opacity-90 group-active:opacity-100 group-hover:shadow-lg group-focus:shadow-lg transition-all duration-200 pointer-events-none z-0" />
          {/* The button wraps only the icon, so any click on the icon triggers onOpen */}
          <button
            ref={(el) => (iconRefs[project.id] = el)}
            class={`relative z-10 bg-white text-4xl cursor-pointer focus:outline-none transition-transform duration-150 hover:scale-125 hover:shadow-lg
              ${
                props.activeId === project.id
                  ? "border-2 border-blue-600"
                  : props.minimizedIds?.includes(project.id)
                  ? "border-2 border-blue-300"
                  : "border-2 border-transparent"
              }
              rounded-xl p-1 overflow-visible`}
            title={project.name}
            onClick={() => props.onOpen(project.id)}
            type="button"
          >
            {typeof project.icon === "string" ? (
              <span class="text-4xl group-hover:scale-110 transition-transform z-10">
                {project.icon}
              </span>
            ) : (
              project.icon()
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
