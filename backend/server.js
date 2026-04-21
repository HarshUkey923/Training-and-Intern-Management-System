import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import AuthRoutes       from "./routes/AuthRoutes.js";
import InternRoutes     from "./routes/InternRoutes.js";
import ProgramRoutes    from "./routes/ProgramRoutes.js";
import TaskRoutes       from "./routes/TaskRoutes.js";
import SubmissionRoutes from "./routes/SubmissionRoutes.js";
import ReportRoutes     from "./routes/ReportRoutes.js";
import HrRoutes         from "./routes/hrRoutes.js";
import MentorRoutes     from "./routes/MentorRoutes.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
} else {
  app.use(cors());
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploads only in dev — production uses Cloudinary
if (process.env.NODE_ENV === "development") {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

app.use("/api/auth",        AuthRoutes);
app.use("/api/interns",     InternRoutes);
app.use("/api/programs",    ProgramRoutes);
app.use("/api/tasks",       TaskRoutes);
app.use("/api/submissions", SubmissionRoutes);
app.use("/api/reports",     ReportRoutes);
app.use("/api/hr",          HrRoutes);
app.use("/api/mentor",      MentorRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
