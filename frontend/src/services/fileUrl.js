// frontend/src/services/fileUrl.js
// Cloudinary returns a full https:// URL in fileUrl/path
// Local dev stored relative paths like "uploads/filename.pdf"
// This helper handles both cases

const BASE = import.meta.env.MODE === "development" ? "http://localhost:5001" : "";

export const resolveFileUrl = (filePath) => {
  if (!filePath) return null;
  // Already a full URL (Cloudinary) — use as-is
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  // Local relative path
  return `${BASE}/${filePath.replace(/\\/g, "/")}`;
};

export const resolveFileName = (filePath) => {
  if (!filePath) return "Attachment";
  // Cloudinary URL — extract the public_id filename at the end
  const parts = filePath.replace(/\\/g, "/").split("/");
  const last = parts[parts.length - 1];
  // Remove Cloudinary version prefix (v1234567890_filename) if present
  return last.replace(/^v\d+_/, "").replace(/%20/g, " ");
};
