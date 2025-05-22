import { createEffect, createSignal, JSX, onMount } from "solid-js";
import Desktop from "~/components/Desktop";
import DesktopIcons from "~/components/DesktopIcons";
import Dock, { DockRef } from "~/components/Dock";
import Window from "~/components/Window";
import { projects } from "../projects";

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
}

type WindowStatus = {
  status: "open" | "minimizing" | "closing";
  minimizeTarget?: { x: number; y: number };
  restoreFrom?: { x: number; y: number };
};

const DEFAULT_STATE: WindowState = { x: 200, y: 100, width: 400, height: 300 };
const STORAGE_KEY = "wolfcancode-os-state";

export default function Home() {
  const [openIds, setOpenIds] = createSignal<string[]>([]);
  const [minimizedIds, setMinimizedIds] = createSignal<string[]>([]);
  const [windowStates, setWindowStates] = createSignal<
    Record<string, WindowState>
  >({});
  const [windowStatus, setWindowStatus] = createSignal<
    Record<string, WindowStatus>
  >({});
  const [activeWindow, setActiveWindow] = createSignal<string | null>(null);
  let dockRef: DockRef | undefined;

  // Load from localStorage on mount
  onMount(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.openIds) setOpenIds(parsed.openIds);
        if (parsed.minimizedIds) setMinimizedIds(parsed.minimizedIds);
        if (parsed.windowStates) setWindowStates(parsed.windowStates);
      } catch {}
    }
  });

  // Save to localStorage on change
  createEffect(() => {
    const state = {
      openIds: openIds(),
      minimizedIds: minimizedIds(),
      windowStates: windowStates(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  });

  function openWindow(id: string) {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    const defaultWidth = project.defaultWidth ?? DEFAULT_STATE.width;
    const defaultHeight = project.defaultHeight ?? DEFAULT_STATE.height;
    if (minimizedIds().includes(id)) {
      let restoreFrom: { x: number; y: number } | undefined = undefined;
      if (dockRef) {
        const rect = dockRef.getIconPosition(id);
        if (rect) {
          restoreFrom = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
      }
      setWindowStatus((status) => ({
        ...status,
        [id]: { status: "open", restoreFrom },
      }));
      setMinimizedIds((ids) => ids.filter((x) => x !== id));
      bringToFront(id);
      setTimeout(() => {
        setWindowStatus((status) => {
          const s = { ...status };
          if (s[id]) delete s[id].restoreFrom;
          return s;
        });
      }, 10);
    } else if (!openIds().includes(id)) {
      setWindowStatus((status) => ({ ...status, [id]: { status: "open" } }));
      setOpenIds((ids) => [...ids, id]);
      setWindowStates((states) => ({
        ...states,
        [id]: states[id] || {
          x: DEFAULT_STATE.x,
          y: DEFAULT_STATE.y,
          width: defaultWidth,
          height: defaultHeight,
        },
      }));
    } else {
      setWindowStatus((status) => ({ ...status, [id]: { status: "open" } }));
      bringToFront(id);
    }
  }
  function closeWindow(id: string) {
    setWindowStatus((status) => ({ ...status, [id]: { status: "closing" } }));
  }
  function bringToFront(id: string) {
    setOpenIds((ids) => {
      const filtered = ids.filter((x) => x !== id);
      return [...filtered, id];
    });
  }
  function minimizeWindow(id: string) {
    // Get dock icon position
    let minimizeTarget: { x: number; y: number } | undefined = undefined;
    if (dockRef) {
      const rect = dockRef.getIconPosition(id);
      if (rect) {
        minimizeTarget = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    }

    setWindowStatus((status) => ({
      ...status,
      [id]: { status: "minimizing", minimizeTarget },
    }));
  }
  function updateWindowState(id: string, state: Partial<WindowState>) {
    setWindowStates((states) => {
      const prev = states[id] || DEFAULT_STATE;
      // Clamp y so window can't go above 48px (menu bar height)
      const newY = state.y !== undefined ? Math.max(state.y, 48) : prev.y;
      return {
        ...states,
        [id]: { ...prev, ...state, y: newY },
      };
    });
  }
  function handleWindowAnimationEnd(id: string) {
    const status = windowStatus()[id]?.status;
    if (status === "closing") {
      setOpenIds((ids) => ids.filter((x) => x !== id));
      setMinimizedIds((ids) => ids.filter((x) => x !== id));
      setWindowStatus((s) => {
        const { [id]: _, ...rest } = s;
        return rest;
      });
    } else if (status === "minimizing") {
      setMinimizedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
      // Set status to open so it doesn't keep animating
      setWindowStatus((s) => ({
        ...s,
        [id]: { status: "open" },
      }));
    }
  }

  return (
    <Desktop>
      <DesktopIcons projects={projects} onOpen={openWindow} />
      <Dock
        projects={projects}
        onOpen={(id) => {
          // Always bring to front and set active when clicking dock icon
          openWindow(id);
          bringToFront(id);
          setActiveWindow(id);
        }}
        minimizedIds={minimizedIds()}
        ref={(ref) => (dockRef = ref)}
        activeId={activeWindow() ?? undefined}
      />
      {projects.map((project) => {
        const isOpen = openIds().includes(project.id);
        // Always render if open, let Window handle animation/visibility
        if (!isOpen) return null;
        const zIndex = 100 + openIds().indexOf(project.id);
        // Use project default size if available
        const defaultWidth = project.defaultWidth ?? DEFAULT_STATE.width;
        const defaultHeight = project.defaultHeight ?? DEFAULT_STATE.height;
        return (
          <Window
            title={project.name}
            x={windowStates()[project.id]?.x ?? DEFAULT_STATE.x}
            y={windowStates()[project.id]?.y ?? DEFAULT_STATE.y}
            width={windowStates()[project.id]?.width ?? defaultWidth}
            height={windowStates()[project.id]?.height ?? defaultHeight}
            zIndex={zIndex}
            isActive={activeWindow() === project.id}
            onClose={() => closeWindow(project.id)}
            onMinimize={() => minimizeWindow(project.id)}
            onClick={() => {
              if (activeWindow() !== project.id) {
                bringToFront(project.id);
                setActiveWindow(project.id);
              }
            }}
            onMove={(x, y) => updateWindowState(project.id, { x, y })}
            onResize={(width, height) =>
              updateWindowState(project.id, { width, height })
            }
            onAnimationEnd={() => handleWindowAnimationEnd(project.id)}
            status={windowStatus()[project.id]?.status ?? "open"}
            minimizeTarget={windowStatus()[project.id]?.minimizeTarget}
            restoreFrom={windowStatus()[project.id]?.restoreFrom}
            minimized={minimizedIds().includes(project.id)}
          >
            <project.component />
          </Window>
        );
      })}
    </Desktop>
  );
}
