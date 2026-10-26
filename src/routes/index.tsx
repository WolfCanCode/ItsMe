import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
import StackVisual from "~/components/portfolio/StackVisual";
import ProjectVisual from "~/components/portfolio/ProjectVisual";
import AppDirectory from "~/components/portfolio/AppDirectory";
import "~/portfolio.css";

const work = [
  {
    number: "01",
    name: "Noevyra",
    category: "Tools",
    kind: "noevyra" as const,
    label: "DEVELOPER TOOLS · AI MEMORY",
    description:
      "One brain for your AI coding agents. Local-first project memory, reusable skills, and shared context across Claude, Codex, Cursor, and Kiro.",
    stack: "Go / SQLite FTS5 / MCP",
    href: "https://github.com/WolfCanCode/NoevyraYourPersonalBrain",
  },
  {
    number: "02",
    name: "Codryn",
    category: "Tools",
    kind: "codryn" as const,
    label: "OPEN SOURCE · CODE INTELLIGENCE",
    description:
      "A persistent knowledge graph for AI coding agents. Explore code structure, trace call paths, and understand the impact of a change through an MCP server and visual dashboard.",
    stack: "Rust / SQLite / Tree-sitter / MCP",
    href: "https://github.com/WolfCanCode/Codryn",
  },
  {
    number: "03",
    name: "My PDF",
    category: "Tools",
    kind: "pdf" as const,
    label: "PRODUCTIVITY · PRIVACY",
    description:
      "Everyday PDF tools, without the upload. Merge, annotate, compress, and sign documents right in your browser.",
    stack: "Browser APIs / Local processing / UX",
    href: "https://tommypdf.vercel.app/",
    repository: "https://github.com/WolfCanCode/my-pdf",
  },
  {
    number: "04",
    name: "Course Trainer",
    category: "Learning",
    kind: "course" as const,
    label: "EDTECH · CLOUD CERTIFICATIONS",
    description:
      "Turning cloud certification prep into focused, interactive practice. Built for the way developers actually learn.",
    stack: "AWS / Azure / Google Cloud",
    href: "https://course-trainer.vercel.app/",
  },
  {
    number: "05",
    name: "Interview Trainer",
    category: "Learning",
    kind: "interview" as const,
    label: "AI · INTERVIEW PRACTICE",
    description:
      "A place to practice, find your confidence, and prepare for your next opportunity with AI-powered interviews.",
    stack: "Generative AI / Interactive learning",
    href: "https://interview-ai-trainer.vercel.app/vi",
  },
];
const expertise = [
  {
    number: "01",
    title: "Frontend",
    subtitle: "The details people feel.",
    description:
      "Thoughtful interfaces, resilient design systems, and fast experiences. Where my eye for detail meets engineering discipline.",
    tech: "React · Vue · Angular · Solid · Next.js",
    symbol: "</>",
  },
  {
    number: "02",
    title: "Backend",
    subtitle: "The foundation they trust.",
    description:
      "APIs and services built with the whole product in mind. Clear boundaries, maintainable code, and room to grow.",
    tech: "Rust · Python · Go · Java",
    symbol: "{ }",
  },
  {
    number: "03",
    title: "DevOps",
    subtitle: "From a commit to the cloud.",
    description:
      "Connecting development and production with automated delivery, observable systems, and infrastructure that supports the team.",
    tech: "AWS · Kubernetes · CI/CD · Grafana",
    symbol: "↗",
  },
  {
    number: "04",
    title: "Leadership",
    subtitle: "Better software starts with people.",
    description:
      "Mentoring engineers, connecting technical decisions to product goals, and giving teams the clarity to do their best work.",
    tech: "Mentoring · Architecture · Technical direction",
    symbol: "✳",
  },
];

