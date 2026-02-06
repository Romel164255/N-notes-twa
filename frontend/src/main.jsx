import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import "./App.css";

import App from "./app/App";

/**
 * 🔐 Native-only deep link handling
 * No Capacitor imports — uses injected global
 */  
if (typeof window !== "undefined") {
  const cap = window.Capacitor;

  if (cap?.isNativePlatform?.()) {
    // Listen for deep link from OAuth callback
    cap.Plugins?.App?.addListener?.("appUrlOpen", async ({ url }) => {
      console.log("Deep link received:", url);
      
      if (!url) return;

      try {
        // Close the browser if it's still open
        await cap.Plugins?.Browser?.close?.();
        
        // If it's the OAuth callback, reload to pick up the session
        if (url.includes("oauth-callback")) {
          window.location.reload();
        }
      } catch (err) {
        console.error("Error handling deep link", err);
      }
    });
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);