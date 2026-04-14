import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar.jsx";
import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  InfoIcon, PenIcon, PlusIcon,
  UsersIcon, LayoutGridIcon, TrendingUpIcon, ClockIcon,
} from "lucide-react";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const themes = {
  dark: {
    bg: "linear-gradient(135deg, #0f1117 0%, #13151e 60%, #0f1117 100%)",
    surface: "rgba(255,255,255,0.03)",
    surfaceHover: "rgba(255,255,255,0.055)",
    border: "rgba(255,255,255,0.07)",
    borderHover: "rgba(99,102,241,0.35)",
    text: "#f9fafb",
    textMuted: "#6b7280",
    textFaint: "#374151",
    skeletonBg: "rgba(255,255,255,0.08)",
    emptyBorder: "rgba(255,255,255,0.08)",
    btnGhost: "rgba(255,255,255,0.04)",
    btnGhostBorder: "rgba(255,255,255,0.08)",
    btnGhostText: "#e5e7eb",
    footerBorder: "rgba(255,255,255,0.05)",
    barBg: "rgba(255,255,255,0.06)",
  },
  light: {
    bg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 60%, #f8fafc 100%)",
    surface: "rgba(255,255,255,0.8)",
    surfaceHover: "rgba(255,255,255,1)",
    border: "rgba(0,0,0,0.08)",
    borderHover: "rgba(99,102,241,0.4)",
    text: "#111827",
    textMuted: "#6b7280",
    textFaint: "#d1d5db",
    skeletonBg: "rgba(0,0,0,0.07)",
    emptyBorder: "rgba(0,0,0,0.08)",
    btnGhost: "rgba(0,0,0,0.03)",
    btnGhostBorder: "rgba(0,0,0,0.09)",
    btnGhostText: "#374151",
    footerBorder: "rgba(0,0,0,0.07)",
    barBg: "rgba(0,0,0,0.07)",
  },
};

