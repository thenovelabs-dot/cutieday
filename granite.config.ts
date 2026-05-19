import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "cutie-day",
  brand: {
    displayName: "오늘도 귀여웠어",
    primaryColor: "#3182F6",
    icon: "https://static.toss.im/appsintoss/24603/64923408-c68e-4402-8156-c20d7507cb04.png",
  },
  web: {
    host: "0.0.0.0",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  navigationBar: {
    withBackButton: true,
  },
  permissions: [],
  outdir: "dist",
});
