import { storage } from "./storage";

export const Token = {
  async get() {
    return await storage.get("token");
  },

  async set(token) {
    await storage.set("token", token);
  },

  async clear() {
    await storage.remove("token");
  },
};
