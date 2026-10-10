import {
  JSX,
  Show,
  onMount,
  createEffect,
  onCleanup,
  createSignal,
} from "solid-js";
import {
  clampWindow,
  isCompactLayout,
  minWindowSize,
} from "~/lib/desktopBounds";

type WindowStatus = "open" | "minimizing" | "closing";

type ResizeHandle =
  | "n"
  | "s"
  | "e"
  | "w"
  | "nw"
  | "ne"
  | "sw"
  | "se";

const WINDOW_RADIUS = 16;

/** Cheap frosted glass — hairline rim; shadow follows radius (no square outer shadow). */
function FrostedFrame(props: {
  active?: boolean;
  lite?: boolean;
  children: JSX.Element;
}) {
  return (
    <div
      class="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl"
      style={{
        background: props.lite
          ? "rgba(24,24,27,0.94)"
          : "rgba(24,24,27,0.78)",
        "backdrop-filter": props.lite ? "none" : "blur(18px) saturate(1.35)",
        "-webkit-backdrop-filter": props.lite
          ? "none"
          : "blur(18px) saturate(1.35)",
        border: "0.5px solid rgba(255,255,255,0.16)",
        // Soft elevation that tracks border-radius (avoid square silhouette)
        "box-shadow": props.active
          ? "0 8px 28px rgba(0,0,0,0.38), 0 2px 8px rgba(0,0,0,0.22), inset 0 0.5px 0 rgba(255,255,255,0.12)"
          : "0 6px 20px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.18), inset 0 0.5px 0 rgba(255,255,255,0.08)",
      }}
    >
      {props.children}
    </div>
  );
}

