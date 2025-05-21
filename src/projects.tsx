import { JSX } from "solid-js";
import PortfolioApp from "./routes/apps/PortfolioApp";
import TaskManagerApp from "./routes/apps/TaskManagerApp";
import WeatherApp from "./routes/apps/WeatherApp";
import CourseTrainerApp from "./routes/apps/CourseTrainerApp";
import AppIcon from "./components/AppIcon";

export interface Project {
  id: string;
  name: string;
  icon: string | (() => JSX.Element); // emoji or function returning JSX
  description: string;
  link: string;
  component: () => JSX.Element;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const projects: Project[] = [
  {
    id: "course-trainer",
    name: "Course Trainer",
    icon: () => (
      <AppIcon src="/course-trainer.png" alt="Course Trainer" size={40} />
    ),
    description:
      "AWS, Azure, Google Cloud, and more: interactive certification quizzes and training.",
    link: "https://course-trainer.vercel.app/",
    component: CourseTrainerApp,
    defaultWidth: 900,
    defaultHeight: 650,
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
