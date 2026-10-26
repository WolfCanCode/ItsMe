import { For } from "solid-js";

type DirectoryApp = {
  name: string;
  description: string;
  href: string;
  kind: "pdf" | "course" | "interview" | "noevyra" | "codryn";
};

const icons = {
  pdf: "/images/app-icons/tommy-pdf.png",
  course: "/images/app-icons/course-trainer.png",
  interview: "/images/app-icons/interview-trainer.png",
  noevyra: "/images/app-icons/noevyra.png",
  codryn: "/images/app-icons/codryn.png",
};

export default function AppDirectory(props: {
  apps: DirectoryApp[];
  ref: (element: HTMLDialogElement) => void;
}) {
  let dialog!: HTMLDialogElement;
  return (
    <dialog
      id="apps-and-cv"
      class="app-directory"
      aria-labelledby="directory-title"
      ref={(element) => {
        dialog = element;
        props.ref(element);
      }}
      onClick={(event) => {
        if (event.target === dialog) dialog.close();
      }}
    >
      <div class="directory-content">
        <div class="directory-topline">
          <span>WOLFCANCODE / DIRECTORY</span>
          <button
            class="directory-close"
            aria-label="Close apps and CV"
            onClick={() => dialog.close()}
          >
            ×
          </button>
        </div>
        <h2 id="directory-title">
          Everything,
          <br />
          <span>in one place.</span>
        </h2>
        <p class="directory-intro">
          The apps I’ve built, the work I do, and the longer story.
        </p>
        <h3 class="directory-label">
          PROJECTS & APPS{" "}
          <span>{String(props.apps.length).padStart(2, "0")}</span>
        </h3>
        <div class="directory-apps">
          <For each={props.apps}>
            {(app) => (
              <a
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                class="directory-row"
              >
                <img src={icons[app.kind]} alt="" width="44" height="44" />
                <div>
                  <h4>{app.name}</h4>
                  <p>{app.description}</p>
                </div>
                <span class="directory-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            )}
          </For>
        </div>
        <h3 class="directory-label directory-cv-label">THE LONGER STORY</h3>
        <a
          class="directory-row directory-cv"
          href="/pdf/myCV.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="cv-file-icon" aria-hidden="true">
            PDF
          </span>
          <div>
            <h4>My CV</h4>
            <p>Experience, skills, and my engineering journey.</p>
          </div>
          <span class="directory-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
        <div class="directory-bottom">
          <a href="#about" onClick={() => dialog.close()}>
            About Tommy <span aria-hidden="true">↘</span>
          </a>
          <a href="/playground">
            Experimental desktop <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </dialog>
  );
}
