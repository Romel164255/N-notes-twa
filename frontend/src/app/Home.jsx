import { useEffect, useState } from "react";
import {
  createNote,
  getAllNotes,
  updateNote,
  softDeleteNote,
} from "../db/notesRepo";

import NotesList from "./NotesList";
import EditorModal from "./EditorModal";
import FloatingAdd from "./FloatingAdd";
import ThemeToggle from "../ui/ThemeToggle";

export default function Home({
  user,
  onLogout,
  onThemeToggle,
  isDark,
}) {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const API = import.meta.env.VITE_API_URL;

  /* ---------------- LOGIN ---------------- */
  function login() {
    window.location.href = `${API}/auth/google`;
  }

  /* ---------------- LOAD NOTES ---------------- */
  useEffect(() => {
    if (!user) return;
    getAllNotes().then(setNotes);
  }, [user]);

  /* ---------------- PIN TOGGLE ---------------- */
  async function handleTogglePin(id) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned } : n
      )
    );

    const note = notes.find((n) => n.id === id);
    if (note) {
      await updateNote(id, { pinned: !note.pinned });
    }
  }

  /* ---------------- SAVE / UPDATE ---------------- */
  async function handleAutoClose({
    title,
    content,
    imageFile,
    removeImage,
  }) {
    if (!editingNote?.id) {
      const note = await createNote({ title, content, imageFile });
      setNotes((prev) => [note, ...prev]);
    } else {
      const updated = await updateNote(editingNote.id, {
        title,
        content,
        imageFile,
        removeImage,
      });

      setNotes((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      );
    }

    setEditingNote(null);
  }

  /* ---------------- DELETE ---------------- */
  function handleDeleteAnimated(id) {
    setDeletingId(id);
    setTimeout(async () => {
      await softDeleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setDeletingId(null);
    }, 900);
  }

  if (!user) {
    return (
      <div className="auth-screen">
        <h1>N-Notes</h1>
        <p>Local-first notes with sync</p>
        <button onClick={login}>Sign in with Google</button>
      </div>
    );
  }

  const pinnedNotes = notes.filter((n) => n.pinned);
  const normalNotes = notes.filter((n) => !n.pinned);

  return (
    <>
      <div className="top-bar">
        <div className="Main-head">NOTES</div>

        <div className="top-actions">
          <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      {pinnedNotes.length > 0 && (
        <>
          <div className="section-label">Pinned</div>
          <div className="notes-grid">
            <NotesList
              notes={pinnedNotes}
              deletingId={deletingId}
              onEdit={setEditingNote}
              onDelete={handleDeleteAnimated}
              onTogglePin={handleTogglePin}
            />
          </div>
        </>
      )}

      <div className="section-label">Others</div>
      <div className="notes-grid">
        <NotesList
          notes={normalNotes}
          deletingId={deletingId}
          onEdit={setEditingNote}
          onDelete={handleDeleteAnimated}
          onTogglePin={handleTogglePin}
        />
      </div>

      <FloatingAdd
        onClick={() =>
          setEditingNote({ id: null, title: "", content: "" })
        }
      />

      {editingNote && (
        <EditorModal
          note={editingNote}
          onAutoClose={handleAutoClose}
        />
      )}
    </>
  );
}
