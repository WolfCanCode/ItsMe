export const WALLPAPERS = [
  { id: "classic", src: "/wallpapers/mywall.png", mobileSrc: "/wallpapers/mywall-mobile.jpg" },
  { id: "liquid-sharp", src: "/wallpapers/liquid-sharp.svg", mobileSrc: "/wallpapers/liquid-sharp.svg" },
] as const;

export type WallpaperId = (typeof WALLPAPERS)[number]["id"];

export function nextWallpaperId(current: WallpaperId): WallpaperId {
  const i = WALLPAPERS.findIndex((w) => w.id === current);
  return WALLPAPERS[(i + 1) % WALLPAPERS.length]!.id;
}
