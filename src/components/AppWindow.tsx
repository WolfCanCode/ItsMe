import { JSX, createSignal, Show } from "solid-js";

export interface AppWindowProps {
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isActive: boolean;
  minimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  children: JSX.Element;
}

export default function AppWindow(props: AppWindowProps) {
  const [overlay, setOverlay] = createSignal(false);
  let resizing = false;
  let dragOffset = { x: 0, y: 0 };

  function onBarMouseDown(e: MouseEvent) {
    setOverlay(true);
    dragOffset = { x: e.clientX - props.x, y: e.clientY - props.y };
    function onMove(ev: MouseEvent) {
      props.onFocus();
      props.onMove(ev.clientX - dragOffset.x, ev.clientY - dragOffset.y);
    }
    function onUp() {
      setOverlay(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function onResizeMouseDown(e: MouseEvent) {
    setOverlay(true);
    e.stopPropagation();
    resizing = true;
    const start = {
      x: e.clientX,
      y: e.clientY,
      width: props.width,
      height: props.height,
    };
    function onMove(ev: MouseEvent) {
      props.onResize(
        Math.max(250, start.width + (ev.clientX - start.x)),
        Math.max(150, start.height + (ev.clientY - start.y))
      );
    }
    function onUp() {
      setOverlay(false);
      resizing = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <Show when={!props.minimized}>
      <div
        class="fixed bg-white rounded-xl shadow-2xl"
        style={{
          left: `${props.x}px`,
          top: `${props.y}px`,
          width: `${props.width}px`,
          height: `${props.height}px`,
          "z-index": props.zIndex,
          overflow: "hidden",
        }}
        onMouseDown={props.onFocus}
      >
        <div
          class="flex items-center bg-gradient-to-r from-[#e2e8f0] to-[#f8fafc] rounded-t-xl px-4 py-2 border-b border-gray-200 shadow-sm cursor-grab"
          onMouseDown={onBarMouseDown}
        >
          <span
            class="inline-block w-3 h-3 bg-[#ff5f56] rounded-full mr-2 border border-[#e33e41] cursor-pointer"
            onClick={props.onClose}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <span
            class="inline-block w-3 h-3 bg-[#ffbd2e] rounded-full mr-2 border border-[#e1a116] cursor-pointer"
            onClick={props.onMinimize}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <span
            class="ml-1 text-base font-bold text-gray-800 truncate"
            style="max-width: 260px;"
          >
            {props.title}
          </span>
        </div>
        {overlay() && (
          <div
            class="absolute left-0 top-0 w-full h-full"
            style={{
              cursor: resizing ? "nwse-resize" : "move",
              "z-index": 2000,
              background: "transparent",
            }}
          />
        )}
        <div class="h-full overflow-auto">{props.children}</div>
        <div
          class="absolute right-1 bottom-1 w-4 h-4 cursor-nwse-resize flex items-end justify-end"
          onMouseDown={onResizeMouseDown}
          style={{ "z-index": 100 }}
        >
          <div class="w-3 h-3 bg-gray-300 rounded-sm border border-gray-400 opacity-70" />
        </div>
      </div>
    </Show>
  );
}
