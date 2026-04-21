import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// ─── Configure Cloudinary ─────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Storage: uploads to Cloudinary instead of local disk ────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    // Determine folder based on route context
    const folder = req.baseUrl?.includes("submission") ? "tims/submissions" : "tims/tasks";
    return {
      folder,
      resource_type: "auto",        // handles pdf, doc, zip, images
      allowed_formats: ["pdf", "doc", "docx", "zip", "png", "jpg", "jpeg"],
      // Use original filename + timestamp to avoid collisions
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "_").replace(/\.[^.]+$/, "")}`,
    };
  },
});

// ─── Multer instance ──────────────────────────────────────────────────────────
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|zip|png|jpg|jpeg/i;
    const ext = file.originalname.split(".").pop();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed. Allowed: pdf, doc, docx, zip, png, jpg, jpeg"));
    }
  },
});

export default cloudinary;
