import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import PageLayout from "../../components/PageLayout.jsx";
import {
  ClipboardListIcon, UserIcon, CalendarIcon,
  ClockIcon, CheckCircleIcon, CircleIcon, SearchIcon, FilterIcon,
} from "lucide-react";

const themes = {
  dark: {
    surface: "rgba(255,255,255,0.03)",
    surfaceHover: "rgba(255,255,255,0.055)",
    border: "rgba(255,255,255,0.07)",
    text: "#f9fafb", textMuted: "#6b7280", textFaint: "#374151",
    rowHover: "rgba(255,255,255,0.03)",
    theadBg: "rgba(255,255,255,0.03)",
    skeletonBg: "rgba(255,255,255,0.08)",
    inputBg: "rgba(255,255,255,0.04)",
    inputBorder: "rgba(255,255,255,0.1)",
  },
  light: {
    surface: "rgba(255,255,255,0.85)",
    surfaceHover: "rgba(255,255,255,1)",
    border: "rgba(0,0,0,0.08)",
    text: "#111827", textMuted: "#6b7280", textFaint: "#d1d5db",
    rowHover: "rgba(0,0,0,0.02)",
    theadBg: "rgba(0,0,0,0.03)",
    skeletonBg: "rgba(0,0,0,0.07)",
    inputBg: "rgba(255,255,255,0.9)",
    inputBorder: "rgba(0,0,0,0.12)",
  },
};

const STATUS_CONFIG = {
  Pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: CircleIcon },
  Submitted: { label: "Submitted", color: "#6366f1", bg: "rgba(99,102,241,0.1)",  icon: ClockIcon },
  Reviewed:  { label: "Reviewed",  color: "#10b981", bg: "rgba(16,185,129,0.1)",  icon: CheckCircleIcon },
};

const DisplayTasks = () => {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");
  const { isDark } = useTheme();
  const t = isDark ? themes.dark : themes.light;

  useEffect(() => {
    api.get("/tasks/mentor")
      .then((res) => setTasks(res.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    All:       tasks.length,
    Pending:   tasks.filter((t) => t.status === "Pending").length,
    Submitted: tasks.filter((t) => t.status === "Submitted").length,
    Reviewed:  tasks.filter((t) => t.status === "Reviewed").length,
  };

  const visible = tasks.filter((task) => {
    const matchesFilter = filter === "All" || task.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      task.title?.toLowerCase().includes(q) ||
      task.internId?.name?.toLowerCase().includes(q) ||
      task.internId?.email?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const filterTabs = ["All", "Pending", "Submitted", "Reviewed"];

  return (
    <PageLayout backPath="/mentor" backLabel="Back to Dashboard" maxWidth="1000px">
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6366f1", marginBottom: "4px" }}>
          Mentor
        </p>
        <h1 style={{ fontSize: "clamp(20px,4vw,26px)", fontWeight: 700, letterSpacing: "-0.02em", color: t.text, margin: 0 }}>
          Assigned Tasks
        </h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>
          Track all tasks you've assigned and their current status.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        {filterTabs.map((tab) => {
          const cfg = STATUS_CONFIG[tab];
          const active = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
                cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
                background: active
                  ? (tab === "All" ? "rgba(99,102,241,0.15)" : cfg.bg)
                  : t.surface,
                border: `1px solid ${active
                  ? (tab === "All" ? "rgba(99,102,241,0.35)" : cfg.color + "50")
                  : t.border}`,
                color: active
                  ? (tab === "All" ? "#818cf8" : cfg.color)
                  : t.textMuted,
              }}
            >
              {tab}
              <span style={{
                fontSize: "10px", fontWeight: 700,
                background: active ? (tab === "All" ? "rgba(99,102,241,0.2)" : cfg.color + "25") : t.border,
                color: active ? (tab === "All" ? "#818cf8" : cfg.color) : t.textMuted,
                padding: "1px 6px", borderRadius: "10px",
              }}>
                {counts[tab]}
              </span>
            </button>
          );
        })}

        <div style={{ marginLeft: "auto", position: "relative", minWidth: "200px" }}>
          <SearchIcon size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or interns..."
            style={{
              width: "100%", padding: "7px 12px 7px 30px",
              borderRadius: "8px", fontSize: "12px",
              background: t.inputBg, color: t.text,
              border: `1px solid ${t.inputBorder}`, outline: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", overflow: "hidden", boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
        {loading ? (
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1,2,3,4].map((i) => (
              <div key={i} style={{ height: "56px", borderRadius: "8px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : visible.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: t.theadBg }}>
                  {["Task", "Assigned To", "Due Date", "Created", "Status"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((task, i) => (
                  <TaskRow key={task._id} task={task} t={t} isLast={i === visible.length - 1} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState filter={filter} search={search} t={t} />
        )}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </PageLayout>
  );
};

const TaskRow = ({ task, t, isLast, isDark }) => {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const cfg      = STATUS_CONFIG[task.status] || STATUS_CONFIG.Pending;
  const StatusIcon = cfg.icon;

  const intern   = task.internId;
  const dueDate  = task.dueDate  ? new Date(task.dueDate).toLocaleDateString("en-IN",  { day: "numeric", month: "short", year: "numeric" }) : "—";
  const created  = task.createdAt ? new Date(task.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const isOverdue = task.dueDate && task.status === "Pending" && new Date(task.dueDate) < new Date();

  return (
    <>
      <tr
        onClick={() => setExpanded((p) => !p)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? t.surfaceHover : "transparent",
          transition: "background 0.15s",
          borderBottom: (!expanded && !isLast) ? `1px solid ${t.border}` : "none",
          cursor: "pointer",
        }}
      >
        <td style={{ padding: "14px 16px", maxWidth: "260px" }}>
          <div style={{ fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {task.title}
          </div>
          {task.description && (
            <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.description}
            </div>
          )}
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
          ) : (
            <span style={{ color: t.textMuted }}>—</span>
          )}
        </td>

        <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", color: isOverdue ? "#f87171" : t.textMuted }}>
            <CalendarIcon size={12} />
            {dueDate}
            {isOverdue && <span style={{ fontSize: "10px", background: "rgba(239,68,68,0.1)", color: "#f87171", padding: "1px 6px", borderRadius: "10px", fontWeight: 600 }}>Overdue</span>}
          </span>
        </td>

        <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: "12px", color: t.textMuted, display: "flex", alignItems: "center", gap: "5px" }}>
            <ClockIcon size={12} />{created}
          </span>
        </td>

        <td style={{ padding: "14px 16px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px", background: cfg.bg, color: cfg.color }}>
            <StatusIcon size={11} />
            {cfg.label}
          </span>
        </td>
      </tr>

      {expanded && (
        <tr style={{ borderBottom: isLast ? "none" : `1px solid ${t.border}` }}>
          <td colSpan={5} style={{ padding: "0 16px 14px 56px" }}>
            <div style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px solid ${t.border}`, borderRadius: "8px", padding: "12px 16px" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</p>
              <p style={{ fontSize: "13px", color: t.text, lineHeight: 1.6, margin: 0 }}>{task.description || "No description provided."}</p>
              {task.fileUrl && (
                <a
                  href={`${import.meta.env.MODE === "development" ? "http://localhost:5001" : ""}/${task.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "10px", fontSize: "12px", color: "#6366f1", fontWeight: 500 }}
                >
                  📎 View attached file
                </a>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
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
