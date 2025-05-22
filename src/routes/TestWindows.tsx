import { createSignal } from "solid-js";
import MyCVViewer from "./apps/MyCVViewerApp";
import CourseTrainerApp from "./apps/CourseTrainerApp";

function MyIframe1() {
  console.log("MyIframe1 mounted");
  return <CourseTrainerApp />;
}

function MyIframe2() {
  console.log("MyIframe2 mounted");
  return <MyCVViewer />;
}

const windows = [
  { id: "one", name: "One", component: MyIframe1 },
  { id: "two", name: "Two", component: MyIframe2 },
];

export default function TestWindows() {
  const [openIds, setOpenIds] = createSignal(["one", "two"]);
  const [active, setActive] = createSignal("one");

  return (
    <div>
      <div>
        {windows.map((w) => (
          <button onClick={() => setActive(w.id)}>{w.name}</button>
        ))}
      </div>
      {windows.map((w) =>
        openIds().includes(w.id) ? (
          <div
            style={{
              border: active() === w.id ? "2px solid blue" : "1px solid gray",
              width: "400px",
              height: "300px",
              position: "absolute",
              left: w.id === "one" ? "100px" : "550px",
              top: "100px",
              background: "#fff",
              "z-index": active() === w.id ? 100 : 50,
            }}
            onMouseDown={() => setActive(w.id)}
          >
            <w.component />
          </div>
        ) : null
      )}
    </div>
  );
}
