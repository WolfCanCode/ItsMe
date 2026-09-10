import { createSignal, onCleanup, onMount } from "solid-js";
import LiquidGlass from "~/components/ui/LiquidGlass";

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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
      class="fixed top-0 left-0 w-full z-[var(--z-menubar)]"
      style={{ height: "var(--menu-height)" }}
    >
      <LiquidGlass
        class="h-full w-full"
        radius={0}
        tint="black"
        blur={2}
        depth={6}
        strength={70}
      >
        <div class="flex h-full w-full items-center px-4">
          <div class="flex flex-row gap-2">
            <div>
              <img src="/images/tommy.png" alt="Tommy" class="h-8 w-auto" />
            </div>
            <span
              class="my-auto text-sm font-medium text-white/95"
              style={{ "font-family": "var(--font-display)" }}
            >
              Hi, I'm Tommy!
            </span>
          </div>
          <span class="my-auto ml-auto mr-4 font-mono text-xs text-white/80">
            {time()}
          </span>
        </div>
      </LiquidGlass>
    </div>
  );
}
