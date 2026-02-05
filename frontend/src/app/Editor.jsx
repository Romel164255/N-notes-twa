import { useEffect, useState } from "react";

export default function Editor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note?.id]);

  function handleSave() {
    onSave({ title, content });
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <input
        placeholder="Headline"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />

      <textarea
        placeholder="Write your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        style={{ width: "100%", marginBottom: 8 }}
      />

      <button onClick={handleSave}>Save</button>
      {note && <button onClick={onCancel}>Cancel</button>}
    </div>
  );
}
