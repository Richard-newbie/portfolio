# Festus Labs

The application entry is `src/App.tsx`. Page composition lives in `src/Studio.tsx`, editable content in `src/data.ts`, and visual styling in `src/index.css`.

## Original Portrait

The supplied chat portrait was not exposed as a file in this project. No substitute person or generated portrait is used. The About section's "Add original portrait" button accepts a real photograph and immediately integrates it into both the hero and About section. The image is resized locally and saved only in the current browser.

For a permanent deployment, place the original photograph in `public/images/oluwatobi-festus.jpg` and set `studio.portraitUrl` in `src/data.ts` to `/images/oluwatobi-festus.jpg`. This will make the original portrait available to every visitor.

## Contact

No recipient address or submission service was provided. The form validates the visitor's details, prepares a project brief, and supports copy and download. It explicitly states that no message has been sent. Set `studio.email` in `src/data.ts` to the verified contact address to also enable an email link and a populated email draft. No address is guessed and no data is submitted to an external service.

## Honest Content

All four portfolio entries are visibly marked as independent concept studies. The workflow is a local simulation. Voice playback is a scripted Web Speech preview and never accesses the microphone. The creative study presents generated stills as a storyboard, not a completed commercial. Replace the entries in `projects` with verified work as it becomes available.

`testimonials` is deliberately empty. Adding permissioned entries with `quote`, `name`, and `role` enables the spatial testimonial carousel. No testimonials, metrics, clients, or professional achievements have been invented.

## Motion And Performance

The hero uses a real Three.js scene with textured browser, workflow, and voice surfaces. Camera position responds to scrolling. Rendering pauses when the scene is offscreen or the tab is hidden. Mobile rendering uses a simplified scene and lower pixel density. A static fallback remains available if WebGL is unavailable.

The site respects the system reduced motion preference and provides a persistent motion toggle in the footer. Project overlays use a native dialog for focus containment, Escape handling, and focus restoration.