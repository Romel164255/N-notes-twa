import React from "react";
import ReactDOM from "react-dom/client";

import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";

import "./index.css";
import "./App.css";

import App from "./app/App";
import { Token } from "./auth/token";

// 👇 THIS is what makes Chrome disappear
CapacitorApp.addListener("appUrlOpen", async ({ url }) => {
  if (!url) return;

  try {
    const parsed = new URL(url);
    const token = parsed.searchParams.get("token");

    if (token) {
      await Token.set(token);
      await Browser.close(); // 🔥 closes Chrome
    }
  } catch (e) {
    console.error("Invalid URL", e);
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
