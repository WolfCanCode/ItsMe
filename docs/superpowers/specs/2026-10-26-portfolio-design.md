# Tommy Le portfolio redesign

## Direction
An editorial engineering portfolio with oversized typography, warm white, ink black, and electric lime. A custom connected-path graphic represents the connection between frontend, backend, infrastructure, and people. The first viewport introduces Tommy immediately and points to his work.

## Content
Use facts from the existing portfolio and the owner's brief: almost ten years of experience, Netherlands based, strong frontend/backend/DevOps and leadership. Preserve Swisscom context, three published side projects, the CV, GitHub and LinkedIn. Do not invent employers, performance metrics, testimonials, email addresses, or availability. Describe CIH as an ongoing project, not a finished product.

## Structure and behavior
Sticky navigation with an Apps & CV native dialog directory listing all three published apps, CV, About, and Playground; hero with direct CV link; selected work with All/Learning/Tools filters; four expertise rows; about and current exploration; contact footer. External links open safely in new tabs; CV opens the existing PDF. Mobile navigation closes on selection and Escape. Native anchor links work without JavaScript. Reduced motion disables animation. Progressive scroll reveals must not hide content if JavaScript is unavailable.

## Integration
Keep SolidStart and Solid. Preserve the former desktop homepage at /playground and its existing styles. Scope new styling beneath .portfolio. Refresh homepage metadata and the manifest brand description. Keep implementation local in this existing repository.

## Verification
Run existing tests and a production build. Inspect wide and narrow browser screenshots; exercise filters, mobile navigation, anchor links, CV and Playground. Check overflow, browser errors, keyboard access and reduced motion.
