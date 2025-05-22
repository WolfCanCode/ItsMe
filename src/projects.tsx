import { JSX, Component } from "solid-js";
import AppIcon from "./components/AppIcon";
import MyCVViewer from "./routes/apps/MyCVViewerApp";
import CourseTrainerApp from "./routes/apps/CourseTrainerApp";
import InterviewTrainerApp from "./routes/apps/InterviewTrainerApp";
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
    id: "interview-trainer",
    name: "Interview Trainer",
    icon: () => (
      <AppIcon
        src="/images/interview-trainer.png"
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
    icon: () => <AppIcon src="/images/cv-logo.png" alt="CV Logo" size={40} />,
    description: "View my curriculum vitae as a PDF.",
    link: "/pdf/myCV.pdf",
    component: MyCVViewer,
    defaultWidth: 800,
    defaultHeight: 1000,
  },
];
