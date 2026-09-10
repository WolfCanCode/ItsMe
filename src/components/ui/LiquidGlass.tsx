import {
  JSX,
  createSignal,
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
    "children",
  ]);
  let root!: HTMLDivElement;
  let filterEl!: HTMLDivElement;
  const [supported] = createSignal(
    typeof document !== "undefined" && supportsBackdropFilterUrl(),
  );

  function redraw() {
    if (!root || !filterEl) return;
    const rect = root.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
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
    filterEl.style.width = `${width}px`;
    filterEl.style.height = `${height}px`;
    if (supported()) {
      filterEl.style.backdropFilter = `blur(${blur / 2}px) url('${getDisplacementFilter(
        { height, width, radius, depth, strength, chromaticAberration },
      )}') blur(${blur}px) brightness(1.1) saturate(1.5)`;
    } else {
      filterEl.style.backdropFilter = `blur(${Math.max(12, width / 40)}px) saturate(180%)`;
      (filterEl.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter =
        filterEl.style.backdropFilter;
    }
  }

  onMount(() => {
    redraw();
    const ro = new ResizeObserver(() => redraw());
    ro.observe(root);
    onCleanup(() => ro.disconnect());
  });

  const tintBg =
    local.tint === "white"
      ? "rgba(250,250,250,0.5)"
      : local.tint === "black"
        ? "rgba(9,9,11,0.45)"
        : "rgba(9,9,11,0.18)";

  return (
    <div
      {...rest}
      ref={root}
      class={`liquid-glass relative overflow-hidden ${local.class ?? ""}`}
      style={{ "border-radius": `${local.radius ?? 16}px` }}
    >
      <div
        class="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: tintBg,
          "box-shadow": "inset 0 0 4px 0 rgba(250,250,250,0.5)",
        }}
      />
      <div class="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
        <div ref={filterEl} class="glass-filter-layer m-0" />
      </div>
      <div class="relative z-[3]">{local.children}</div>
    </div>
  );
}
