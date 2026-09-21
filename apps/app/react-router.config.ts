import type { Config } from "@react-router/dev/config";

export default {
  buildDirectory: "../../build",
  ssr: false,
  future: {
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
