import { For, Show, createEffect, onCleanup } from "solid-js";
import LiquidGlass from "./LiquidGlass";

export type ContextMenuItem = {
  id: string;
  label: string;
  disabled?: boolean;
  danger?: boolean;
};

export default function ContextMenu(props: {
  open: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  createEffect(() => {
    if (!props.open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-context-menu]")) props.onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    onCleanup(() => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    });
  });

  return (
    <Show when={props.open}>
      <div
        data-context-menu
        class="fixed z-[1100] min-w-[180px] origin-top-left animate-[ctx_120ms_ease-out]"
        style={{ left: `${props.x}px`, top: `${props.y}px` }}
      >
        <LiquidGlass class="p-1.5" radius={14} tint="black" blur={0}>
          <ul class="m-0 list-none p-0 text-sm text-white">
            <For each={props.items}>
              {(item) => (
                <li>
                  <button
                    type="button"
                    disabled={item.disabled}
                    class={`w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/10 disabled:opacity-40 ${
                      item.danger ? "text-red-300" : ""
                    }`}
                    onClick={() => {
                      if (item.disabled) return;
                      props.onSelect(item.id);
                      props.onClose();
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              )}
            </For>
          </ul>
        </LiquidGlass>
      </div>
    </Show>
  );
}
