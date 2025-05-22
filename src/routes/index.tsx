import { createEffect, createSignal, JSX, onMount } from "solid-js";
import Desktop from "~/components/Desktop";
import DesktopIcons from "~/components/DesktopIcons";
import Dock, { DockRef } from "~/components/Dock";
import Window from "~/components/Window";
import { projects } from "../projects";
import CourseTrainerApp from "~/routes/apps/CourseTrainerApp";
import MyCVViewer from "~/routes/apps/MyCVViewerApp";
import InterviewTrainerApp from "~/routes/apps/InterviewTrainerApp";

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

// Add global signals for interaction state
const [interactingWindowId, setInteractingWindowId] = createSignal<
  string | null
>(null);
const [isInteracting, setIsInteracting] = createSignal(false);

// Utility to detect mobile
function isMobile() {
  if (typeof window === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

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
    let defaultWidth = project.defaultWidth ?? DEFAULT_STATE.width;
    let defaultHeight = project.defaultHeight ?? DEFAULT_STATE.height;
    if (isMobile()) {
      defaultWidth = Math.floor(window.innerWidth * 0.9);
      defaultHeight = Math.floor(window.innerHeight * 0.6);
      var defaultX = 10;
      var defaultY = 70;
    } else {
      var defaultX = DEFAULT_STATE.x;
      var defaultY = DEFAULT_STATE.y;
    }
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
          x: defaultX,
          y: defaultY,
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
    if (activeWindow() === id) {
      setActiveWindow(null);
    }
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
    // If the minimized window is active, clear activeWindow
    if (activeWindow() === id) {
      setActiveWindow(null);
    }
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
          openWindow(id);
          bringToFront(id);
          setActiveWindow(id);
        }}
        minimizedIds={minimizedIds()}
        ref={(ref) => (dockRef = ref)}
        activeId={activeWindow() ?? undefined}
      />
      {/* Global overlay to block mouse events during drag/resize */}
      {isInteracting() && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            "z-index": 9999,
            "pointer-events": "all",
          }}
        />
      )}
      <Window
        isOpen={openIds().includes("course-trainer")}
        title="Course Trainer"
        x={windowStates()["course-trainer"]?.x ?? 200}
        y={windowStates()["course-trainer"]?.y ?? 100}
        width={windowStates()["course-trainer"]?.width ?? 900}
        height={windowStates()["course-trainer"]?.height ?? 650}
        zIndex={100 + openIds().indexOf("course-trainer")}
        isActive={activeWindow() === "course-trainer"}
        onClose={() => closeWindow("course-trainer")}
        onMinimize={() => minimizeWindow("course-trainer")}
        onClick={() => {
          if (activeWindow() !== "course-trainer") {
            bringToFront("course-trainer");
            setActiveWindow("course-trainer");
          }
        }}
        onMove={(x, y) => updateWindowState("course-trainer", { x, y })}
        onResize={(width, height) =>
          updateWindowState("course-trainer", { width, height })
        }
        onAnimationEnd={() => handleWindowAnimationEnd("course-trainer")}
        status={windowStatus()["course-trainer"]?.status ?? "open"}
        minimizeTarget={windowStatus()["course-trainer"]?.minimizeTarget}
        restoreFrom={windowStatus()["course-trainer"]?.restoreFrom}
        minimized={minimizedIds().includes("course-trainer")}
        isInteracting={interactingWindowId() === "course-trainer"}
        setInteractingWindowId={setInteractingWindowId}
        setIsInteracting={setIsInteracting}
      >
        <CourseTrainerApp />
      </Window>
      <Window
        isOpen={openIds().includes("my-cv")}
        title="My CV"
        x={windowStates()["my-cv"]?.x ?? 200}
        y={windowStates()["my-cv"]?.y ?? 100}
        width={windowStates()["my-cv"]?.width ?? 800}
        height={windowStates()["my-cv"]?.height ?? 1000}
        zIndex={100 + openIds().indexOf("my-cv")}
        isActive={activeWindow() === "my-cv"}
        onClose={() => closeWindow("my-cv")}
        onMinimize={() => minimizeWindow("my-cv")}
        onClick={() => {
          if (activeWindow() !== "my-cv") {
            bringToFront("my-cv");
            setActiveWindow("my-cv");
          }
        }}
        onMove={(x, y) => updateWindowState("my-cv", { x, y })}
        onResize={(width, height) =>
          updateWindowState("my-cv", { width, height })
        }
        onAnimationEnd={() => handleWindowAnimationEnd("my-cv")}
        status={windowStatus()["my-cv"]?.status ?? "open"}
        minimizeTarget={windowStatus()["my-cv"]?.minimizeTarget}
        restoreFrom={windowStatus()["my-cv"]?.restoreFrom}
        minimized={minimizedIds().includes("my-cv")}
        isInteracting={interactingWindowId() === "my-cv"}
        setInteractingWindowId={setInteractingWindowId}
        setIsInteracting={setIsInteracting}
      >
        <MyCVViewer />
      </Window>
      <Window
        isOpen={openIds().includes("interview-trainer")}
        title="Interview Trainer"
        x={windowStates()["interview-trainer"]?.x ?? 200}
        y={windowStates()["interview-trainer"]?.y ?? 100}
        width={windowStates()["interview-trainer"]?.width ?? 900}
        height={windowStates()["interview-trainer"]?.height ?? 650}
        zIndex={100 + openIds().indexOf("interview-trainer")}
        isActive={activeWindow() === "interview-trainer"}
        onClose={() => closeWindow("interview-trainer")}
        onMinimize={() => minimizeWindow("interview-trainer")}
        onClick={() => {
          if (activeWindow() !== "interview-trainer") {
            bringToFront("interview-trainer");
            setActiveWindow("interview-trainer");
          }
        }}
        onMove={(x, y) => updateWindowState("interview-trainer", { x, y })}
        onResize={(width, height) =>
          updateWindowState("interview-trainer", { width, height })
        }
        onAnimationEnd={() => handleWindowAnimationEnd("interview-trainer")}
        status={windowStatus()["interview-trainer"]?.status ?? "open"}
        minimizeTarget={windowStatus()["interview-trainer"]?.minimizeTarget}
        restoreFrom={windowStatus()["interview-trainer"]?.restoreFrom}
        minimized={minimizedIds().includes("interview-trainer")}
        isInteracting={interactingWindowId() === "interview-trainer"}
        setInteractingWindowId={setInteractingWindowId}
        setIsInteracting={setIsInteracting}
      >
        <InterviewTrainerApp />
      </Window>
    </Desktop>
  );
}
