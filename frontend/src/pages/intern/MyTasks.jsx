import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageLayout from "../../components/PageLayout.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import api from "../../services/api.js";
import toast from "react-hot-toast";
import { ClipboardListIcon, SendIcon, FilterIcon } from "lucide-react";

const themes = {
  dark: {
    surface: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.07)",
    text: "#f9fafb",
    textMuted: "#6b7280",
    textFaint: "#374151",
    rowHover: "rgba(255,255,255,0.03)",
    theadBg: "rgba(255,255,255,0.03)",
    theadText: "#6b7280",
    skeletonBg: "rgba(255,255,255,0.08)",
    pillBg: "rgba(255,255,255,0.05)",
    pillBorder: "rgba(255,255,255,0.1)",
    pillActive: "rgba(99,102,241,0.15)",
    pillActiveBorder: "rgba(99,102,241,0.4)",
  },
  light: {
    surface: "rgba(255,255,255,0.85)",
    border: "rgba(0,0,0,0.08)",
    text: "#111827",
    textMuted: "#6b7280",
    textFaint: "#d1d5db",
    rowHover: "rgba(0,0,0,0.02)",
    theadBg: "rgba(0,0,0,0.03)",
    theadText: "#6b7280",
    skeletonBg: "rgba(0,0,0,0.07)",
    pillBg: "rgba(0,0,0,0.03)",
    pillBorder: "rgba(0,0,0,0.09)",
    pillActive: "rgba(99,102,241,0.1)",
    pillActiveBorder: "rgba(99,102,241,0.4)",
  },
};

const statusStyles = {
  Pending:   { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b"  },
  Submitted: { bg: "rgba(59,130,246,0.1)",  color: "#60a5fa"  },
  Reviewed:  { bg: "rgba(16,185,129,0.1)",  color: "#34d399"  },
};

const FILTERS = ["All", "Pending", "Submitted", "Reviewed"];

const MyTasks = () => {
  const { isDark } = useTheme();
  const t = isDark ? themes.dark : themes.light;
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    try {
      const res = await api.get("/tasks/intern");
      setTasks(res.data || []);
    } catch (e) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "All" ? tasks : tasks.filter(tk => tk.status === filter);

  // PUT /api/tasks/:taskId/status  — intern marks as Submitted
  const markSubmitted = async (taskId) => {
    setUpdatingId(taskId);
    try {
      await api.put(`/tasks/${taskId}/status`, { status: "Submitted" });
      toast.success("Task marked as submitted!");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update task");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <PageLayout backPath="/intern" backLabel="Back to Dashboard" maxWidth="900px">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6366f1", marginBottom: "4px" }}>Intern Portal</p>
          <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: isDark ? "#f9fafb" : "#111827", margin: 0 }}>My Tasks</h1>
          <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>{tasks.length} task{tasks.length !== 1 ? "s" : ""} assigned to you</p>
        </div>
        <button
          onClick={() => navigate("/intern/submit")}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "#6366f1", color: "#fff", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#4f46e5"}
          onMouseLeave={e => e.currentTarget.style.background = "#6366f1"}
        >
          <SendIcon size={14} /> Submit Work
        </button>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        <FilterIcon size={14} style={{ color: t.textMuted, alignSelf: "center" }} />
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s", border: `1px solid ${filter === f ? t.pillActiveBorder : t.pillBorder}`, background: filter === f ? t.pillActive : t.pillBg, color: filter === f ? "#818cf8" : t.textMuted }}>
            {f} {f === "All" ? `(${tasks.length})` : `(${tasks.filter(tk => tk.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "16px", overflow: "hidden", boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
        {loading ? (
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: "56px", borderRadius: "10px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <ClipboardListIcon size={32} style={{ color: t.textFaint, marginBottom: "12px" }} />
            <p style={{ fontSize: "14px", color: t.textMuted }}>{filter === "All" ? "No tasks assigned yet" : `No ${filter.toLowerCase()} tasks`}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: t.theadBg }}>
                  {["Title", "Description", "Assigned By", "Status", "Action"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: t.theadText, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${t.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((task, i) => (
                  <TaskRow key={task._id} task={task} t={t} isLast={i === filtered.length - 1} onMarkSubmit={markSubmitted} updatingId={updatingId} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </PageLayout>
  );
};

const TaskRow = ({ task, t, isLast, onMarkSubmit, updatingId }) => {
  const [hovered, setHovered] = useState(false);
  const s = statusStyles[task.status] || statusStyles.Pending;
  const isUpdating = updatingId === task._id;

  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? t.rowHover : "transparent", transition: "background 0.15s", borderBottom: isLast ? "none" : `1px solid ${t.border}` }}>
      <td style={{ padding: "13px 16px", fontWeight: 600, color: t.text, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {task.title}
      </td>
      <td style={{ padding: "13px 16px", color: t.textMuted, maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {task.description || "—"}
      </td>
      <td style={{ padding: "13px 16px", color: t.textMuted }}>
        {task.mentorId?.name || "—"}
      </td>
      <td style={{ padding: "13px 16px" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: s.bg, color: s.color }}>
          {task.status}
        </span>
      </td>
      <td style={{ padding: "13px 16px" }}>
        {task.status === "Pending" && (
          <button
            onClick={() => onMarkSubmit(task._id)}
            disabled={isUpdating}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: isUpdating ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", cursor: isUpdating ? "not-allowed" : "pointer", transition: "all 0.15s", opacity: isUpdating ? 0.6 : 1 }}>
            <SendIcon size={11} /> {isUpdating ? "Updating..." : "Mark Submitted"}
          </button>
        )}
        {task.status === "Submitted" && (
          <span style={{ fontSize: "11px", color: t.textMuted }}>Awaiting review</span>
        )}
        {task.status === "Reviewed" && (
          <span style={{ fontSize: "11px", color: "#34d399" }}>✓ Reviewed</span>
        )}
      </td>
    </tr>
  );
};

export default MyTasks;
