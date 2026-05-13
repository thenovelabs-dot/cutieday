import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "cutieday",
  brand: {
    displayName: "오늘도 귀여웠어",
    primaryColor: "#3182F6",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