function CornerCurve(props: { corner: "nw" | "ne" | "sw" | "se" }) {
  // Arc matching WINDOW_RADIUS along the outer glass border
  const paths: Record<typeof props.corner, string> = {
    nw: "M 3 18 L 3 16 A 13 13 0 0 1 16 3 L 18 3",
    ne: "M 18 18 L 18 16 A 13 13 0 0 0 5 3 L 3 3",
    sw: "M 3 3 L 3 5 A 13 13 0 0 0 16 18 L 18 18",
    se: "M 18 3 L 18 5 A 13 13 0 0 1 5 18 L 3 18",
  };
  const pos =
    props.corner === "nw"
      ? "left-0 top-0"
      : props.corner === "ne"
        ? "right-0 top-0"
        : props.corner === "sw"
          ? "left-0 bottom-0"
          : "right-0 bottom-0";

  return (
    <svg
      class={`pointer-events-none absolute ${pos} h-5 w-5 opacity-0 transition-opacity duration-150 group-hover:opacity-90`}
      viewBox="0 0 21 21"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={paths[props.corner]}
        stroke="rgba(255,255,255,0.85)"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export default function Window(props: {
  id?: string;
  title: string;
  onClose: () => void;
  onClick?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  maximized?: boolean;
  onContextMenuRequest?: (x: number, y: number) => void;
  zIndex?: number;
  isActive?: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  status?: WindowStatus;
  minimizeTarget?: { x: number; y: number };
  restoreFrom?: { x: number; y: number };
  onAnimationEnd?: () => void;
  children?: JSX.Element;
  minimized?: boolean;
  isOpen?: boolean;
  isInteracting?: boolean;
  /** True while any window is being dragged/resized — disable heavy glass everywhere. */
  desktopBusy?: boolean;
  interactingWindowId?: string | null;
  setInteractingWindowId?: (id: string | null) => void;
  setIsInteracting?: (v: boolean) => void;
}) {
  let dragging = false;
  let resizing = false;
  /** While true, geometry is written to the DOM directly (no Solid state thrash). */
  let domDriven = false;
  let offset = { x: 0, y: 0 };
  let startPos = { x: 0, y: 0 };
  let startSize = { width: 400, height: 300 };
  let liveGeom = { x: 0, y: 0, width: 400, height: 300 };
  let contentRef: HTMLDivElement | undefined;
  let bodyRef: HTMLDivElement | undefined;

  const [transform, setTransform] = createSignal("scale(1)");
  const [transformOrigin, setTransformOrigin] = createSignal("50% 50%");
  const [winOpacity, setWinOpacity] = createSignal(1);
  const [transitionEnabled, setTransitionEnabled] = createSignal(true);
  const [showOverlay, setShowOverlay] = createSignal(false);
  const [isGrabbing, setIsGrabbing] = createSignal(false);
  /** Skip frosted blur while dragging/resizing/animating. */
  const [liteChrome, setLiteChrome] = createSignal(false);
  const [freezeLive, setFreezeLive] = createSignal(false);
  /** Disable left/top/width/height transitions while dragging/resizing. */
  const [lockGeomTransition, setLockGeomTransition] = createSignal(false);
  /** Allow maximize morph only after mount (avoids open flash). */
  const [geomReady, setGeomReady] = createSignal(false);
  /** Hide resize grips on compact / phone layouts. */
  const [compact, setCompact] = createSignal(false);

  const MAC_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  const MINIMIZE_MS = 520;
  const MAXIMIZE_MS = 460;

  function interactionKey() {
    return props.id ?? props.title;
  }

  function beginInteraction() {
    setLiteChrome(true);
    setLockGeomTransition(true);
    props.setInteractingWindowId?.(interactionKey());
    props.setIsInteracting?.(true);
  }

  function endInteraction() {
    setLiteChrome(false);
    setLockGeomTransition(false);
    props.setInteractingWindowId?.(null);
    props.setIsInteracting?.(false);
  }

  function dockTransformOrigin(target: { x: number; y: number }) {
    const ox = ((target.x - props.x) / Math.max(props.width, 1)) * 100;
    const oy = ((target.y - props.y) / Math.max(props.height, 1)) * 100;
    return `${Math.min(110, Math.max(-10, ox))}% ${Math.min(110, Math.max(-10, oy))}%`;
  }

  function writeDomGeom(x: number, y: number, width: number, height: number) {
    if (!contentRef) return;
    contentRef.style.left = `${x}px`;
    contentRef.style.top = `${y}px`;
    contentRef.style.width = `${width}px`;
    contentRef.style.height = `${height}px`;
  }

  function applyMoveDom(x: number, y: number) {
    const c = clampWindow(x, y, liveGeom.width, liveGeom.height);
    liveGeom = { ...liveGeom, x: c.x, y: c.y };
    writeDomGeom(c.x, c.y, liveGeom.width, liveGeom.height);
  }

  function applyGeometryDom(
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    const c = clampWindow(x, y, width, height);
    liveGeom = c;
    writeDomGeom(c.x, c.y, c.width, c.height);
  }

  /** Freeze live content during minimize/close animations (no bitmap capture). */
  function freezeForAnimation() {
    setLiteChrome(true);
    setFreezeLive(true);
  }

  function handleMinimize(e: MouseEvent) {
    e.stopPropagation();
    freezeForAnimation();
    props.onMinimize?.();
  }

  function handleClose(e: MouseEvent) {
    e.stopPropagation();
    freezeForAnimation();
    props.onClose();
  }

  const hideLiveContent = () =>
    freezeLive() ||
    props.status === "minimizing" ||
    props.status === "closing" ||
    !!props.minimized;

  // Sync props → DOM when not mid drag/resize
  createEffect(() => {
    const x = props.x;
    const y = props.y;
    const w = props.width;
    const h = props.height;
    if (domDriven) return;
    liveGeom = { x, y, width: w, height: h };
    writeDomGeom(x, y, w, h);
  });

  // After restore from dock, keep frozen until suck-in finishes
  createEffect(() => {
    if (props.restoreFrom) {
      setFreezeLive(true);
      setLiteChrome(true);
    }
  });

  createEffect(() => {
    if (props.status === "open" && !props.minimized && !props.restoreFrom) {
      const t = window.setTimeout(() => {
        setFreezeLive(false);
        setLiteChrome(false);
        setTransformOrigin("50% 50%");
        setWinOpacity(1);
        setTransform("scale(1)");
      }, MINIMIZE_MS);
      onCleanup(() => clearTimeout(t));
    }
  });

  let animEndSent = false;
  function emitAnimationEnd() {
    if (animEndSent) return;
    if (props.status !== "closing" && props.status !== "minimizing") return;
    animEndSent = true;
    props.onAnimationEnd?.();
  }

  onMount(() => {
    const syncCompact = () => setCompact(isCompactLayout());
    syncCompact();
    window.addEventListener("resize", syncCompact);

    const readyT = window.setTimeout(() => setGeomReady(true), 80);
    if (!contentRef) {
      onCleanup(() => {
        clearTimeout(readyT);
        window.removeEventListener("resize", syncCompact);
      });
      return;
    }
    const handler = (e: TransitionEvent) => {
      if (e.propertyName === "transform" || e.propertyName === "opacity") {
        emitAnimationEnd();
      }
    };
    contentRef.addEventListener("transitionend", handler);
    onCleanup(() => {
      clearTimeout(readyT);
      window.removeEventListener("resize", syncCompact);
      contentRef?.removeEventListener("transitionend", handler);
    });
  });

  // Restore from dock — reverse macOS suck
  onMount(() => {
    if (props.restoreFrom) {
      setTransitionEnabled(false);
      setTransformOrigin(dockTransformOrigin(props.restoreFrom));
      setTransform("scale(0.04, 0.14) translateX(10%)");
      setWinOpacity(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
          setTransform("scale(1) translateX(0)");
          setWinOpacity(1);
        });
      });
    }
  });

  createEffect(() => {
    if (props.status === "minimizing" && props.minimizeTarget) {
      animEndSent = false;
      setLiteChrome(true);
      setFreezeLive(true);
      setTransitionEnabled(true);
      setTransformOrigin(dockTransformOrigin(props.minimizeTarget));
      setTransform("scale(1)");
      setWinOpacity(1);
      requestAnimationFrame(() => {
        // Suck toward right dock: squash + fade (macOS-like)
        setTransform("scale(0.035, 0.12) translateX(14%)");
        setWinOpacity(0);
      });
    } else if (props.status === "closing") {
      animEndSent = false;
      setLiteChrome(true);
      setFreezeLive(true);
      setTransitionEnabled(true);
      setTransformOrigin("50% 50%");
      if (contentRef) contentRef.offsetWidth;
      setTransform("scale(0.92)");
      setWinOpacity(0);
    }
  });

  // Fallback if transitionend is missed
  createEffect(() => {
    if (props.status === "minimizing" || props.status === "closing") {
      const t = window.setTimeout(() => {
        emitAnimationEnd();
      }, MINIMIZE_MS + 80);
      onCleanup(() => clearTimeout(t));
    }
  });

  onMount(() => {
    function handleMouseMove(e: MouseEvent) {
      onMouseMove(e);
    }
    function handleMouseUp() {
      onMouseUp();
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    onCleanup(() => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    });
  });

  function onTitleMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    if (props.onClick) props.onClick();
    setShowOverlay(true);
    setIsGrabbing(true);
    dragging = true;
    domDriven = true;
    offset = { x: e.clientX, y: e.clientY };
    startPos = { x: props.x, y: props.y };
    liveGeom = {
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
    };
    beginInteraction();
  }

  function onTitleTouchStart(e: TouchEvent) {
    if (props.onClick) props.onClick();
    setShowOverlay(true);
    setIsGrabbing(true);
    dragging = true;
    domDriven = true;
    const touch = e.touches[0];
    offset = { x: touch.clientX, y: touch.clientY };
    startPos = { x: props.x, y: props.y };
    liveGeom = {
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
    };
    beginInteraction();
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
  }

  function onTouchMove(e: TouchEvent) {
    if (!dragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    applyMoveDom(
      startPos.x + (touch.clientX - offset.x),
      startPos.y + (touch.clientY - offset.y),
    );
  }

  function onTouchEnd() {
    if (dragging) {
      props.onMove(liveGeom.x, liveGeom.y);
    }
    dragging = false;
    domDriven = false;
    setIsGrabbing(false);
    setShowOverlay(false);
    endInteraction();
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
  }

  function onMouseMove(e: MouseEvent) {
    if (dragging) {
      applyMoveDom(
        startPos.x + (e.clientX - offset.x),
        startPos.y + (e.clientY - offset.y),
      );
    }
  }

  function onMouseUp() {
    if (!dragging && !resizing) return;
    if (dragging) {
      props.onMove(liveGeom.x, liveGeom.y);
    }
    if (resizing) {
      props.onMove(liveGeom.x, liveGeom.y);
      props.onResize(liveGeom.width, liveGeom.height);
    }
    dragging = false;
    resizing = false;
    domDriven = false;
    setIsGrabbing(false);
    setShowOverlay(false);
    endInteraction();
  }

  function handleContainerMouseDown() {
    if (!dragging && props.onClick) props.onClick();
  }

  function resizeFromDelta(handle: ResizeHandle, dx: number, dy: number) {
    const { minW, minH } = minWindowSize();
    let newX = startPos.x;
    let newY = startPos.y;
    let newWidth = startSize.width;
    let newHeight = startSize.height;

    if (handle.includes("w")) {
      newX = startPos.x + dx;
      newWidth = Math.max(minW, startSize.width - dx);
    } else if (handle.includes("e")) {
      newWidth = Math.max(minW, startSize.width + dx);
    }

    if (handle.includes("n")) {
      newY = startPos.y + dy;
      newHeight = Math.max(minH, startSize.height - dy);
    } else if (handle.includes("s")) {
      newHeight = Math.max(minH, startSize.height + dy);
    }

    if (handle.includes("w") && newWidth === minW) {
      newX = startPos.x + startSize.width - minW;
    }
    if (handle.includes("n") && newHeight === minH) {
      newY = startPos.y + startSize.height - minH;
    }

    applyGeometryDom(newX, newY, newWidth, newHeight);
  }

  function onResizeMouseDown(e: MouseEvent, handle: ResizeHandle) {
    e.stopPropagation();
    e.preventDefault();
    if (props.onClick) props.onClick();
    setShowOverlay(true);
    resizing = true;
    domDriven = true;
    offset = { x: e.clientX, y: e.clientY };
    startSize = { width: props.width, height: props.height };
    startPos = { x: props.x, y: props.y };
    liveGeom = {
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
    };
    beginInteraction();

    function onMove(ev: MouseEvent) {
      resizeFromDelta(handle, ev.clientX - offset.x, ev.clientY - offset.y);
    }
    function onUp() {
      props.onMove(liveGeom.x, liveGeom.y);
      props.onResize(liveGeom.width, liveGeom.height);
      resizing = false;
      domDriven = false;
      setShowOverlay(false);
      endInteraction();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function onResizeTouchStart(e: TouchEvent, handle: ResizeHandle) {
    e.stopPropagation();
    if (props.onClick) props.onClick();
    setShowOverlay(true);
    resizing = true;
    domDriven = true;
    const touch = e.touches[0];
    offset = { x: touch.clientX, y: touch.clientY };
    startSize = { width: props.width, height: props.height };
    startPos = { x: props.x, y: props.y };
    liveGeom = {
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
    };
    beginInteraction();

    function onMove(ev: TouchEvent) {
      const t = ev.touches[0];
      resizeFromDelta(handle, t.clientX - offset.x, t.clientY - offset.y);
    }
    function onUp() {
      props.onMove(liveGeom.x, liveGeom.y);
      props.onResize(liveGeom.width, liveGeom.height);
      resizing = false;
      domDriven = false;
      setShowOverlay(false);
      endInteraction();
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    }
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }

  const handleCursor: Record<ResizeHandle, string> = {
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    nw: "nwse-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    se: "nwse-resize",
  };

  function resizeGrip(handle: ResizeHandle, className: string, visual?: JSX.Element) {
    return (
      <div
        class={`absolute z-30 group ${className}`}
        style={{ cursor: handleCursor[handle] }}
        onMouseDown={(e) => onResizeMouseDown(e, handle)}
        onTouchStart={(e) => onResizeTouchStart(e, handle)}
      >
        {visual}
      </div>
    );
  }

  const chromeInner = (
    <>
      <div
        class={`relative z-[110] flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2.5 sm:py-2 ${
          isGrabbing() ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          background: "rgba(255,255,255,0.06)",
        }}
        onMouseDown={onTitleMouseDown}
        onTouchStart={onTitleTouchStart}
        onDblClick={() => props.onMaximize?.()}
        onContextMenu={(e) => {
          e.preventDefault();
          props.onContextMenuRequest?.(e.clientX, e.clientY);
        }}
      >
        <div class="relative z-[111] flex shrink-0 items-center gap-2">
          <span
            class="inline-block h-3.5 w-3.5 cursor-pointer rounded-full border border-[#e33e41] bg-[#ff5f56] transition-transform duration-150 hover:scale-125 sm:h-3 sm:w-3"
            onClick={handleClose}
            onMouseDown={(e) => e.stopPropagation()}
            title="Close"
          />
          <span
            class="inline-block h-3.5 w-3.5 cursor-pointer rounded-full border border-[#e1a116] bg-[#ffbd2e] transition-transform duration-150 hover:scale-125 sm:h-3 sm:w-3"
            onClick={handleMinimize}
            onMouseDown={(e) => e.stopPropagation()}
            title="Minimize"
          />
          <span
            class="inline-block h-3.5 w-3.5 cursor-pointer rounded-full border border-[#14ae2c] bg-[#28c840] transition-transform duration-150 hover:scale-125 sm:h-3 sm:w-3"
            onClick={(e) => {
              e.stopPropagation();
              props.onMaximize?.();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title={props.maximized ? "Restore" : "Maximize"}
          />
        </div>
        <span
          class="ml-1 truncate text-sm font-medium text-white/90"
          style={{ "max-width": "260px" }}
        >
          {props.title}
        </span>
      </div>

      <div
        ref={bodyRef}
        class="relative z-[6] min-h-0 flex-1 overflow-hidden bg-zinc-950 text-zinc-100"
      >
        <Show
          when={!hideLiveContent()}
          fallback={
            <div class="flex h-full items-center justify-center bg-zinc-900/90 text-sm text-white/40">
              {props.title}
            </div>
          }
        >
          {props.children}
        </Show>
      </div>
    </>
  );

  return (
    <div
      ref={contentRef}
      class="fixed select-none rounded-2xl"
      style={{
        left: `${props.x}px`,
        top: `${props.y}px`,
        width: `${props.width}px`,
        height: `${props.height}px`,
        "z-index":
          props.isInteracting
            ? Math.max(props.zIndex ?? 50, 10050)
            : (props.zIndex ?? 50),
        transform: transform(),
        "transform-origin": transformOrigin(),
        opacity: winOpacity(),
        // Maximize morphs geometry; minimize sucks via transform/opacity
        transition: !transitionEnabled() || lockGeomTransition()
          ? "none"
          : geomReady()
            ? `left ${MAXIMIZE_MS}ms ${MAC_EASE}, top ${MAXIMIZE_MS}ms ${MAC_EASE}, width ${MAXIMIZE_MS}ms ${MAC_EASE}, height ${MAXIMIZE_MS}ms ${MAC_EASE}, transform ${MINIMIZE_MS}ms ${MAC_EASE}, opacity ${MINIMIZE_MS}ms ${MAC_EASE}`
            : `transform ${MINIMIZE_MS}ms ${MAC_EASE}, opacity ${MINIMIZE_MS}ms ${MAC_EASE}`,
        "will-change":
          dragging || resizing
            ? "left, top, width, height"
            : "transform, opacity, left, top, width, height",
        display:
          props.isOpen === false
            ? "none"
            : props.minimized && props.status === "open"
              ? "none"
              : undefined,
      }}
      onMouseDown={handleContainerMouseDown}
    >
      <FrostedFrame
        active={props.isActive}
        lite={liteChrome() || !!props.desktopBusy}
      >
        {chromeInner}
      </FrostedFrame>

      {showOverlay() && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            background: "transparent",
            "z-index": 40,
            "pointer-events": "all",
            cursor: resizing
              ? "nwse-resize"
              : dragging
                ? "grabbing"
                : "default",
          }}
        />
      )}

      {/* Resize grips: desktop only — phones use maximize fill */}
      <Show when={!compact()}>
        {resizeGrip(
          "nw",
          "-left-1 -top-1 h-2.5 w-2.5",
          <CornerCurve corner="nw" />,
        )}
        {resizeGrip(
          "ne",
          "-right-1 -top-1 h-2.5 w-2.5",
          <CornerCurve corner="ne" />,
        )}
        {resizeGrip(
          "sw",
          "bottom-0 left-0 h-3.5 w-3.5",
          <CornerCurve corner="sw" />,
        )}
        {resizeGrip(
          "se",
          "bottom-0 right-0 h-3.5 w-3.5",
          <CornerCurve corner="se" />,
        )}
        {resizeGrip(
          "n",
          "left-1/2 top-0 flex h-2 w-20 -translate-x-1/2 items-start justify-center",
          <div class="pointer-events-none h-[1.5px] w-10 rounded-full bg-white/70 opacity-0 transition-opacity group-hover:opacity-90" />,
        )}
        {resizeGrip(
          "s",
          "bottom-0 left-1/2 flex h-3 w-20 -translate-x-1/2 items-end justify-center pb-[1px]",
          <div class="pointer-events-none h-[1.5px] w-10 rounded-full bg-white/70 opacity-0 transition-opacity group-hover:opacity-90" />,
        )}
        {resizeGrip(
          "w",
          "left-0 top-[40%] flex h-16 w-2.5 items-center justify-start pl-[1px]",
          <div class="pointer-events-none h-10 w-[1.5px] rounded-full bg-white/70 opacity-0 transition-opacity group-hover:opacity-90" />,
        )}
        {resizeGrip(
          "e",
          "right-0 top-1/2 flex h-20 w-3 -translate-y-1/2 items-center justify-end pr-[1px]",
          <div class="pointer-events-none h-10 w-[1.5px] rounded-full bg-white/70 opacity-0 transition-opacity group-hover:opacity-90" />,
        )}
      </Show>
    </div>
  );
}