// ─── HRDashboard ──────────────────────────────────────────────────────────────
const HRDashboard = () => {
  const [program, setProgram] = useState([]);
  const [intern, setIntern] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const t = isDark ? themes.dark : themes.light;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, internRes] = await Promise.all([
          api.get("/hr/program"),
          api.get("/hr/intern"),
        ]);
        setProgram(progRes.data);
        setIntern(internRes.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Total Programs", value: program.length, icon: LayoutGridIcon, accent: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    { label: "Total Interns",  value: intern.length,  icon: UsersIcon,       accent: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Active Batches", value: program.filter((p) => p.interns?.length > 0).length, icon: TrendingUpIcon, accent: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    {
      label: "Avg. Duration",
      value: program.length
        ? `${Math.round(program.reduce((a, p) => a + (parseInt(p.duration) || 0), 0) / program.length)}w`
        : "—",
      icon: ClockIcon, accent: "#ec4899", bg: "rgba(236,72,153,0.1)",
    },
  ];

  const quickActions = [
    { label: "New Program", path: "/program",    accent: "#6366f1" },
    { label: "Add Intern",  path: "/add-intern", accent: "#10b981" },
    { label: "Add Mentor",  path: "/add-mentor", accent: "#f59e0b" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: t.bg, fontFamily: "'DM Sans', 'Inter', sans-serif", transition: "background 0.3s" }}>
      <Navbar />

      {/* Accent bar */}
      <div style={{ height: "2px", background: "linear-gradient(90deg, #6366f1, #10b981, #f59e0b)", flexShrink: 0 }} />

      <main style={{ flex: 1, maxWidth: "1280px", width: "100%", margin: "0 auto", padding: "clamp(16px, 4vw, 32px) clamp(16px, 4vw, 24px)" }}>

        {/* Header */}
        <div style={{ marginBottom: "clamp(20px, 4vw, 32px)" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6366f1", marginBottom: "4px" }}>
            Aetherbyte IT Solutions
          </p>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 700, letterSpacing: "-0.02em", color: t.text, margin: 0 }}>
                HR Dashboard
              </h1>
              <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>
                Manage programs, interns, and mentors from one place.
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {quickActions.map((a) => (
                <ActionButton key={a.label} label={a.label} accent={a.accent} t={t} onClick={() => navigate(a.path)} />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "clamp(20px, 4vw, 32px)" }}>
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} t={t} loading={loading} />
          ))}
        </div>

        {/* Programs */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: t.text, whiteSpace: "nowrap", margin: 0 }}>
              Active Programs
            </h2>
            <span style={{ fontSize: "11px", background: "rgba(99,102,241,0.12)", color: "#818cf8", padding: "2px 8px", borderRadius: "20px" }}>
              {program.length}
            </span>
            <div style={{ flex: 1, height: "1px", background: t.border }} />
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ borderRadius: "12px", height: "200px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : program.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
              {program.map((prog) => (
                <ProgramCard key={prog._id} prog={prog} t={t} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div style={{ borderRadius: "12px", border: `1px dashed ${t.emptyBorder}`, padding: "48px 24px", textAlign: "center" }}>
              <LayoutGridIcon size={32} style={{ color: t.textFaint, marginBottom: "12px" }} />
              <p style={{ fontSize: "14px", fontWeight: 500, color: t.textMuted }}>No active programs yet</p>
              <p style={{ fontSize: "12px", color: t.textMuted, marginTop: "4px", opacity: 0.7 }}>Create a program to get started</p>
              <button
                onClick={() => navigate("/program")}
                style={{ marginTop: "16px", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", cursor: "pointer" }}
              >
                + New Program
              </button>
            </div>
          )}
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${t.footerBorder}`, padding: "12px 24px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: t.textMuted }}>AetherByte IT Solutions</span>
        <span style={{ fontSize: "11px", color: t.textMuted, opacity: 0.5 }}>TIMS</span>
      </footer>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ActionButton = ({ label, accent, t, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
        background: hovered ? `${accent}18` : t.btnGhost,
        border: `1px solid ${hovered ? `${accent}50` : t.btnGhostBorder}`,
        color: hovered ? accent : t.btnGhostText,
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      <PlusIcon size={13} />{label}
    </button>
  );
};

const StatCard = ({ stat, t, loading }) => (
  <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "18px", transition: "background 0.3s, border 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
      <span style={{ fontSize: "11px", color: stat.textMuted || "#6b7280", fontWeight: 500 }}>{stat.label}</span>
      <div style={{ background: stat.bg, borderRadius: "8px", padding: "6px", display: "flex" }}>
        <stat.icon size={14} style={{ color: stat.accent }} />
      </div>
    </div>
    {loading
      ? <div style={{ height: "32px", width: "48px", borderRadius: "6px", background: t.skeletonBg }} />
      : <div style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 700, letterSpacing: "-0.03em", color: t.text }}>{stat.value}</div>
    }
  </div>
);

const ProgramCard = ({ prog, t, navigate }) => {
  const [hovered, setHovered] = useState(false);
  const internCount = prog.interns?.length || 0;
  const created = new Date(prog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? t.surfaceHover : t.surface,
        border: `1px solid ${hovered ? t.borderHover : t.border}`,
        borderRadius: "12px", padding: "18px",
        display: "flex", flexDirection: "column", gap: "14px",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={prog.title}>
            {prog.title}
          </h3>
          <p style={{ fontSize: "11px", color: t.textMuted, marginTop: "2px" }}>Created {created}</p>
        </div>
        <span style={{
          flexShrink: 0, fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "20px",
          background: internCount > 0 ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)",
          color: internCount > 0 ? "#34d399" : t.textMuted,
        }}>
          {internCount > 0 ? "Active" : "Empty"}
        </span>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        {[["Duration", prog.duration || "—"], ["Interns", internCount]].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: "10px", color: t.textMuted, margin: 0 }}>{label}</p>
            <p style={{ fontSize: "13px", fontWeight: 500, color: t.text, marginTop: "2px" }}>{val}</p>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "10px", color: t.textMuted }}>Capacity</span>
          <span style={{ fontSize: "10px", color: t.textMuted }}>{internCount} enrolled</span>
        </div>
        <div style={{ height: "3px", background: t.barBg, borderRadius: "99px", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg, #6366f1, #10b981)", width: `${Math.min((internCount / 10) * 100, 100)}%`, transition: "width 0.5s" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <CardButton label="Assign"  icon={<PenIcon  size={12} />} accent="#6366f1" t={t} onClick={() => navigate(`/assign-program/${prog._id}`)} />
        <CardButton label="Details" icon={<InfoIcon size={12} />} accent={null}    t={t} onClick={() => navigate(`/details/${prog._id}`)} />
      </div>
    </div>
  );
};

const CardButton = ({ label, icon, accent, t, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const isAccent = !!accent;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
        padding: "7px", borderRadius: "8px", fontSize: "11px", fontWeight: 500,
        cursor: "pointer", transition: "all 0.15s",
        background: isAccent ? (hovered ? `${accent}30` : `${accent}15`) : (hovered ? t.surfaceHover : t.btnGhost),
        color: isAccent ? "#818cf8" : t.btnGhostText,
        border: isAccent ? `1px solid ${accent}40` : `1px solid ${t.btnGhostBorder}`,
      }}
    >
      {icon} {label}
    </button>
  );
};

export default HRDashboard;
