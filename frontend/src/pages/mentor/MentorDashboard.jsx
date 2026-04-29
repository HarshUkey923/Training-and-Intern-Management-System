import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext.jsx";
import PageLayout from "../../components/PageLayout.jsx";
import {
  UsersIcon, LayoutGridIcon, ClipboardListIcon,
  ChevronDownIcon, ChevronUpIcon, ClockIcon, UserIcon,
} from "lucide-react";

const themes = {
  dark: {
    surface: "rgba(255,255,255,0.03)", surfaceHover: "rgba(255,255,255,0.055)",
    border: "rgba(255,255,255,0.07)", text: "#f9fafb", textMuted: "#6b7280",
    textFaint: "#374151", rowHover: "rgba(255,255,255,0.03)",
    theadBg: "rgba(255,255,255,0.03)", skeletonBg: "rgba(255,255,255,0.08)",
    btnBg: "rgba(255,255,255,0.04)", btnBorder: "rgba(255,255,255,0.08)", btnText: "#e5e7eb",
  },
  light: {
    surface: "rgba(255,255,255,0.85)", surfaceHover: "rgba(255,255,255,1)",
    border: "rgba(0,0,0,0.08)", text: "#111827", textMuted: "#6b7280",
    textFaint: "#d1d5db", rowHover: "rgba(0,0,0,0.02)",
    theadBg: "rgba(0,0,0,0.03)", skeletonBg: "rgba(0,0,0,0.07)",
    btnBg: "rgba(255,255,255,0.8)", btnBorder: "rgba(0,0,0,0.09)", btnText: "#374151",
  },
};

const MentorDashboard = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading]   = useState(true);
  const { isDark } = useTheme();
  const t = isDark ? themes.dark : themes.light;
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/mentor/programs")
      .then((res) => setPrograms(res.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const totalInterns = programs.reduce((acc, p) => acc + (p.interns?.length || 0), 0);

  const stats = [
    { label: "Assigned Programs", value: programs.length, icon: LayoutGridIcon,    accent: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    { label: "Total Interns",     value: totalInterns,     icon: UsersIcon,         accent: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Active Tasks",      value: "—",              icon: ClipboardListIcon, accent: "#f59e0b", bg: "rgba(245,158,11,0.1)",
      onClick: () => navigate("/mentor/show-tasks") },
  ];

  return (
    <PageLayout backPath={null}>
      {/* Header */}
      <div style={{ marginBottom: "clamp(20px,4vw,32px)" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6366f1", marginBottom: "4px" }}>
          Aetherbyte IT Solutions
        </p>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "clamp(22px,5vw,28px)", fontWeight: 700, letterSpacing: "-0.02em", color: t.text, margin: 0 }}>
              Mentor Dashboard
            </h1>
            <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>Your assigned programs and interns.</p>
          </div>
          {/* Fixed action button using correct theme tokens */}
          <NavButton
            label="View Assigned Tasks"
            accent="#6366f1"
            t={t}
            onClick={() => navigate("/mentor/show-tasks")}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "12px", marginBottom: "clamp(20px,4vw,32px)" }}>
        {stats.map((s) => <StatCard key={s.label} stat={s} t={t} loading={loading} />)}
      </div>

      {/* Programs */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: t.text, whiteSpace: "nowrap", margin: 0 }}>Assigned Programs</h2>
          <span style={{ fontSize: "11px", background: "rgba(99,102,241,0.12)", color: "#818cf8", padding: "2px 8px", borderRadius: "20px" }}>
            {programs.length}
          </span>
          <div style={{ flex: 1, height: "1px", background: t.border }} />
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1,2].map((i) => <div key={i} style={{ height: "80px", borderRadius: "12px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />)}
          </div>
        ) : programs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {programs.map((prog) => <ProgramCard key={prog._id} prog={prog} t={t} isDark={isDark} navigate={navigate} />)}
          </div>
        ) : (
          <div style={{ borderRadius: "12px", border: `1px dashed ${t.border}`, padding: "48px 24px", textAlign: "center" }}>
            <LayoutGridIcon size={32} style={{ color: t.textFaint, marginBottom: "12px" }} />
            <p style={{ fontSize: "14px", fontWeight: 500, color: t.textMuted }}>No programs assigned yet</p>
            <p style={{ fontSize: "12px", color: t.textMuted, marginTop: "4px", opacity: 0.7 }}>Contact your HR manager to get assigned.</p>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </PageLayout>
  );
};

