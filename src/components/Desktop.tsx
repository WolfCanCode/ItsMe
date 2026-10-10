import { JSX, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import MenuBar from "./MenuBar";
import { isCompactLayout } from "~/lib/desktopBounds";
import { WALLPAPERS, WallpaperId } from "~/lib/wallpapers";

function preferMobileWallpaper() {
  if (typeof window === "undefined") return false;
  if (isCompactLayout()) return true;
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

export default function Desktop(props: {
  children?: JSX.Element;
  wallpaperId: WallpaperId;
  onContextMenu?: (x: number, y: number) => void;
}) {
  const [compact, setCompact] = createSignal(false);
  onMount(() => {
    const sync = () => setCompact(preferMobileWallpaper());
    sync();
    window.addEventListener("resize", sync);
    onCleanup(() => window.removeEventListener("resize", sync));
  });

  const wallpaper = createMemo(
    () =>
      WALLPAPERS.find((w) => w.id === props.wallpaperId) ?? WALLPAPERS[0]!,
  );

  const bg = createMemo(() => {
    const w = wallpaper();
    return compact() ? w.mobileSrc : w.src;
  });

  return (
    <div
      class="relative h-dvh w-screen select-none overflow-hidden"
      style={{
        "background-image": `url('${bg()}')`,
        "background-size": "cover",
        "background-position": "center",
        "padding-top":
          "calc(var(--menu-height) + env(safe-area-inset-top, 0px))",
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
