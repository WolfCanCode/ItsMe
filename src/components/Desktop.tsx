import { JSX, createMemo, createSignal, onMount } from "solid-js";
import MenuBar from "./MenuBar";
import { WALLPAPERS, WallpaperId } from "~/lib/wallpapers";

function detectMobile() {
  if (typeof window === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export default function Desktop(props: {
  children?: JSX.Element;
  wallpaperId: WallpaperId;
  onContextMenu?: (x: number, y: number) => void;
}) {
  const [mobile, setMobile] = createSignal(false);
  onMount(() => setMobile(detectMobile()));

  const wallpaper = createMemo(
    () =>
      WALLPAPERS.find((w) => w.id === props.wallpaperId) ?? WALLPAPERS[0]!
  );

  const bg = createMemo(() => {
    const w = wallpaper();
    return mobile() ? w.mobileSrc : w.src;
  });

  return (
    <div
      class="relative w-screen h-screen overflow-hidden pt-10 select-none"
      style={{
        "background-image": `url('${bg()}')`,
        "background-size": "cover",
        "background-position": "center",
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        props.onContextMenu?.(e.clientX, e.clientY);
      }}
    >
      <MenuBar />
      {props.children}
    </div>
  );
}