// ─── Nav button — uses explicit theme tokens (no btnGhost) ────────────────────
const NavButton = ({ label, accent, t, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
        background: hovered ? `${accent}18` : t.btnBg,
        border: `1px solid ${hovered ? `${accent}50` : t.btnBorder}`,
        color: hovered ? accent : t.btnText,
        cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <ClipboardListIcon size={13} /> {label}
    </button>
  );
};

const ProgramCard = ({ prog, t, isDark, navigate }) => {
  const [expanded, setExpanded] = useState(false);
  const interns     = prog.interns || [];
  const internCount = interns.length;

  return (
    <div style={{ background: t.surface, border: `1px solid ${expanded ? "rgba(99,102,241,0.3)" : t.border}`, borderRadius: "12px", overflow: "hidden", boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.15)" : "0 2px 12px rgba(0,0,0,0.05)", transition: "border 0.2s" }}>
      <div onClick={() => setExpanded((p) => !p)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LayoutGridIcon size={16} style={{ color: "#818cf8" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prog.title}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "3px" }}>
              <span style={{ fontSize: "11px", color: t.textMuted, display: "flex", alignItems: "center", gap: "4px" }}><ClockIcon size={11} />{prog.duration || "—"}</span>
              <span style={{ fontSize: "11px", color: t.textMuted, display: "flex", alignItems: "center", gap: "4px" }}><UsersIcon size={11} />{internCount} intern{internCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <span style={{ fontSize: "10px", fontWeight: 500, padding: "3px 10px", borderRadius: "20px", background: internCount > 0 ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)", color: internCount > 0 ? "#34d399" : t.textMuted }}>
            {internCount > 0 ? "Active" : "Empty"}
          </span>
          {expanded ? <ChevronUpIcon size={16} style={{ color: t.textMuted }} /> : <ChevronDownIcon size={16} style={{ color: t.textMuted }} />}
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${t.border}` }}>
          {interns.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: t.theadBg }}>
                    {["Intern", "Email", "College", ""].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${t.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {interns.map((intern, i) => (
                    <InternRow
                      key={intern._id} intern={intern} t={t} isLast={i === interns.length - 1}
                      onAssign={() => navigate(`/mentor/assign-task/${prog._id}/${intern._id}`, { state: { internName: intern.name, programTitle: prog.title } })}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: t.textMuted }}>No interns assigned to this program yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InternRow = ({ intern, t, isLast, onAssign }) => {
  const [hovered, setHovered]       = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: hovered ? t.rowHover : "transparent", transition: "background 0.15s", borderBottom: isLast ? "none" : `1px solid ${t.border}` }}>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <UserIcon size={13} style={{ color: "#818cf8" }} />
          </div>
          <span style={{ fontWeight: 500, color: t.text }}>{intern.name}</span>
        </div>
      </td>
      <td style={{ padding: "12px 16px", color: t.textMuted }}>{intern.email}</td>
      <td style={{ padding: "12px 16px", color: t.textMuted }}>{intern.college || "—"}</td>
      <td style={{ padding: "12px 16px", textAlign: "right" }}>
        <button
          onClick={onAssign}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{ padding: "5px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: btnHovered ? "rgba(99,102,241,0.22)" : "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)", cursor: "pointer", transition: "background 0.15s", fontFamily: "'DM Sans', sans-serif" }}
        >
          + Assign Task
        </button>
      </td>
    </tr>
  );
};

const StatCard = ({ stat, t, loading }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={stat.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered && stat.onClick ? t.surfaceHover : t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "18px", transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", cursor: stat.onClick ? "pointer" : "default", transform: hovered && stat.onClick ? "translateY(-1px)" : "none" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>{stat.label}</span>
        <div style={{ background: stat.bg, borderRadius: "8px", padding: "6px", display: "flex" }}>
          <stat.icon size={14} style={{ color: stat.accent }} />
        </div>
      </div>
      {loading
        ? <div style={{ height: "32px", width: "48px", borderRadius: "6px", background: t.skeletonBg }} />
        : <div style={{ fontSize: "clamp(22px,4vw,28px)", fontWeight: 700, letterSpacing: "-0.03em", color: t.text }}>{stat.value}</div>
      }
    </div>
  );
};

export default MentorDashboard;
