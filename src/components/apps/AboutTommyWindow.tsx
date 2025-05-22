import { JSX } from "solid-js";

function TechTag(props: { tech: string }) {
  const colorMap: Record<string, string> = {
    React: "bg-blue-100 text-blue-700 border-blue-300",
    Vue: "bg-green-100 text-green-700 border-green-300",
    Angular: "bg-red-100 text-red-700 border-red-300",
    Solid: "bg-cyan-100 text-cyan-700 border-cyan-300",
    Qwik: "bg-purple-100 text-purple-700 border-purple-300",
    Next: "bg-gray-100 text-gray-700 border-gray-300",
    GenAI: "bg-yellow-100 text-yellow-700 border-yellow-300",
  };
  const color =
    colorMap[props.tech] || "bg-gray-100 text-gray-700 border-gray-300";
  return (
    <span
      class={`px-2 py-0.5 rounded-full border text-xs font-semibold mr-1 mb-1 ${color}`}
    >
      {props.tech}
    </span>
  );
}

export default function AboutTommyWindow(): JSX.Element {
  return (
    <div class="flex items-start justify-center h-full w-full bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div class="flex flex-col mt-8 items-center justify-center p-6 sm:p-10 rounded-2xl shadow-2xl bg-white/90 border border-blue-100 max-w-[400px] w-full mx-2">
        <div class="relative mb-4">
          <img
            src="/images/tommy.gif"
            alt="Tommy"
            class="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-black shadow-lg transition-transform duration-300 hover:scale-105"
            style={{ "box-shadow": "0 8px 32px 0 rgba(31, 38, 135, 0.15)" }}
          />
          <span
            class="absolute bottom-2 right-2 bg-green-400 border-2 border-white rounded-full w-4 h-4 animate-pulse"
            title="Online"
          ></span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold mb-1 text-blue-950 tracking-tight">
          Tommy Le
        </h2>
        <div class="flex items-center justify-center gap-2 mb-2 flex-wrap">
          <span class="text-gray-700 text-sm font-medium">Working at</span>
          <img
            src="/images/app-icons/swisscom-logo.jpg"
            alt="Swisscom"
            class="h-6 w-auto drop-shadow"
            style={{ "margin-bottom": "-2px" }}
          />
          <span class="text-blue-950 font-bold text-sm">Swisscom</span>
        </div>
        <div class="flex flex-wrap justify-center gap-2 mb-2">
          <TechTag tech="React" />
          <TechTag tech="Vue" />
          <TechTag tech="Angular" />
          <TechTag tech="Solid" />
          <TechTag tech="Qwik" />
          <TechTag tech="Next" />
          <TechTag tech="GenAI" />
        </div>
        <div class="text-gray-700 text-sm mb-2 text-left w-full">
          <span class="font-bold">With 8+ years</span> crafting responsive,
          scalable web apps for startups and enterprises, I thrive on{" "}
          <span class="font-bold">clean code</span>,{" "}
          <span class="font-bold">smooth UX</span>, and{" "}
          <span class="font-bold">robust design systems</span>.<br />
          My journey spans React, Vue, Angular, Solid, Qwik, Next and
          beyond—mentoring teams, architecting UI libraries, and always pushing
          for better, faster, and more delightful products.
        </div>
        <div class="italic text-blue-700 text-sm mb-4 text-left w-full">
          Lately, I'm diving into Generative AI, blending product thinking with
          cutting-edge tech to create smarter, more adaptive user experiences.
        </div>
        <div class="flex gap-6 justify-center mt-2 w-full">
          <a
            href="https://github.com/WolfCanCode"
            target="_blank"
            rel="noopener"
            title="GitHub"
            class="transition-transform duration-200 hover:scale-125 hover:drop-shadow-lg"
          >
            <img
              src="/images/app-icons/github-logo.png"
              alt="GitHub"
              class="w-9 h-9"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/wolfcancode/"
            target="_blank"
            rel="noopener"
            title="LinkedIn"
            class="transition-transform duration-200 hover:scale-125 hover:drop-shadow-lg"
          >
            <img
              src="/images/app-icons/linkedin.webp"
              alt="LinkedIn"
              class="w-9 h-9"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
