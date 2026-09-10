export const MENU_HEIGHT = 40;
export const DOCK_CLEARANCE = 96;
export const MIN_W = 280;
export const MIN_H = 180;

export function usableBounds(vw = window.innerWidth, vh = window.innerHeight) {
  return {
    minX: 0,
    minY: MENU_HEIGHT,
    maxX: vw,
    maxY: vh - DOCK_CLEARANCE,
  };
}

export function clampWindow(
  x: number,
  y: number,
  width: number,
  height: number,
  vw = window.innerWidth,
  vh = window.innerHeight,
) {
  const b = usableBounds(vw, vh);
  const w = Math.min(Math.max(width, MIN_W), b.maxX - b.minX);
  const h = Math.min(Math.max(height, MIN_H), b.maxY - b.minY);
  const nx = Math.min(Math.max(x, b.minX), b.maxX - w);
  const ny = Math.min(Math.max(y, b.minY), b.maxY - h);
  return { x: nx, y: ny, width: w, height: h };
}

export function maximizedRect(vw = window.innerWidth, vh = window.innerHeight) {
  const b = usableBounds(vw, vh);
  return {
    x: b.minX,
    y: b.minY,
    width: b.maxX - b.minX,
    height: b.maxY - b.minY,
  };
}
