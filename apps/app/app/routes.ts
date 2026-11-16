import { createRootRoute, createRoute, createRouter, lazyRouteComponent } from "speedy-router";

import { InitialLoadingState } from "./components/initial-loading-state";
import { App, NotFound, RouteError } from "./root";

const rootRoute = createRootRoute({
  component: App,
  errorComponent: RouteError,
  notFoundComponent: NotFound,
});
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "main",
  // Data and notification providers are only required by application pages.
  component: lazyRouteComponent(() => import("./layouts/MainLayout")),
});
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  // PERF: keep the start page's UI kit, data client and form validation out of the entry chunk.
  component: lazyRouteComponent(() => import("./routes/index")),
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([layoutRoute.addChildren([indexRoute])]),
  defaultPendingComponent: InitialLoadingState,
  defaultPendingMs: 0,
});

declare module "speedy-router" {
  interface Register {
    router: typeof router;
  }
}