export default function Home() {
  const [filter, setFilter] = createSignal("All projects");
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [activeSection, setActiveSection] = createSignal("");
  const [localTime, setLocalTime] = createSignal("Europe / Amsterdam");
  let root!: HTMLDivElement;
  let directory!: HTMLDialogElement;
  onMount(() => {
    const updateClock = () =>
      setLocalTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/Amsterdam",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    updateClock();
    const clock = window.setInterval(updateClock, 60000);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen()) {
        setMenuOpen(false);
        root.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActiveSection(entry.target.id);
      },
      { rootMargin: "-20% 0px -45% 0px" },
    );
    root
      .querySelectorAll("section[id]")
      .forEach((section) => sectionObserver.observe(section));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
      },
      { threshold: 0.08 },
    );
    root.querySelectorAll(".reveal").forEach((section) => {
      section.classList.add("will-reveal");
      revealObserver.observe(section);
    });
    onCleanup(() => {
      window.clearInterval(clock);
      document.removeEventListener("keydown", handleKey);
      sectionObserver.disconnect();
      revealObserver.disconnect();
    });
  });
  return (
    <div class="portfolio" ref={root}>
      <a class="skip-link" href="#main-content">
        Skip to content
      </a>
      <header class="site-header">
        <a class="brand" href="#top" aria-label="Tommy Le home">
          <span class="brand-mark">
            t<span>/</span>
          </span>
          <span class="brand-word">wolfcancode</span>
        </a>
        <nav class="desktop-nav" aria-label="Main navigation">
          <For
            each={[
              ["Work", "work"],
              ["Expertise", "expertise"],
              ["About", "about"],
            ]}
          >
            {([label, id]) => (
              <a href={`#${id}`} classList={{ active: activeSection() === id }}>
                {label}
              </a>
            )}
          </For>
        </nav>
        <button
          class="directory-trigger"
          aria-haspopup="dialog"
          aria-controls="apps-and-cv"
          onClick={() => {
            setMenuOpen(false);
            directory.showModal();
          }}
        >
          <span aria-hidden="true">▦</span> Apps & CV
        </button>
        <a class="header-contact" href="#contact">
          Let’s talk <span aria-hidden="true">↗</span>
        </a>
        <button
          class="menu-toggle"
          aria-expanded={menuOpen()}
          aria-controls="mobile-navigation"
          aria-label={menuOpen() ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen())}
        >
          <span />
          <span />
        </button>
        <Show when={menuOpen()}>
          <nav
            id="mobile-navigation"
            class="mobile-nav"
            aria-label="Mobile navigation"
          >
            <For
              each={[
                ["Work", "work"],
                ["Expertise", "expertise"],
                ["About", "about"],
                ["Let’s talk", "contact"],
              ]}
            >
              {([label, id]) => (
                <a href={`#${id}`} onClick={() => setMenuOpen(false)}>
                  {label}
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </For>
          </nav>
        </Show>
      </header>
      <AppDirectory apps={work} ref={(element) => (directory = element)} />
      <main id="main-content">
        <section class="hero" id="top" aria-labelledby="hero-title">
          <div class="hero-topline">
            <span>
              <span class="status-dot" /> ENGINEER. BUILDER. TECHNICAL LEADER.
            </span>
            <span class="hero-edition">INDEPENDENT MIND. SHARED AMBITION.</span>
          </div>
          <h1 id="hero-title">
            TOMMY LE<span class="hero-period">.</span>
            <span class="name-asterisk" aria-hidden="true">
              ✳
            </span>
          </h1>
          <div class="hero-main">
            <div class="hero-copy">
              <h2>
                Good software.
                <br />
                <span>Built together.</span>
              </h2>
              <p>
                From the first pixel to the last deployment.
                <br />
                Almost a decade connecting interfaces, systems,
                <br class="desktop-break" /> and people to build things that
                matter.
              </p>
              <div class="hero-actions">
                <a class="button button-lime" href="#work">
                  Explore my work <span aria-hidden="true">↘</span>
                </a>
                <a
                  class="hero-cv"
                  href="/pdf/myCV.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View CV <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
            <StackVisual />
          </div>
          <div class="hero-bottom">
            <a href="#work">
              <span class="scroll-line" /> SCROLL TO EXPLORE
            </a>
            <span class="location">
              <span class="netherlands-flag" aria-hidden="true" /> BASED IN THE
              NETHERLANDS <span class="location-time">/ {localTime()}</span>
            </span>
            <span class="hero-index">PORTFOLIO — 2026</span>
          </div>
        </section>
        <section
          class="work-section section-wrap"
          id="work"
          aria-labelledby="work-title"
        >
          <div class="section-kicker reveal">
            <span>01 / SELECTED WORK</span>
            <span>IDEAS, TAKEN INTO THE REAL WORLD.</span>
          </div>
          <div class="section-heading reveal">
            <h2 id="work-title">
              Built with intent<span>.</span>
            </h2>
            <p>
              A few things I’ve built to solve real problems.
              <br />
              From learning tools to everyday utilities.
            </p>
          </div>
          <div
            class="work-filters reveal"
            role="group"
            aria-label="Filter projects"
          >
            <For each={["All projects", "Tools", "Learning"]}>
              {(category) => (
                <button
                  aria-pressed={filter() === category}
                  classList={{ selected: filter() === category }}
                  onClick={() => setFilter(category)}
                >
                  {category}
                  <span>
                    {String(
                      work.filter(
                        (project) =>
                          category === "All projects" ||
                          project.category === category,
                      ).length,
                    ).padStart(2, "0")}
                  </span>
                </button>
              )}
            </For>
            <span class="filter-note">
              A SMALL SELECTION OF SIDE PROJECTS ↙
            </span>
          </div>
          <div class="projects-grid" aria-live="polite" aria-atomic="true">
            <For
              each={work.filter(
                (project) =>
                  filter() === "All projects" || project.category === filter(),
              )}
            >
              {(project) => (
                <article class={`project project-${project.kind}`}>
                  <a
                    class="project-visual-link"
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.name} (new tab)`}
                  >
                    <ProjectVisual kind={project.kind} />
                    <span class="project-open">↗</span>
                  </a>
                  <div class="project-info">
                    <span class="project-number">/{project.number}</span>
                    <div>
                      <span class="project-category">{project.label}</span>
                      <h3>
                        <a
                          href={project.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {project.name}
                          <span aria-hidden="true">↗</span>
                        </a>
                      </h3>
                      <p>{project.description}</p>
                      <span class="project-stack">{project.stack}</span>
                      <Show when={project.repository}>
                        {(repository) => (
                          <a
                            class="project-source"
                            href={repository()}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View on GitHub <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </Show>
                    </div>
                  </div>
                </article>
              )}
            </For>
          </div>
          <a
            class="text-link github-more"
            href="https://github.com/WolfCanCode"
            target="_blank"
            rel="noopener noreferrer"
          >
            More experiments on GitHub <span aria-hidden="true">↗</span>
          </a>
        </section>
        <section
          class="expertise-section"
          id="expertise"
          aria-labelledby="expertise-title"
        >
          <div class="section-wrap">
            <div class="section-kicker reveal">
              <span>02 / THE FULL PICTURE</span>
              <span>DEPTH IN THE DETAILS. RANGE IN THE WORK.</span>
            </div>
            <div class="expertise-intro reveal">
              <h2 id="expertise-title">
                Beyond
                <br />
                the frontend<span>.</span>
              </h2>
              <div>
                <span class="small-cross" aria-hidden="true">
                  ✳
                </span>
                <p>
                  Great products don’t stop at the interface.
                  <br />
                  Neither do I.
                </p>
              </div>
            </div>
            <div class="expertise-list">
              <For each={expertise}>
                {(item) => (
                  <article class="expertise-row reveal">
                    <span class="expertise-number">/{item.number}</span>
                    <div class="expertise-name">
                      <h3>{item.title}</h3>
                      <p>{item.subtitle}</p>
                    </div>
                    <div class="expertise-description">
                      <p>{item.description}</p>
                      <span>{item.tech}</span>
                    </div>
                    <span class="expertise-symbol" aria-hidden="true">
                      {item.symbol}
                    </span>
                  </article>
                )}
              </For>
            </div>
          </div>
        </section>
        <section
          class="about-section section-wrap"
          id="about"
          aria-labelledby="about-title"
        >
          <div class="section-kicker reveal">
            <span>03 / THE PERSON BEHIND THE CODE</span>
            <span>CURIOUS BY DEFAULT.</span>
          </div>
          <div class="about-layout">
            <div class="about-portrait reveal">
              <div class="portrait-stamp">
                ALMOST A DECADE
                <br />
                <strong>Still curious.</strong>
              </div>
              <img
                src="/images/tommy-circle.png"
                alt="Illustrated portrait of Tommy Le"
                width="400"
                height="400"
                loading="lazy"
              />
              <div class="portrait-caption">
                <span>TOMMY LE</span>
                <span>AKA WOLFCANCODE ↗</span>
              </div>
            </div>
            <div class="about-copy reveal">
              <h2 id="about-title">
                Serious about craft.
                <br />
                <span>Human about it.</span>
              </h2>
              <p>
                I’m Tommy, a developer and technical leader based in the
                Netherlands. I care about the details you see, the systems you
                don’t, and the people who bring it all together.
              </p>
              <p>
                My work spans frontend, backend, and infrastructure. I’ve built
                for startups and enterprises, shaped UI libraries, and mentored
                engineers. For me, a good technical decision makes both the
                product and the team better.
              </p>
              <div class="current-role">
                <span class="status-dot" />
                <span>
                  Engineering at <strong>Swisscom</strong>
                </span>
              </div>
              <a
                class="text-link"
                href="/pdf/myCV.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                The longer story — my CV <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <aside class="now-building reveal">
            <div>
              <span class="section-kicker">ON MY WORKBENCH</span>
              <h3>
                Exploring what’s next<span aria-hidden="true">↗</span>
              </h3>
            </div>
            <p>
              Currently exploring agents, MCP, and code intelligence through{" "}
              <strong>CIH — Codebase Intelligence Hub</strong>. Building tools
              that help developers understand and work with complex codebases.
            </p>
            <a
              href="https://github.com/WolfCanCode"
              target="_blank"
              rel="noopener noreferrer"
              class="now-link"
              aria-label="Follow Tommy’s work on GitHub"
            >
              ↗
            </a>
          </aside>
        </section>
        <section
          class="contact-section"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div class="section-wrap">
            <div class="section-kicker reveal">
              <span>04 / WHAT’S NEXT?</span>
              <span>GOOD THINGS START WITH A CONVERSATION.</span>
            </div>
            <div class="contact-top reveal">
              <h2 id="contact-title">
                Let’s build
                <br />
                something <em>good.</em>
                <span aria-hidden="true">↗</span>
              </h2>
              <div class="contact-copy">
                <p>
                  A challenging product. A team to grow.
                  <br />
                  An idea worth exploring.
                  <br />
                  I’d love to hear about it.
                </p>
                <a
                  class="button button-lime"
                  href="https://www.linkedin.com/in/wolfcancode/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start a conversation <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
            <div class="contact-socials">
              <a
                href="https://github.com/WolfCanCode"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗
              </a>
              <a
                href="https://www.linkedin.com/in/wolfcancode/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn ↗
              </a>
              <a href="/pdf/myCV.pdf" target="_blank" rel="noopener noreferrer">
                View CV ↗
              </a>
            </div>
            <aside class="beyond-jira" aria-labelledby="beyond-jira-title">
              <div>
                <span class="beyond-jira-label">MY TECH PAGE</span>
                <h3 id="beyond-jira-title">Beyond Jira</h3>
              </div>
              <div class="contact-socials">
                <a
                  href="https://www.facebook.com/profile.php?id=61590142515797"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Beyond Jira on Facebook"
                >
                  Facebook <span aria-hidden="true">↗</span>
                </a>
                <a
                  href="https://www.instagram.com/beyondjira/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Beyond Jira on Instagram"
                >
                  Instagram <span aria-hidden="true">↗</span>
                </a>
              </div>
            </aside>
            <footer class="site-footer">
              <span>© {new Date().getFullYear()} TOMMY LE</span>
              <a href="/playground">
                Visit the experimental desktop <span aria-hidden="true">↗</span>
              </a>
              <a href="#top">BACK TO TOP ↑</a>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
