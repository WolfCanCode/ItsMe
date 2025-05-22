import { JSX } from "solid-js";

export default function MyCVViewer(): JSX.Element {
  return (
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
  );
}
