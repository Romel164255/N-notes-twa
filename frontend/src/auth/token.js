import { Storage } from "./storage";

export const Token = {
  async get() {
    return await Storage.get("token");
  },

  async set(token) {
    await Storage.set("token", token);
  },

  async clear() {
    await Storage.remove("token");
  },
};
