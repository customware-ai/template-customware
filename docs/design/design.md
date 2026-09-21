# Design and User Experience

Read this before changing user-facing code. Poor UX is a functional defect.

## Design System

- Use the shadcn components under `apps/app/app/components/ui`, generated with the Base Nova style.
- Components use Base UI primitives for accessible behavior and Tailwind CSS v4 for styling.
- Add or refresh components with the shadcn CLI so `components.json`, dependencies, and CSS stay aligned; do not hand-port components from an older Radix registry.
- Reuse the existing CSS variables, component variants, spacing, and typography before adding local values.
- Use composition over configuration and keep one-use page composition with its owning route.
- Keep props typed and preserve the existing light and dark themes.

## Loading and Pending States

- Never leave a blank area while requested data is unavailable. Render a skeleton or appropriately sized progress state.
- Use `HydrateFallback` when a route needs visible SPA hydration feedback.
- Disable a submitting control and show its pending state. The shared `Button` supports `loading`.
- Do not replace already available cached data with a loading skeleton during a background refresh.
- Use optimistic UI when the result is predictable and rollback or reconcile it with the authoritative response.

## Error Feedback

- Translate technical failures into concise, actionable language.
- Offer retry when the operation is recoverable.
- Preserve usable cached data when refreshing it fails and clearly indicate when it is stale.
- Route modules should export an `ErrorBoundary` when they own a meaningful failure surface.
- Never show raw stacks, database errors, or internal identifiers to users.

## Responsive Layout

- Build mobile-first and add wider breakpoints only when content needs them.
- Interactive targets must be at least 44 by 44 CSS pixels.
- Replace wide tables with an appropriate compact or card presentation on narrow screens.
- Verify layouts at narrow and wide viewport sizes through the running application.

## Progressive Disclosure

- Show the primary information and actions first.
- Reveal advanced or infrequently used controls only when requested.
- Use an accessible disclosure, dialog, sheet, or a dedicated route according to the amount and importance of the content.

## Motion

- Motion must provide feedback, guide attention, or preserve spatial continuity; never add it only as decoration.
- Keep ordinary hover and press feedback brief.
- Use React Router view transitions only when they clarify a navigation change.
- Respect `prefers-reduced-motion`; the experience must remain complete without animation.

## React Components

- Use functional components with typed props and explicit return types.
- Prefer semantic HTML and preserve keyboard, focus, screen-reader, and contrast behavior.
- Reuse shared UI primitives for repeated behavior. Keep one-use visual composition local.
- Route modules coordinate rendering and typed client operations; reusable components do not own route or persistence logic.

## Definition of Done

- Loading, pending, success, empty, and error states required by the changed flow are understandable.
- Keyboard and visible-focus behavior work.
- Light and dark themes retain readable contrast.
- Narrow and wide layouts work without clipped or unreachable content.
- Reduced-motion users receive the same information and capabilities.
