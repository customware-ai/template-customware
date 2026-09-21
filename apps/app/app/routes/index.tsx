import { lazy, Suspense, type ReactElement } from "react";

import { InitialLoadingState } from "~/components/initial-loading-state";

// Potentially large route/demo surfaces should be lazy imported. This keeps the
// initial route chunk small and makes Vite's 200 kB chunk warning meaningful.
const Demo = lazy(() => import("~/components/Demo"));

/**
 * Reference-only mount for the shipped shadcn demo surface.
 *
 * IMPORTANT:
 * Delete this component mount before implementing the real product task flow.
 * It exists only as a code/reference catalog for the shipped shadcn components.
 */
export default function IndexPage(): ReactElement {
  return (
    <>
      {/*
        REFERENCE ONLY:
        This Demo mount exists only to expose the shipped shadcn component set for code reference.
        Delete <Demo /> before implementing the actual product task flow on the index page.
      */}
      <Suspense fallback={<InitialLoadingState />}>
        <Demo />
      </Suspense>
    </>
  );
}
