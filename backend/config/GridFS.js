import multer from "multer";
import mongoose from "mongoose";

// ─── Allowed file types ─────────────────────────────────────────
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "zip", "png", "jpg", "jpeg"];

// ─── MIME mapping (IMPORTANT) ───────────────────────────────────
const mimeToExt = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "application/zip": ".zip",
};

// ─── Multer config ──────────────────────────────────────────────
const memStorage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const ext = file.originalname.includes(".")
    ? file.originalname.substring(file.originalname.lastIndexOf(".") + 1).toLowerCase()
    : "";

  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${ext} not allowed`), false);
  }
};

export const upload = multer({
  storage: memStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

// ─── Save to GridFS (FIXED) ─────────────────────────────────────
export const saveToGridFS = (req, res, next) => {
  if (!req.file) return next();

  const bucketName = req.baseUrl?.includes("submission") ? "submissions" : "tasks";

  const originalName = req.file.originalname;

  // Clean base name
  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "_");

  // Get extension (MIME first, fallback to original)
  const ext =
    mimeToExt[req.file.mimetype] ||
    (originalName.includes(".")
      ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
      : "");

  const filename = `${Date.now()}-${baseName}${ext}`;

  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });

  const uploadStream = bucket.openUploadStream(filename, {
    contentType: req.file.mimetype,
  });

  uploadStream.on("finish", () => {
    req.file.id = uploadStream.id;
    req.file.filename = filename;
    req.file.bucketName = bucketName;
    next();
  });

  uploadStream.on("error", (err) => next(err));

  uploadStream.end(req.file.buffer);
};

// ─── Stream file (FIXED HEADERS) ────────────────────────────────
export const streamFile = async (fileId, bucketName, res) => {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });

  const files = await bucket
    .find({ _id: new mongoose.Types.ObjectId(fileId) })
    .toArray();

  if (!files.length) {
    return res.status(404).json({ message: "File not found." });
  }

  const file = files[0];

  // Strip any charset/boundary suffix — "application/pdf; charset=utf-8" → "application/pdf"
  const mimeType = (file.contentType || "application/octet-stream").split(";")[0].trim();

  res.set("Content-Type", mimeType);
  // Include both name and extension so browser knows what to do with it
  res.set("Content-Disposition", `inline; filename="${file.filename}"`);
  res.set("Cache-Control", "no-store");
  // Explicitly allow iframe embedding from same origin
  res.set("X-Frame-Options", "SAMEORIGIN");

  bucket.openDownloadStream(file._id).pipe(res);
};