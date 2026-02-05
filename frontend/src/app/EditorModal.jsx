import { useEffect, useRef, useState } from "react";
import { db } from "../db/adapter";

export default function EditorModal({ note, onAutoClose }) {
  const overlayRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [fullscreenUrl, setFullscreenUrl] = useState(null);

  /* -----------------------------
     Load note + existing image
  ----------------------------- */
  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");

    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    setRemoveImage(false);
    setFullscreenUrl(null);

    let objectUrl;

    async function loadImage() {
      if (!note?.imageId) return;

      const img = await db.getImage(note.imageId);
      if (!img) return;

      objectUrl = URL.createObjectURL(
        new Blob([img.blob], { type: img.type })
      );
      setExistingImageUrl(objectUrl);
    }

    loadImage();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [note?.id]);

  /* -----------------------------
     Image picker
  ----------------------------- */
  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  /* -----------------------------
     Auto save / discard
  ----------------------------- */
  function handleClose() {
    const hasContent =
      title.trim() ||
      content.trim() ||
      imageFile ||
      existingImageUrl;

    if (!note?.id && !hasContent) {
      onAutoClose({ title: "", content: "" });
      return;
    }

    onAutoClose({
      title,
      content,
      imageFile,
      removeImage,
    });
  }

  return (
    <>
      {/* ---------- EDITOR OVERLAY ---------- */}
      <div
        ref={overlayRef}
        className="editor-overlay"
        onMouseDown={(e) => {
          if (e.target === overlayRef.current) {
            handleClose();
          }
        }}
      >
        <div
          className="editor-popup"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* TITLE */}
          <input
            className="headline-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          {/* CONTENT */}
          <textarea
            className="content-input"
            placeholder="Write your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />

          {/* IMAGE PICKER */}
          <label className="image-picker">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageSelect}
            />
            Add image
          </label>

          {/* IMAGE PREVIEW */}
          {(imagePreview || existingImageUrl) && (
            <>
              <img
                src={imagePreview || existingImageUrl}
                className="editor-image-preview"
                onClick={(e) => {
                  e.stopPropagation(); // 🚫 critical
                  setFullscreenUrl(
                    imagePreview || existingImageUrl
                  );
                }}
              />

              <button
                className="delete-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageFile(null);
                  setImagePreview(null);
                  setExistingImageUrl(null);
                  setRemoveImage(true);
                }}
              >
                Remove image
              </button>
            </>
          )}
        </div>
      </div>

      {/* ---------- FULLSCREEN IMAGE ---------- */}
      {fullscreenUrl && (
        <div
          className="image-fullscreen"
          onClick={() => setFullscreenUrl(null)}
        >
          <button
            className="close-btn"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenUrl(null);
            }}
          >
            ✕
          </button>

          <img
            src={fullscreenUrl}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
