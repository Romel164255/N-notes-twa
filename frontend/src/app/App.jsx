import { useEffect, useState } from "react";
import Home from "./Home.jsx";

export default function App() {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") !== "light"
  );

  const [user, setUser] = useState(null);
  const API = import.meta.env.VITE_API_URL;

  /* ---------------- THEME ---------------- */
  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  /* ---------------- AUTH CHECK ---------------- */
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(`${API}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.loggedIn) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    }

    loadUser();
  }, [API]);

  /* ---------------- DEVICE SYNC ---------------- */
  useEffect(() => {
    if (!user) return;

    fetch(`${API}/api/device`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: "web", // android later via Capacitor
        model: navigator.userAgent,
        os: navigator.platform,
        appVersion: "1.0.0",
      }),
    }).catch(() => {});
  }, [user, API]);

  /* ---------------- LOGOUT ---------------- */
  async function logout() {
    await fetch(`${API}/auth/logout`, {
      credentials: "include",
    });
    setUser(null);
  }

  return (
    <div className={`app-container ${isDark ? "dark" : "light"}`}>
      <Home
        user={user}
        onLogout={logout}
        onThemeToggle={setIsDark}
        isDark={isDark}
      />
    </div>
  );
}
