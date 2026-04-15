import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import api from "../../services/api.js";
import {
  ClipboardListIcon,
  CheckCircleIcon,
  ClockIcon,
  SendIcon,
  BookOpenIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  FileTextIcon,
} from "lucide-react";

const themes = {
  dark: {
    bg: "linear-gradient(135deg, #0f1117 0%, #13151e 60%, #0f1117 100%)",
    surface: "rgba(255,255,255,0.03)",
    surfaceHover: "rgba(255,255,255,0.055)",
    border: "rgba(255,255,255,0.07)",
    text: "#f9fafb",
    textMuted: "#6b7280",
    textFaint: "#374151",
    skeletonBg: "rgba(255,255,255,0.08)",
    btnGhost: "rgba(255,255,255,0.04)",
    btnGhostBorder: "rgba(255,255,255,0.08)",
    barBg: "rgba(255,255,255,0.06)",
    footerBorder: "rgba(255,255,255,0.05)",
  },
  light: {
    bg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 60%, #f8fafc 100%)",
    surface: "rgba(255,255,255,0.8)",
    surfaceHover: "rgba(255,255,255,1)",
    border: "rgba(0,0,0,0.08)",
    text: "#111827",
    textMuted: "#6b7280",
    textFaint: "#d1d5db",
    skeletonBg: "rgba(0,0,0,0.07)",
    btnGhost: "rgba(0,0,0,0.03)",
    btnGhostBorder: "rgba(0,0,0,0.09)",
    barBg: "rgba(0,0,0,0.07)",
    footerBorder: "rgba(0,0,0,0.07)",
  },
};

