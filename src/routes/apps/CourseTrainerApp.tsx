import { JSX } from "solid-js";

const CourseTrainerApp = (): JSX.Element => (
  <iframe
    src="https://course-trainer.vercel.app/"
    title="Course Trainer"
    class="w-full h-full min-h-[300px] min-w-[250px] rounded-lg border-0"
    style={{
      height: "100%",
      width: "100%",
      border: "none",
      background: "#fff",
    }}
    allow="clipboard-write; fullscreen"
  />
);

export default CourseTrainerApp;
