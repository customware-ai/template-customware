import type { ReactElement } from "react";
import { Outlet } from "speedy-router";

import { AppProviders } from "~/components/app-providers";
import { Toaster } from "~/components/ui/toast";

export default function MainLayout(): ReactElement {
  return (
    <AppProviders>
      <div className="min-h-screen bg-background text-foreground">
        {/* Only add a sidebar here if there is a genuine, product-level need. Do not add one by default. */}
        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </AppProviders>
  );
}
