import { useEffect, useState } from "react";
import PageLayout from "../../components/PageLayout.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import api from "../../services/api.js";
import toast from "react-hot-toast";
import { BookOpenIcon, CalendarIcon, ClockIcon, UsersIcon, UserIcon } from "lucide-react";

const themes = {
  dark: {
    surface: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.07)",
    text: "#f9fafb",
    textMuted: "#6b7280",
    textFaint: "#374151",
    skeletonBg: "rgba(255,255,255,0.08)",
    metaBg: "rgba(255,255,255,0.03)",
  },
  light: {
    surface: "rgba(255,255,255,0.85)",
    border: "rgba(0,0,0,0.08)",
    text: "#111827",
    textMuted: "#6b7280",
    textFaint: "#d1d5db",
    skeletonBg: "rgba(0,0,0,0.07)",
    metaBg: "rgba(0,0,0,0.02)",
  },
};

const MyProgram = () => {
  const { isDark } = useTheme();
  const t = isDark ? themes.dark : themes.light;

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // GET /api/programs — Intern role is allowed
        const res = await api.get("/programs");
        setPrograms(res.data || []);
      } catch {
        toast.error("Failed to load programs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageLayout backPath="/intern" backLabel="Back to Dashboard" maxWidth="800px">
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6366f1", marginBottom: "4px" }}>Intern Portal</p>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: t.text, margin: 0 }}>My Program</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>Details about your internship program.</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[1, 2].map(i => <div key={i} style={{ height: "180px", borderRadius: "14px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />)}
        </div>
      ) : programs.length === 0 ? (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "60px 24px", textAlign: "center", boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          <BookOpenIcon size={36} style={{ color: t.textFaint, marginBottom: "14px" }} />
          <p style={{ fontSize: "15px", fontWeight: 500, color: t.textMuted }}>No programs found</p>
          <p style={{ fontSize: "12px", color: t.textMuted, marginTop: "4px", opacity: 0.7 }}>Your HR will assign you to a program.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {programs.map((prog, i) => (
            <ProgramCard key={prog._id} prog={prog} t={t} isDark={isDark} index={i} />
          ))}
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </PageLayout>
  );
};

const ACCENTS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899"];

const ProgramCard = ({ prog, t, isDark, index }) => {
  const accent  = ACCENTS[index % ACCENTS.length];
  const created = new Date(prog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "16px", overflow: "hidden", boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
      {/* Accent top bar */}
      <div style={{ height: "3px", background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

      <div style={{ padding: "22px 24px" }}>
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, margin: "0 0 4px" }}>Program</p>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: t.text, margin: 0, letterSpacing: "-0.01em" }}>{prog.title}</h2>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: "rgba(16,185,129,0.1)", color: "#34d399", flexShrink: 0 }}>
            Active
          </span>
        </div>

        {/* Description */}
        {prog.description && (
          <p style={{ fontSize: "13px", color: t.textMuted, lineHeight: 1.6, marginBottom: "20px" }}>
            {prog.description}
          </p>
        )}

        {/* Meta grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", paddingTop: "16px", borderTop: `1px solid ${t.border}` }}>
          <MetaItem icon={<ClockIcon size={13} />}    label="Duration"  value={prog.duration || "—"}      t={t} />
          <MetaItem icon={<CalendarIcon size={13} />} label="Created"   value={created}                   t={t} />
          <MetaItem icon={<UsersIcon size={13} />}    label="Interns"   value={prog.interns?.length ?? 0}  t={t} />
          <MetaItem icon={<UserIcon size={13} />}     label="Mentors"   value={prog.mentors?.length ?? 0}  t={t} />
        </div>

        {/* Mentors list */}
        {prog.mentors?.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            <p style={{ fontSize: "11px", color: t.textMuted, fontWeight: 500, marginBottom: "8px" }}>Assigned Mentors</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {prog.mentors.map((m, idx) => (
                <span key={idx} style={{ fontSize: "12px", fontWeight: 500, padding: "4px 12px", borderRadius: "20px", background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                  {typeof m === "object" ? m.name : m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetaItem = ({ icon, label, value, t }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", background: t.metaBg, border: `1px solid ${t.border}` }}>
    <span style={{ color: "#6b7280" }}>{icon}</span>
    <div>
      <p style={{ fontSize: "10px", color: t.textMuted, margin: 0 }}>{label}</p>
      <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0 }}>{value}</p>
    </div>
  </div>
);

export default MyProgram;
