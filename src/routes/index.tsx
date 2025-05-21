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

// Add this before the Home function

const [courseTrainerStyle, setCourseTrainerStyle] = createSignal({
  left: "200px",
  top: "100px",
  width: "400px",
  height: "300px",
  visibility: "hidden",
  pointerEvents: "none",
  zIndex: 1000,
  background: "#fff",
});

const [showCourseTrainer, setShowCourseTrainer] = createSignal(false);
const [ctState, setCtState] = createSignal({
  x: 200,
  y: 100,
  width: 400,
  height: 300,
});

const [ctOverlay, setCtOverlay] = createSignal(false);

let ctResizing = false;
let ctDragOffset = { x: 0, y: 0 };

const [showPortfolio, setShowPortfolio] = createSignal(false);
const [portfolioState, setPortfolioState] = createSignal({
  x: 250,
  y: 120,
  width: 400,
  height: 300,
});
const [portfolioOverlay, setPortfolioOverlay] = createSignal(false);
let portfolioResizing = false;
let portfolioDragOffset = { x: 0, y: 0 };

function onPortfolioBarMouseDown(e: MouseEvent) {
  setPortfolioOverlay(true);
  portfolioDragOffset = {
    x: e.clientX - portfolioState().x,
    y: e.clientY - portfolioState().y,
  };
  function onMove(ev: MouseEvent) {
    setPortfolioState((s) => ({
      ...s,
      x: ev.clientX - portfolioDragOffset.x,
      y: ev.clientY - portfolioDragOffset.y,
    }));
  }
  function onUp() {
    setPortfolioOverlay(false);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  }
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

function onPortfolioResizeMouseDown(e: MouseEvent) {
  setPortfolioOverlay(true);
  e.stopPropagation();
  portfolioResizing = true;
  const { width, height } = portfolioState();
  const start = { x: e.clientX, y: e.clientY, width, height };
  function onMove(ev: MouseEvent) {
    setPortfolioState((s) => ({
      ...s,
      width: Math.max(250, start.width + (ev.clientX - start.x)),
      height: Math.max(150, start.height + (ev.clientY - start.y)),
    }));
  }
  function onUp() {
    setPortfolioOverlay(false);
    portfolioResizing = false;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  }
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

const [showTaskManager, setShowTaskManager] = createSignal(false);
const [taskManagerState, setTaskManagerState] = createSignal({
  x: 320,
  y: 180,
  width: 400,
  height: 300,
});
const [taskManagerOverlay, setTaskManagerOverlay] = createSignal(false);
const [minimizedTaskManager, setMinimizedTaskManager] = createSignal(false);
let taskManagerResizing = false;
let taskManagerDragOffset = { x: 0, y: 0 };

const [showWeather, setShowWeather] = createSignal(false);
const [weatherState, setWeatherState] = createSignal({
  x: 400,
  y: 220,
  width: 400,
  height: 300,
});
const [weatherOverlay, setWeatherOverlay] = createSignal(false);
const [minimizedWeather, setMinimizedWeather] = createSignal(false);
let weatherResizing = false;
let weatherDragOffset = { x: 0, y: 0 };

const [activeWindow, setActiveWindow] = createSignal<string | null>(null);

const [minimizedCT, setMinimizedCT] = createSignal(false);
const [minimizedPortfolio, setMinimizedPortfolio] = createSignal(false);

function restoreWindow(app: string) {
  if (app === "course-trainer") {
    setShowCourseTrainer(true);
    setMinimizedCT(false);
    setActiveWindow("course-trainer");
  } else if (app === "portfolio") {
    setShowPortfolio(true);
    setMinimizedPortfolio(false);
    setActiveWindow("portfolio");
  } else if (app === "task-manager") {
    setShowTaskManager(true);
    setMinimizedTaskManager(false);
    setActiveWindow("task-manager");
  } else if (app === "weather") {
    setShowWeather(true);
    setMinimizedWeather(false);
    setActiveWindow("weather");
  }
}

function onBarMouseDown(e: MouseEvent, app: string) {
  setActiveWindow(app);
  if (app === "course-trainer") {
    setCtOverlay(true);
    ctDragOffset = { x: e.clientX - ctState().x, y: e.clientY - ctState().y };
    function onMove(ev: MouseEvent) {
      setCtState((s) => ({
        ...s,
        x: ev.clientX - ctDragOffset.x,
        y: ev.clientY - ctDragOffset.y,
      }));
    }
    function onUp() {
      setCtOverlay(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  } else if (app === "portfolio") {
    setPortfolioOverlay(true);
    portfolioDragOffset = {
      x: e.clientX - portfolioState().x,
      y: e.clientY - portfolioState().y,
    };
    function onMove(ev: MouseEvent) {
      setPortfolioState((s) => ({
        ...s,
        x: ev.clientX - portfolioDragOffset.x,
        y: ev.clientY - portfolioDragOffset.y,
      }));
    }
    function onUp() {
      setPortfolioOverlay(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  } else if (app === "task-manager") {
    setTaskManagerOverlay(true);
    taskManagerDragOffset = {
      x: e.clientX - taskManagerState().x,
      y: e.clientY - taskManagerState().y,
    };
    function onMove(ev: MouseEvent) {
      setTaskManagerState((s) => ({
        ...s,
        x: ev.clientX - taskManagerDragOffset.x,
        y: ev.clientY - taskManagerDragOffset.y,
      }));
    }
    function onUp() {
      setTaskManagerOverlay(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  } else if (app === "weather") {
    setWeatherOverlay(true);
    weatherDragOffset = {
      x: e.clientX - weatherState().x,
      y: e.clientY - weatherState().y,
    };
    function onMove(ev: MouseEvent) {
      setWeatherState((s) => ({
        ...s,
        x: ev.clientX - weatherDragOffset.x,
        y: ev.clientY - weatherDragOffset.y,
      }));
    }
    function onUp() {
      setWeatherOverlay(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
}

function onResizeMouseDown(e: MouseEvent, app: string) {
  if (app === "course-trainer") {
    setCtOverlay(true);
    e.stopPropagation();
    ctResizing = true;
    const { width, height } = ctState();
    const start = { x: e.clientX, y: e.clientY, width, height };
    function onMove(ev: MouseEvent) {
      setCtState((s) => ({
        ...s,
        width: Math.max(250, start.width + (ev.clientX - start.x)),
        height: Math.max(150, start.height + (ev.clientY - start.y)),
      }));
    }
    function onUp() {
      setCtOverlay(false);
      ctResizing = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  } else if (app === "portfolio") {
    setPortfolioOverlay(true);
    e.stopPropagation();
    portfolioResizing = true;
    const { width, height } = portfolioState();
    const start = { x: e.clientX, y: e.clientY, width, height };
    function onMove(ev: MouseEvent) {
      setPortfolioState((s) => ({
        ...s,
        width: Math.max(250, start.width + (ev.clientX - start.x)),
        height: Math.max(150, start.height + (ev.clientY - start.y)),
      }));
    }
    function onUp() {
      setPortfolioOverlay(false);
      portfolioResizing = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  } else if (app === "task-manager") {
    setTaskManagerOverlay(true);
    e.stopPropagation();
    taskManagerResizing = true;
    const { width, height } = taskManagerState();
    const start = { x: e.clientX, y: e.clientY, width, height };
    function onMove(ev: MouseEvent) {
      setTaskManagerState((s) => ({
        ...s,
        width: Math.max(250, start.width + (ev.clientX - start.x)),
        height: Math.max(150, start.height + (ev.clientY - start.y)),
      }));
    }
    function onUp() {
      setTaskManagerOverlay(false);
      taskManagerResizing = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  } else if (app === "weather") {
    setWeatherOverlay(true);
    e.stopPropagation();
    weatherResizing = true;
    const { width, height } = weatherState();
    const start = { x: e.clientX, y: e.clientY, width, height };
    function onMove(ev: MouseEvent) {
      setWeatherState((s) => ({
        ...s,
        width: Math.max(250, start.width + (ev.clientX - start.x)),
        height: Math.max(150, start.height + (ev.clientY - start.y)),
      }));
    }
    function onUp() {
      setWeatherOverlay(false);
      weatherResizing = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
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

  createEffect(() => {
    const isOpen =
      openIds().includes("course-trainer") &&
      !(
        minimizedIds().includes("course-trainer") &&
        windowStatus()["course-trainer"]?.status !== "minimizing"
      );
    const state = windowStates()["course-trainer"] || DEFAULT_STATE;
    setCourseTrainerStyle({
      left: `${state.x}px`,
      top: `${state.y}px`,
      width: `${state.width}px`,
      height: `${state.height}px`,
      visibility: isOpen ? "visible" : "hidden",
      pointerEvents: isOpen ? "auto" : "none",
      zIndex: 1000,
      background: "#fff",
    });
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
    // Debug: log window and dock icon positions
    const state = windowStates()[id] || DEFAULT_STATE;
    const winCenterX = state.x + state.width / 2;
    const winCenterY = state.y + state.height / 2;
    if (minimizeTarget) {
      console.log("Window center:", winCenterX, winCenterY);
      console.log("Dock icon center:", minimizeTarget.x, minimizeTarget.y);
      console.log(
        "Delta:",
        minimizeTarget.x - winCenterX,
        minimizeTarget.y - winCenterY
      );
    }
    setWindowStatus((status) => ({
      ...status,
      [id]: { status: "minimizing", minimizeTarget },
    }));
  }
  function updateWindowState(id: string, state: Partial<WindowState>) {
    setWindowStates((states) => ({
      ...states,
      [id]: { ...states[id], ...state },
    }));
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
      setWindowStatus((s) => {
        const { [id]: _, ...rest } = s;
        return rest;
      });
    }
  }

  return (
    <Desktop>
      <DesktopIcons projects={projects} onOpen={openWindow} />
      <Dock
        projects={projects}
        onOpen={openWindow}
        minimizedIds={
          [
            minimizedCT() ? "course-trainer" : null,
            minimizedPortfolio() ? "1" : null,
            minimizedTaskManager() ? "2" : null,
            minimizedWeather() ? "3" : null,
          ].filter(Boolean) as string[]
        }
      />
      {/* Standalone Course Trainer window */}
      {showCourseTrainer() && !minimizedCT() && (
        <div
          class="fixed bg-white rounded-xl shadow-2xl"
          style={{
            left: `${ctState().x}px`,
            top: `${ctState().y}px`,
            width: `${ctState().width}px`,
            height: `${ctState().height}px`,
            "z-index": activeWindow() === "course-trainer" ? 2000 : 1000,
            overflow: "hidden",
          }}
          onMouseDown={() => setActiveWindow("course-trainer")}
        >
          <div
            class="flex items-center bg-gradient-to-r from-[#e2e8f0] to-[#f8fafc] rounded-t-xl px-4 py-2 border-b border-gray-200 shadow-sm cursor-grab"
            onMouseDown={(e) => onBarMouseDown(e, "course-trainer")}
          >
            <span
              class="inline-block w-3 h-3 bg-[#ff5f56] rounded-full mr-2 border border-[#e33e41] cursor-pointer"
              onClick={() => setShowCourseTrainer(false)}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <span
              class="inline-block w-3 h-3 bg-[#ffbd2e] rounded-full mr-2 border border-[#e1a116] cursor-pointer"
              onClick={() => setMinimizedCT(true)}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <span
              class="ml-1 text-base font-bold text-gray-800 truncate"
              style="max-width: 260px;"
            >
              Course Trainer
            </span>
          </div>
          {ctOverlay() && (
            <div
              class="absolute left-0 top-0 w-full h-full"
              style={{
                cursor: ctResizing ? "nwse-resize" : "move",
                "z-index": 2000,
                background: "transparent",
              }}
            />
          )}
          <iframe
            src={projects.find((p) => p.id === "course-trainer")!.link}
            title="Course Trainer"
            class="w-full h-full min-h-[300px] min-w-[250px] rounded-lg border-0"
            style={{
              height: "100%",
              width: "100%",
              border: "none",
              background: "#fff",
            }}
            allow="clipboard-write; fullscreen"
          />
          <div
            class="absolute right-1 bottom-1 w-4 h-4 cursor-nwse-resize flex items-end justify-end"
            onMouseDown={(e) => onResizeMouseDown(e, "course-trainer")}
            style={{ "z-index": 100 }}
          >
            <div class="w-3 h-3 bg-gray-300 rounded-sm border border-gray-400 opacity-70" />
          </div>
        </div>
      )}
      {/* Standalone Portfolio Website window */}
      {showPortfolio() && !minimizedPortfolio() && (
        <div
          class="fixed bg-white rounded-xl shadow-2xl"
          style={{
            left: `${portfolioState().x}px`,
            top: `${portfolioState().y}px`,
            width: `${portfolioState().width}px`,
            height: `${portfolioState().height}px`,
            "z-index": activeWindow() === "portfolio" ? 2000 : 1000,
            overflow: "hidden",
          }}
          onMouseDown={() => setActiveWindow("portfolio")}
        >
          <div
            class="flex items-center bg-gradient-to-r from-[#e2e8f0] to-[#f8fafc] rounded-t-xl px-4 py-2 border-b border-gray-200 shadow-sm cursor-grab"
            onMouseDown={(e) => onBarMouseDown(e, "portfolio")}
          >
            <span
              class="inline-block w-3 h-3 bg-[#ff5f56] rounded-full mr-2 border border-[#e33e41] cursor-pointer"
              onClick={() => setShowPortfolio(false)}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <span
              class="inline-block w-3 h-3 bg-[#ffbd2e] rounded-full mr-2 border border-[#e1a116] cursor-pointer"
              onClick={() => setMinimizedPortfolio(true)}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <span
              class="ml-1 text-base font-bold text-gray-800 truncate"
              style="max-width: 260px;"
            >
              Portfolio Website
            </span>
          </div>
          {portfolioOverlay() && (
            <div
              class="absolute left-0 top-0 w-full h-full"
              style={{
                cursor: portfolioResizing ? "nwse-resize" : "move",
                "z-index": 2000,
                background: "transparent",
              }}
            />
          )}
          <div class="h-full overflow-auto p-4">
            <h2 class="text-xl font-bold mb-2">Portfolio Website</h2>
            <p class="mb-2">
              My personal portfolio built with SolidJS and Tailwind.
            </p>
            <a
              href="https://your-portfolio.com"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sky-600 hover:underline"
            >
              View Project
            </a>
          </div>
          <div
            class="absolute right-1 bottom-1 w-4 h-4 cursor-nwse-resize flex items-end justify-end"
            onMouseDown={(e) => onResizeMouseDown(e, "portfolio")}
            style={{ "z-index": 100 }}
          >
            <div class="w-3 h-3 bg-gray-300 rounded-sm border border-gray-400 opacity-70" />
          </div>
        </div>
      )}
      {/* Standalone Task Manager window */}
      {showTaskManager() && !minimizedTaskManager() && (
        <div
          class="fixed bg-white rounded-xl shadow-2xl"
          style={{
            left: `${taskManagerState().x}px`,
            top: `${taskManagerState().y}px`,
            width: `${taskManagerState().width}px`,
            height: `${taskManagerState().height}px`,
            "z-index": activeWindow() === "task-manager" ? 2000 : 1000,
            overflow: "hidden",
          }}
          onMouseDown={() => setActiveWindow("task-manager")}
        >
          <div
            class="flex items-center bg-gradient-to-r from-[#e2e8f0] to-[#f8fafc] rounded-t-xl px-4 py-2 border-b border-gray-200 shadow-sm cursor-grab"
            onMouseDown={(e) => onBarMouseDown(e, "task-manager")}
          >
            <span
              class="inline-block w-3 h-3 bg-[#ff5f56] rounded-full mr-2 border border-[#e33e41] cursor-pointer"
              onClick={() => setShowTaskManager(false)}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <span
              class="inline-block w-3 h-3 bg-[#ffbd2e] rounded-full mr-2 border border-[#e1a116] cursor-pointer"
              onClick={() => setMinimizedTaskManager(true)}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <span
              class="ml-1 text-base font-bold text-gray-800 truncate"
              style="max-width: 260px;"
            >
              Task Manager
            </span>
          </div>
          {taskManagerOverlay() && (
            <div
              class="absolute left-0 top-0 w-full h-full"
              style={{
                cursor: taskManagerResizing ? "nwse-resize" : "move",
                "z-index": 2000,
                background: "transparent",
              }}
            />
          )}
          <div class="h-full overflow-auto p-4">
            <h2 class="text-xl font-bold mb-2">Task Manager</h2>
            <p class="mb-2">A simple and elegant task manager app.</p>
            <a
              href="https://github.com/yourname/task-manager"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sky-600 hover:underline"
            >
              View Project
            </a>
          </div>
          <div
            class="absolute right-1 bottom-1 w-4 h-4 cursor-nwse-resize flex items-end justify-end"
            onMouseDown={(e) => onResizeMouseDown(e, "task-manager")}
            style={{ "z-index": 100 }}
          >
            <div class="w-3 h-3 bg-gray-300 rounded-sm border border-gray-400 opacity-70" />
          </div>
        </div>
      )}
      {/* Standalone Weather App window */}
      {showWeather() && !minimizedWeather() && (
        <div
          class="fixed bg-white rounded-xl shadow-2xl"
          style={{
            left: `${weatherState().x}px`,
            top: `${weatherState().y}px`,
            width: `${weatherState().width}px`,
            height: `${weatherState().height}px`,
            "z-index": activeWindow() === "weather" ? 2000 : 1000,
            overflow: "hidden",
          }}
          onMouseDown={() => setActiveWindow("weather")}
        >
          <div
            class="flex items-center bg-gradient-to-r from-[#e2e8f0] to-[#f8fafc] rounded-t-xl px-4 py-2 border-b border-gray-200 shadow-sm cursor-grab"
            onMouseDown={(e) => onBarMouseDown(e, "weather")}
          >
            <span
              class="inline-block w-3 h-3 bg-[#ff5f56] rounded-full mr-2 border border-[#e33e41] cursor-pointer"
              onClick={() => setShowWeather(false)}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <span
              class="inline-block w-3 h-3 bg-[#ffbd2e] rounded-full mr-2 border border-[#e1a116] cursor-pointer"
              onClick={() => setMinimizedWeather(true)}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <span
              class="ml-1 text-base font-bold text-gray-800 truncate"
              style="max-width: 260px;"
            >
              Weather App
            </span>
          </div>
          {weatherOverlay() && (
            <div
              class="absolute left-0 top-0 w-full h-full"
              style={{
                cursor: weatherResizing ? "nwse-resize" : "move",
                "z-index": 2000,
                background: "transparent",
              }}
            />
          )}
          <div class="h-full overflow-auto p-4">
            <h2 class="text-xl font-bold mb-2">Weather App</h2>
            <p class="mb-2">A weather forecast app using OpenWeatherMap API.</p>
            <a
              href="https://github.com/yourname/weather-app"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sky-600 hover:underline"
            >
              View Project
            </a>
          </div>
          <div
            class="absolute right-1 bottom-1 w-4 h-4 cursor-nwse-resize flex items-end justify-end"
            onMouseDown={(e) => onResizeMouseDown(e, "weather")}
            style={{ "z-index": 100 }}
          >
            <div class="w-3 h-3 bg-gray-300 rounded-sm border border-gray-400 opacity-70" />
          </div>
        </div>
      )}
      {projects.map((project) => {
        const isOpen = openIds().includes(project.id);
        const isMinimized = minimizedIds().includes(project.id);
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
            onClick={() => bringToFront(project.id)}
            onMove={(x, y) => updateWindowState(project.id, { x, y })}
            onResize={(width, height) =>
              updateWindowState(project.id, { width, height })
            }
            onAnimationEnd={() => handleWindowAnimationEnd(project.id)}
          >
            <project.component />
          </Window>
        );
      })}
    </Desktop>
  );
}
