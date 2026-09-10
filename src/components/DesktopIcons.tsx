import type { Project } from "../projects";

export default function DesktopIcons(props: {
  projects: Project[];
  onOpen: (id: string) => void;
}) {
  return (
    <div class="absolute top-16 left-4 z-10 flex select-none flex-col gap-6">
      {props.projects.map((project) => (
        <button
          class="group relative flex flex-col items-center focus:outline-none"
          onClick={() => props.onOpen(project.id)}
          title={project.name}
          type="button"
        >
          <span class="pointer-events-none absolute -inset-2 rounded-lg bg-white/15 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-80 group-focus:opacity-90 group-active:opacity-100" />
          {typeof project.icon === "string" ? (
            <span class="z-10 text-3xl transition-transform group-hover:scale-110 sm:text-2xl">
              {project.icon}
            </span>
          ) : (
            project.icon()
          )}
          <span
            class="z-10 mt-1 max-w-[5.5rem] truncate rounded px-1.5 py-0.5 text-center text-xs font-medium text-white"
            style={{
              "text-shadow":
                "0 1px 2px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.55)",
              background: "rgba(0,0,0,0.45)",
              "backdrop-filter": "blur(6px)",
            }}
          >
            {project.name}
          </span>
        </button>
      ))}
    </div>
  );
}
