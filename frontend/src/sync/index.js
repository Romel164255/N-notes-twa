import { pushNotes } from "./push";
import { pullNotes } from "./pull";

let syncing = false;

export async function runSync() {
  if (syncing || !navigator.onLine) return;
  syncing = true;

  try {
    await pushNotes();
    await pullNotes();
  } catch (err) {
    console.warn("Sync error:", err.message);
  } finally {
    syncing = false;
  }
}

export function startBackgroundSync() {
  runSync();

  setInterval(runSync, 30_000);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      runSync();
    }
  });

  window.addEventListener("online", runSync);
}
