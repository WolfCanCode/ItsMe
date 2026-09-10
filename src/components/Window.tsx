import { JSX, onMount, createEffect, onCleanup, createSignal } from "solid-js";
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
  let offset = { x: 0, y: 0 };
  let startPos = { x: 0, y: 0 };
  let startSize = { width: 400, height: 300 };
  let contentRef: HTMLDivElement | undefined;

  const [transform, setTransform] = createSignal("scale(1)");
  const [transitionEnabled, setTransitionEnabled] = createSignal(true);
  const [showOverlay, setShowOverlay] = createSignal(false);
  const [isGrabbing, setIsGrabbing] = createSignal(false);

  function interactionKey() {
    return props.id ?? props.title;
  }

  function beginInteraction() {
    props.setInteractingWindowId?.(interactionKey());
    props.setIsInteracting?.(true);
    document.body.style.overflow = "hidden";
  }

  function endInteraction() {
    props.setInteractingWindowId?.(null);
    props.setIsInteracting?.(false);
    document.body.style.overflow = "";
  }

  function applyMove(x: number, y: number) {
    const c = clampWindow(x, y, props.width, props.height);
    props.onMove(c.x, c.y);
  }

  function applyGeometry(x: number, y: number, width: number, height: number) {
    const c = clampWindow(x, y, width, height);
    props.onMove(c.x, c.y);
    props.onResize(c.width, c.height);
  }

  // Listen for transition end to call onAnimationEnd
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

  // Restore animation from dock
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

  // Set transform for open/close/minimize
  createEffect(() => {
    if (props.status === "minimizing" && props.minimizeTarget) {
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
      setTransitionEnabled(true);
      if (contentRef) contentRef.offsetWidth;
      setTransform("scale(0.01)");
    } else if (!props.restoreFrom) {
      setTransitionEnabled(true);
      setTransform("scale(1.01)");
      setTimeout(() => {
        setTransform("scale(1)");
      }, 100);
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
    offset = { x: e.clientX, y: e.clientY };
    startPos = { x: props.x, y: props.y };
    beginInteraction();
  }

  function onTitleTouchStart(e: TouchEvent) {
    if (props.onClick) props.onClick();
    setShowOverlay(true);
    setIsGrabbing(true);
    dragging = true;
    const touch = e.touches[0];
    offset = { x: touch.clientX, y: touch.clientY };
    startPos = { x: props.x, y: props.y };
    beginInteraction();
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
  }

  function onTouchMove(e: TouchEvent) {
    if (!dragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    applyMove(
      startPos.x + (touch.clientX - offset.x),
      startPos.y + (touch.clientY - offset.y),
    );
  }

  function onTouchEnd() {
    dragging = false;
    setIsGrabbing(false);
    setShowOverlay(false);
    endInteraction();
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
  }

  function onMouseMove(e: MouseEvent) {
    if (dragging) {
      applyMove(
        startPos.x + (e.clientX - offset.x),
        startPos.y + (e.clientY - offset.y),
      );
    }
  }

  function onMouseUp() {
    if (!dragging && !resizing) return;
    dragging = false;
    resizing = false;
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

    // When clamped by MIN_*, keep the anchored edge fixed
    if (handle.includes("w") && newWidth === MIN_W) {
      newX = startPos.x + startSize.width - MIN_W;
    }
    if (handle.includes("n") && newHeight === MIN_H) {
      newY = startPos.y + startSize.height - MIN_H;
    }

    applyGeometry(newX, newY, newWidth, newHeight);
  }

  function onResizeMouseDown(e: MouseEvent, handle: ResizeHandle) {
    e.stopPropagation();
    e.preventDefault();
    if (props.onClick) props.onClick();
    setShowOverlay(true);
    resizing = true;
    offset = { x: e.clientX, y: e.clientY };
    startSize = { width: props.width, height: props.height };
    startPos = { x: props.x, y: props.y };
    beginInteraction();

    function onMove(ev: MouseEvent) {
      resizeFromDelta(handle, ev.clientX - offset.x, ev.clientY - offset.y);
    }
    function onUp() {
      resizing = false;
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
    const touch = e.touches[0];
    offset = { x: touch.clientX, y: touch.clientY };
    startSize = { width: props.width, height: props.height };
    startPos = { x: props.x, y: props.y };
    beginInteraction();

    function onMove(ev: TouchEvent) {
      const t = ev.touches[0];
      resizeFromDelta(handle, t.clientX - offset.x, t.clientY - offset.y);
    }
    function onUp() {
      resizing = false;
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

  function resizeGrip(
    handle: ResizeHandle,
    className: string,
    visual?: JSX.Element,
  ) {
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

  const cornerVisual = (corner: "nw" | "ne" | "sw" | "se") => {
    const radius =
      corner === "nw"
        ? "rounded-tl-[10px] border-t border-l"
        : corner === "ne"
          ? "rounded-tr-[10px] border-t border-r"
          : corner === "sw"
            ? "rounded-bl-[10px] border-b border-l"
            : "rounded-br-[10px] border-b border-r";
    return (
      <div
        class={`pointer-events-none h-3 w-3 border-white/55 opacity-0 transition-opacity duration-150 group-hover:opacity-90 ${radius}`}
      />
    );
  };

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
        display:
          props.isOpen === false
            ? "none"
            : props.minimized && props.status === "open"
              ? "none"
              : undefined,
      }}
      onMouseDown={handleContainerMouseDown}
    >
      {/* Liquid-glass border frame — padding ring refracts wallpaper */}
      <LiquidGlass
        class="h-full w-full p-[1.5px]"
        radius={16}
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
          {/* Prismatic edge highlight */}
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
            class={`relative z-[6] flex shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.06] px-3 py-2.5 backdrop-blur-[2px] sm:py-2 ${
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
            <div class="flex shrink-0 items-center gap-2">
              <span
                class="inline-block h-3.5 w-3.5 cursor-pointer rounded-full border border-[#e33e41] bg-[#ff5f56] transition-transform duration-150 hover:scale-125 sm:h-3 sm:w-3"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onClose();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title="Close"
              />
              <span
                class="inline-block h-3.5 w-3.5 cursor-pointer rounded-full border border-[#e1a116] bg-[#ffbd2e] transition-transform duration-150 hover:scale-125 sm:h-3 sm:w-3"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onMinimize?.();
                }}
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

          <div class="relative z-[6] min-h-0 flex-1 overflow-hidden bg-zinc-950 text-zinc-100">
            {props.children}
          </div>
        </div>
      </LiquidGlass>

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

      {/* Hit targets — L-curve corners, thin edge bars; hidden until hover */}
      {resizeGrip(
        "nw",
        "left-0 top-0 flex h-5 w-5 items-start justify-start p-1",
        cornerVisual("nw"),
      )}
      {resizeGrip(
        "ne",
        "right-0 top-0 flex h-5 w-5 items-start justify-end p-1",
        cornerVisual("ne"),
      )}
      {resizeGrip(
        "sw",
        "bottom-0 left-0 flex h-5 w-5 items-end justify-start p-1",
        cornerVisual("sw"),
      )}
      {resizeGrip(
        "se",
        "bottom-0 right-0 flex h-5 w-5 items-end justify-end p-1",
        cornerVisual("se"),
      )}
      {resizeGrip(
        "n",
        "left-1/2 top-0 flex h-3 w-16 -translate-x-1/2 items-start justify-center pt-0.5",
        <div class="pointer-events-none h-0.5 w-8 rounded-full bg-white/50 opacity-0 transition-opacity group-hover:opacity-80" />,
      )}
      {resizeGrip(
        "s",
        "bottom-0 left-1/2 flex h-3 w-16 -translate-x-1/2 items-end justify-center pb-0.5",
        <div class="pointer-events-none h-0.5 w-8 rounded-full bg-white/50 opacity-0 transition-opacity group-hover:opacity-80" />,
      )}
      {resizeGrip(
        "w",
        "left-0 top-1/2 flex h-16 w-3 -translate-y-1/2 items-center justify-start pl-0.5",
        <div class="pointer-events-none h-8 w-0.5 rounded-full bg-white/50 opacity-0 transition-opacity group-hover:opacity-80" />,
      )}
      {resizeGrip(
        "e",
        "right-0 top-1/2 flex h-16 w-3 -translate-y-1/2 items-center justify-end pr-0.5",
        <div class="pointer-events-none h-8 w-0.5 rounded-full bg-white/50 opacity-0 transition-opacity group-hover:opacity-80" />,
      )}
    </div>
  );
}
