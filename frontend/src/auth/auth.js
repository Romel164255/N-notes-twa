import { Browser } from "@capacitor/browser";

export async function login() {
  await Browser.open({
    // 👇 VERY IMPORTANT
    url: "https://n-notes.onrender.com/auth/google?client=apk",
  });
}
