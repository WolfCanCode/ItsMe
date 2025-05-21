import { JSX } from "solid-js";

const PortfolioApp = (): JSX.Element => (
  <div class="h-full overflow-auto p-4">
    <h2 class="text-xl font-bold mb-2">Portfolio Website</h2>
    <p class="mb-2">My personal portfolio built with SolidJS and Tailwind.</p>
    <a
      href="https://your-portfolio.com"
      target="_blank"
      rel="noopener noreferrer"
      class="text-sky-600 hover:underline"
    >
      View Project
    </a>
  </div>
);

export default PortfolioApp;
