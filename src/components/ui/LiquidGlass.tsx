import {
  JSX,
  createEffect,
  onCleanup,
  onMount,
  splitProps,
} from "solid-js";
import { getDisplacementFilter } from "~/lib/liquid-glass/displacement";
import { supportsBackdropFilterUrl } from "~/lib/liquid-glass/supports";

type Props = {
  class?: string;
  depth?: number;
  strength?: number;
  chromaticAberration?: number;
  blur?: number;
  radius?: number;
  tint?: "black" | "white" | "transparent";
  /** When false, skip expensive backdrop-filter (keep DOM mounted). */
  enabled?: boolean;
  children?: JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>;

export default function LiquidGlass(props: Props) {
  const [local, rest] = splitProps(props, [
    "class",
    "depth",
    "strength",
    "chromaticAberration",
    "blur",
    "radius",
    "tint",
    "enabled",
    "children",
  ]);
  const [divProps, restAttrs] = splitProps(rest, ["style"]);
  let root!: HTMLDivElement;
  let filterEl!: HTMLDivElement;
  const supported =
    typeof document !== "undefined" && supportsBackdropFilterUrl();
  let lastKey = "";

  function redraw() {
    if (!root || !filterEl) return;
    const enabled = local.enabled !== false;
    if (!enabled) {
      filterEl.style.backdropFilter = "none";
      (
        filterEl.style as CSSStyleDeclaration & {
          webkitBackdropFilter?: string;
        }
      ).webkitBackdropFilter = "none";
      lastKey = "";
      return;
    }

    const rect = root.getBoundingClientRect();
    // Ignore transient zero/fullscreen glitches during mount or layout thrash
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (width < 8 || height < 8) return;
    if (width > window.innerWidth + 32 || height > window.innerHeight + 32) {
      return;
    }

    const depth = Math.max(
      0,
      Math.min(
        local.depth ?? 10,
        Math.floor(Math.min(width, height) / 2) - 1,
      ),
    );
    const strength = local.strength ?? 100;
    const chromaticAberration = local.chromaticAberration ?? 2;
    const blur = local.blur ?? 0;
    const radius = local.radius ?? 16;
    const key = `${width}x${height}:${depth}:${strength}:${chromaticAberration}:${blur}:${radius}`;
    if (key === lastKey) return;
    lastKey = key;

    // Fill the inset parent — never set explicit px that can desync from layout
    filterEl.style.width = "100%";
    filterEl.style.height = "100%";
    if (supported) {
      filterEl.style.backdropFilter = `blur(${blur / 2}px) url('${getDisplacementFilter(
        { height, width, radius, depth, strength, chromaticAberration },
      )}') blur(${blur}px) brightness(1.1) saturate(1.5)`;
      (
        filterEl.style as CSSStyleDeclaration & {
          webkitBackdropFilter?: string;
        }
      ).webkitBackdropFilter = filterEl.style.backdropFilter;
    } else {
      filterEl.style.backdropFilter = `blur(${Math.max(12, width / 40)}px) saturate(180%)`;
      (
        filterEl.style as CSSStyleDeclaration & {
          webkitBackdropFilter?: string;
        }
      ).webkitBackdropFilter = filterEl.style.backdropFilter;
    }
  }

  onMount(() => {
    redraw();
    let timer: number | undefined;
    const ro = new ResizeObserver(() => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = window.setTimeout(redraw, 48);
    });
    ro.observe(root);
    onCleanup(() => {
      ro.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
    });
  });

  createEffect(() => {
    local.depth;
    local.strength;
    local.chromaticAberration;
    local.blur;
    local.radius;
    local.tint;
    local.enabled;
    lastKey = "";
    redraw();
  });

  const tintBg =
    local.tint === "white"
      ? "rgba(250,250,250,0.5)"
      : local.tint === "black"
        ? "rgba(9,9,11,0.45)"
        : "rgba(9,9,11,0.18)";

  return (
    <div
      {...restAttrs}
      ref={root}
      class={`liquid-glass relative overflow-hidden ${local.class ?? ""}`}
      style={{
        ...(typeof divProps.style === "object" && divProps.style !== null
          ? divProps.style
          : {}),
        "border-radius": `${local.radius ?? 16}px`,
      }}
    >
      <div
        class="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: tintBg,
          "box-shadow": "inset 0 0 4px 0 rgba(250,250,250,0.5)",
        }}
      />
      <div class="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
        <div
          ref={filterEl}
          class="glass-filter-layer absolute inset-0 m-0"
          style={{ "will-change": "auto" }}
        />
      </div>
      <div class="relative z-[3] h-full min-h-0">{local.children}</div>
    </div>
  );
}
