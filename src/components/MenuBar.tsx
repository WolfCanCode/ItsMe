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
      <span class="font-bold text-xl mr-8"></span>
      <span class="ml-auto font-mono text-gray-700 mr-4">{time()}</span>
    </div>
  );
}
