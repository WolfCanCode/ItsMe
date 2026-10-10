import { For, JSX } from "solid-js";

type Tech = {
  name: string;
  color: string;
  icon: () => JSX.Element;
};

function IconShell(props: { children: JSX.Element; viewBox?: string }) {
  return (
    <svg
      class="h-3.5 w-3.5 shrink-0"
      viewBox={props.viewBox ?? "0 0 24 24"}
      fill="currentColor"
      aria-hidden="true"
    >
      {props.children}
    </svg>
  );
}

const TECH: Tech[] = [
  {
    name: "React",
    color: "#61DAFB",
    icon: () => (
      <IconShell>
        <circle cx="12" cy="12" r="2.2" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" fill="none" stroke="currentColor" stroke-width="1.6" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(120 12 12)" />
      </IconShell>
    ),
  },
  {
    name: "Vue",
    color: "#42B883",
    icon: () => (
      <IconShell>
        <path d="M2 3h4.5L12 13.5 17.5 3H22L12 21 2 3z" />
        <path d="M7.2 3h3.2L12 7.2 13.6 3h3.2L12 12 7.2 3z" opacity="0.55" />
      </IconShell>
    ),
  },
  {
    name: "Angular",
    color: "#DD0031",
    icon: () => (
      <IconShell>
        <path d="M12 2 2.5 5.5l1.5 13L12 22l8-3.5 1.5-13L12 2zm0 3.2 5.8 2.1-.5 4.4H12V5.2zm0 8.3h5l-.9 2.4L12 18.2v-4.7z" />
      </IconShell>
    ),
  },
  {
    name: "Solid",
    color: "#2C4F7C",
    icon: () => (
      <IconShell>
        <path d="M11.5 3.2c2.4-1.6 5.8-.8 7.4 1.7 1 1.6.9 3.5.1 5l-3.4 5.4c-.8 1.2-2.4 1.6-3.7 1-1.3-.6-1.9-2.1-1.4-3.4l1.2-3.1-5.1 1.5c-1.6.5-3.3-.4-3.8-2-.5-1.6.4-3.3 2-3.8l6.7-2.3z" />
        <path d="M5.2 14.1c1.1-1.7 3.4-2.2 5.2-1.1l4.6 2.8c1.7 1 2.3 3.3 1.2 5-.5.9-1.4 1.5-2.4 1.7l-5.5.9c-1.8.3-3.5-1-3.8-2.8-.2-.9.1-1.8.7-2.5l-.05-4z" opacity="0.75" />
      </IconShell>
    ),
  },
  {
    name: "Qwik",
    color: "#AC7EF4",
    icon: () => (
      <IconShell>
        <path d="M12 2 3 6.5v7.2L12 22l9-8.3V6.5L12 2zm1.2 5.2 3.4 5.4h-2.6l1.4 3.2-5.2-5.8h2.7L11.4 7.2h1.8z" />
      </IconShell>
    ),
  },
  {
    name: "Next",
    color: "#111111",
    icon: () => (
      <IconShell>
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.9 15.2h-1.7l-5-7.4v7.4H7.6V6.8h1.8l4.9 7.3V6.8h1.6v10.4z" />
      </IconShell>
    ),
  },
  {
    name: "GenAI",
    color: "#8B5CF6",
    icon: () => (
      <IconShell>
        <path d="M12 2.5 13.8 9H20l-5 3.6 1.9 6.4L12 15.8 7.1 19l1.9-6.4-5-3.6h6.2L12 2.5z" />
      </IconShell>
    ),
  },
  {
    name: "Rust",
    color: "#DEA584",
    icon: () => (
      <IconShell>
        <path d="M12 2.2 13.2 5h2.9l-.9 2.7 2.1 2-2.1 2 .9 2.7h-2.9L12 17.3 10.8 14.5H7.9l.9-2.7-2.1-2 2.1-2L7.9 5h2.9L12 2.2zm0 5.3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z" />
      </IconShell>
    ),
  },
  {
    name: "Python",
    color: "#3776AB",
    icon: () => (
      <IconShell>
        <path d="M12.1 2c-3.3 0-3.1 1.4-3.1 1.4v2.2h3.2v.7H6.3S3 6.1 3 10.4s1.4 4.2 1.4 4.2h2.3v-2c0-2.2 1.8-2.1 1.8-2.1h4.5s1.7.1 1.7-1.7V5.2S15.4 2 12.1 2zm-1.6 1.4a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4z" />
        <path d="M11.9 22c3.3 0 3.1-1.4 3.1-1.4v-2.2h-3.2v-.7h5.9s3.3.2 3.3-4.1-1.4-4.2-1.4-4.2h-2.3v2c0 2.2-1.8 2.1-1.8 2.1H11s-1.7-.1-1.7 1.7v4.5s.7 2.3 2.6 2.3zm1.6-1.4a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4z" opacity="0.85" />
      </IconShell>
    ),
  },
  {
    name: "Go",
    color: "#00ADD8",
    icon: () => (
      <IconShell viewBox="0 0 24 24">
        <path d="M4.2 10.2h1.5l.3-.8h1.2l.3.8h1.5l-1.7-4.2H5.9L4.2 10.2zm2.4-1.9.4-1.1.4 1.1H6.6zM11 6.2h4.2c1.6 0 2.6.8 2.6 2.1 0 1.4-1.1 2.2-2.7 2.2h-1.5v2.1H11V6.2zm2.2 1.5v1.4h1.2c.6 0 1-.3 1-.7s-.4-.7-1-.7h-1.2zM4.3 13.5H6c1.1 0 1.8.4 1.8 1.3 0 .6-.3 1-.8 1.2.6.2 1 .8 1 1.4 0 1.1-.8 1.6-2.1 1.6H4.3v-5.5zm1.7 2.1h.4c.4 0 .6-.2.6-.5s-.2-.5-.6-.5h-.4v1zm0 2.1h.5c.4 0 .7-.2.7-.6s-.3-.5-.7-.5h-.5v1.1zM10.2 13.5h1.7l1.1 3.5 1.1-3.5h1.7l-2.1 5.5h-1.5l-2-5.5zM17.2 13.5h4.1v1.4h-2.4v.8h2.2v1.3h-2.2v.8h2.5v1.4h-4.2v-5.7z" />
      </IconShell>
    ),
  },
  {
    name: "Java",
    color: "#ED8B00",
    icon: () => (
      <IconShell>
        <path d="M12.4 15.4c0 0-1.2.7 0 1.8 1.4 1.3 3.9 1 3.9 1s-1.4 1 2.1.3c4-1.1 2.2-4 2.2-4s-1.6 1.5-4.1 1.1c-1.7-.3-2.1-.9-4.1-1.2z" />
        <path d="M11.2 13.2s-1.4 1 .2 1.6c1.9.7 4.9.5 5.4.1.6-.5-.3-1-.3-1s.9.5-1.6.8c-2.2.5-4.5-.1-3.7-1.4z" />
        <path d="M14.2 9.4s2.2 1.5-1 3.8c-2.5 1.9-2.5.6-2.5.6s1.5.4 2.8-.5c2.2-1.4 1.3-3.1.7-3.9zM12.7 4s1.4 1.4-.4 3.5C10.5 9.5 11 10.3 11 10.3s-1.5-1.1-.2-2.7C12.3 5.6 12.7 4 12.7 4z" />
        <path d="M15.6 18.8s1.2.9-.9 1.5c-4 .9-8.5.1-8.6-.1-.1-.1.8.5 4.5.8 3.9.3 7.1-1 5-2.2z" />
      </IconShell>
    ),
  },
  {
    name: "Grafana",
    color: "#F46800",
    icon: () => (
      <IconShell>
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1.2 4.2c1.8.4 3.2 1.6 3.9 3.2.4 1 .4 2.1 0 3.1-.5 1.3-1.6 2.3-2.9 2.7l-.6-1.6c.8-.3 1.4-.9 1.7-1.7.2-.6.2-1.2 0-1.8-.4-.9-1.2-1.6-2.1-1.8l.1-2.1zm-3.4.6 1.5 1.5c-.7.4-1.2 1-1.4 1.8-.2.6-.1 1.3.2 1.9.4.7 1.1 1.2 1.9 1.3l-.2 2.1c-1.6-.2-3-1.2-3.7-2.6-.5-1-.6-2.2-.2-3.3.4-1.1 1.1-2 2-2.7z" />
      </IconShell>
    ),
  },
  {
    name: "Kubernetes",
    color: "#326CE5",
    icon: () => (
      <IconShell>
        <path d="M12 2.2 14.6 4l2.8-.3 1.4 2.5 2.5 1.4-.3 2.8L23 12l-1.8 2.6.3 2.8-2.5 1.4-1.4 2.5-2.8-.3L12 21.8 9.4 20l-2.8.3-1.4-2.5-2.5-1.4.3-2.8L1 12l1.8-2.6-.3-2.8 2.5-1.4L8.4 3.7l2.8.3L12 2.2zm0 4.3a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm0 2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
      </IconShell>
    ),
  },
  {
    name: "AWS",
    color: "#FF9900",
    icon: () => (
      <IconShell>
        <path d="M7.2 14.1c-1.1 0-2 .2-2.7.5-.2.1-.3 0-.2-.1.7-.9 2.4-1.5 4.1-1.5 2.5 0 3.8 1.1 3.8 2.7v5.1c0 .2-.1.2-.2.2h-1.5c-.2 0-.2-.1-.2-.2v-5c0-1.1-.5-1.7-1.8-1.7h-.1.3zm6.3-.8c0-.1.1-.2.3-.1 1 .2 2 .4 2.7.4 1.1 0 1.4-.4 1.4-1 0-.6-.4-.9-1.4-.9-1.2 0-2.5.3-3.5.6-.2.1-.3 0-.3-.1V11c0-.1 0-.2.2-.2 1.1-.3 2.4-.5 3.7-.5 2.4 0 3.5 1 3.5 2.7v5.2c0 .1 0 .2-.1.2h-1.5c-.1 0-.2-.1-.2-.2v-.8c-.7.9-1.8 1.3-3.1 1.3-1.8 0-3-1-3-2.5 0-2.4 2.3-3 4.6-3h1.2v-.4c0-.8-.4-1.1-1.4-1.1-.9 0-1.9.2-2.7.5-.1 0-.2 0-.2-.1v-1.5zm4.5 4.2h-1.2c-1.4 0-2.2.5-2.2 1.4 0 .7.5 1.2 1.6 1.2.9 0 1.8-.4 2.2-1v-1.6h-.4z" />
        <path d="M6.5 19.8c2.9 1.7 6.7 2.2 9.9 1.2.5-.2.9.2.4.6-2.3 1.9-6.4 2.5-9.8 1.3-1.6-.6-2.8-1.4-3.5-2-.3-.3.1-.7.5-.5.8.4 1.7.8 2.5 1.1z" />
      </IconShell>
    ),
  },
];

