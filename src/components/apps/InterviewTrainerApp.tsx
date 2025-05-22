import { JSX } from "solid-js";

export default function MyCVViewer(): JSX.Element {
  return (
    <iframe
      src="https://interview-ai-trainer.vercel.app/vi"
      title="Interview Trainer"
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
}
