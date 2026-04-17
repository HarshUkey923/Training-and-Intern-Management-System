import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../../services/api.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import PageLayout from "../../components/PageLayout.jsx";
import {
  UsersIcon, LayoutGridIcon, ClipboardListIcon,
  TrendingUpIcon, CheckCircleIcon, ClockIcon, AwardIcon,
} from "lucide-react";

const themes = {
  dark: {
    surface: "rgba(255,255,255,0.03)", surfaceHover: "rgba(255,255,255,0.055)",
    border: "rgba(255,255,255,0.07)", text: "#f9fafb", textMuted: "#6b7280",
    textFaint: "#374151", theadBg: "rgba(255,255,255,0.03)",
    rowHover: "rgba(255,255,255,0.03)", skeletonBg: "rgba(255,255,255,0.08)",
    barBg: "rgba(255,255,255,0.06)", pillBg: "rgba(255,255,255,0.04)",
    pillBorder: "rgba(255,255,255,0.08)",
  },
  light: {
    surface: "rgba(255,255,255,0.85)", surfaceHover: "rgba(255,255,255,1)",
    border: "rgba(0,0,0,0.08)", text: "#111827", textMuted: "#6b7280",
    textFaint: "#d1d5db", theadBg: "rgba(0,0,0,0.03)",
    rowHover: "rgba(0,0,0,0.02)", skeletonBg: "rgba(0,0,0,0.07)",
    barBg: "rgba(0,0,0,0.07)", pillBg: "rgba(0,0,0,0.03)",
    pillBorder: "rgba(0,0,0,0.09)",
  },
};

const TAB_LIST = ["Overview", "Interns", "Programs"];

