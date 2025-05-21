import { JSX } from "solid-js";

const WeatherApp = (): JSX.Element => (
  <div class="h-full overflow-auto p-4">
    <h2 class="text-xl font-bold mb-2">Weather App</h2>
    <p class="mb-2">A weather forecast app using OpenWeatherMap API.</p>
    <a
      href="https://github.com/yourname/weather-app"
      target="_blank"
      rel="noopener noreferrer"
      class="text-sky-600 hover:underline"
    >
      View Project
    </a>
  </div>
);

export default WeatherApp;