const CIH_POINTS = [
  { label: "Budget-aware", detail: "Spend control that stays ahead of runaway runs" },
  { label: "CodeGraph", detail: "Built-in map of how your codebase actually connects" },
  { label: "Observable", detail: "See agents think, tool, and fail — live" },
  { label: "Secret-safe", detail: "Stops keys & tokens from leaking into the wild" },
  { label: "Best-in-class TUI", detail: "A terminal UI you’ll want to live in" },
] as const;

export default function AboutTommyWindow(): JSX.Element {
  return (
    // Container queries track THIS OS window, not the browser viewport
    <div class="about-tommy @container relative h-full min-h-0 w-full overflow-x-hidden overflow-y-auto bg-[#f3f5f8] text-zinc-900">
      <div
        class="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 60% at 0% -10%, rgba(56, 120, 220, 0.16), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 110%, rgba(40, 200, 64, 0.1), transparent 50%), linear-gradient(165deg, #f7f8fb 0%, #eef1f6 48%, #e8ecf2 100%)",
        }}
      />
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          "background-image":
            "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
          "background-size": "28px 28px",
          "mask-image":
            "radial-gradient(ellipse 75% 70% at 50% 40%, black 20%, transparent 75%)",
        }}
      />

      <div class="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 @[28rem]:gap-7 @[28rem]:px-6 @[28rem]:py-8 @[40rem]:gap-8 @[40rem]:px-10 @[40rem]:py-10 @[52rem]:grid @[52rem]:grid-cols-[minmax(180px,240px)_minmax(0,1fr)] @[52rem]:items-start @[52rem]:gap-x-10 @[52rem]:px-12 @[52rem]:py-12 @[64rem]:gap-x-16 @[64rem]:px-14">
        <header class="flex min-w-0 flex-row items-end gap-4 @[40rem]:gap-5 @[52rem]:sticky @[52rem]:top-4 @[52rem]:flex-col @[52rem]:items-start @[52rem]:gap-5">
          <div class="relative shrink-0">
            <img
              src="/images/tommy.gif"
              alt="Tommy Le"
              class="h-16 w-16 rounded-[1.1rem] object-cover shadow-[0_12px_36px_rgba(15,23,42,0.18)] ring-1 ring-zinc-900/10 @[28rem]:h-20 @[28rem]:w-20 @[28rem]:rounded-[1.25rem] @[40rem]:h-24 @[40rem]:w-24 @[40rem]:rounded-3xl @[52rem]:h-32 @[52rem]:w-32 @[52rem]:rounded-[1.75rem]"
              loading="lazy"
              decoding="async"
            />
            <span
              class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#f3f5f8] bg-[var(--accent)] shadow-[0_0_0_3px_rgba(40,200,64,0.25)] @[40rem]:h-3.5 @[40rem]:w-3.5 @[52rem]:h-4 @[52rem]:w-4"
              title="Online"
            />
          </div>
          <div class="min-w-0 flex-1 pb-0.5 text-left">
            <p
              class="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 @[28rem]:mb-1.5 @[28rem]:text-[11px]"
              style={{ "font-family": "var(--font-body)" }}
            >
              About
            </p>
            <h2
              class="text-[1.65rem] leading-none tracking-tight break-words text-zinc-900 @[28rem]:text-[2rem] @[40rem]:text-[2.5rem] @[52rem]:text-[2.75rem]"
              style={{
                "font-family": "var(--font-display)",
                "font-weight": "700",
              }}
            >
              Tommy Le
            </h2>
            <p class="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-600 @[40rem]:mt-3 @[40rem]:text-base">
              <span>Engineer at</span>
              <span class="inline-flex items-center gap-1.5 rounded-md border border-zinc-900/8 bg-white/80 px-2 py-0.5 shadow-sm shadow-zinc-900/5">
                <img
                  src="/images/app-icons/swisscom-logo.jpg"
                  alt=""
                  class="h-4 w-auto rounded-[2px]"
                  loading="lazy"
                  decoding="async"
                />
                <span class="font-medium text-zinc-800">Swisscom</span>
              </span>
            </p>
          </div>
        </header>

        <div class="flex min-w-0 flex-col gap-5 text-left @[28rem]:gap-6 @[40rem]:gap-7">
          <div
            class="flex min-w-0 flex-wrap gap-1.5 @[28rem]:gap-2"
            style={{ "font-family": "var(--font-body)" }}
          >
            <For each={TECH}>
              {(tech) => (
                <span class="inline-flex max-w-full items-center gap-1.5 rounded-md border border-zinc-900/8 bg-white/80 px-2 py-1 text-[12px] text-zinc-700 shadow-sm shadow-zinc-900/5 @[28rem]:px-2.5 @[28rem]:text-[13px]">
                  <span class="shrink-0" style={{ color: tech.color }}>
                    {tech.icon()}
                  </span>
                  <span class="truncate">{tech.name}</span>
                </span>
              )}
            </For>
          </div>

          <p class="min-w-0 text-[14px] leading-[1.65] text-zinc-600 @[28rem]:text-[15px] @[28rem]:leading-[1.7] @[40rem]:text-base @[52rem]:text-[1.05rem] @[52rem]:leading-[1.75]">
            <span class="font-semibold text-zinc-900">8+ years</span> building
            responsive, scalable web apps for startups and enterprises — focused
            on{" "}
            <span class="font-semibold text-zinc-900">clean code</span>,{" "}
            <span class="font-semibold text-zinc-900">smooth UX</span>, and{" "}
            <span class="font-semibold text-zinc-900">design systems</span>.
            Mentoring teams, shaping UI libraries, and shipping products that
            feel fast and deliberate.
          </p>

          <section class="min-w-0 overflow-hidden rounded-2xl border border-zinc-900/8 bg-white/75 p-4 shadow-sm shadow-zinc-900/5 @[28rem]:p-5 @[40rem]:p-6">
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-zinc-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                Now building
              </span>
              <For each={["Agents", "MCP", "Skills"]}>
                {(tag) => (
                  <span class="rounded-full border border-zinc-900/10 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">
                    {tag}
                  </span>
                )}
              </For>
            </div>

            <h3
              class="text-lg leading-tight tracking-tight text-zinc-900 @[28rem]:text-xl @[40rem]:text-2xl"
              style={{
                "font-family": "var(--font-display)",
                "font-weight": "700",
              }}
            >
              CIH — Codebase Intelligence Hub
            </h3>
            <p class="mt-2 text-[13px] leading-relaxed text-zinc-600 @[28rem]:text-[14px] @[40rem]:text-[15px]">
              Hooked on the agent era —{" "}
              <span class="font-semibold text-zinc-800">agents</span>,{" "}
              <span class="font-semibold text-zinc-800">MCP</span>, and{" "}
              <span class="font-semibold text-zinc-800">skills</span> as the new
              interface to software. CIH is my OpenCode-based agent, rebuilt for
              real budgets, a native CodeGraph, full observability, and hard
              stops on secret leaks — with a TUI that finally feels first-class.
            </p>

            <ul class="mt-4 grid grid-cols-1 gap-2.5 @[36rem]:grid-cols-2">
              <For each={[...CIH_POINTS]}>
                {(point) => (
                  <li class="min-w-0 rounded-xl border border-zinc-900/6 bg-zinc-50/80 px-3 py-2.5">
                    <p class="text-[12px] font-semibold uppercase tracking-wide text-zinc-800">
                      {point.label}
                    </p>
                    <p class="mt-0.5 text-[12px] leading-snug text-zinc-500">
                      {point.detail}
                    </p>
                  </li>
                )}
              </For>
            </ul>
          </section>

          <footer class="flex flex-wrap items-center gap-3 pt-1 pb-2">
            <a
              href="https://github.com/WolfCanCode"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 rounded-full border border-zinc-900/10 bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm shadow-zinc-900/5 transition hover:border-zinc-900/20 hover:bg-zinc-50"
            >
              <img
                src="/images/app-icons/github-logo.png"
                alt=""
                class="h-4 w-4"
                loading="lazy"
                decoding="async"
              />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/wolfcancode/"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 rounded-full border border-zinc-900/10 bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm shadow-zinc-900/5 transition hover:border-zinc-900/20 hover:bg-zinc-50"
            >
              <img
                src="/images/app-icons/linkedin.webp"
                alt=""
                class="h-4 w-4"
                loading="lazy"
                decoding="async"
              />
              LinkedIn
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
