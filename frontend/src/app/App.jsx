import { useEffect, useState } from "react";
import Home from "./Home.jsx";
import { startBackgroundSync } from "./sync";

export default function App() {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") !== "light"
  );

  const [user, setUser] = useState(null);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    startBackgroundSync();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    async function loadUser() {
      const res = await fetch(`${API}/auth/me`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.loggedIn) setUser(data.user);
    }
    loadUser();
  }, [API]);

  useEffect(() => {
    if (!user) return;

    fetch(`${API}/api/device`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: "web",
        model: navigator.userAgent,
        os: navigator.platform,
        appVersion: "1.0.0",
      }),
    }).catch(() => {});
  }, [user, API]);

  async function logout() {
    await fetch(`${API}/auth/logout`, { credentials: "include" });
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
