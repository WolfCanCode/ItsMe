import { JSX } from "solid-js";
import MenuBar from "./MenuBar";

export default function Desktop(props: { children?: JSX.Element }) {
  return (
    <div
      class="relative w-screen h-screen overflow-hidden pt-10"
      style={{
        "background-image": "url('/wallpapers/mywall.png')",
        "background-size": "cover",
        "background-position": "center",
      }}
    >
      <MenuBar />
      {props.children}
    </div>
  );
}
