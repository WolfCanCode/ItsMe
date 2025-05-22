import { JSX } from "solid-js";
import MenuBar from "./MenuBar";
import { createSignal, onMount } from "solid-js";

export default function Desktop(props: { children?: JSX.Element }) {
  // Utility to detect mobile
  function isMobile() {
    if (typeof window === "undefined") return false;
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  const [bg, setBg] = createSignal("/images/mywall.jpg");
  onMount(() => {
    if (isMobile()) {
      setBg("/images/mywall-mobile.jpg");
    }
  });

  return (
    <div
      class="relative w-screen h-screen overflow-hidden pt-10 select-none"
      style={{
        "background-image": `url('${bg()}')`,
        "background-size": "cover",
        "background-position": "center",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <MenuBar />
      {props.children}
    </div>
  );
}
