import { createSignal, onCleanup, onMount } from "solid-js";

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
    <div class="fixed top-0 left-0 w-full h-10 bg-white/20 backdrop-blur-md flex items-center px-4 z-[1000] shadow border-b border-white/30">
      <div class="flex flex-row gap-2">
        <div>
          <img src="/images/tommy.png" alt="Tommy" class="h-8 w-auto" />
        </div>
        <span class="text-sm font-mono text-gray-700 my-auto">
          Hi, I'm Tommy! 👋
        </span>
      </div>
      <span class="ml-auto text-xs font-mono text-gray-700 my-auto mr-4">
        {time()}
      </span>
    </div>
  );
}
