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
    <div class="about-tommy relative h-full min-h-0 overflow-auto">
      {/* Soft atmosphere — no heavy opaque card */}
      <div
        class="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 10% 0%, rgba(90,140,255,0.18), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(255,120,90,0.12), transparent 50%), linear-gradient(180deg, rgba(12,14,22,0.2), rgba(9,9,12,0.85))",
        }}
      />
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          "background-image":
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div class="relative mx-auto flex min-h-full max-w-[520px] flex-col justify-center gap-8 px-6 py-10 sm:px-8">
        {/* Identity row — asymmetric */}
        <header class="flex items-end gap-5">
          <div class="relative shrink-0">
            <img
              src="/images/tommy.gif"
              alt="Tommy Le"
              class="h-[4.75rem] w-[4.75rem] rounded-[1.35rem] object-cover shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/25 sm:h-24 sm:w-24 sm:rounded-3xl"
            />
            <span
              class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 bg-[var(--accent)] shadow-[0_0_10px_rgba(40,200,64,0.65)]"
              title="Online"
            />
          </div>
          <div class="min-w-0 flex-1 pb-0.5 text-left">
            <p
              class="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45"
              style={{ "font-family": "var(--font-body)" }}
            >
              About
            </p>
            <h2
              class="text-[2rem] leading-none tracking-tight text-white sm:text-[2.35rem]"
              style={{ "font-family": "var(--font-display)", "font-weight": "700" }}
            >
              Tommy Le
            </h2>
            <p class="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/70">
              <span>Engineer at</span>
              <span class="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5">
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

        {/* Tech — sparse text, not pill soup */}
        <p
          class="text-left text-[13px] leading-relaxed tracking-wide text-white/55"
          style={{ "font-family": "var(--font-body)" }}
        >
          <For each={[...TECH]}>
            {(tech, i) => (
              <>
                <span class="text-white/80">{tech}</span>
                {i() < TECH.length - 1 ? (
                  <span class="mx-2 text-white/25">·</span>
                ) : null}
              </>
            )}
          </For>
        </p>

        {/* Story */}
        <div class="space-y-4 text-left">
          <p class="text-[15px] leading-[1.65] text-white/80">
            <span class="font-semibold text-white">8+ years</span> building
            responsive, scalable web apps for startups and enterprises — focused
            on{" "}
            <span class="font-semibold text-white">clean code</span>,{" "}
            <span class="font-semibold text-white">smooth UX</span>, and{" "}
            <span class="font-semibold text-white">design systems</span>.
            Mentoring teams, shaping UI libraries, and shipping products that
            feel fast and deliberate.
          </p>
          <p class="border-l-2 border-[var(--accent)]/60 pl-4 text-[13px] italic leading-relaxed text-white/50">
            Lately: Generative AI — product thinking meets adaptive interfaces.
          </p>
        </div>

        {/* Links */}
        <footer class="flex flex-wrap items-center gap-3 pt-1">
          <a
            href="https://github.com/WolfCanCode"
            target="_blank"
            rel="noopener"
            class="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:border-white/30 hover:bg-white/10"
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
            class="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:border-white/30 hover:bg-white/10"
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
  );
}
