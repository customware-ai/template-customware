import { describe, expect, it } from "vite-plus/test";

import { DEFAULT_SERVER_PORT, resolveServerPort } from "../../../apps/api/src/utils/env.js";

describe("resolveServerPort", () => {
  it("returns the configured PORT when it is valid", () => {
    const port = resolveServerPort({ PORT: "9090" });

    expect(port).toBe(9090);
  });

  it("falls back to the default port when PORT is missing", () => {
    const port = resolveServerPort({});

    expect(port).toBe(DEFAULT_SERVER_PORT);
  });

  it("falls back to the default port when PORT is invalid", () => {
    const port = resolveServerPort({ PORT: "70000" });

    expect(port).toBe(DEFAULT_SERVER_PORT);
  });
});
