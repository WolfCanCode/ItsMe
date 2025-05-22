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
      <AppIcon
        src="/images/course-trainer.png"
        alt="Course Trainer"
        size={40}
      />
    ),
    description:
      "AWS, Azure, Google Cloud, and more: interactive certification quizzes and training.",
    link: "https://course-trainer.vercel.app/",
    component: CourseTrainerApp,
    defaultWidth: 900,
    defaultHeight: 650,
  },
  {
    id: "my-cv",
    name: "My CV",
    icon: () => <AppIcon src="/images/cv-logo.png" alt="CV Logo" size={40} />,
    description: "View my curriculum vitae as a PDF.",
    link: "/pdf/myCV.pdf",
    component: () => (
      <iframe
        src="/pdf/myCV.pdf"
        title="My CV PDF"
        class="w-full h-full min-h-[300px] min-w-[250px] rounded-lg border-0"
        style={{
          height: "100%",
          width: "100%",
          border: "none",
          background: "#fff",
        }}
        allow="fullscreen"
      />
    ),
    defaultWidth: 800,
    defaultHeight: 1000,
  },
];
