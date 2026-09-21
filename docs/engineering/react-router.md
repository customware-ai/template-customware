# React Router v7

> **CRITICAL**: This section is the authoritative reference for **client-side routing only**. In this codebase, React Router is used only for navigation, route hierarchy, and route module boundaries on client-side (not as a full-stack data framework).

### Overview

This app uses:

- **React Router v7** for client-side URL matching and navigation
- **Route config in `apps/app/app/routes.ts`** using `@react-router/dev/routes` helpers
- **Route modules in `apps/app/app/routes/*.tsx`** and layouts in `apps/app/app/layouts/*.tsx`
- **tRPC + React Query hooks** inside route modules for typed query/mutation flows

**What this means:**

- React Router guidance here is about `routes.ts`, route modules, and navigation APIs
- Keep routing concerns in `apps/app/app/routes.ts` + route/layout modules
- Route modules orchestrate UI and call `trpc.*.useQuery()` / `trpc.*.useMutation()`

---

### `routes.ts` API (Authoritative)

`apps/app/app/routes.ts` defines the route tree. Prefer helper functions from `@react-router/dev/routes`:

```typescript
import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("layouts/MainLayout.tsx", [
    index("routes/index.tsx"),
    route("customers/new", "routes/customers.new.tsx"),
  ]),
] satisfies RouteConfig;
```

**Primary helpers:**

1. `layout(file, children)` - Defines a layout route that renders an `Outlet`
2. `index(file)` - Defines the default child route at the parent's exact path
3. `route(path, file, children?)` - Defines a path route and optional nested children
4. `prefix(prefixPath, routes)` - Adds a shared URL prefix without a parent route file
5. `relative(directory)` - Builds helper set scoped to another directory when splitting route config

**`routes.ts` rules:**

- Route module file paths are relative to `apps/app/app/`
- Keep route config declarative; avoid runtime conditionals in route definitions
- Use `satisfies RouteConfig` on default export
- Prefer `layout(...)` for shared shells instead of duplicating wrappers across route files

---

### Layout Route Contract

Layout modules (for example, `apps/app/app/layouts/MainLayout.tsx`) should provide shared UI and render children with `Outlet`.

```typescript
import type { ReactElement } from "react";
import { Outlet } from "react-router";

export default function MainLayout(): ReactElement {
  return (
    <main>
      {/* shared nav/header/chrome */}
      <Outlet />
    </main>
  );
}
```

---

### Route Module Exports

Every route module should export:

1. `default` route component (`ReactElement` return type)
2. Optional `ErrorBoundary` for unexpected route rendering/runtime failures
3. Optional metadata exports such as `meta` and `links` when needed

Route modules should keep routing concerns local and use `trpc` hooks for data reads/writes.

---

### Client Navigation APIs

Use these hooks/components for routing concerns in client code:

```typescript
// Declarative navigation
<Link to="/" />
<NavLink to="/customers/new" />

// Imperative navigation
const navigate = useNavigate();
navigate("/customers/new");
navigate(-1);

// Route state
const navigation = useNavigation();
const isNavigating = navigation.state !== "idle";
const params = useParams();
const [searchParams, setSearchParams] = useSearchParams();
const location = useLocation();

// Route-level error boundary helpers
const error = useRouteError();
isRouteErrorResponse(error);
```

Use `useNavigation()` for global transition UI in layouts:

```typescript
import { useNavigation } from "react-router";

function LayoutShell(): ReactElement {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";

  return (
    <div>
      {isNavigating && <div className="h-1 w-full animate-pulse bg-primary" />}
      {/* layout content */}
    </div>
  );
}
```

---

### Essential Hooks Reference

```typescript
// tRPC + React Query (primary data APIs)
trpc.getCustomers.useQuery();
trpc.getCustomerById.useQuery({ id });
trpc.createCustomer.useMutation();
trpc.updateCustomer.useMutation();
trpc.deleteCustomer.useMutation();
trpc.useUtils(); // invalidate/setData/cancel helpers

// React Router hooks (routing/navigation concerns)
useNavigate();
useNavigation();
useParams();
useSearchParams();
useLocation();

// Root/route error handling hooks
useRouteError();
isRouteErrorResponse(error);
```

