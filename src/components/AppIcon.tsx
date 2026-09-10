import { JSX } from "solid-js";

export default function AppIcon(props: {
  src: string;
  alt: string;
  size?: number; // px
}) {
  const size = props.size ?? 40;
  return (
    <img
      src={props.src}
      alt={props.alt}
      width={size}
      height={size}
      class="rounded-lg object-contain bg-white/95 transition-transform duration-150 hover:scale-110"
      style={{
        "pointer-events": "auto",
        "box-shadow":
          "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.35), 0 4px 12px rgba(0,0,0,0.25)",
      }}
      loading="lazy"
      draggable={false}
      onError={(e) =>
        ((e.currentTarget as HTMLImageElement).style.opacity = "0.3")
      }
    />
  );
}
