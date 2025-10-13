# RobotNik Website

Static marketing site for RobotNik's autonomous weeding platform. The page showcases the
problem, solution, technology pillars, ROI calculator, and lead capture form.

## Getting Started

```bash
npm install
npm run dev
```

Vite will start the local dev server and hot-reload changes to HTML, CSS, or JavaScript.

## Building & Previewing

```bash
npm run build
npm run preview
```

The build step outputs an optimized bundle to `dist/`. The preview command serves that bundle
so you can double-check production assets before deploying.

## ROI Calculator Assumptions

The ROI widget draws on the constants defined in `js/main.js`. Update those values whenever
business inputs (wages, robot capacity, or hardware price) change. Any update should be paired
with a quick smoke test of the calculator to confirm formatting and payback math still behave
as expected.

## Contact Form

The contact form is wired for static hosts that support Netlify-style form handling. If you are
using a different host, set the form's `action` attribute or replace the submission logic in
`js/main.js` so that leads are delivered to your CRM or email inbox. The status message in the
form will surface success or failure to the visitor.

## Coding Standards

- Source files target modern evergreen browsers and use vanilla JavaScript.
- CSS lives in `css/styles.css` and follows a variable-driven palette with responsive breakpoints.
- Keep bundle size lean; prefer assets from `images/` and audit third-party scripts before adding
  them.
