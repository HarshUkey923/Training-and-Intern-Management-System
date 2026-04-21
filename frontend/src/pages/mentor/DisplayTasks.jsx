import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import PageLayout from "../../components/PageLayout.jsx";
import toast from "react-hot-toast";
import {
  ClipboardListIcon, UserIcon, CalendarIcon,
  ClockIcon, CheckCircleIcon, CircleIcon, SearchIcon,
  StarIcon, XIcon, PaperclipIcon, DownloadIcon, FileTextIcon,
} from "lucide-react";

const themes = {
  dark: {
    surface: "rgba(255,255,255,0.03)", surfaceHover: "rgba(255,255,255,0.055)",
    border: "rgba(255,255,255,0.07)", text: "#f9fafb", textMuted: "#6b7280",
    textFaint: "#374151", rowHover: "rgba(255,255,255,0.03)",
    theadBg: "rgba(255,255,255,0.03)", skeletonBg: "rgba(255,255,255,0.08)",
    inputBg: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.1)",
    modalBg: "#161920", overlayBg: "rgba(0,0,0,0.65)",
    expandBg: "rgba(255,255,255,0.02)", fileBg: "rgba(99,102,241,0.08)",
  },
  light: {
    surface: "rgba(255,255,255,0.85)", surfaceHover: "rgba(255,255,255,1)",
    border: "rgba(0,0,0,0.08)", text: "#111827", textMuted: "#6b7280",
    textFaint: "#d1d5db", rowHover: "rgba(0,0,0,0.02)",
    theadBg: "rgba(0,0,0,0.03)", skeletonBg: "rgba(0,0,0,0.07)",
    inputBg: "rgba(255,255,255,0.9)", inputBorder: "rgba(0,0,0,0.12)",
    modalBg: "#ffffff", overlayBg: "rgba(0,0,0,0.4)",
    expandBg: "rgba(0,0,0,0.02)", fileBg: "rgba(99,102,241,0.06)",
  },
};

const STATUS_CONFIG = {
  Pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: CircleIcon },
  Submitted: { label: "Submitted", color: "#6366f1", bg: "rgba(99,102,241,0.1)",  icon: ClockIcon },
  Reviewed:  { label: "Reviewed",  color: "#10b981", bg: "rgba(16,185,129,0.1)",  icon: CheckCircleIcon },
};

// ─── File URL helpers — work with both Cloudinary and local paths ─────────────
// Cloudinary returns a full https:// URL → use as-is
// Local dev stores relative paths like "uploads/file.pdf" → prepend localhost
const fileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
  const base = import.meta.env.MODE === "development" ? "http://localhost:5001" : "";
  return `${base}/${filePath.replace(/\\/g, "/")}`;
};

const fileName = (filePath) => {
  if (!filePath) return "Attachment";
  const parts = filePath.replace(/\\/g, "/").split("/");
  const last = parts[parts.length - 1];
  // Strip Cloudinary version prefix (v1234567890_name) if present
  return decodeURIComponent(last.replace(/^v\d+_/, ""));
};