---

### Data Fetching (Queries)

Use `trpc.*.useQuery()` for route-level reads:

```typescript
import type { ReactElement } from "react";
import { trpc } from "~/lib/trpc";
import { Alert } from "~/components/ui/alert";
import { Skeleton } from "~/components/ui/skeleton";

export default function CustomersPage(): ReactElement {
  const {
    data: customers = [],
    isLoading,
    error,
  } = trpc.getCustomers.useQuery();

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error) {
    return <Alert variant="destructive">{error.message}</Alert>;
  }

  return <div>{customers.length} customer(s)</div>;
}
```

**Query rules:**

- Always render a loading state
- Always render user-facing error feedback
- Keep query logic in route/module UI code, not in `routes.ts`

---

### Mutations (Form Submission)

Use `trpc.*.useMutation()` for route-level writes:

```typescript
import type { FormEvent, ReactElement } from "react";
import { useNavigate } from "react-router";
import { trpc } from "~/lib/trpc";
import { Button } from "~/components/ui/button";
import { Alert } from "~/components/ui/alert";

export default function NewCustomerPage(): ReactElement {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const createCustomer = trpc.createCustomer.useMutation({
    onSuccess: async () => {
      await utils.getCustomers.invalidate();
      void navigate("/");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    createCustomer.mutate({
      company_name: String(formData.get("company_name") || ""),
      email: String(formData.get("email") || "") || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {createCustomer.error && (
        <Alert variant="destructive">{createCustomer.error.message}</Alert>
      )}
      <Button type="submit" loading={createCustomer.isPending}>
        {createCustomer.isPending ? "Creating..." : "Create Customer"}
      </Button>
    </form>
  );
}
```

**Mutation rules:**

- Show pending state on submit controls
- Invalidate related queries on success
- Keep error feedback visible and recoverable

---

### Pending + Optimistic UI

Use query/mutation/navigation state together:

1. Query-level loading: `query.isLoading`
2. Mutation-level pending: `mutation.isPending`
3. Navigation transition: `useNavigation().state`

Optimistic rendering pattern (route-local):

```typescript
const updateTask = trpc.updateTask.useMutation();

let isComplete = task.status === "complete";
if (updateTask.isPending && updateTask.variables?.id === task.id) {
  isComplete = updateTask.variables.status === "complete";
}
```

Robust list-level optimistic update with rollback:

```typescript
const utils = trpc.useUtils();

const deleteCustomer = trpc.deleteCustomer.useMutation({
  onMutate: async ({ id }) => {
    await utils.getCustomers.cancel();
    const previous = utils.getCustomers.getData();

    utils.getCustomers.setData(undefined, (current) => (current ?? []).filter((c) => c.id !== id));

    return { previous };
  },
  onError: (_error, _input, context) => {
    if (context?.previous) {
      utils.getCustomers.setData(undefined, context.previous);
    }
  },
  onSettled: async () => {
    await utils.getCustomers.invalidate();
  },
});
```

---

### Error Boundary Pattern

```typescript
import type { ReactElement } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";

export function ErrorBoundary(): ReactElement {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <div>{error.status} {error.statusText}</div>;
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return <div>{message}</div>;
}
```

---

### Routing Do/Don't

- Do use `layout`, `index`, and `route` helpers in `apps/app/app/routes.ts`
- Do keep navigation logic in route/layout modules with Router hooks
- Do keep route modules focused on rendering, navigation, and `trpc` hook orchestration
- Don't introduce route tree entries outside `apps/app/app/routes.ts`
- Don't import server-only modules into client route/layout files

**Config requirements to keep:**

- `apps/app/react-router.config.ts` enables `future.v8_viteEnvironmentApi: true`
- `apps/app/vite.config.ts` uses Vite 8-compatible settings