const Reports = () => {
  const { isDark } = useTheme();
  const t = isDark ? themes.dark : themes.light;
  const navigate = useNavigate();

  const [tab, setTab]                 = useState("Overview");
  const [overview, setOverview]       = useState(null);
  const [internReports, setInternReports] = useState([]);
  const [programReports, setProgramReports] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ovRes, intRes, progRes] = await Promise.all([
          api.get("/reports/overview"),
          api.get("/reports/interns"),
          api.get("/reports/programs"),
        ]);
        setOverview(ovRes.data);
        setInternReports(intRes.data);
        setProgramReports(progRes.data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const taskBreakdown = overview?.taskBreakdown || [];
  const getCount = (status) => taskBreakdown.find(b => b._id === status)?.count || 0;

  return (
    <PageLayout backPath="/hr" backLabel="Back to Dashboard" maxWidth="1100px">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6366f1", marginBottom: "4px" }}>HR Portal</p>
          <h1 style={{ fontSize: "clamp(20px,4vw,26px)", fontWeight: 700, letterSpacing: "-0.02em", color: t.text, margin: 0 }}>Reports & Analytics</h1>
          <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>Program performance, intern progress, and certifications.</p>
        </div>
        <button
          onClick={() => navigate("/certificates")}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
        >
          <AwardIcon size={14} /> Certificates
        </button>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: `1px solid ${t.border}`, paddingBottom: "0" }}>
        {TAB_LIST.map((tb) => (
          <button key={tb} onClick={() => setTab(tb)} style={{
            padding: "8px 18px", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            background: "transparent", border: "none", fontFamily: "'DM Sans', sans-serif",
            color: tab === tb ? "#6366f1" : t.textMuted,
            borderBottom: tab === tb ? "2px solid #6366f1" : "2px solid transparent",
            marginBottom: "-1px", transition: "all 0.15s",
          }}>{tb}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
            {[
              { label: "Programs",    value: overview?.programs,    icon: LayoutGridIcon,    accent: "#6366f1", bg: "rgba(99,102,241,0.1)" },
              { label: "Interns",     value: overview?.interns,     icon: UsersIcon,         accent: "#10b981", bg: "rgba(16,185,129,0.1)" },
              { label: "Mentors",     value: overview?.mentors,     icon: UsersIcon,         accent: "#ec4899", bg: "rgba(236,72,153,0.1)" },
              { label: "Total Tasks", value: overview?.tasks,       icon: ClipboardListIcon, accent: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
              { label: "Submissions", value: overview?.submissions, icon: CheckCircleIcon,   accent: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
            ].map((s) => <StatCard key={s.label} stat={s} t={t} loading={loading} />)}
          </div>

          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "22px 24px", boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: t.text, margin: "0 0 18px" }}>Task Status Breakdown</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Pending",   count: getCount("Pending"),   color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                { label: "Submitted", count: getCount("Submitted"), color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
                { label: "Reviewed",  count: getCount("Reviewed"),  color: "#10b981", bg: "rgba(16,185,129,0.1)" },
              ].map((row) => {
                const total = overview?.tasks || 1;
                const pct   = Math.round((row.count / total) * 100);
                return (
                  <div key={row.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: t.text }}>{row.label}</span>
                      <span style={{ fontSize: "12px", color: t.textMuted }}>{row.count} ({pct}%)</span>
                    </div>
                    <div style={{ height: "6px", background: t.barBg, borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "99px", background: row.color, width: `${pct}%`, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "Interns" && (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", overflow: "hidden", boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
          {loading ? <SkeletonRows t={t} /> : internReports.length === 0 ? (
            <EmptyState label="No intern data" t={t} />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: t.theadBg }}>
                    {["Intern", "Program", "Progress", "Tasks", "Avg Rating", "Action"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {internReports.map((r, i) => (
                    <InternReportRow key={r.intern._id} r={r} t={t} isLast={i === internReports.length - 1} navigate={navigate} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "Programs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {loading ? [1,2].map(i => <div key={i} style={{ height: "160px", borderRadius: "14px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />) :
          programReports.length === 0 ? <EmptyState label="No program data" t={t} /> :
          programReports.map((prog) => <ProgramReportCard key={prog._id} prog={prog} t={t} isDark={isDark} />)}
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </PageLayout>
  );
};

const StatCard = ({ stat, t, loading }) => (
  <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
      <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>{stat.label}</span>
      <div style={{ background: stat.bg, borderRadius: "8px", padding: "6px", display: "flex" }}>
        <stat.icon size={14} style={{ color: stat.accent }} />
      </div>
    </div>
    {loading
      ? <div style={{ height: "32px", width: "48px", borderRadius: "6px", background: t.skeletonBg }} />
      : <div style={{ fontSize: "clamp(22px,4vw,28px)", fontWeight: 700, letterSpacing: "-0.03em", color: t.text }}>{stat.value ?? "—"}</div>
    }
  </div>
);

const InternReportRow = ({ r, t, isLast, navigate }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? t.surfaceHover : "transparent", transition: "background 0.15s", borderBottom: isLast ? "none" : `1px solid ${t.border}` }}>
      <td style={{ padding: "13px 16px" }}>
        <div style={{ fontWeight: 600, color: t.text }}>{r.intern.name}</div>
        <div style={{ fontSize: "11px", color: t.textMuted }}>{r.intern.email}</div>
      </td>
      <td style={{ padding: "13px 16px", color: t.textMuted, fontSize: "12px" }}>{r.program?.title || "—"}</td>
      <td style={{ padding: "13px 16px", minWidth: "140px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ flex: 1, height: "5px", background: t.barBg, borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg, #6366f1, #10b981)", width: `${r.progress}%`, transition: "width 0.6s" }} />
          </div>
          <span style={{ fontSize: "11px", fontWeight: 600, color: t.text, flexShrink: 0 }}>{r.progress}%</span>
        </div>
      </td>
      <td style={{ padding: "13px 16px" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { label: r.pending,   color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
            { label: r.submitted, color: "#6366f1", bg: "rgba(99,102,241,0.1)"  },
            { label: r.reviewed,  color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
          ].map((p, i) => (
            <span key={i} style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "12px", background: p.bg, color: p.color }}>{p.label}</span>
          ))}
        </div>
      </td>
      <td style={{ padding: "13px 16px" }}>
        {r.avgRating ? (
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b" }}>⭐ {r.avgRating}</span>
        ) : <span style={{ color: t.textMuted, fontSize: "12px" }}>—</span>}
      </td>
      <td style={{ padding: "13px 16px" }}>
        <button
          onClick={() => navigate(`/certificates?intern=${r.intern._id}`)}
          style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 500, background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
        >
          Issue Cert
        </button>
      </td>
    </tr>
  );
};

const ProgramReportCard = ({ prog, t, isDark }) => (
  <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "20px 24px", boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.15)" : "0 2px 12px rgba(0,0,0,0.05)" }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
      <div>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: t.text, margin: "0 0 4px" }}>{prog.title}</h3>
        <p style={{ fontSize: "12px", color: t.textMuted, margin: 0 }}>Duration: {prog.duration || "—"}</p>
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <Pill label={`${prog.interns?.length || 0} Interns`}  color="#10b981" />
        <Pill label={`${prog.mentors?.length || 0} Mentors`}  color="#6366f1" />
        <Pill label={`${prog.progress}% done`}                color="#f59e0b" />
      </div>
    </div>

    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", color: t.textMuted }}>Completion</span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: t.text }}>{prog.reviewed} / {prog.totalTasks} tasks reviewed</span>
      </div>
      <div style={{ height: "6px", background: t.barBg, borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg, #6366f1, #10b981)", width: `${prog.progress}%`, transition: "width 0.8s" }} />
      </div>
    </div>

    {prog.mentors?.length > 0 && (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {prog.mentors.map((m) => (
          <span key={m._id} style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
            {m.name}
          </span>
        ))}
      </div>
    )}
  </div>
);

const Pill = ({ label, color }) => (
  <span style={{ fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "20px", background: color + "15", color, border: `1px solid ${color}30` }}>{label}</span>
);

const SkeletonRows = ({ t }) => (
  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
    {[1,2,3].map(i => <div key={i} style={{ height: "52px", borderRadius: "8px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />)}
  </div>
);

const EmptyState = ({ label, t }) => (
  <div style={{ padding: "48px 24px", textAlign: "center" }}>
    <TrendingUpIcon size={28} style={{ color: t.textFaint, marginBottom: "12px" }} />
    <p style={{ fontSize: "14px", color: t.textMuted }}>{label}</p>
  </div>
);

export default Reports;
