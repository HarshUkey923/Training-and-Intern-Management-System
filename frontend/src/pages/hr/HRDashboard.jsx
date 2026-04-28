import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar.jsx";
import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import toast from "react-hot-toast";
import {
  InfoIcon, PenIcon, PlusIcon, XIcon,
  UsersIcon, LayoutGridIcon, TrendingUpIcon, UserIcon,
  TrashIcon, MailIcon, BookOpenIcon, BriefcaseIcon,
} from "lucide-react";

const themes = {
  dark: {
    bg: "linear-gradient(135deg, #0f1117 0%, #13151e 60%, #0f1117 100%)",
    surface: "rgba(255,255,255,0.03)", surfaceHover: "rgba(255,255,255,0.055)",
    border: "rgba(255,255,255,0.07)", borderHover: "rgba(99,102,241,0.35)",
    text: "#f9fafb", textMuted: "#6b7280", textFaint: "#374151",
    skeletonBg: "rgba(255,255,255,0.08)", emptyBorder: "rgba(255,255,255,0.08)",
    btnGhost: "rgba(255,255,255,0.04)", btnGhostBorder: "rgba(255,255,255,0.08)",
    btnGhostText: "#e5e7eb", footerBorder: "rgba(255,255,255,0.05)",
    barBg: "rgba(255,255,255,0.06)", modalBg: "#161920",
    rowHover: "rgba(255,255,255,0.03)", theadBg: "rgba(255,255,255,0.03)",
  },
  light: {
    bg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 60%, #f8fafc 100%)",
    surface: "rgba(255,255,255,0.8)", surfaceHover: "rgba(255,255,255,1)",
    border: "rgba(0,0,0,0.08)", borderHover: "rgba(99,102,241,0.4)",
    text: "#111827", textMuted: "#6b7280", textFaint: "#d1d5db",
    skeletonBg: "rgba(0,0,0,0.07)", emptyBorder: "rgba(0,0,0,0.08)",
    btnGhost: "rgba(0,0,0,0.03)", btnGhostBorder: "rgba(0,0,0,0.09)",
    btnGhostText: "#374151", footerBorder: "rgba(0,0,0,0.07)",
    barBg: "rgba(0,0,0,0.07)", modalBg: "#ffffff",
    rowHover: "rgba(0,0,0,0.02)", theadBg: "rgba(0,0,0,0.03)",
  },
};

