import { getDriveClient } from "./googleDrive";

export async function uploadImage(noteId, blob) {
  const drive = await getDriveClient();

  const res = await drive.files.create({
    requestBody: {
      name: `note-${noteId}.jpg`,
      mimeType: "image/jpeg",
    },
    media: {
      mimeType: "image/jpeg",
      body: blob,
    },
  });

  return res.data.id; // store this
}
