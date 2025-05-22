import type { Project } from "../projects";

export default function DesktopIcons(props: {
  projects: Project[];
  onOpen: (id: string) => void;
}) {
  return (
    <div class="absolute top-16 left-4 flex flex-col gap-6 z-10 select-none">
      {props.projects.map((project) => (
        <button
          class="flex flex-col items-center focus:outline-none group relative"
          onClick={() => props.onOpen(project.id)}
          title={project.name}
          type="button"
        >
          <span class="absolute -inset-2 rounded-lg bg-blue-100 opacity-0 group-hover:opacity-80 group-focus:opacity-90 group-active:opacity-100 group-hover:shadow-lg group-focus:shadow-lg transition-all duration-200 pointer-events-none" />
          {typeof project.icon === "string" ? (
            <span class="text-3xl sm:text-2xl group-hover:scale-110 transition-transform z-10">
              {project.icon}
            </span>
          ) : (
            project.icon()
          )}
          <span class="mt-1 text-xs text-gray-800 bg-white/70 rounded px-1 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors z-10">
            {project.name}
          </span>
        </button>
      ))}
    </div>
  );
}
