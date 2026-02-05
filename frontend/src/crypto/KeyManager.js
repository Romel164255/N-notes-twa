const KEY_NAME = 'notes-key';

export async function getKey() {
  let raw = localStorage.getItem(KEY_NAME);

  if (!raw) {
    const key = crypto.getRandomValues(new Uint8Array(32));
    raw = Array.from(key).map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(KEY_NAME, raw);
  }

  return crypto.subtle.importKey(
    'raw',
    Uint8Array.from(raw.match(/.{2}/g).map(b => parseInt(b, 16))),
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  );
}