const DisplayTasks = () => {
  const [tasks, setTasks]           = useState([]);
  const [submissions, setSubmissions] = useState([]); // all submissions indexed by taskId
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState("All");
  const [reviewTask, setReviewTask] = useState(null);
  const { isDark } = useTheme();
  const t = isDark ? themes.dark : themes.light;

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tasksRes, subsRes] = await Promise.all([
        api.get("/tasks/mentor"),
        api.get("/submissions/mentor"),  // mentor's submissions
      ]);
      setTasks(tasksRes.data || []);
      setSubmissions(subsRes.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Build a map of taskId → submission for O(1) lookup
  const submissionByTask = submissions.reduce((acc, sub) => {
    const id = sub.taskId?._id || sub.taskId;
    if (id) acc[id] = sub;
    return acc;
  }, {});

  const counts = {
    All:       tasks.length,
    Pending:   tasks.filter((t) => t.status === "Pending").length,
    Submitted: tasks.filter((t) => t.status === "Submitted").length,
    Reviewed:  tasks.filter((t) => t.status === "Reviewed").length,
  };

  const visible = tasks.filter((task) => {
    const matchesFilter = filter === "All" || task.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      task.title?.toLowerCase().includes(q) ||
      task.internId?.name?.toLowerCase().includes(q) ||
      task.internId?.email?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const filterTabs = ["All", "Pending", "Submitted", "Reviewed"];

  return (
    <PageLayout backPath="/mentor" backLabel="Back to Dashboard" maxWidth="1040px">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6366f1", marginBottom: "4px" }}>Mentor</p>
        <h1 style={{ fontSize: "clamp(20px,4vw,26px)", fontWeight: 700, letterSpacing: "-0.02em", color: t.text, margin: 0 }}>Assigned Tasks</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>
          Track task status and review submitted work. Click a row to expand details.
        </p>
      </div>

      {/* Filter tabs + search */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px", alignItems: "center" }}>
        {filterTabs.map((tab) => {
          const cfg = STATUS_CONFIG[tab];
          const active = filter === tab;
          return (
            <button key={tab} onClick={() => setFilter(tab)} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
              cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
              background: active ? (tab === "All" ? "rgba(99,102,241,0.15)" : cfg.bg) : t.surface,
              border: `1px solid ${active ? (tab === "All" ? "rgba(99,102,241,0.35)" : cfg.color + "50") : t.border}`,
              color: active ? (tab === "All" ? "#818cf8" : cfg.color) : t.textMuted,
            }}>
              {tab}
              <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px", background: active ? (tab === "All" ? "rgba(99,102,241,0.2)" : cfg?.color + "25") : t.border, color: active ? (tab === "All" ? "#818cf8" : cfg?.color) : t.textMuted }}>
                {counts[tab]}
              </span>
            </button>
          );
        })}
        <div style={{ marginLeft: "auto", position: "relative", minWidth: "200px" }}>
          <SearchIcon size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or interns..."
            style={{ width: "100%", padding: "7px 12px 7px 30px", borderRadius: "8px", fontSize: "12px", background: t.inputBg, color: t.text, border: `1px solid ${t.inputBorder}`, outline: "none", fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", overflow: "hidden", boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
        {loading ? (
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1,2,3,4].map((i) => <div key={i} style={{ height: "56px", borderRadius: "8px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />)}
          </div>
        ) : visible.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: t.theadBg }}>
                  {["Task", "Assigned To", "Due Date", "Created", "Status", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((task, i) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    submission={submissionByTask[task._id]}
                    t={t} isDark={isDark}
                    isLast={i === visible.length - 1}
                    onReview={() => setReviewTask({ task, submission: submissionByTask[task._id] })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState filter={filter} search={search} t={t} />
        )}
      </div>

      {/* Review modal */}
      {reviewTask && (
        <ReviewModal
          task={reviewTask.task}
          submission={reviewTask.submission}
          t={t} isDark={isDark}
          onClose={() => setReviewTask(null)}
          onSuccess={() => { setReviewTask(null); fetchAll(); }}
        />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </PageLayout>
  );
};

// ─── File pill component ──────────────────────────────────────────────────────
const FilePill = ({ path: filePath, t, small = false }) => {
  if (!filePath) return null;
  const url  = fileUrl(filePath);
  const name = fileName(filePath);
  return (
    <a
      href={url} target="_blank" rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: small ? "3px 10px" : "6px 12px",
        borderRadius: "8px", fontSize: small ? "11px" : "12px", fontWeight: 500,
        background: t.fileBg, color: "#818cf8",
        border: "1px solid rgba(99,102,241,0.25)",
        textDecoration: "none", transition: "background 0.15s",
        maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}
      title={name}
    >
      <PaperclipIcon size={small ? 11 : 13} />
      {name}
      <DownloadIcon size={small ? 10 : 12} style={{ flexShrink: 0 }} />
    </a>
  );
};

// ─── Task row ─────────────────────────────────────────────────────────────────
const TaskRow = ({ task, submission, t, isDark, isLast, onReview }) => {
  const [hovered, setHovered]   = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cfg        = STATUS_CONFIG[task.status] || STATUS_CONFIG.Pending;
  const StatusIcon = cfg.icon;
  const intern     = task.internId;
  const dueDate    = task.dueDate   ? new Date(task.dueDate).toLocaleDateString("en-IN",   { day: "numeric", month: "short", year: "numeric" }) : "—";
  const created    = task.createdAt ? new Date(task.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const isOverdue  = task.dueDate && task.status === "Pending" && new Date(task.dueDate) < new Date();

  return (
    <>
      <tr
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setExpanded((p) => !p)}
        style={{ background: hovered ? t.surfaceHover : "transparent", transition: "background 0.15s", borderBottom: (!expanded && !isLast) ? `1px solid ${t.border}` : "none", cursor: "pointer" }}
      >
        <td style={{ padding: "14px 16px", maxWidth: "240px" }}>
          <div style={{ fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
          <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.description}</div>
        </td>
        <td style={{ padding: "14px 16px" }}>
          {intern ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <UserIcon size={12} style={{ color: "#818cf8" }} />
              </div>
              <div>
                <div style={{ fontWeight: 500, color: t.text, fontSize: "12px" }}>{intern.name}</div>
                <div style={{ fontSize: "11px", color: t.textMuted }}>{intern.email}</div>
              </div>
            </div>
          ) : <span style={{ color: t.textMuted }}>—</span>}
        </td>
        <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", color: isOverdue ? "#f87171" : t.textMuted }}>
            <CalendarIcon size={12} />{dueDate}
            {isOverdue && <span style={{ fontSize: "10px", background: "rgba(239,68,68,0.1)", color: "#f87171", padding: "1px 6px", borderRadius: "10px", fontWeight: 600 }}>Overdue</span>}
          </span>
        </td>
        <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: "12px", color: t.textMuted, display: "flex", alignItems: "center", gap: "5px" }}><ClockIcon size={12} />{created}</span>
        </td>
        <td style={{ padding: "14px 16px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px", background: cfg.bg, color: cfg.color }}>
            <StatusIcon size={11} />{cfg.label}
          </span>
        </td>
        <td style={{ padding: "14px 16px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
          {task.status === "Submitted" && (
            <button
              onClick={onReview}
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}
            >
              <StarIcon size={11} /> Review
            </button>
          )}
          {task.status === "Reviewed" && task.rating && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} size={12} style={{ color: i < task.rating ? "#f59e0b" : t.textFaint, fill: i < task.rating ? "#f59e0b" : "none" }} />
              ))}
            </div>
          )}
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr style={{ borderBottom: isLast ? "none" : `1px solid ${t.border}` }}>
          <td colSpan={6} style={{ padding: "0 16px 16px 16px" }}>
            <div style={{ background: t.expandBg, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Task description */}
              <div>
                <p style={{ fontSize: "11px", fontWeight: 600, color: t.textMuted, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Task Description</p>
                <p style={{ fontSize: "13px", color: t.text, lineHeight: 1.6, margin: 0 }}>{task.description || "No description."}</p>
              </div>

              {/* Task reference file (set by mentor) */}
              {task.fileUrl && (
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: t.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Reference File (by you)</p>
                  <FilePill path={task.fileUrl} t={t} />
                </div>
              )}

              {/* Submission details */}
              {submission ? (
                <div style={{ paddingTop: "12px", borderTop: `1px solid ${t.border}` }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#6366f1", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "5px" }}>
                    <FileTextIcon size={12} /> Intern Submission
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      {submission.note ? (
                        <>
                          <p style={{ fontSize: "11px", color: t.textMuted, marginBottom: "4px", fontWeight: 500 }}>Submission Note</p>
                          <p style={{ fontSize: "13px", color: t.text, lineHeight: 1.5, margin: 0 }}>{submission.note}</p>
                        </>
                      ) : (
                        <p style={{ fontSize: "13px", color: t.textMuted, fontStyle: "italic" }}>No note added.</p>
                      )}
                    </div>

                    {/* Submitted file */}
                    {submission.fileUrl ? (
                      <div>
                        <p style={{ fontSize: "11px", color: t.textMuted, marginBottom: "6px", fontWeight: 500 }}>Submitted File</p>
                        <FilePill path={submission.fileUrl} t={t} />
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: "11px", color: t.textMuted, marginBottom: "4px", fontWeight: 500 }}>Submitted File</p>
                        <span style={{ fontSize: "12px", color: t.textFaint }}>No file attached</span>
                      </div>
                    )}
                  </div>

                  {/* Feedback if reviewed */}
                  {submission.feedback && (
                    <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <p style={{ fontSize: "11px", fontWeight: 600, color: "#34d399", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Feedback</p>
                      <p style={{ fontSize: "13px", color: t.text, margin: 0, lineHeight: 1.5 }}>{submission.feedback}</p>
                    </div>
                  )}
                </div>
              ) : task.status !== "Pending" ? (
                <div style={{ paddingTop: "12px", borderTop: `1px solid ${t.border}` }}>
                  <p style={{ fontSize: "13px", color: t.textMuted, fontStyle: "italic" }}>Submission details not found.</p>
                </div>
              ) : null}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── Review modal ─────────────────────────────────────────────────────────────
const ReviewModal = ({ task, submission, t, isDark, onClose, onSuccess }) => {
  const [feedback, setFeedback]       = useState("");
  const [rating, setRating]           = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async () => {
    if (!rating)          { toast.error("Please select a rating"); return; }
    if (!feedback.trim()) { toast.error("Please enter feedback");  return; }
    if (!submission)      { toast.error("No submission found for this task"); return; }

    setLoading(true);
    try {
      await api.put(`/submissions/${submission._id}/review`, { feedback, rating });
      toast.success("Review submitted!");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const ratingLabel = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating] || "";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: t.overlayBg, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: t.modalBg, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#10b981", margin: "0 0 4px" }}>Review Task</p>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: t.text, margin: 0, letterSpacing: "-0.01em" }}>{task.title}</h2>
            {task.internId && (
              <p style={{ fontSize: "12px", color: t.textMuted, marginTop: "4px" }}>
                Submitted by <span style={{ fontWeight: 500, color: t.text }}>{task.internId.name}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: t.textMuted, padding: "4px" }}>
            <XIcon size={18} />
          </button>
        </div>

        {/* Intern's submitted file — prominently shown */}
        {submission ? (
          <div style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1px solid ${t.border}`, borderRadius: "10px", padding: "14px 16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: t.textMuted, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "5px" }}>
              <FileTextIcon size={12} /> Intern's Submission
            </p>

            {/* Note */}
            {submission.note && (
              <div style={{ marginBottom: "10px" }}>
                <p style={{ fontSize: "11px", color: t.textMuted, marginBottom: "3px" }}>Note</p>
                <p style={{ fontSize: "13px", color: t.text, lineHeight: 1.5, margin: 0 }}>{submission.note}</p>
              </div>
            )}

            {/* Submitted file */}
            <div>
              <p style={{ fontSize: "11px", color: t.textMuted, marginBottom: "6px" }}>Attached File</p>
              {submission.fileUrl ? (
                <FilePill path={submission.fileUrl} t={t} />
              ) : (
                <span style={{ fontSize: "12px", color: t.textFaint, fontStyle: "italic" }}>No file attached by intern</span>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px solid ${t.border}`, borderRadius: "10px", padding: "14px 16px" }}>
            <p style={{ fontSize: "13px", color: t.textMuted, fontStyle: "italic" }}>No submission record found.</p>
          </div>
        )}

        {/* Star rating */}
        <div>
          <label style={{ fontSize: "12px", fontWeight: 500, color: t.textMuted, display: "block", marginBottom: "10px" }}>
            Rating <span style={{ color: "#f87171" }}>*</span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: "3px", transition: "transform 0.1s", transform: (hoverRating || rating) >= star ? "scale(1.2)" : "scale(1)" }}>
                <StarIcon size={28} style={{ color: (hoverRating || rating) >= star ? "#f59e0b" : t.border, fill: (hoverRating || rating) >= star ? "#f59e0b" : "none", transition: "all 0.1s" }} />
              </button>
            ))}
            {ratingLabel && (
              <span style={{ fontSize: "13px", color: t.textMuted, marginLeft: "6px" }}>{ratingLabel}</span>
            )}
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label style={{ fontSize: "12px", fontWeight: 500, color: t.textMuted, display: "block", marginBottom: "6px" }}>
            Feedback <span style={{ color: "#f87171" }}>*</span>
          </label>
          <textarea
            value={feedback} onChange={(e) => setFeedback(e.target.value)}
            placeholder="What was done well? What could be improved?"
            rows={4}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", background: t.inputBg, color: t.text, border: `1px solid ${t.inputBorder}`, outline: "none", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, background: t.surface, color: t.textMuted, border: `1px solid ${t.border}`, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: loading ? "rgba(16,185,129,0.5)" : "#10b981", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {loading
              ? <><span style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Submitting...</>
              : <><CheckCircleIcon size={14} /> Submit Review</>
            }
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

const EmptyState = ({ filter, search, t }) => (
  <div style={{ padding: "52px 24px", textAlign: "center" }}>
    <ClipboardListIcon size={32} style={{ color: t.textFaint, marginBottom: "12px" }} />
    <p style={{ fontSize: "14px", fontWeight: 500, color: t.textMuted }}>
      {search ? `No tasks match "${search}"` : filter === "All" ? "No tasks assigned yet" : `No ${filter.toLowerCase()} tasks`}
    </p>
    <p style={{ fontSize: "12px", color: t.textMuted, marginTop: "4px", opacity: 0.7 }}>
      {search ? "Try a different search term" : "Tasks you assign to interns will appear here"}
    </p>
  </div>
);

export default DisplayTasks;
