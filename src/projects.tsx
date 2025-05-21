import { JSX } from "solid-js";
import PortfolioApp from "./routes/apps/PortfolioApp";
import TaskManagerApp from "./routes/apps/TaskManagerApp";
import WeatherApp from "./routes/apps/WeatherApp";
import CourseTrainerApp from "./routes/apps/CourseTrainerApp";

function getCourseTrainerIcon(): JSX.Element {
  return (
    <img
      src="src/media/icons/course-trainer.png"
      alt="Course Trainer"
      class="w-10 h-10 object-contain bg-white rounded-lg shadow border border-gray-200"
      loading="lazy"
      draggable={false}
    />
  );
}

export interface Project {
  id: string;
  name: string;
  icon: string | JSX.Element; // emoji or image path or JSX
  description: string;
  link: string;
  component: () => JSX.Element;
}

export const projects: Project[] = [
  {
    id: "course-trainer",
    name: "Course Trainer",
    icon: getCourseTrainerIcon(),
    description:
      "AWS, Azure, Google Cloud, and more: interactive certification quizzes and training.",
    link: "https://course-trainer.vercel.app/",
    component: CourseTrainerApp,
  },
  {
    id: "1",
    name: "Portfolio Website",
    icon: "🌐",
    description: "My personal portfolio built with SolidJS and Tailwind.",
    link: "https://your-portfolio.com",
    component: PortfolioApp,
  },
  {
    id: "2",
    name: "Task Manager",
    icon: "✅",
    description: "A simple and elegant task manager app.",
    link: "https://github.com/yourname/task-manager",
    component: TaskManagerApp,
  },
  {
    id: "3",
    name: "Weather App",
    icon: "☀️",
    description: "A weather forecast app using OpenWeatherMap API.",
    link: "https://github.com/yourname/weather-app",
    component: WeatherApp,
  },
];
