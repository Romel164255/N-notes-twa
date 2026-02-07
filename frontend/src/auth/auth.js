export function login() {
  const API = import.meta.env.VITE_API_URL;

  // ✅ TWA-safe OAuth
  // Must stay on SAME domain
  window.location.href = `${API}/auth/google`;
}
