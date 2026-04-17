import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import api from "../../services/api.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import PageLayout from "../../components/PageLayout.jsx";
import { FormCard, StyledSelect, PrimaryButton } from "../../components/FormComponents.jsx";
import toast from "react-hot-toast";
import { AwardIcon, CalendarIcon, PrinterIcon } from "lucide-react";

const themes = {
  dark: {
    surface: "rgba(255,255,255,0.03)", surfaceHover: "rgba(255,255,255,0.055)",
    border: "rgba(255,255,255,0.07)", text: "#f9fafb", textMuted: "#6b7280",
    textFaint: "#374151", skeletonBg: "rgba(255,255,255,0.08)",
    certBg: "rgba(255,255,255,0.02)", certBorder: "rgba(245,158,11,0.2)",
  },
  light: {
    surface: "rgba(255,255,255,0.85)", surfaceHover: "rgba(255,255,255,1)",
    border: "rgba(0,0,0,0.08)", text: "#111827", textMuted: "#6b7280",
    textFaint: "#d1d5db", skeletonBg: "rgba(0,0,0,0.07)",
    certBg: "rgba(255,248,235,0.8)", certBorder: "rgba(245,158,11,0.25)",
  },
};

const Certificates = () => {
  const { isDark } = useTheme();
  const t = isDark ? themes.dark : themes.light;
  const [searchParams] = useSearchParams();
  const preselectedIntern = searchParams.get("intern");

  const [certs, setCerts]       = useState([]);
  const [interns, setInterns]   = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form, setForm]         = useState({ internId: preselectedIntern || "", programId: "" });
  const [loading, setLoading]   = useState(true);
  const [issuing, setIssuing]   = useState(false);
  const [preview, setPreview]   = useState(null);
  // printTarget: cert to print directly without showing modal first
  const [printTarget, setPrintTarget] = useState(null);

  const fetchCerts = () =>
    api.get("/reports/certificates").then((r) => setCerts(r.data)).catch(console.log);

  useEffect(() => {
    Promise.all([
      api.get("/hr/intern"),
      api.get("/hr/program"),
      api.get("/reports/certificates"),
    ]).then(([intRes, progRes, certRes]) => {
      setInterns(intRes.data);
      setPrograms(progRes.data);
      setCerts(certRes.data);
    }).catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!form.internId || !form.programId) { toast.error("Select both intern and program"); return; }
    setIssuing(true);
    try {
      await api.post("/reports/certificate", form);
      toast.success("Certificate issued!");
      setForm({ internId: "", programId: "" });
      fetchCerts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to issue certificate");
    } finally {
      setIssuing(false);
    }
  };

  // Print: show the hidden print-only cert, then window.print(), then hide it
  const handlePrint = (cert) => {
    setPrintTarget(cert);
    // useEffect below watches printTarget and fires print after render
  };

  useEffect(() => {
    if (!printTarget) return;
    // Use requestAnimationFrame to ensure the DOM has painted before printing
    const raf = requestAnimationFrame(() => {
      window.print();
      // Give print dialog time to open before clearing the target
      setTimeout(() => setPrintTarget(null), 1000);
    });
    return () => cancelAnimationFrame(raf);
  }, [printTarget]);

  return (
    <PageLayout backPath="/reports" backLabel="Back to Reports" maxWidth="980px">
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f59e0b", marginBottom: "4px" }}>HR Portal</p>
        <h1 style={{ fontSize: "clamp(20px,4vw,26px)", fontWeight: 700, letterSpacing: "-0.02em", color: t.text, margin: 0 }}>Certificates</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>Issue and manage completion certificates for interns.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", alignItems: "start" }}>
        {/* Issue form */}
        <FormCard title="Issue Certificate" subtitle="Select an intern and their completed program">
          <form onSubmit={handleIssue} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <StyledSelect label="Intern" value={form.internId} onChange={(e) => setForm({ ...form, internId: e.target.value })} required>
              <option value="">Select intern...</option>
              {interns.map((i) => (
                <option key={i._id} value={i._id}>{i.name} — {i.college || i.email}</option>
              ))}
            </StyledSelect>
            <StyledSelect label="Program" value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })} required>
              <option value="">Select program...</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </StyledSelect>
            <div style={{ marginTop: "4px" }}>
              <PrimaryButton type="submit" loading={issuing}>
                <AwardIcon size={14} /> Issue Certificate
              </PrimaryButton>
            </div>
          </form>
        </FormCard>

        {/* Certs list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: t.text, margin: 0 }}>Issued Certificates</h2>
            <span style={{ fontSize: "11px", background: "rgba(245,158,11,0.12)", color: "#f59e0b", padding: "2px 8px", borderRadius: "20px" }}>{certs.length}</span>
          </div>
          {loading ? (
            [1,2,3].map(i => <div key={i} style={{ height: "90px", borderRadius: "12px", background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />)
          ) : certs.length === 0 ? (
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "48px 24px", textAlign: "center" }}>
              <AwardIcon size={32} style={{ color: t.textFaint, marginBottom: "12px" }} />
              <p style={{ fontSize: "14px", color: t.textMuted }}>No certificates issued yet</p>
            </div>
          ) : (
            certs.map((cert) => (
              <CertCard
                key={cert._id} cert={cert} t={t} isDark={isDark}
                onPreview={() => setPreview(cert)}
                onPrint={() => handlePrint(cert)}
              />
            ))
          )}
        </div>
      </div>

      {/* View modal */}
      {preview && (
        <CertModal cert={preview} onClose={() => setPreview(null)} onPrint={() => { setPreview(null); handlePrint(preview); }} />
      )}

      {/* Hidden print-only certificate — rendered in DOM but invisible until print */}
      {printTarget && (
        <div id="cert-print-only" style={{ display: "none" }}>
          <CertContent cert={printTarget} />
        </div>
      )}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

        /* Print: hide everything EXCEPT the cert */
        @media print {
          body * { visibility: hidden; }
          #cert-print-only,
          #cert-print-only * { visibility: visible; display: block !important; }
          #cert-print-only {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex !important;
            align-items: center;
            justify-content: center;
            background: white;
          }
        }
      `}</style>
    </PageLayout>
  );
};

// ─── Reusable cert content (used in both modal and print area) ────────────────
const CertContent = ({ cert }) => {
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div style={{
      background: "#fffdf5",
      border: "3px solid #f59e0b",
      borderRadius: "16px",
      padding: "48px",
      width: "580px",
      textAlign: "center",
      fontFamily: "'DM Sans', serif",
      boxShadow: "inset 0 0 0 8px rgba(245,158,11,0.06)",
    }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)", borderRadius: "2px", marginBottom: "28px" }} />

      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#92400e", marginBottom: "8px" }}>
        Aetherbyte IT Solutions
      </p>

      <AwardIcon size={40} style={{ color: "#f59e0b", marginBottom: "14px" }} />

      <p style={{ fontSize: "14px", color: "#78350f", marginBottom: "6px", letterSpacing: "0.05em" }}>Certificate of Completion</p>
      <p style={{ fontSize: "13px", color: "#92400e", marginBottom: "20px" }}>This is to certify that</p>

      <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#1c1917", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        {cert.internId?.name || "—"}
      </h2>
      <p style={{ fontSize: "12px", color: "#78350f", marginBottom: "20px" }}>
        {cert.internId?.college || cert.internId?.email || ""}
      </p>

      <p style={{ fontSize: "14px", color: "#44403c", marginBottom: "8px" }}>has successfully completed the internship program</p>
      <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#6366f1", margin: "0 0 6px" }}>
        {cert.programId?.title || "—"}
      </h3>
      <p style={{ fontSize: "13px", color: "#78350f", marginBottom: "28px" }}>
        Duration: {cert.programId?.duration || "—"}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid rgba(245,158,11,0.3)", paddingTop: "20px" }}>
        <div style={{ textAlign: "left" }}>
          <p style={{ fontSize: "11px", color: "#92400e", margin: 0 }}>Issued by</p>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917", margin: "2px 0 0" }}>
            {cert.issuedBy?.name || "HR Manager"}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "11px", color: "#92400e", margin: 0 }}>Date of Issue</p>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917", margin: "2px 0 0" }}>{issuedDate}</p>
        </div>
      </div>
    </div>
  );
};

// ─── View modal ───────────────────────────────────────────────────────────────
const CertModal = ({ cert, onClose, onPrint }) => (
  <div
    onClick={onClose}
    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
  >
    <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <CertContent cert={cert} />
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onPrint}
          style={{ padding: "9px 20px", borderRadius: "8px", background: "#10b981", color: "#fff", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <PrinterIcon size={14} /> Print / Save PDF
        </button>
        <button
          onClick={onClose}
          style={{ padding: "9px 20px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

// ─── Cert card ────────────────────────────────────────────────────────────────
const CertCard = ({ cert, t, onPreview, onPrint }) => {
  const [hovered, setHovered] = useState(false);
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? t.surfaceHover : t.certBg, border: `1px solid ${hovered ? "rgba(245,158,11,0.4)" : t.certBorder}`, borderRadius: "12px", padding: "16px 18px", transition: "all 0.2s" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AwardIcon size={18} style={{ color: "#f59e0b" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {cert.internId?.name || "—"}
            </p>
            <p style={{ fontSize: "11px", color: t.textMuted, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {cert.programId?.title || "—"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          <button onClick={onPreview} style={{ padding: "4px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 500, background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            View
          </button>
          <button onClick={onPrint} style={{ padding: "4px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 500, background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "4px" }}>
            <PrinterIcon size={10} /> Print
          </button>
        </div>
      </div>
      <p style={{ fontSize: "11px", color: t.textMuted, marginTop: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
        <CalendarIcon size={11} /> Issued on {issuedDate}
      </p>
    </div>
  );
};

export default Certificates;
