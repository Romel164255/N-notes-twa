import { dbPromise } from '../db/indexedDb';
import { Token } from '../auth/token';

export async function pushNotes() {
  const db = await dbPromise;
  const dirty = await db.getAllFromIndex('notes', 'dirty', true);
  const token = await Token.get();

  for (const note of dirty) {
    await fetch('https://api.yourdomain.com/api/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: note.id,
        updatedAt: note.updatedAt,
        payload: note, // encrypted
      })
    });

    note.dirty = false;
    await db.put('notes', note);
  }
}
