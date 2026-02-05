import { useEffect } from "react";
import "./ThemeToggle.css";

export default function ThemeToggle({ isDark, onToggle }) {
  useEffect(() => {
    // Optional favicon swap
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      favicon.href = isDark
        ? "/assets/favicon-dark.svg"
        : "/assets/favicon.svg";
    }
  }, [isDark]);

  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={isDark}
        onChange={() => onToggle(!isDark)}
      />
      <span className="slider round"></span>
    </label>
  );
}
