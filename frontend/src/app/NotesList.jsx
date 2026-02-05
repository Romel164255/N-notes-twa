import { useEffect, useRef, useState } from "react";
import { db } from "../db/adapter";

/* Stable color variant */
function getVariantFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 5);
}

/* ---------- Image Preview Component ---------- */

function NoteImage({ imageId }) {
  const [url, setUrl] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl;

    async function load() {
      const img = await db.getImage(imageId);
      if (!img || !active) return;

      objectUrl = URL.createObjectURL(
        new Blob([img.blob], { type: img.type })
      );
      setUrl(objectUrl);
    }

    load();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);

  if (!url) return null;

  return (
    <>
      <img
      src={url}
      className="note-image"
      onClick={(e) => {
      e.stopPropagation(); // prevent opening editor
      }}
    />


      {fullscreen && (
        <div
          className="image-fullscreen"
          onClick={() => setFullscreen(false)}
        >
          <img src={url} />
        </div>
      )}
    </>
  );
}



/* ---------- NOTES LIST ---------- */
export default function NotesList({
  notes,
  onEdit,
  onDelete,
  onTogglePin,
  deletingId,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  /* Close menu on outside click */
  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <>
      {notes.map((note) => (
        <div
          key={note.id}
          className={`note-card variant-${getVariantFromId(note.id)} ${
            deletingId === note.id ? "deleting" : ""
          }`}
          onClick={() => !openMenuId && onEdit(note)}
        >
          {note.pinned && <div className="pin-indicator">📌</div>}

          <h3 className="note-title">{note.title || "Untitled"}</h3>
          <p className="note-body">{note.content}</p>

          {/* 🆕 IMAGE PREVIEW */}
          {note.imageId && <NoteImage imageId={note.imageId} />}

          {/* MENU */}
          <div
            className="note-menu"
            ref={openMenuId === note.id ? menuRef : null}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="dots"
              onClick={() =>
                setOpenMenuId(
                  openMenuId === note.id ? null : note.id
                )
              }
            >
              ⋯
            </button>

            {openMenuId === note.id && (
              <div className="menu-popup">
                <button
                  onClick={() => {
                    onTogglePin(note.id);
                    setOpenMenuId(null);
                  }}
                >
                  {note.pinned ? "Unpin note" : "Pin note"}
                </button>

                <button
                  onClick={() => {
                    onDelete(note.id);
                    setOpenMenuId(null);
                  }}
                >
                  Delete note
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
