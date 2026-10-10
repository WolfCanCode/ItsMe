export const MENU_HEIGHT = 40;
export const MENU_HEIGHT_COMPACT = 36;
/** Desktop right-rail dock width (windows may sit under glass). */
export const DOCK_CLEARANCE_RIGHT = 88;
/** Compact bottom dock height including padding (windows stay clear). */
export const DOCK_CLEARANCE_BOTTOM = 72;
export const MIN_W = 280;
export const MIN_H = 180;
export const COMPACT_BREAKPOINT = 768;

/** Narrow / phone layout — dock goes bottom, windows keep clear of it. */
export function isCompactLayout(
  vw = typeof window !== "undefined" ? window.innerWidth : 1024,
) {
  return vw <= COMPACT_BREAKPOINT;
}

export function menuHeight(
  vw = typeof window !== "undefined" ? window.innerWidth : 1024,
) {
  return isCompactLayout(vw) ? MENU_HEIGHT_COMPACT : MENU_HEIGHT;
}

export function dockClearance(
  vw = typeof window !== "undefined" ? window.innerWidth : 1024,
) {
  return isCompactLayout(vw)
    ? { right: 0, bottom: DOCK_CLEARANCE_BOTTOM }
    : { right: DOCK_CLEARANCE_RIGHT, bottom: 0 };
}

export function usableBounds(vw = window.innerWidth, vh = window.innerHeight) {
  const dock = dockClearance(vw);
  return {
    minX: isCompactLayout(vw) ? 6 : 0,
    minY: menuHeight(vw),
    // Compact: leave room for bottom dock. Desktop: full width under glass.
    maxX: vw - dock.right - (isCompactLayout(vw) ? 6 : 0),
    maxY: vh - dock.bottom,
  };
}

export function minWindowSize(vw = window.innerWidth, vh = window.innerHeight) {
  const b = usableBounds(vw, vh);
  const availW = Math.max(160, b.maxX - b.minX);
  const availH = Math.max(140, b.maxY - b.minY);
  return {
    minW: Math.min(MIN_W, availW),
    minH: Math.min(MIN_H, availH),
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
  const { minW, minH } = minWindowSize(vw, vh);
  const w = Math.min(Math.max(width, minW), b.maxX - b.minX);
  const h = Math.min(Math.max(height, minH), b.maxY - b.minY);
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

/** Preferred open size: fill usable area on compact, project defaults on desktop. */
export function initialWindowRect(
  preferredWidth: number,
  preferredHeight: number,
  preferredX: number,
  preferredY: number,
  vw = window.innerWidth,
  vh = window.innerHeight,
) {
  if (isCompactLayout(vw)) {
    return maximizedRect(vw, vh);
  }
  return clampWindow(
    preferredX,
    preferredY,
    preferredWidth,
    preferredHeight,
    vw,
    vh,
  );
}
