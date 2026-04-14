import Navbar from "./Navbar.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router";

const themes = {
  dark: {
    bg: "linear-gradient(135deg, #0f1117 0%, #13151e 60%, #0f1117 100%)",
    text: "#f9fafb",
    textMuted: "#6b7280",
    footerBorder: "rgba(255,255,255,0.05)",
    backBtn: "rgba(255,255,255,0.04)",
    backBtnBorder: "rgba(255,255,255,0.08)",
    backBtnText: "#9ca3af",
  },
  light: {
    bg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 60%, #f8fafc 100%)",
    text: "#111827",
    textMuted: "#6b7280",
    footerBorder: "rgba(0,0,0,0.07)",
    backBtn: "rgba(255,255,255,0.8)",
    backBtnBorder: "rgba(0,0,0,0.09)",
    backBtnText: "#6b7280",
  },
};

const PageLayout = ({
  children,
  backPath  = null,       // null = no back button (use for dashboards)
  backLabel = "Back",
  maxWidth  = "1280px",  // wide default suits dashboards; pass "680px" for forms
}) => {
  const { isDark } = useTheme();
  const t = isDark ? themes.dark : themes.light;
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: t.bg, fontFamily: "'DM Sans', 'Inter', sans-serif", transition: "background 0.3s" }}>
      <Navbar />
      <div style={{ height: "2px", background: "linear-gradient(90deg, #6366f1, #10b981, #f59e0b)", flexShrink: 0 }} />

      <main style={{ flex: 1, width: "100%", maxWidth, margin: "0 auto", padding: "clamp(16px, 4vw, 32px) clamp(16px, 4vw, 24px)" }}>

        {/* Back button — only rendered when backPath is a non-null string */}
        {backPath && (
          <button
            onClick={() => navigate(backPath)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "8px", marginBottom: "24px",
              fontSize: "13px", fontWeight: 500, cursor: "pointer",
              background: t.backBtn, border: `1px solid ${t.backBtnBorder}`,
              color: t.backBtnText, transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = t.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.backBtnText; }}
          >
            <ArrowLeftIcon size={14} /> {backLabel}
          </button>
        )}

        {children}
      </main>

      <footer style={{ borderTop: `1px solid ${t.footerBorder}`, padding: "12px 24px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: t.textMuted }}>AetherByte IT Solutions</span>
        <span style={{ fontSize: "11px", color: t.textMuted, opacity: 0.5 }}>TIMS v1.0</span>
      </footer>
    </div>
  );
};

export default PageLayout;
