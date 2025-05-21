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
        const dy = props.minimizeTarget!.y - winCenterY;
        setTransform(`translate(${dx}px, ${dy}px) scale(0.1)`);
      });
    } else if (props.status === "closing") {
      setTransitionEnabled(true);
      if (contentRef) contentRef.offsetWidth; // force reflow
      setTransform("scale(0.1)");
    } else if (!props.restoreFrom) {
      setTransitionEnabled(true);
      setTransform("scale(1)");
    }
  });

  function onMouseDown(e: MouseEvent) {
    dragging = true;
    offset = {
      x: e.clientX,
      y: e.clientY,
    };
    startPos = { x: props.x, y: props.y };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
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
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  function handleContainerMouseDown(e: MouseEvent) {
    if (!dragging && props.onClick) props.onClick();
  }

  function onResizeMouseDown(e: MouseEvent) {
    e.stopPropagation();
    resizing = true;
    offset = { x: e.clientX, y: e.clientY };
    startSize = { width: props.width, height: props.height };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
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
          ? "ring-2 ring-blue-400 shadow-2xl shadow-blue-200"
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
      }}
      onMouseDown={handleContainerMouseDown}
    >
      <div
        class="flex items-center bg-gradient-to-r from-[#e2e8f0] to-[#f8fafc] rounded-t-xl px-4 py-2 cursor-grab border-b border-gray-200 shadow-sm"
        onMouseDown={onMouseDown}
      >
        <span
          class="inline-block w-3 h-3 bg-[#ff5f56] rounded-full mr-2 border border-[#e33e41] cursor-pointer"
          onClick={props.onClose}
        />
        <span
          class="inline-block w-3 h-3 bg-[#ffbd2e] rounded-full mr-2 border border-[#e1a116] cursor-pointer"
          onClick={props.onMinimize}
        />
        <span
          class="ml-1 text-base font-bold text-gray-800 truncate"
          style="max-width: 260px;"
        >
          {props.title}
        </span>
      </div>
      <div class="h-full overflow-auto">{props.children}</div>
      <div
        class="absolute right-1 bottom-1 w-4 h-4 cursor-nwse-resize flex items-end justify-end"
        onMouseDown={onResizeMouseDown}
        style={{ "z-index": 100 }}
      >
        <div class="w-3 h-3 bg-gray-300 rounded-sm border border-gray-400 opacity-70" />
      </div>
    </div>
  );
}
