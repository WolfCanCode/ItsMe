import { JSX } from "solid-js";

export default function AppIcon(props: {
  src: string;
  alt: string;
  size?: number; // px
}) {
  return (
    <img
      src={props.src}
      alt={props.alt}
      width={props.size ?? 40}
      height={props.size ?? 40}
      class="object-contain bg-white rounded-lg shadow border border-gray-200 transition-transform duration-150 hover:scale-110"
      style={{ "pointer-events": "auto" }}
      loading="lazy"
      draggable={false}
      onError={(e) =>
        ((e.currentTarget as HTMLImageElement).style.opacity = "0.3")
      }
    />
  );
}
