import {
  JSX,
  Show,
  onMount,
  createEffect,
  onCleanup,
  createSignal,
} from "solid-js";
import LiquidGlass from "~/components/ui/LiquidGlass";
import { clampWindow, MIN_W, MIN_H } from "~/lib/desktopBounds";

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

/** Lightweight CSS glass rim used while dragging/resizing (no SVG displacement). */
function StaticGlassFrame(props: {
  active?: boolean;
  children: JSX.Element;
}) {
  return (
    <div
      class="h-full w-full rounded-2xl p-[1.5px]"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,140,160,0.25) 30%, rgba(255,255,255,0.08) 50%, rgba(130,190,255,0.4) 100%)",
        "box-shadow": props.active
          ? "0 20px 50px rgba(0,0,0,0.4)"
          : "0 12px 32px rgba(0,0,0,0.3)",
      }}
    >
      <div class="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[14.5px] bg-zinc-950/95">
        {props.children}
      </div>
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
  const [transitionEnabled, setTransitionEnabled] = createSignal(true);
  const [showOverlay, setShowOverlay] = createSignal(false);
  const [isGrabbing, setIsGrabbing] = createSignal(false);
  /** Skip heavy LiquidGlass displacement while dragging/resizing/animating. */
  const [liteChrome, setLiteChrome] = createSignal(false);
  /** Replace live app content with a static bitmap during animations. */
  const [snapshotUrl, setSnapshotUrl] = createSignal<string | null>(null);
  const [freezeLive, setFreezeLive] = createSignal(false);

  function interactionKey() {
    return props.id ?? props.title;
  }

  function beginInteraction() {
    setLiteChrome(true);
    props.setInteractingWindowId?.(interactionKey());
    props.setIsInteracting?.(true);
    document.body.style.overflow = "hidden";
  }

  function endInteraction() {
    setLiteChrome(false);
    props.setInteractingWindowId?.(null);
    props.setIsInteracting?.(false);
    document.body.style.overflow = "";
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

  async function captureSnapshot() {
    if (!contentRef) return null;
    try {
      const { toJpeg } = await import("html-to-image");
      // Lower pixelRatio keeps minimize snappy with 4 windows open
      return await toJpeg(contentRef, {
        quality: 0.72,
        pixelRatio: 0.6,
        cacheBust: false,
        skipFonts: true,
        filter: (node) => {
          // Skip cross-origin iframes (they taint / stall capture)
          if (node instanceof HTMLIFrameElement) return false;
          return true;
        },
      });
    } catch {
      return null;
    }
  }

  async function freezeForAnimation() {
    setLiteChrome(true);
    if (!snapshotUrl()) {
      const url = await captureSnapshot();
      if (url) setSnapshotUrl(url);
    }
    setFreezeLive(true);
  }

  async function handleMinimize(e: MouseEvent) {
    e.stopPropagation();
    await freezeForAnimation();
    props.onMinimize?.();
  }

  async function handleClose(e: MouseEvent) {
    e.stopPropagation();
    await freezeForAnimation();
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

  // After restore from dock, remount live content once animation settles
  createEffect(() => {
    if (props.restoreFrom) {
      setFreezeLive(true);
      setLiteChrome(true);
    }
  });

  createEffect(() => {
    if (props.status === "open" && !props.minimized && !props.restoreFrom) {
      // Delay remount so restore scale-in can finish on the snapshot
      const t = window.setTimeout(() => {
        setFreezeLive(false);
        setLiteChrome(false);
      }, 320);
      onCleanup(() => clearTimeout(t));
    }
  });

  onMount(() => {
    if (!contentRef) return;
    let timeout: number | undefined;
    const handler = (e: TransitionEvent) => {
      if (
        e.propertyName === "transform" &&
        (props.status === "closing" || props.status === "minimizing")
      ) {
        if (timeout) clearTimeout(timeout);
        props.onAnimationEnd?.();
      }
    };
    contentRef.addEventListener("transitionend", handler);
    if (props.status === "closing" || props.status === "minimizing") {
      timeout = window.setTimeout(() => {
        props.onAnimationEnd?.();
      }, 300);
    }
    onCleanup(() => {
      contentRef?.removeEventListener("transitionend", handler);
      if (timeout) clearTimeout(timeout);
    });
  });

  onMount(() => {
    if (props.restoreFrom) {
      setTransitionEnabled(false);
      const winCenterX = props.x + props.width / 2;
      const winCenterY = props.y + props.height / 2;
      const dx = props.restoreFrom.x - winCenterX;
      const dy = props.restoreFrom.y - winCenterY;
      setTransform(`translate(${dx}px, ${dy}px) scale(0.1)`);
      requestAnimationFrame(() => {
        if (contentRef) contentRef.offsetWidth;
        setTransitionEnabled(true);
        setTransform("scale(1)");
      });
    }
  });

  createEffect(() => {
    if (props.status === "minimizing" && props.minimizeTarget) {
      setLiteChrome(true);
      setFreezeLive(true);
      setTransform("scale(1)");
      setTransitionEnabled(true);
      requestAnimationFrame(() => {
        const winCenterX = props.x + props.width / 2;
        const winCenterY = props.y + props.height / 2;
        const dx = props.minimizeTarget!.x - winCenterX;
        const dy = props.minimizeTarget!.y - winCenterY - 20;
        setTransform(`translate(${dx}px, ${dy}px) scale(0.01)`);
      });
    } else if (props.status === "closing") {
      setLiteChrome(true);
      setFreezeLive(true);
      setTransitionEnabled(true);
      if (contentRef) contentRef.offsetWidth;
      setTransform("scale(0.01)");
    } else if (!props.restoreFrom && props.status === "open") {
      setTransitionEnabled(true);
      setTransform("scale(1.01)");
      setTimeout(() => setTransform("scale(1)"), 100);
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
    let newX = startPos.x;
    let newY = startPos.y;
    let newWidth = startSize.width;
    let newHeight = startSize.height;

    if (handle.includes("w")) {
      newX = startPos.x + dx;
      newWidth = Math.max(MIN_W, startSize.width - dx);
    } else if (handle.includes("e")) {
      newWidth = Math.max(MIN_W, startSize.width + dx);
    }

    if (handle.includes("n")) {
      newY = startPos.y + dy;
      newHeight = Math.max(MIN_H, startSize.height - dy);
    } else if (handle.includes("s")) {
      newHeight = Math.max(MIN_H, startSize.height + dy);
    }

    if (handle.includes("w") && newWidth === MIN_W) {
      newX = startPos.x + startSize.width - MIN_W;
    }
    if (handle.includes("n") && newHeight === MIN_H) {
      newY = startPos.y + startSize.height - MIN_H;
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
        class={`absolute z-[100] group ${className}`}
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
        class="pointer-events-none absolute inset-0 z-[5] rounded-[14.5px]"
        style={{
          padding: "1px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,140,160,0.35) 22%, rgba(255,255,255,0.08) 45%, rgba(130,190,255,0.55) 78%, rgba(255,255,255,0.65) 100%)",
          "-webkit-mask":
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          "-webkit-mask-composite": "xor",
          "mask-composite": "exclude",
          opacity: props.isActive ? "0.95" : "0.55",
        }}
      />

      <div
        class={`relative z-[110] flex shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.06] px-3 py-2.5 backdrop-blur-[2px] sm:py-2 ${
          isGrabbing() ? "cursor-grabbing" : "cursor-grab"
        }`}
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
            <Show
              when={snapshotUrl()}
              fallback={
                <div class="flex h-full items-center justify-center bg-zinc-900 text-sm text-white/40">
                  {props.title}
                </div>
              }
            >
              {(url) => (
                <img
                  src={url()}
                  alt=""
                  class="h-full w-full object-cover object-top"
                  draggable={false}
                />
              )}
            </Show>
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
      class={`fixed select-none ${
        transitionEnabled()
          ? "transition-transform duration-300 [transition-timing-function:cubic-bezier(0.4,0.8,0.2,1.1)]"
          : ""
      } ${
        props.isActive
          ? "shadow-2xl shadow-black/45"
          : "shadow-lg shadow-black/30"
      }`}
      style={{
        left: `${props.x}px`,
        top: `${props.y}px`,
        width: `${props.width}px`,
        height: `${props.height}px`,
        "z-index": props.zIndex ?? 50,
        transform: transform(),
        "will-change": dragging || resizing ? "left, top, width, height" : "transform",
        display:
          props.isOpen === false
            ? "none"
            : props.minimized && props.status === "open"
              ? "none"
              : undefined,
      }}
      onMouseDown={handleContainerMouseDown}
    >
      <Show
        when={!liteChrome()}
        fallback={
          <StaticGlassFrame active={props.isActive}>{chromeInner}</StaticGlassFrame>
        }
      >
        <LiquidGlass
          class="h-full w-full p-[1.5px]"
          radius={WINDOW_RADIUS}
          tint="transparent"
          blur={0}
          depth={12}
          strength={110}
          chromaticAberration={3}
        >
          <div
            class="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[14.5px] bg-zinc-950/95"
            style={{
              "box-shadow":
                "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 0 0 0.5px rgba(255,255,255,0.18)",
            }}
          >
            {chromeInner}
          </div>
        </LiquidGlass>
      </Show>

      {showOverlay() && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            background: "transparent",
            "z-index": 9999,
            "pointer-events": "all",
            cursor: resizing
              ? "nwse-resize"
              : dragging
                ? "grabbing"
                : "default",
          }}
        />
      )}

      {/* Corner hit targets: outer tip only — must not cover traffic lights */}
      {resizeGrip(
        "nw",
        "left-0 top-0 z-[90] h-3 w-3",
        <CornerCurve corner="nw" />,
      )}
      {resizeGrip(
        "ne",
        "right-0 top-0 z-[90] h-3 w-3",
        <CornerCurve corner="ne" />,
      )}
      {resizeGrip(
        "sw",
        "bottom-0 left-0 z-[90] h-3.5 w-3.5",
        <CornerCurve corner="sw" />,
      )}
      {resizeGrip(
        "se",
        "bottom-0 right-0 z-[90] h-3.5 w-3.5",
        <CornerCurve corner="se" />,
      )}
      {resizeGrip(
        "n",
        "left-1/2 top-0 z-[90] flex h-2 w-20 -translate-x-1/2 items-start justify-center",
        <div class="pointer-events-none h-[1.5px] w-10 rounded-full bg-white/70 opacity-0 transition-opacity group-hover:opacity-90" />,
      )}
      {resizeGrip(
        "s",
        "bottom-0 left-1/2 z-[90] flex h-3 w-20 -translate-x-1/2 items-end justify-center pb-[1px]",
        <div class="pointer-events-none h-[1.5px] w-10 rounded-full bg-white/70 opacity-0 transition-opacity group-hover:opacity-90" />,
      )}
      {resizeGrip(
        "w",
        "left-0 top-1/2 z-[90] flex h-20 w-3 -translate-y-1/2 items-center justify-start pl-[1px]",
        <div class="pointer-events-none h-10 w-[1.5px] rounded-full bg-white/70 opacity-0 transition-opacity group-hover:opacity-90" />,
      )}
      {resizeGrip(
        "e",
        "right-0 top-1/2 z-[90] flex h-20 w-3 -translate-y-1/2 items-center justify-end pr-[1px]",
        <div class="pointer-events-none h-10 w-[1.5px] rounded-full bg-white/70 opacity-0 transition-opacity group-hover:opacity-90" />,
      )}
    </div>
  );
}
