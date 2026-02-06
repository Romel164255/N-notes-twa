import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import "./App.css";

import App from "./app/App";
import { Token } from "./auth/token";

/**
* 🔐 Native-only deep link handling
* No Capacitor imports — uses injected global
*/
if (typeof window !== "undefined") {
 const cap = window.Capacitor;

 if (cap?.isNativePlatform?.()) {
   cap.Plugins?.App?.addListener?.("appUrlOpen", async ({ url }) => {
     if (!url) return;

     try {
       const parsed = new URL(url);
       const token = parsed.searchParams.get("token");

       if (token) {
         await Token.set(token);

         // Close Chrome Custom Tab if available
         cap.Plugins?.Browser?.close?.();
       }
     } catch (err) {
       console.error("Invalid deep link URL", err);
     }
   });
 }
}

ReactDOM.createRoot(document.getElementById("root")).render(
 <React.StrictMode>
   <App />
 </React.StrictMode>
);

