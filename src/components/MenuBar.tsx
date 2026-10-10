import { createSignal, onCleanup, onMount } from "solid-js";

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Lightweight frosted menubar — liquid glass stays on the Dock. */
export default function MenuBar() {
  const [time, setTime] = createSignal(getTime());

  let interval: number | undefined;
  onMount(() => {
    interval = window.setInterval(() => setTime(getTime()), 1000 * 60);
  });
  onCleanup(() => {
    if (interval) clearInterval(interval);
  });

  return (
    <div
      class="fixed top-0 left-0 z-[var(--z-menubar)] w-full"
      style={{
        "padding-top": "env(safe-area-inset-top, 0px)",
        height: "calc(var(--menu-height) + env(safe-area-inset-top, 0px))",
      }}
    >
      <div
        class="flex h-[var(--menu-height)] w-full items-center px-3 sm:px-4"
        style={{
          background: "rgba(24,24,27,0.55)",
          "backdrop-filter": "blur(16px) saturate(1.4)",
          "-webkit-backdrop-filter": "blur(16px) saturate(1.4)",
          "box-shadow":
            "inset 0 -0.5px 0 rgba(255,255,255,0.12), 0 1px 0 rgba(0,0,0,0.2)",
        }}
      >
        <div class="flex min-w-0 flex-row items-center gap-2 sm:gap-2.5">
          <img
            src="/images/tommy-circle.png"
            alt="Tommy"
            class="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/25 sm:h-7 sm:w-7"
          />
          <span
            class="my-auto truncate text-xs font-medium text-white/95 sm:text-sm"
            style={{ "font-family": "var(--font-display)" }}
          >
            Hi, I'm Tommy!
          </span>
        </div>
        <span class="my-auto ml-auto shrink-0 font-mono text-[11px] text-white/80 sm:mr-4 sm:text-xs">
          {time()}
        </span>
      </div>
    </div>
  );
}
