import { getKey } from './keyManager';

export async function encrypt(text) {
  if (!text) return null;

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(text)
  );

  return `${btoa(String.fromCharCode(...iv))}.${btoa(
    String.fromCharCode(...new Uint8Array(encrypted))
  )}`;
}

export async function decrypt(payload) {
  if (!payload) return '';

  const [ivB64, dataB64] = payload.split('.');
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0));
  const key = await getKey();

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
}
