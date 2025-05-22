import { JSX, Component } from "solid-js";
import AppIcon from "./components/AppIcon";
import MyCVViewer from "./components/apps/MyCVViewerApp";
import CourseTrainerApp from "./components/apps/CourseTrainerApp";
import InterviewTrainerApp from "./components/apps/InterviewTrainerApp";
import AboutTommyWindow from "./components/apps/AboutTommyWindow";
export interface Project {
  id: string;
  name: string;
  icon: string | (() => JSX.Element); // emoji or function returning JSX
  description: string;
  link: string;
  component: Component;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const projects: Project[] = [
  {
    id: "course-trainer",
    name: "Course Trainer",
    icon: () => (
      <AppIcon
        src="/images/app-icons/course-trainer.png"
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
    id: "interview-trainer",
    name: "Interview Trainer",
    icon: () => (
      <AppIcon
        src="/images/app-icons/interview-trainer.png"
        alt="Interview Trainer"
        size={40}
      />
    ),
    description:
      "Sharpen your skills and ace your next interview with AI-powered practice.",
    link: "https://interview-ai-trainer.vercel.app/vi",
    component: InterviewTrainerApp,
    defaultWidth: 900,
    defaultHeight: 650,
  },
  {
    id: "my-cv",
    name: "My CV",
    icon: () => (
      <AppIcon src="/images/app-icons/my-cv.png" alt="CV Logo" size={40} />
    ),
    description: "View my curriculum vitae as a PDF.",
    link: "/pdf/myCV.pdf",
    component: MyCVViewer,
    defaultWidth: 800,
    defaultHeight: 1000,
  },
  {
    id: "about-tommy",
    name: "About Tommy",
    icon: () => (
      <AppIcon src="/images/tommy-circle.png" alt="Tommy" size={40} />
    ),
    description: "About Tommy Le (wolfcancode) and social links.",
    link: "#about-tommy",
    component: AboutTommyWindow,
    defaultWidth: 400,
    defaultHeight: 500,
  },
];
