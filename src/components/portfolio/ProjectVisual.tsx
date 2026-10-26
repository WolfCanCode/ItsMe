import { For, Show } from "solid-js";

export default function ProjectVisual(props: {
  kind: "pdf" | "course" | "interview" | "noevyra" | "codryn";
}) {
  return (
    <div class={`project-art art-${props.kind}`} aria-hidden="true">
      <Show when={props.kind === "codryn"}>
        <img
          class="codryn-wordmark"
          src="/images/app-icons/codryn.png"
          alt=""
          loading="lazy"
        />
        <svg class="codryn-graph" viewBox="0 0 440 260" fill="none">
          <g stroke="#577e9b" stroke-width="1">
            <path d="M240 50 335 90 280 165 375 210M240 50l-80 68 120 47-65 72M160 118l-85 65 140 54M335 90l70-55M280 165l125-40" />
            <path
              d="m75 183 165-133 135 160"
              stroke-dasharray="3 6"
              opacity=".4"
            />
          </g>
          <g fill="#dce9ed" stroke="#245573" stroke-width="1.5">
            <circle cx="240" cy="50" r="7" />
            <circle cx="335" cy="90" r="10" />
            <circle cx="280" cy="165" r="16" fill="#0b6190" />
            <circle cx="375" cy="210" r="7" />
            <circle cx="160" cy="118" r="9" />
            <circle cx="75" cy="183" r="6" />
            <circle cx="215" cy="237" r="7" />
            <circle cx="405" cy="35" r="5" />
            <circle cx="405" cy="125" r="5" />
          </g>
          <g fill="#365b74" font-size="7" font-family="monospace">
            <text x="259" y="39">
              find_symbol
            </text>
            <text x="293" y="197">
              trace_call_path
            </text>
            <text x="91" y="107">
              index_repository
            </text>
          </g>
        </svg>
        <div class="codryn-art-copy">
          Understand
          <br />
          <span>the connections.</span>
        </div>
        <span class="art-caption">CODEBASE KNOWLEDGE GRAPH · CONCEPT ART</span>
      </Show>
      <Show when={props.kind === "noevyra"}>
        <div class="noevyra-orbit" />
        <img
          class="noevyra-emblem"
          src="/images/app-icons/noevyra.png"
          alt=""
          loading="lazy"
        />
        <div class="noevyra-art-copy">
          <span>NOEVYRA / YOUR PERSONAL AI BRAIN</span>
          <h4>
            One brain.
            <br />
            <em>Any agent.</em>
          </h4>
        </div>
        <div class="noevyra-terminal">
          <span>
            <b>$</b> brain setup
          </span>
          <span class="noevyra-agents">CLAUDE · CODEX · CURSOR · KIRO</span>
        </div>
        <span class="art-caption">LOCAL-FIRST INTELLIGENCE · CONCEPT ART</span>
      </Show>
      <Show when={props.kind === "pdf"}>
        <div class="trainer-orbit" />
        <img
          class="trainer-emblem pdf-emblem"
          src="/images/app-icons/tommy-pdf.png"
          alt=""
          loading="lazy"
        />
        <div class="trainer-art-copy">
          <span>MY PDF / DOCUMENT TOOLS</span>
          <h4>
            Your files.
            <br />
            <em>Your rules.</em>
          </h4>
        </div>
        <div class="trainer-art-strip">
          <span>MERGE · ANNOTATE · SIGN</span>
          <span>ON YOUR DEVICE.</span>
        </div>
        <span class="art-caption">
          BROWSER-LOCAL DOCUMENT TOOLS · CONCEPT ART
        </span>
      </Show>
      <Show when={props.kind === "course"}>
        <div class="trainer-orbit" />
        <img
          class="trainer-emblem course-emblem"
          src="/images/app-icons/course-trainer.png"
          alt=""
          loading="lazy"
        />
        <div class="trainer-art-copy">
          <span>COURSE TRAINER / CLOUD CERTIFICATIONS</span>
          <h4>
            Your next
            <br />
            <em>chapter.</em>
          </h4>
        </div>
        <div class="trainer-art-strip">
          <span>LEARN. PRACTICE. REPEAT.</span>
          <span>AWS · AZURE · GOOGLE CLOUD</span>
        </div>
        <span class="art-caption">
          CLOUD CERTIFICATION PRACTICE · CONCEPT ART
        </span>
      </Show>
      <Show when={props.kind === "interview"}>
        <div class="trainer-orbit" />
        <img
          class="trainer-emblem interview-emblem"
          src="/images/app-icons/interview-trainer.png"
          alt=""
          loading="lazy"
        />
        <div class="trainer-art-copy">
          <span>INTERVIEW TRAINER / AI PRACTICE</span>
          <h4>
            Find your
            <br />
            <em>confidence.</em>
          </h4>
        </div>
        <div class="trainer-art-strip">
          <span>PRACTICE. REFLECT. IMPROVE.</span>
          <div class="trainer-waveform">
            <For each={[10, 18, 12, 26, 32, 16, 24, 10, 20, 28, 14, 24, 18]}>
              {(height) => <span style={{ height: `${height}px` }} />}
            </For>
          </div>
        </div>
        <span class="art-caption">
          AI-POWERED INTERVIEW PRACTICE · CONCEPT ART
        </span>
      </Show>
    </div>
  );
}
