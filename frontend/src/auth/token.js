import { Preferences } from '@capacitor/preferences';

export const Token = {
  async set(token) {
    await Preferences.set({ key: 'jwt', value: token });
  },
  async get() {
    return (await Preferences.get({ key: 'jwt' })).value;
  },
  async clear() {
    await Preferences.remove({ key: 'jwt' });
  }
};
