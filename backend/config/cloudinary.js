import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// ─── Configure Cloudinary ─────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── CloudinaryStorage ────────────────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = req.baseUrl?.includes("submission") ? "tims/submissions" : "tims/tasks";
    const safeName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/\.[^.]+$/, ""); // strip extension — Cloudinary adds it back
    return {
      folder,
      resource_type: "auto",
      public_id: `${Date.now()}-${safeName}`,
      // No allowed_formats here — handled by fileFilter below
    };
  },
});

// ─── Multer v1 instance ───────────────────────────────────────────────────────
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["pdf", "doc", "docx", "zip", "png", "jpg", "jpeg"];
    const ext = file.originalname.split(".").pop().toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${ext} not allowed. Allowed: ${allowed.join(", ")}`));
    }
  },
});

export default cloudinary;
