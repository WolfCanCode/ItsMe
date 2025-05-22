import { JSX, onMount, createEffect, onCleanup, createSignal } from "solid-js";

type WindowStatus = "open" | "minimizing" | "closing";

export default function Window(props: {
  title: string;
  onClose: () => void;
  onClick?: () => void;
  onMinimize?: () => void;
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

  // For transform animation
  const [transform, setTransform] = createSignal("scale(1)");
  const [transitionEnabled, setTransitionEnabled] = createSignal(true);
  const [showOverlay, setShowOverlay] = createSignal(false);

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
    // Fallback: call onAnimationEnd after 300ms if transitionend doesn't fire
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
      // Start at dock icon
      const winCenterX = props.x + props.width / 2;
      const winCenterY = props.y + props.height / 2;
      const dx = props.restoreFrom.x - winCenterX;
      const dy = props.restoreFrom.y - winCenterY;
      setTransform(`translate(${dx}px, ${dy}px) scale(0.1)`);
      requestAnimationFrame(() => {
        if (contentRef) contentRef.offsetWidth; // force reflow
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
      if (contentRef) contentRef.offsetWidth; // force reflow
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
    // Dragging and resizing event listeners
    function handleMouseMove(e: MouseEvent) {
      onMouseMove(e);
    }
    function handleMouseUp(e: MouseEvent) {
      onMouseUp();
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    onCleanup(() => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    });
  });

  function onMouseDown(e: MouseEvent) {
    // Always bring to front and set active
    if (props.onClick) props.onClick();
    setShowOverlay(true);
    dragging = true;
    offset = {
      x: e.clientX,
      y: e.clientY,
    };
    startPos = { x: props.x, y: props.y };
    // Set global interaction state
    props.setInteractingWindowId?.(props.title);
    props.setIsInteracting?.(true);
    // Prevent iOS overflow scroll
    document.body.style.overflow = "hidden";
  }

  // Touch support for dragging
  function onTouchStart(e: TouchEvent) {
    if (props.onClick) props.onClick();
    setShowOverlay(true);
    dragging = true;
    const touch = e.touches[0];
    offset = {
      x: touch.clientX,
      y: touch.clientY,
    };
    startPos = { x: props.x, y: props.y };
    // Set global interaction state
    props.setInteractingWindowId?.(props.title);
    props.setIsInteracting?.(true);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    // Prevent iOS overflow scroll
    document.body.style.overflow = "hidden";
  }
  function onTouchMove(e: TouchEvent) {
    if (!dragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const newX = startPos.x + (touch.clientX - offset.x);
    const newY = startPos.y + (touch.clientY - offset.y);
    props.onMove(newX, newY);
  }
  function onTouchEnd() {
    dragging = false;
    setShowOverlay(false);
    // Clear global interaction state
    props.setInteractingWindowId?.(null);
    props.setIsInteracting?.(false);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    // Restore overflow scroll
    document.body.style.overflow = "";
  }

  function onMouseMove(e: MouseEvent) {
    if (dragging) {
      const newX = startPos.x + (e.clientX - offset.x);
      const newY = startPos.y + (e.clientY - offset.y);
      props.onMove(newX, newY);
    } else if (resizing) {
      const newWidth = Math.max(250, startSize.width + (e.clientX - offset.x));
      const newHeight = Math.max(
        150,
        startSize.height + (e.clientY - offset.y)
      );
      props.onResize(newWidth, newHeight);
    }
  }

  function onMouseUp() {
    dragging = false;
    if (resizing) {
      resizing = false;
    }
    setShowOverlay(false);
    // Clear global interaction state
    props.setInteractingWindowId?.(null);
    props.setIsInteracting?.(false);
    // Restore overflow scroll
    document.body.style.overflow = "";
  }

  function handleContainerMouseDown(e: MouseEvent) {
    if (!dragging && props.onClick) props.onClick();
  }

  function onResizeMouseDown(
    e: MouseEvent,
    corner: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  ) {
    e.stopPropagation();
    setShowOverlay(true);
    resizing = true;
    offset = { x: e.clientX, y: e.clientY };
    startSize = { width: props.width, height: props.height };
    startPos = { x: props.x, y: props.y };
    // Set global interaction state for resizing
    props.setInteractingWindowId?.(props.title);
    props.setIsInteracting?.(true);
    function onMove(ev: MouseEvent) {
      let newX = startPos.x;
      let newY = startPos.y;
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      const dx = ev.clientX - offset.x;
      const dy = ev.clientY - offset.y;
      if (corner === "top-left") {
        newX = startPos.x + dx;
        newY = startPos.y + dy;
        newWidth = Math.max(250, startSize.width - dx);
        newHeight = Math.max(150, startSize.height - dy);
      } else if (corner === "top-right") {
        newY = startPos.y + dy;
        newWidth = Math.max(250, startSize.width + dx);
        newHeight = Math.max(150, startSize.height - dy);
      } else if (corner === "bottom-left") {
        newX = startPos.x + dx;
        newWidth = Math.max(250, startSize.width - dx);
        newHeight = Math.max(150, startSize.height + dy);
      } else if (corner === "bottom-right") {
        newWidth = Math.max(250, startSize.width + dx);
        newHeight = Math.max(150, startSize.height + dy);
      }
      // Clamp minimum size
      if (newWidth !== props.width || newHeight !== props.height) {
        props.onResize(newWidth, newHeight);
      }
      if (newX !== props.x || newY !== props.y) {
        props.onMove(newX, newY);
      }
    }
    function onUp() {
      resizing = false;
      setShowOverlay(false);
      // Clear global interaction state
      props.setInteractingWindowId?.(null);
      props.setIsInteracting?.(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // Touch support for resizing
  function onResizeTouchStart(
    e: TouchEvent,
    corner: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  ) {
    e.stopPropagation();
    setShowOverlay(true);
    resizing = true;
    const touch = e.touches[0];
    offset = { x: touch.clientX, y: touch.clientY };
    startSize = { width: props.width, height: props.height };
    startPos = { x: props.x, y: props.y };
    // Set global interaction state for resizing
    props.setInteractingWindowId?.(props.title);
    props.setIsInteracting?.(true);
    function onMove(ev: TouchEvent) {
      const t = ev.touches[0];
      let newX = startPos.x;
      let newY = startPos.y;
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      const dx = t.clientX - offset.x;
      const dy = t.clientY - offset.y;
      if (corner === "top-left") {
        newX = startPos.x + dx;
        newY = startPos.y + dy;
        newWidth = Math.max(250, startSize.width - dx);
        newHeight = Math.max(150, startSize.height - dy);
      } else if (corner === "top-right") {
        newY = startPos.y + dy;
        newWidth = Math.max(250, startSize.width + dx);
        newHeight = Math.max(150, startSize.height - dy);
      } else if (corner === "bottom-left") {
        newX = startPos.x + dx;
        newWidth = Math.max(250, startSize.width - dx);
        newHeight = Math.max(150, startSize.height + dy);
      } else if (corner === "bottom-right") {
        newWidth = Math.max(250, startSize.width + dx);
        newHeight = Math.max(150, startSize.height + dy);
      }
      if (newWidth !== props.width || newHeight !== props.height) {
        props.onResize(newWidth, newHeight);
      }
      if (newX !== props.x || newY !== props.y) {
        props.onMove(newX, newY);
      }
    }
    function onUp() {
      resizing = false;
      setShowOverlay(false);
      // Clear global interaction state
      props.setInteractingWindowId?.(null);
      props.setIsInteracting?.(false);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      // Restore overflow scroll
      document.body.style.overflow = "";
    }
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    // Prevent iOS overflow scroll
    document.body.style.overflow = "hidden";
  }

  return (
    <div
      ref={contentRef}
      class={`fixed bg-white rounded-xl select-none ${
        transitionEnabled()
          ? "transition-transform duration-300 [transition-timing-function:cubic-bezier(0.4,0.8,0.2,1.1)]"
          : ""
      } ${
        props.isActive
          ? "ring-1 ring-blue-400 shadow-2xl shadow-blue-200"
          : "shadow-lg"
      }`}
      style={{
        left: `${props.x}px`,
        top: `${props.y}px`,
        width: `${props.width}px`,
        height: `${props.height}px`,
        overflow: "hidden",
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
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={onTouchStart}
    >
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
            cursor: resizing ? "nwse-resize" : dragging ? "move" : "default",
          }}
        />
      )}
      <div
        class="flex items-center bg-gradient-to-r from-[#e2e8f0] to-[#f8fafc] rounded-t-xl px-4 py-2 cursor-grab border-b border-gray-200 shadow-sm"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <span
          class="inline-block w-3 h-3 bg-[#ff5f56] rounded-full mr-2 border border-[#e33e41] cursor-pointer transition-transform transition-shadow duration-150 hover:scale-125 hover:shadow-[0_0_6px_2px_rgba(255,95,86,0.5)]"
          onClick={props.onClose}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <span
          class="inline-block w-3 h-3 bg-[#ffbd2e] rounded-full mr-2 border border-[#e1a116] cursor-pointer transition-transform transition-shadow duration-150 hover:scale-125 hover:shadow-[0_0_6px_2px_rgba(255,189,46,0.5)]"
          onClick={props.onMinimize}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <span
          class="ml-1 text-sm font-medium text-gray-800 truncate"
          style="max-width: 260px;"
        >
          {props.title}
        </span>
      </div>
      <div class="h-full overflow-auto">{props.children}</div>
      {/* Four corner resize handles */}
      <div
        class="absolute left-0 top-0 w-6 h-6 flex items-start justify-start group"
        onMouseDown={(e) => onResizeMouseDown(e, "top-left")}
        onTouchStart={(e) => onResizeTouchStart(e, "top-left")}
        style={{ "z-index": 100, cursor: "nwse-resize" }}
      >
        {/* iPad-style pill handle for mobile */}
        <div class="w-3 h-2 rounded-full bg-blue-300 shadow-lg -rotate-45 sm:hidden mt-1 ml-1 hover:bg-blue-500 hover:scale-125 hover:shadow-[0_0_6px_2px_rgba(37,99,235,0.5)]"></div>
        <div class="w-3 h-3 rounded-sm border opacity-0 group-hover:opacity-100 bg-white/70"></div>
      </div>
      <div
        class="absolute right-0 top-0 w-6 h-6 flex items-start justify-end group"
        onMouseDown={(e) => onResizeMouseDown(e, "top-right")}
        onTouchStart={(e) => onResizeTouchStart(e, "top-right")}
        style={{ "z-index": 100, cursor: "nesw-resize" }}
      >
        {/* iPad-style pill handle for mobile */}
        <div class="w-3 h-3 rounded-sm border opacity-0 group-hover:opacity-100 bg-white/70"></div>
        <div class="w-3 h-2 rounded-full bg-blue-300 shadow-lg rotate-45 sm:hidden mt-1 mr-1 hover:bg-blue-500 hover:scale-125 hover:shadow-[0_0_6px_2px_rgba(37,99,235,0.5)]"></div>
      </div>
      <div
        class="absolute left-0 bottom-0 w-6 h-6 flex items-end justify-start group"
        onMouseDown={(e) => onResizeMouseDown(e, "bottom-left")}
        onTouchStart={(e) => onResizeTouchStart(e, "bottom-left")}
        style={{ "z-index": 100, cursor: "nesw-resize" }}
      >
        {/* iPad-style pill handle for mobile */}
        <div class="w-3 h-2 rounded-full bg-blue-300 shadow-lg rotate-45 sm:hidden mb-1 ml-1 hover:bg-blue-500 hover:scale-125 hover:shadow-[0_0_6px_2px_rgba(37,99,235,0.5)]"></div>
        <div class="w-3 h-3 rounded-sm border opacity-0 group-hover:opacity-100 bg-white/70"></div>
      </div>
      <div
        class="absolute right-0 bottom-0 w-6 h-6 flex items-end justify-end group"
        onMouseDown={(e) => onResizeMouseDown(e, "bottom-right")}
        onTouchStart={(e) => onResizeTouchStart(e, "bottom-right")}
        style={{ "z-index": 100, cursor: "nwse-resize" }}
      >
        {/* iPad-style pill handle for mobile */}
        <div class="w-3 h-3 rounded-sm border opacity-0 group-hover:opacity-100 bg-white/70"></div>
        <div class="w-3 h-2 rounded-full bg-blue-300 shadow-lg -rotate-45 sm:hidden mb-1 mr-1 hover:bg-blue-500 hover:scale-125 hover:shadow-[0_0_6px_2px_rgba(37,99,235,0.5)]"></div>
      </div>
      {/* Blocker overlay for all other windows when interacting - render as last child */}
    </div>
  );
}
