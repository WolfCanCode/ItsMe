import { JSX } from "solid-js";

function TechTag(props: { tech: string }) {
  return (
    <span class="mr-1.5 mb-1.5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-zinc-100 backdrop-blur-sm">
      {props.tech}
    </span>
  );
}

function SocialButton(props: {
  href: string;
  title: string;
  src: string;
  alt: string;
}) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener"
      title={props.title}
      class="group inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-white/35 hover:bg-white/15"
    >
      <img
        src={props.src}
        alt={props.alt}
        class="h-7 w-7 object-contain opacity-95 transition-opacity group-hover:opacity-100"
      />
    </a>
  );
}

export default function AboutTommyWindow(): JSX.Element {
  return (
    <div class="flex h-full w-full items-start justify-center overflow-auto bg-transparent px-4 py-8 sm:py-10">
      <div class="mx-auto flex w-full max-w-[420px] flex-col items-center text-center">
        <div class="relative mb-5">
          <img
            src="/images/tommy.gif"
            alt="Tommy"
            class="h-24 w-24 rounded-full border border-white/25 object-cover shadow-[0_8px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.2)] sm:h-28 sm:w-28"
          />
          <span
            class="absolute bottom-1.5 right-1.5 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-zinc-950 bg-[var(--accent)]"
            title="Online"
          />
        </div>

        <h2
          class="mb-1 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          style={{ "font-family": "var(--font-display)" }}
        >
          Tommy Le
        </h2>

        <div class="mb-4 flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-300">
          <span>Working at</span>
          <img
            src="/images/app-icons/swisscom-logo.jpg"
            alt="Swisscom"
            class="h-5 w-auto rounded-sm"
          />
          <span class="font-semibold text-zinc-100">Swisscom</span>
        </div>

        <div class="mb-5 flex flex-wrap justify-center">
          <TechTag tech="React" />
          <TechTag tech="Vue" />
          <TechTag tech="Angular" />
          <TechTag tech="Solid" />
          <TechTag tech="Qwik" />
          <TechTag tech="Next" />
          <TechTag tech="GenAI" />
        </div>

        <p class="mb-3 w-full text-left text-sm leading-relaxed text-zinc-300">
          <span class="font-semibold text-zinc-100">With 8+ years</span> crafting
          responsive, scalable web apps for startups and enterprises, I thrive on{" "}
          <span class="font-semibold text-zinc-100">clean code</span>,{" "}
          <span class="font-semibold text-zinc-100">smooth UX</span>, and{" "}
          <span class="font-semibold text-zinc-100">robust design systems</span>.
          My journey spans React, Vue, Angular, Solid, Qwik, Next and
          beyond—mentoring teams, architecting UI libraries, and always pushing
          for better, faster, and more delightful products.
        </p>

        <p class="mb-6 w-full text-left text-sm italic leading-relaxed text-zinc-400">
          Lately, I'm diving into Generative AI, blending product thinking with
          cutting-edge tech to create smarter, more adaptive user experiences.
        </p>

        <div class="flex gap-4 justify-center">
          <SocialButton
            href="https://github.com/WolfCanCode"
            title="GitHub"
            src="/images/app-icons/github-logo.png"
            alt="GitHub"
          />
          <SocialButton
            href="https://www.linkedin.com/in/wolfcancode/"
            title="LinkedIn"
            src="/images/app-icons/linkedin.webp"
            alt="LinkedIn"
          />
        </div>
      </div>
    </div>
  );
}
