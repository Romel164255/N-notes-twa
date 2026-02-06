// Platform detection helper
const isNative = () => {
  return (
    typeof window !== "undefined" &&
    window.Capacitor?.isNativePlatform?.()
  );
};

export async function login() {
  const API = import.meta.env.VITE_API_URL;

  // 📱 MOBILE: Use in-app browser with deep linking
  if (isNative()) {
    try {
      const { Browser } = await import("@capacitor/browser");
      const { App } = await import("@capacitor/app");

      // Open browser for OAuth
      await Browser.open({
        url: `${API}/auth/google?client=apk`,
        presentationStyle: "popover",
      });

      // Listen for the app to resume (after OAuth redirect)
      App.addListener("appUrlOpen", async () => {
        // Close the browser when we detect the deep link
        await Browser.close();

        // Force reload to pick up the new session
        window.location.reload();
      });
    } catch (error) {
      console.error("Error during mobile login:", error);
    }
  } 
  // 🌐 WEB: Standard OAuth flow
  else {
    window.location.href = `${API}/auth/google?client=web`;
  }
}