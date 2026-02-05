import { Browser } from '@capacitor/browser';
import { Token } from './token';

export async function login() {
  await Browser.open({
    url: 'https://api.yourdomain.com/auth/google'
  });
}

window.handleAuthCallback = async (token) => {
  await Token.set(token);
};
