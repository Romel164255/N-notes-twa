import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";

export async function login() {
  // Open browser for OAuth
  await Browser.open({
    url: "https://n-notes.onrender.com/auth/google?client=apk",
    presentationStyle: "popover", // Makes it clear it's a temporary overlay
  });

  // Listen for the app to resume (after OAuth redirect)
  App.addListener("appUrlOpen", async () => {
    // Close the browser when we detect the deep link
    await Browser.close();
    
    // Force reload to pick up the new session
    window.location.reload();
  });
}