const HRDashboard = () => {
  const [program, setProgram]       = useState([]);
  const [intern, setIntern]         = useState([]);
  const [mentor, setMentor]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showInterns, setShowInterns] = useState(false);
  const [showMentors, setShowMentors] = useState(false);
  const { isDark } = useTheme();
  const t = isDark ? themes.dark : themes.light;
  const navigate = useNavigate();

  const fetchAll = async () => {
    try {
      const [progRes, internRes, mentorRes] = await Promise.all([
        api.get("/hr/program"),
        api.get("/hr/intern"),
        api.get("/hr/mentor"),
      ]);
      setProgram(progRes.data);
      setIntern(internRes.data);
      setMentor(mentorRes.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDeleteIntern = async (id) => {
    if (!window.confirm("Delete this intern? This cannot be undone.")) return;
    try {
      await api.delete(`/hr/delete-intern/${id}`);
      toast.success("Intern deleted");
      setIntern((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete intern");
    }
  };

  const handleDeleteMentor = async (id) => {
    if (!window.confirm("Delete this mentor? This cannot be undone.")) return;
    try {
      await api.delete(`/hr/delete-mentor/${id}`);
      toast.success("Mentor deleted");
      setMentor((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete mentor");
    }
  };

  const stats = [
    { label: "Total Programs", value: program.length, icon: LayoutGridIcon, accent: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    { label: "Total Interns",  value: intern.length,  icon: UsersIcon,       accent: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Active Batches", value: program.filter((p) => p.interns?.length > 0).length, icon: TrendingUpIcon, accent: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    // ← Avg Duration replaced with Total Mentors
    { label: "Total Mentors",  value: mentor.length,  icon: UserIcon,        accent: "#ec4899", bg: "rgba(236,72,153,0.1)" },
  ];

  const quickActions = [
    { label: "Add HR",       path: "/hr/add-hr", accent: "#10b981"},
    { label: "New Program",  path: "/hr/program",    accent: "#6366f1" },
    { label: "Add Intern",   path: "/hr/add-intern", accent: "#10b981" },
    { label: "Add Mentor",   path: "/hr/add-mentor", accent: "#f59e0b" },
    { label: "Reports",      path: "/hr/reports", accent: "#ec4899" }
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
              {/* All Interns button */}
              <ActionButton label="All Interns" accent="#10b981" t={t} onClick={() => setShowInterns(true)} icon={<UsersIcon size={13} />} />
              {/* All Mentors button */}
              <ActionButton label="All Mentors" accent="#ec4899" t={t} onClick={() => setShowMentors(true)} icon={<UserIcon size={13} />} />
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
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: t.text, whiteSpace: "nowrap", margin: 0 }}>Active Programs</h2>
            <span style={{ fontSize: "11px", background: "rgba(99,102,241,0.12)", color: "#818cf8", padding: "2px 8px", borderRadius: "20px" }}>
              {program.length}
            </span>
            <div style={{ flex: 1, height: "1px", background: t.border }} />
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
              {[1,2,3].map((i) => <div key={i} style={{ borderRadius: "12px", height: "200px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />)}
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
              <button onClick={() => navigate("/hr/program")} style={{ marginTop: "16px", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", cursor: "pointer" }}>
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

      {/* All Interns Modal */}
      {showInterns && (
        <PeopleModal
          title="All Interns"
          people={intern}
          type="intern"
          t={t} isDark={isDark}
          onClose={() => setShowInterns(false)}
          onDelete={handleDeleteIntern}
          onAdd={() => { setShowInterns(false); navigate("/hr/add-intern"); }}
        />
      )}

      {/* All Mentors Modal */}
      {showMentors && (
        <PeopleModal
          title="All Mentors"
          people={mentor}
          type="mentor"
          t={t} isDark={isDark}
          onClose={() => setShowMentors(false)}
          onDelete={handleDeleteMentor}
          onAdd={() => { setShowMentors(false); navigate("/hr/add-mentor"); }}
        />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
};

// ─── People modal (interns or mentors) ───────────────────────────────────────
const PeopleModal = ({ title, people, type, t, isDark, onClose, onDelete, onAdd }) => {
  const [search, setSearch] = useState("");
  const filtered = people.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const isIntern = type === "intern";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: isDark ? "#161920" : "#ffffff", border: `1px solid ${t.border}`, borderRadius: "16px", width: "100%", maxWidth: "700px", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>

        {/* Modal header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: t.text, margin: 0 }}>{title}</h2>
            <span style={{ fontSize: "11px", background: isIntern ? "rgba(16,185,129,0.12)" : "rgba(236,72,153,0.12)", color: isIntern ? "#34d399" : "#f472b6", padding: "2px 8px", borderRadius: "20px" }}>{people.length}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={onAdd}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, background: isIntern ? "rgba(16,185,129,0.12)" : "rgba(236,72,153,0.12)", color: isIntern ? "#34d399" : "#f472b6", border: `1px solid ${isIntern ? "rgba(16,185,129,0.25)" : "rgba(236,72,153,0.25)"}`, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              <PlusIcon size={12} /> Add {isIntern ? "Intern" : "Mentor"}
            </button>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: t.textMuted, padding: "4px", display: "flex" }}>
              <XIcon size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 24px", borderBottom: `1px solid ${t.border}` }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${isIntern ? "interns" : "mentors"}...`}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", background: t.btnGhost, color: t.text, border: `1px solid ${t.btnGhostBorder}`, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
          />
        </div>

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: t.textMuted }}>No {isIntern ? "interns" : "mentors"} found</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: t.theadBg, position: "sticky", top: 0 }}>
                  {isIntern
                    ? ["Name", "Email", "College", "Department", ""].map((h) => <Th key={h} label={h} t={t} />)
                    : ["Name", "Email", "Specialization", ""].map((h) => <Th key={h} label={h} t={t} />)
                  }
                </tr>
              </thead>
              <tbody>
                {filtered.map((person, i) => (
                  <PersonRow
                    key={person._id}
                    person={person}
                    type={type}
                    t={t}
                    isLast={i === filtered.length - 1}
                    onDelete={() => onDelete(person._id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const Th = ({ label, t }) => (
  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${t.border}` }}>
    {label}
  </th>
);

const PersonRow = ({ person, type, t, isLast, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const [delBtnHovered, setDelBtnHovered] = useState(false);
  const isIntern = type === "intern";

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? t.rowHover : "transparent", transition: "background 0.15s", borderBottom: isLast ? "none" : `1px solid ${t.border}` }}
    >
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: isIntern ? "rgba(16,185,129,0.12)" : "rgba(236,72,153,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <UserIcon size={13} style={{ color: isIntern ? "#34d399" : "#f472b6" }} />
          </div>
          <span style={{ fontWeight: 500, color: t.text }}>{person.name}</span>
        </div>
      </td>
      <td style={{ padding: "12px 16px", color: t.textMuted, fontSize: "12px" }}>{person.email}</td>
      {isIntern ? (
        <>
          <td style={{ padding: "12px 16px", color: t.textMuted, fontSize: "12px" }}>{person.college || "—"}</td>
          <td style={{ padding: "12px 16px", color: t.textMuted, fontSize: "12px" }}>{person.department || "—"}</td>
        </>
      ) : (
        <td style={{ padding: "12px 16px", color: t.textMuted, fontSize: "12px" }}>{person.specialization || "—"}</td>
      )}
      <td style={{ padding: "12px 16px", textAlign: "right" }}>
        <button
          onClick={onDelete}
          onMouseEnter={() => setDelBtnHovered(true)}
          onMouseLeave={() => setDelBtnHovered(false)}
          style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 500, background: delBtnHovered ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s" }}
        >
          <TrashIcon size={11} /> Delete
        </button>
      </td>
    </tr>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────
const ActionButton = ({ label, accent = "#6366f1", t, onClick, icon }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, background: hovered ? `${accent}18` : t.btnGhost, border: `1px solid ${hovered ? `${accent}50` : t.btnGhostBorder}`, color: hovered ? accent : t.btnGhostText, cursor: "pointer", transition: "all 0.15s" }}
    >
      {icon ?? <PlusIcon size={13} />}{label}
    </button>
  );
};

const StatCard = ({ stat, t, loading }) => (
  <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "18px", transition: "background 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
      <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>{stat.label}</span>
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
      style={{ background: hovered ? t.surfaceHover : t.surface, border: `1px solid ${hovered ? t.borderHover : t.border}`, borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px", transform: hovered ? "translateY(-2px)" : "translateY(0)", transition: "all 0.2s", boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={prog.title}>{prog.title}</h3>
          <p style={{ fontSize: "11px", color: t.textMuted, marginTop: "2px" }}>Created {created}</p>
        </div>
        <span style={{ flexShrink: 0, fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "20px", background: internCount > 0 ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)", color: internCount > 0 ? "#34d399" : t.textMuted }}>
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
        <CardButton label="Assign" icon={<PenIcon size={12} />} accent="#6366f1" t={t} onClick={() => navigate(`/hr/assign-program/${prog._id}`)} />
        <CardButton label="Details" icon={<InfoIcon size={12} />} accent={null} t={t} onClick={() => navigate(`/hr/details/${prog._id}`)} />
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
      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "7px", borderRadius: "8px", fontSize: "11px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s", background: isAccent ? (hovered ? `${accent}30` : `${accent}15`) : (hovered ? t.surfaceHover : t.btnGhost), color: isAccent ? "#818cf8" : t.btnGhostText, border: isAccent ? `1px solid ${accent}40` : `1px solid ${t.btnGhostBorder}` }}
    >
      {icon} {label}
    </button>
  );
};

export default HRDashboard;