import { For, Show, createEffect, createSignal, onMount } from "solid-js";
import Desktop from "~/components/Desktop";
import DesktopIcons from "~/components/DesktopIcons";
import Dock, { DockRef } from "~/components/Dock";
import Window from "~/components/Window";
import ContextMenu, { ContextMenuItem } from "~/components/ui/ContextMenu";
import { projects } from "../projects";
import { clampWindow, maximizedRect } from "~/lib/desktopBounds";
import {
  WALLPAPERS,
  WallpaperId,
  nextWallpaperId,
} from "~/lib/wallpapers";

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

type CtxState = {
  kind: "desktop" | "window";
  windowId?: string;
  x: number;
  y: number;
};

const DEFAULT_STATE: WindowState = { x: 200, y: 100, width: 400, height: 300 };
const STORAGE_KEY = "wolfcancode-os-state";

const [interactingWindowId, setInteractingWindowId] = createSignal<
  string | null
>(null);
const [isInteracting, setIsInteracting] = createSignal(false);

function isMobile() {
  if (typeof window === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function isWallpaperId(id: unknown): id is WallpaperId {
  return WALLPAPERS.some((w) => w.id === id);
}

export default function Home() {
  const [openIds, setOpenIds] = createSignal<string[]>([]);
  const [minimizedIds, setMinimizedIds] = createSignal<string[]>([]);
  const [maximizedIds, setMaximizedIds] = createSignal<string[]>([]);
  const [restoreRects, setRestoreRects] = createSignal<
    Record<string, WindowState>
  >({});
  const [windowStates, setWindowStates] = createSignal<
    Record<string, WindowState>
  >({});
  const [windowStatus, setWindowStatus] = createSignal<
    Record<string, WindowStatus>
  >({});
  const [activeWindow, setActiveWindow] = createSignal<string | null>(null);
  const [ctx, setCtx] = createSignal<CtxState | null>(null);
  const [wallpaperId, setWallpaperId] =
    createSignal<WallpaperId>("liquid-sharp");
  let dockRef: DockRef | undefined;

  onMount(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.openIds) setOpenIds(parsed.openIds);
        if (parsed.minimizedIds) setMinimizedIds(parsed.minimizedIds);
        if (parsed.maximizedIds) setMaximizedIds(parsed.maximizedIds);
        if (parsed.restoreRects) setRestoreRects(parsed.restoreRects);
        if (parsed.windowStates) setWindowStates(parsed.windowStates);
        if (isWallpaperId(parsed.wallpaperId)) {
          setWallpaperId(parsed.wallpaperId);
        }
      } catch {}
    }
  });

  createEffect(() => {
    const state = {
      openIds: openIds(),
      minimizedIds: minimizedIds(),
      maximizedIds: maximizedIds(),
      restoreRects: restoreRects(),
      windowStates: windowStates(),
      wallpaperId: wallpaperId(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  });

  function openWindow(id: string) {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    let defaultWidth = project.defaultWidth ?? DEFAULT_STATE.width;
    let defaultHeight = project.defaultHeight ?? DEFAULT_STATE.height;
    let defaultX: number;
    let defaultY: number;
    if (isMobile()) {
      defaultWidth = Math.floor(window.innerWidth * 0.9);
      defaultHeight = Math.floor(window.innerHeight * 0.6);
      defaultX = 10;
      defaultY = 70;
    } else {
      defaultX = DEFAULT_STATE.x;
      defaultY = DEFAULT_STATE.y;
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
      setActiveWindow(id);
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
      const initial = clampWindow(
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight
      );
      setWindowStates((states) => ({
        ...states,
        [id]: states[id] || initial,
      }));
      setActiveWindow(id);
    } else {
      setWindowStatus((status) => ({ ...status, [id]: { status: "open" } }));
      bringToFront(id);
      setActiveWindow(id);
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
    if (activeWindow() === id) {
      setActiveWindow(null);
    }
  }

  function updateWindowState(id: string, state: Partial<WindowState>) {
    setWindowStates((states) => {
      const prev = states[id] || DEFAULT_STATE;
      const next = { ...prev, ...state };
      const clamped = clampWindow(next.x, next.y, next.width, next.height);
      return {
        ...states,
        [id]: clamped,
      };
    });
  }

  function toggleMaximize(id: string) {
    if (maximizedIds().includes(id)) {
      const prev = restoreRects()[id];
      if (prev) updateWindowState(id, prev);
      setMaximizedIds((ids) => ids.filter((x) => x !== id));
    } else {
      const cur = windowStates()[id];
      if (cur) setRestoreRects((r) => ({ ...r, [id]: cur }));
      updateWindowState(id, maximizedRect());
      setMaximizedIds((ids) => [...ids, id]);
    }
    bringToFront(id);
    setActiveWindow(id);
  }

  function handleWindowAnimationEnd(id: string) {
    const status = windowStatus()[id]?.status;
    if (status === "closing") {
      setOpenIds((ids) => ids.filter((x) => x !== id));
      setMinimizedIds((ids) => ids.filter((x) => x !== id));
      setMaximizedIds((ids) => ids.filter((x) => x !== id));
      setWindowStatus((s) => {
        const { [id]: _, ...rest } = s;
        return rest;
      });
    } else if (status === "minimizing") {
      setMinimizedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
      setWindowStatus((s) => ({
        ...s,
        [id]: { status: "open" },
      }));
    }
  }

  function desktopMenuItems(): ContextMenuItem[] {
    return [
      { id: "refresh", label: "Refresh" },
      { id: "about-tommy", label: "About Tommy" },
      { id: "change-wallpaper", label: "Change wallpaper" },
    ];
  }

  function windowMenuItems(windowId: string): ContextMenuItem[] {
    const maximized = maximizedIds().includes(windowId);
    return [
      { id: "close", label: "Close", danger: true },
      { id: "minimize", label: "Minimize" },
      { id: "maximize", label: maximized ? "Restore" : "Maximize" },
      { id: "bring-front", label: "Bring to Front" },
    ];
  }

  function handleCtxSelect(itemId: string) {
    const menu = ctx();
    if (!menu) return;

    if (menu.kind === "desktop") {
      if (itemId === "refresh") {
        // Dismiss only — light refresh of transient UI
      } else if (itemId === "about-tommy") {
        openWindow("about-tommy");
      } else if (itemId === "change-wallpaper") {
        setWallpaperId((id) => nextWallpaperId(id));
      }
      return;
    }

    const windowId = menu.windowId;
    if (!windowId) return;

    if (itemId === "close") {
      closeWindow(windowId);
    } else if (itemId === "minimize") {
      minimizeWindow(windowId);
    } else if (itemId === "maximize") {
      toggleMaximize(windowId);
    } else if (itemId === "bring-front") {
      bringToFront(windowId);
      setActiveWindow(windowId);
    }
  }

  return (
    <Desktop
      wallpaperId={wallpaperId()}
      onContextMenu={(x, y) => setCtx({ kind: "desktop", x, y })}
    >
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
      {isInteracting() && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            "z-index": "var(--z-interact)",
            "pointer-events": "all",
          }}
        />
      )}
      <For each={openIds()}>
        {(id) => {
          const project = () => projects.find((p) => p.id === id);
          return (
            <Show when={project()}>
              {(proj) => {
                const Comp = proj().component;
                const state = () => windowStates()[id] || DEFAULT_STATE;
                return (
                  <Window
                    id={id}
                    isOpen={true}
                    title={proj().name}
                    x={state().x}
                    y={state().y}
                    width={state().width}
                    height={state().height}
                    zIndex={100 + openIds().indexOf(id)}
                    isActive={activeWindow() === id}
                    maximized={maximizedIds().includes(id)}
                    onClose={() => closeWindow(id)}
                    onMinimize={() => minimizeWindow(id)}
                    onMaximize={() => toggleMaximize(id)}
                    onContextMenuRequest={(x, y) =>
                      setCtx({ kind: "window", windowId: id, x, y })
                    }
                    onClick={() => {
                      if (activeWindow() !== id) {
                        bringToFront(id);
                        setActiveWindow(id);
                      }
                    }}
                    onMove={(x, y) => updateWindowState(id, { x, y })}
                    onResize={(width, height) =>
                      updateWindowState(id, { width, height })
                    }
                    onAnimationEnd={() => handleWindowAnimationEnd(id)}
                    status={windowStatus()[id]?.status ?? "open"}
                    minimizeTarget={windowStatus()[id]?.minimizeTarget}
                    restoreFrom={windowStatus()[id]?.restoreFrom}
                    minimized={minimizedIds().includes(id)}
                    isInteracting={interactingWindowId() === id}
                    setInteractingWindowId={setInteractingWindowId}
                    setIsInteracting={setIsInteracting}
                  >
                    <Comp />
                  </Window>
                );
              }}
            </Show>
          );
        }}
      </For>
      <ContextMenu
        open={ctx() !== null}
        x={ctx()?.x ?? 0}
        y={ctx()?.y ?? 0}
        items={
          ctx()?.kind === "window" && ctx()?.windowId
            ? windowMenuItems(ctx()!.windowId!)
            : desktopMenuItems()
        }
        onSelect={handleCtxSelect}
        onClose={() => setCtx(null)}
      />
    </Desktop>
  );
}
