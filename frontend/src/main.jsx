import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import "./App.css";

import App from "./app/App";

// 👇 Capacitor-only logic (safe for web builds)
if (typeof window !== "undefined") {
  const isCapacitor = window.Capacitor?.isNativePlatform?.();

  if (isCapacitor) {
    (async () => {
      const { App: CapApp } = await import("@capacitor/app");
      const { Browser } = await import("@capacitor/browser");
      const { Token } = await import("./auth/token");

      CapApp.addListener("appUrlOpen", async ({ url }) => {
        if (!url) return;

        try {
          const parsed = new URL(url);
          const token = parsed.searchParams.get("token");

          if (token) {
            await Token.set(token);
            await Browser.close(); // 🔥 closes Chrome
          }
        } catch (err) {
          console.error("Invalid deep link URL", err);
        }
      });
    })();
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
