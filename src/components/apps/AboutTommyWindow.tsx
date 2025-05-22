import { JSX } from "solid-js";

export default function AboutTommyWindow(): JSX.Element {
  return (
    <div class="flex flex-col items-center justify-center h-full p-6 text-center">
      <img
        src="/images/tommy-circle.png"
        alt="Tommy"
        class="w-24 h-24 rounded-full mb-4 border-2 border-blue-400 shadow"
      />
      <h2 class="text-2xl font-bold mb-1 text-blue-950">Tommy Le</h2>
      <div class="flex items-center justify-center gap-2 mb-2">
        <div class="text-gray-700 text-sm font-medium flex items-center gap-2">
          Working at
          <div class="flex items-center gap-2">
            <img
              src="/images/app-icons/swisscom-logo.jpg"
              alt="Swisscom"
              class="h-7 w-auto"
            />
            <span class="text-blue-950 font-bold">Swisscom</span>
          </div>
        </div>
      </div>
      <div class="text-gray-600 mb-4">
        Building smarter UIs with GenAI. React, Vue, Angular, Solid, Qwik, Next.
        Based in Rotterdam, Netherlands.
      </div>
      <div class="flex gap-4 justify-center">
        <a
          href="https://github.com/WolfCanCode"
          target="_blank"
          rel="noopener"
          title="GitHub"
        >
          <img
            src="/images/app-icons/github-logo.png"
            alt="GitHub"
            class="w-7 h-7"
          />
        </a>
        <a
          href="https://www.linkedin.com/in/wolfcancode/"
          target="_blank"
          rel="noopener"
          title="LinkedIn"
        >
          <img
            src="/images/app-icons/linkedin.webp"
            alt="LinkedIn"
            class="w-7 h-7"
          />
        </a>
      </div>
    </div>
  );
}
