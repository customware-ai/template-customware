import { cn } from "cn";
import { Loader2Icon } from "lucide-react";
import type * as React from "react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">): React.ReactElement {
  return (
    <output aria-label="Loading">
      <Loader2Icon
        data-slot="spinner"
        className={cn("size-4 animate-spin", className)}
        {...props}
      />
    </output>
  );
}

export { Spinner };
