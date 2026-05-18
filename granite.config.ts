import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "cutie-day",
  brand: {
    displayName: "오늘도 귀여웠어",
    primaryColor: "#3182F6",
    icon: "",
  },
  web: {
    host: "0.0.0.0",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
