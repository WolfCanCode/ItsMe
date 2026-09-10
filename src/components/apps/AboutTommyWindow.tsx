import { For, JSX } from "solid-js";

const TECH = [
  "React",
  "Vue",
  "Angular",
  "Solid",
  "Qwik",
  "Next",
  "GenAI",
] as const;

export default function AboutTommyWindow(): JSX.Element {
  return (
    <div class="about-tommy relative h-full min-h-0 w-full overflow-auto">
      <div
        class="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 8% 0%, rgba(90,140,255,0.2), transparent 55%), radial-gradient(ellipse 55% 45% at 100% 100%, rgba(255,120,90,0.14), transparent 50%), linear-gradient(180deg, rgba(12,14,22,0.15), rgba(9,9,12,0.92))",
        }}
      />
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          "background-image":
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Fills the window: stacked on small, two-column on wide/tall */}
      <div class="relative mx-auto flex h-full min-h-full w-full max-w-6xl flex-col justify-center gap-8 px-6 py-8 sm:px-10 sm:py-12 lg:grid lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:items-center lg:gap-x-14 lg:gap-y-8 lg:px-14 lg:py-16 xl:gap-x-20">
        {/* Identity */}
        <header class="flex flex-row items-end gap-5 lg:flex-col lg:items-start lg:gap-6">
          <div class="relative shrink-0">
            <img
              src="/images/tommy.gif"
              alt="Tommy Le"
              class="h-20 w-20 rounded-[1.25rem] object-cover shadow-[0_16px_48px_rgba(0,0,0,0.5)] ring-1 ring-white/25 sm:h-24 sm:w-24 sm:rounded-3xl lg:h-36 lg:w-36 lg:rounded-[1.75rem]"
            />
            <span
              class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 bg-[var(--accent)] shadow-[0_0_12px_rgba(40,200,64,0.7)] lg:h-4 lg:w-4"
              title="Online"
            />
          </div>
          <div class="min-w-0 flex-1 pb-0.5 text-left">
            <p
              class="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45"
              style={{ "font-family": "var(--font-body)" }}
            >
              About
            </p>
            <h2
              class="text-[2rem] leading-none tracking-tight text-white sm:text-[2.5rem] lg:text-[3.25rem]"
              style={{
                "font-family": "var(--font-display)",
                "font-weight": "700",
              }}
            >
              Tommy Le
            </h2>
            <p class="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/70 lg:text-base">
              <span>Engineer at</span>
              <span class="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
                <img
                  src="/images/app-icons/swisscom-logo.jpg"
                  alt=""
                  class="h-4 w-auto rounded-[2px]"
                />
                <span class="font-medium text-white/90">Swisscom</span>
              </span>
            </p>
          </div>
        </header>

        {/* Story column */}
        <div class="flex min-h-0 flex-col justify-center gap-6 text-left lg:gap-8">
          <p
            class="text-[13px] leading-relaxed tracking-wide text-white/55 sm:text-sm"
            style={{ "font-family": "var(--font-body)" }}
          >
            <For each={[...TECH]}>
              {(tech, i) => (
                <>
                  <span class="text-white/85">{tech}</span>
                  {i() < TECH.length - 1 ? (
                    <span class="mx-2 text-white/25">·</span>
                  ) : null}
                </>
              )}
            </For>
          </p>

          <p class="max-w-2xl text-[15px] leading-[1.7] text-white/80 sm:text-base lg:text-[1.05rem] lg:leading-[1.75]">
            <span class="font-semibold text-white">8+ years</span> building
            responsive, scalable web apps for startups and enterprises — focused
            on{" "}
            <span class="font-semibold text-white">clean code</span>,{" "}
            <span class="font-semibold text-white">smooth UX</span>, and{" "}
            <span class="font-semibold text-white">design systems</span>.
            Mentoring teams, shaping UI libraries, and shipping products that
            feel fast and deliberate.
          </p>

          <p class="max-w-xl border-l-2 border-[var(--accent)]/60 pl-4 text-[13px] italic leading-relaxed text-white/50 sm:text-sm">
            Lately: Generative AI — product thinking meets adaptive interfaces.
          </p>

          <footer class="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://github.com/WolfCanCode"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/85 transition hover:border-white/30 hover:bg-white/10"
            >
              <img
                src="/images/app-icons/github-logo.png"
                alt=""
                class="h-4 w-4 opacity-90"
              />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/wolfcancode/"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/85 transition hover:border-white/30 hover:bg-white/10"
            >
              <img
                src="/images/app-icons/linkedin.webp"
                alt=""
                class="h-4 w-4 opacity-90"
              />
              LinkedIn
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
