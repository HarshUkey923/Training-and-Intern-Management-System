import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageLayout from "../../components/PageLayout.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import api from "../../services/api.js";
import toast from "react-hot-toast";
import { FileTextIcon, StarIcon, ExternalLinkIcon, SendIcon } from "lucide-react";

// ─── File URL helper ──────────────────────────────────────────────────────────
// Cloudinary returns a full https:// URL → use as-is
// Local dev stores relative paths like "uploads/file.pdf" → prepend localhost
const resolveFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
  const base = import.meta.env.MODE === "development" ? "http://localhost:5001" : "";
  return `${base}/${filePath.replace(/\\/g, "/")}`;
};

const themes = {
  dark: {
    surface: "rgba(255,255,255,0.03)", surfaceHover: "rgba(255,255,255,0.055)",
    border: "rgba(255,255,255,0.07)", borderHover: "rgba(99,102,241,0.35)",
    text: "#f9fafb", textMuted: "#6b7280", textFaint: "#374151",
    skeletonBg: "rgba(255,255,255,0.08)", noteBg: "rgba(255,255,255,0.03)",
    feedbackBg: "rgba(16,185,129,0.06)", feedbackBorder: "rgba(16,185,129,0.2)",
  },
  light: {
    surface: "rgba(255,255,255,0.85)", surfaceHover: "rgba(255,255,255,1)",
    border: "rgba(0,0,0,0.08)", borderHover: "rgba(99,102,241,0.4)",
    text: "#111827", textMuted: "#6b7280", textFaint: "#d1d5db",
    skeletonBg: "rgba(0,0,0,0.07)", noteBg: "rgba(0,0,0,0.02)",
    feedbackBg: "rgba(16,185,129,0.05)", feedbackBorder: "rgba(16,185,129,0.2)",
  },
};

const statusStyles = {
  Submitted: { bg: "rgba(59,130,246,0.1)",  color: "#60a5fa" },
  Reviewed:  { bg: "rgba(16,185,129,0.1)",  color: "#34d399" },
};

const MySubmissions = () => {
  const { isDark } = useTheme();
  const t = isDark ? themes.dark : themes.light;
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/submissions/my")
      .then(res => setSubmissions(res.data || []))
      .catch(() => toast.error("Failed to load submissions"))
      .finally(() => setLoading(false));
  }, []);

  const reviewed  = submissions.filter(s => s.status === "Reviewed").length;
  const pending   = submissions.filter(s => s.status === "Submitted").length;
  const rated     = submissions.filter(s => s.rating);
  const avgRating = rated.length
    ? (rated.reduce((a, s) => a + s.rating, 0) / rated.length).toFixed(1)
    : "—";

  return (
    <PageLayout backPath="/intern" backLabel="Back to Dashboard" maxWidth="860px">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6366f1", marginBottom: "4px" }}>Intern Portal</p>
          <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: t.text, margin: 0 }}>My Submissions</h1>
          <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>{submissions.length} submission{submissions.length !== 1 ? "s" : ""} total</p>
        </div>
        <button
          onClick={() => navigate("/intern/submit")}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "#6366f1", color: "#fff", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = "#4f46e5"}
          onMouseLeave={e => e.currentTarget.style.background = "#6366f1"}
        >
          <SendIcon size={14} /> New Submission
        </button>
      </div>

      {/* Summary pills */}
      {!loading && submissions.length > 0 && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
          {[
            { label: "Reviewed",    value: reviewed,                                  color: "#34d399", bg: "rgba(16,185,129,0.1)" },
            { label: "Pending",     value: pending,                                   color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
            { label: "Avg. Rating", value: avgRating !== "—" ? `${avgRating} / 5` : "—", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          ].map(pill => (
            <div key={pill.label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", background: pill.bg, border: `1px solid ${pill.color}30` }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: pill.color }}>{pill.value}</span>
              <span style={{ fontSize: "11px", color: t.textMuted }}>{pill.label}</span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[1,2,3].map(i => <div key={i} style={{ height: "130px", borderRadius: "14px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />)}
        </div>
      ) : submissions.length === 0 ? (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "60px 24px", textAlign: "center" }}>
          <FileTextIcon size={36} style={{ color: t.textFaint, marginBottom: "14px" }} />
          <p style={{ fontSize: "15px", fontWeight: 500, color: t.textMuted }}>No submissions yet</p>
          <p style={{ fontSize: "12px", color: t.textMuted, marginTop: "4px", opacity: 0.7 }}>Submit your first task to see it here</p>
          <button onClick={() => navigate("/intern/submit")}
            style={{ marginTop: "16px", padding: "8px 20px", borderRadius: "8px", background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
            Submit Now
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {submissions.map(sub => (
            <SubmissionCard key={sub._id} sub={sub} t={t} isDark={isDark} />
          ))}
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </PageLayout>
  );
};

const SubmissionCard = ({ sub, t, isDark }) => {
  const [hovered, setHovered] = useState(false);
  const s = statusStyles[sub.status] || statusStyles.Submitted;
  const submitted = new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const fileLink  = resolveFileUrl(sub.fileUrl);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? t.surfaceHover : t.surface, border: `1px solid ${hovered ? t.borderHover : t.border}`, borderRadius: "14px", padding: "20px 22px", transition: "all 0.2s", boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.1)" : isDark ? "0 2px 12px rgba(0,0,0,0.15)" : "0 2px 12px rgba(0,0,0,0.05)" }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: sub.note || sub.feedback ? "14px" : "0" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: t.text, margin: 0 }}>
              {sub.taskId?.title || "Task"}
            </h3>
            <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 9px", borderRadius: "20px", background: s.bg, color: s.color }}>
              {sub.status}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: t.textMuted, margin: "4px 0 0" }}>Submitted on {submitted}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {/* Rating stars */}
          {sub.rating && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {[1,2,3,4,5].map(star => (
                <StarIcon key={star} size={13} style={{ color: star <= sub.rating ? "#f59e0b" : t.textFaint, fill: star <= sub.rating ? "#f59e0b" : "none" }} />
              ))}
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#f59e0b", marginLeft: "2px" }}>{sub.rating}/5</span>
            </div>
          )}

          {/* File link — fixed for Cloudinary + local */}
          {fileLink && (
            <a
              href={fileLink}
              target="_blank"
              rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#818cf8", textDecoration: "none", padding: "3px 10px", borderRadius: "6px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
              title="View attachment"
            >
              <ExternalLinkIcon size={12} /> View File
            </a>
          )}
        </div>
      </div>

      {/* Note */}
      {sub.note && (
        <div style={{ background: t.noteBg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "10px 12px", marginBottom: sub.feedback ? "10px" : "0" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: t.textMuted, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Note</p>
          <p style={{ fontSize: "13px", color: t.text, margin: 0, lineHeight: 1.5 }}>{sub.note}</p>
        </div>
      )}

      {/* Mentor feedback */}
      {sub.feedback && (
        <div style={{ background: t.feedbackBg, border: `1px solid ${t.feedbackBorder}`, borderRadius: "8px", padding: "10px 12px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#34d399", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Mentor Feedback</p>
          <p style={{ fontSize: "13px", color: t.text, margin: 0, lineHeight: 1.5 }}>{sub.feedback}</p>
        </div>
      )}
    </div>
  );
};

export default MySubmissions;
