import { Capacitor } from "@capacitor/core";

let Preferences;

// Lazy import ONLY on native
async function getPreferences() {
  if (!Preferences) {
    const mod = await import("@capacitor/preferences");
    Preferences = mod.Preferences;
  }
  return Preferences;
}

export const Storage = {
  async get(key) {
    if (Capacitor.isNativePlatform()) {
      const prefs = await getPreferences();
      const { value } = await prefs.get({ key });
      return value;
    }
    return localStorage.getItem(key);
  },

  async set(key, value) {
    if (Capacitor.isNativePlatform()) {
      const prefs = await getPreferences();
      await prefs.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },

  async remove(key) {
    if (Capacitor.isNativePlatform()) {
      const prefs = await getPreferences();
      await prefs.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },
};
