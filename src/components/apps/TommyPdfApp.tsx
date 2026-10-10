import { JSX } from "solid-js";

const TommyPdfApp = (): JSX.Element => {
  return (
    <iframe
      src="https://tommypdf.vercel.app/"
      title="My PDF"
      class="h-full min-h-[300px] w-full min-w-[250px] rounded-lg border-0"
      style={{
        height: "100%",
        width: "100%",
        border: "none",
        background: "#fff",
      }}
      allow="clipboard-write; fullscreen"
    />
  );
};

export default TommyPdfApp;
