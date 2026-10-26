# Portfolio redesign implementation plan

**Goal:** Introduce Tommy's experience and work through a responsive, distinctive portfolio.

**Architecture:** Replace the home route with an editorial Solid page. Isolate decorative visual components and portfolio data, and scope new CSS to avoid breaking the retained desktop route.

**Tech stack:** SolidStart, SolidJS, TypeScript, CSS, existing Vitest suite.

- [x] Preserve the existing homepage at `src/routes/playground.tsx` and confirm relative imports remain valid.
- [x] Create `src/components/portfolio/StackVisual.tsx` for an accessible decorative SVG and `ProjectVisual.tsx` for explicitly illustrative project artwork.
- [x] Implement `src/routes/index.tsx`: navigation, hero, filtered work, expertise, about, contact; use existing project and profile links.
- [x] Create `src/portfolio.css`: typography, color, layout, motion and responsive rules; import it only through the portfolio route.
- [x] Refresh `src/app.tsx` metadata and `public/manifest.json` branding.
- [x] Run `npm test` and `npm run build`; inspect browser desktop/mobile layouts and interactions.
- [x] Review the final diff and graph impact; record verification and any limitations.

## Added directory request

- [x] Native dialog directory includes Tommy PDF, Course Trainer, Interview Trainer, the CV, About Tommy, and Playground.
- [x] Header trigger works on desktop and mobile; the hero also links directly to the CV.

## Verification results

- `npm test`: 2 tests passed. Vitest aligned to 3.2.7 because version 5 was incompatible with the existing Vite 6.3 toolchain. Both lockfiles updated.
- `npm run build`: production build passed. Existing client-entry export warning remains.
- Browser: 21 interaction/layout checks passed, including directory contents and focus restoration, mobile navigation and resizing, all project filters, CV HTTP 200, Playground route, and no horizontal document overflow at 320/390/768/1440px.
- Visual review: desktop, mobile, directory, and full-page screenshots saved under `output/playwright/`.
- Review findings addressed: mobile navigation hidden above its breakpoint and informational metadata contrast increased.

## Noevyra and Codryn additions

- [x] Added both projects to selected work, the Tools filter, and Apps & CV, using their existing repository branding.
- [x] GitHub API verified canonical public repositories: WolfCanCode/NoevyraYourPersonalBrain and WolfCanCode/Codryn. Descriptions and technology lists were taken from their local README files.
- [x] Project and category counts derive from the project data: five total, three Tools, two Learning.
- [x] Browser verified five directory entries, both repository links, filter results, and 320/390/768/1440px layouts. Unit tests and production build passed.

## Trainer artwork update

- [x] Replaced Course Trainer and Interview Trainer interface mockups with logo-led artwork using the existing app images.
- [x] Standardized project rows to the image-left/details-right treatment in the supplied reference; mobile layouts stack images above details.
- [x] Removed unused mock-interface CSS rules. Browser checks passed for images, Learning filtering, desktop alignment, mobile stacking, and 320/390/768px overflow. Production build passed.

## My PDF artwork and naming

- [x] Corrected the display name to My PDF in the portfolio and directory.
- [x] Replaced the paper mockup with the existing PDF app icon and shared branded artwork composition.
- [x] Retained the live app URL and added a separate source link to the verified public repository `WolfCanCode/my-pdf`.
- [x] Browser verified name, directory entry, image loading, both links, and 320/390/768px layouts. Production build and diff whitespace checks passed.

## Beyond Jira social links

- [x] Added a Beyond Jira tech-page block to the contact section with the supplied Facebook and Instagram URLs.
- [x] Links use descriptive accessible names and open in new tabs with noopener/noreferrer.
- [x] Browser verified URLs, external-link attributes, and 320/390/1440px layouts. Production build passed.