const statusStyles = {
  Pending:   { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b" },
  Submitted: { bg: "rgba(59,130,246,0.1)",  color: "#60a5fa" },
  Reviewed:  { bg: "rgba(16,185,129,0.1)",  color: "#34d399" },
};

const InternDashboard = () => {
  const { isDark } = useTheme();
  const t = isDark ? themes.dark : themes.light;
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const name = localStorage.getItem("name") || "Intern";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/tasks/intern");
        setTasks(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pending   = tasks.filter(tk => tk.status === "Pending").length;
  const submitted = tasks.filter(tk => tk.status === "Submitted").length;
  const reviewed  = tasks.filter(tk => tk.status === "Reviewed").length;
  const total     = tasks.length;
  const progress  = total ? Math.round((reviewed / total) * 100) : 0;

  const stats = [
    { label: "Total Tasks",  value: total,     icon: ClipboardListIcon, accent: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    { label: "Pending",      value: pending,   icon: ClockIcon,         accent: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Submitted",    value: submitted, icon: SendIcon,          accent: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { label: "Reviewed",     value: reviewed,  icon: CheckCircleIcon,   accent: "#10b981", bg: "rgba(16,185,129,0.1)" },
  ];

  const quickLinks = [
    { label: "My Tasks",        path: "/intern/tasks",       icon: ClipboardListIcon, accent: "#6366f1" },
    { label: "Submit Work",     path: "/intern/submit",      icon: SendIcon,          accent: "#10b981" },
    { label: "My Submissions",  path: "/intern/submissions", icon: FileTextIcon,      accent: "#f59e0b" },
    { label: "My Program",      path: "/intern/program",     icon: BookOpenIcon,      accent: "#ec4899" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: t.bg, fontFamily: "'DM Sans', 'Inter', sans-serif", transition: "background 0.3s" }}>
      <Navbar />
      <div style={{ height: "2px", background: "linear-gradient(90deg, #6366f1, #10b981, #f59e0b)", flexShrink: 0 }} />

      <main style={{ flex: 1, maxWidth: "1280px", width: "100%", margin: "0 auto", padding: "clamp(16px, 4vw, 32px) clamp(16px, 4vw, 24px)" }}>

        {/* Header */}
        <div style={{ marginBottom: "clamp(20px, 4vw, 32px)" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6366f1", marginBottom: "4px" }}>
            Aetherbyte IT Solutions
          </p>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 700, letterSpacing: "-0.02em", color: t.text, margin: 0 }}>
            Welcome back, {name} 👋
          </h1>
          <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>
            Here's your internship progress at a glance.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "clamp(20px, 4vw, 28px)" }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>{s.label}</span>
                <div style={{ background: s.bg, borderRadius: "8px", padding: "6px", display: "flex" }}>
                  <s.icon size={14} style={{ color: s.accent }} />
                </div>
              </div>
              {loading
                ? <div style={{ height: "32px", width: "48px", borderRadius: "6px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />
                : <div style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 700, letterSpacing: "-0.03em", color: t.text }}>{s.value}</div>
              }
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "22px 24px", marginBottom: "clamp(20px, 4vw, 28px)", boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUpIcon size={16} style={{ color: "#6366f1" }} />
              <span style={{ fontSize: "14px", fontWeight: 600, color: t.text }}>Overall Progress</span>
            </div>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "#6366f1" }}>{progress}%</span>
          </div>
          <div style={{ height: "8px", background: t.barBg, borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg, #6366f1, #10b981)", width: `${progress}%`, transition: "width 0.8s ease" }} />
          </div>
          <p style={{ fontSize: "12px", color: t.textMuted, marginTop: "8px" }}>
            {reviewed} of {total} tasks reviewed
          </p>
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>

          {/* Quick actions */}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "22px 24px", boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: t.text, marginBottom: "16px", margin: "0 0 16px" }}>Quick Actions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {quickLinks.map((q) => (
                <QuickLinkRow key={q.label} item={q} t={t} navigate={navigate} />
              ))}
            </div>
          </div>

          {/* Recent tasks */}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "22px 24px", boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 600, color: t.text, margin: 0 }}>Recent Tasks</h2>
              <NavTextBtn label="View all" onClick={() => navigate("/intern/tasks")} t={t} />
            </div>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[1, 2, 3].map(i => <div key={i} style={{ height: "52px", borderRadius: "10px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />)}
              </div>
            ) : tasks.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <ClipboardListIcon size={28} style={{ color: t.textFaint, marginBottom: "10px" }} />
                <p style={{ fontSize: "13px", color: t.textMuted }}>No tasks assigned yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {tasks.slice(0, 4).map((task) => {
                  const s = statusStyles[task.status] || statusStyles.Pending;
                  return (
                    <div key={task._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: t.btnGhost, border: `1px solid ${t.border}` }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 500, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</p>
                        <p style={{ fontSize: "11px", color: t.textMuted, margin: "2px 0 0" }}>
                          {task.mentorId?.name ? `By ${task.mentorId.name}` : "Assigned"}
                        </p>
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px", background: s.bg, color: s.color, whiteSpace: "nowrap", flexShrink: 0 }}>
                        {task.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${t.footerBorder}`, padding: "12px 24px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: t.textMuted }}>AetherByte IT Solutions</span>
        <span style={{ fontSize: "11px", color: t.textMuted, opacity: 0.5 }}>TIMS v1.0</span>
      </footer>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
};

const QuickLinkRow = ({ item, t, navigate }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => navigate(item.path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: "10px", border: `1px solid ${hovered ? item.accent + "50" : t.border}`, background: hovered ? item.accent + "12" : t.btnGhost, cursor: "pointer", transition: "all 0.15s", textAlign: "left", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: item.accent + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <item.icon size={14} style={{ color: item.accent }} />
        </div>
        <span style={{ fontSize: "13px", fontWeight: 500, color: t.text }}>{item.label}</span>
      </div>
      <ArrowRightIcon size={14} style={{ color: hovered ? item.accent : t.textMuted, transition: "color 0.15s" }} />
    </button>
  );
};

const NavTextBtn = ({ label, onClick, t }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ fontSize: "11px", fontWeight: 500, color: hovered ? "#818cf8" : t.textMuted, background: "none", border: "none", cursor: "pointer", transition: "color 0.15s", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}>
      {label} <ArrowRightIcon size={11} />
    </button>
  );
};

export default InternDashboard;
