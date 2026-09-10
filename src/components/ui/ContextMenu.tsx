import { For, Show, createEffect, onCleanup } from "solid-js";

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
        class="fixed z-[1100] min-w-[180px] origin-top-left animate-[ctx_120ms_ease-out] overflow-hidden rounded-xl p-[1px]"
        style={{
          left: `${props.x}px`,
          top: `${props.y}px`,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.08))",
          "box-shadow": "0 16px 40px rgba(0,0,0,0.45)",
        }}
      >
        <ul
          class="m-0 list-none rounded-[11px] p-1.5 text-sm text-white"
          style={{
            background: "rgba(24,24,27,0.78)",
            "backdrop-filter": "blur(16px) saturate(1.35)",
            "-webkit-backdrop-filter": "blur(16px) saturate(1.35)",
          }}
        >
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
      </div>
    </Show>
  );
}
