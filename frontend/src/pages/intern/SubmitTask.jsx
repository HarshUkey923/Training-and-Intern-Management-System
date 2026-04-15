import { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout.jsx";
import { FormCard, StyledSelect, StyledTextarea, PrimaryButton } from "../../components/FormComponents.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import api from "../../services/api.js";
import toast from "react-hot-toast";
import { UploadIcon, FileIcon, XIcon, CheckCircleIcon, SendIcon } from "lucide-react";

const SubmitTask = () => {
  const { isDark } = useTheme();
  const [tasks, setTasks]       = useState([]);
  const [form, setForm]         = useState({ taskId: "", note: "" });
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess]   = useState(false);
  const fileRef = useRef();

  const border  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const text    = isDark ? "#f9fafb" : "#111827";
  const muted   = isDark ? "#6b7280" : "#9ca3af";
  const dropBg  = isDark ? "rgba(255,255,255,0.02)" : "rgba(248,250,252,0.8)";
  const dropHov = isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)";

  useEffect(() => {
    api.get("/tasks/intern")
      .then((res) => setTasks((res.data || []).filter((tk) => tk.status === "Pending")))
      .catch(() => toast.error("Failed to load tasks"))
      .finally(() => setFetching(false));
  }, []);

  const handleFile = (e) => { const f = e.target.files[0]; if (f) setFile(f); };
  const handleDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.taskId) { toast.error("Please select a task"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("taskId", form.taskId);
      fd.append("note",   form.note);
      if (file) fd.append("file", file);

      // ⚠️ Do NOT set Content-Type manually — axios sets multipart boundary automatically
      await api.post("/submissions", fd);

      setSuccess(true);
      toast.success("Task submitted successfully!");
      setForm({ taskId: "", note: "" });
      setFile(null);
      setTasks((prev) => prev.filter((tk) => tk._id !== form.taskId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageLayout backPath="/intern" backLabel="Back to Dashboard">
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <CheckCircleIcon size={48} style={{ color: "#10b981", marginBottom: "16px" }} />
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: text, margin: "0 0 8px" }}>Submitted!</h2>
          <p style={{ fontSize: "14px", color: muted, marginBottom: "24px" }}>Your work has been submitted. Your mentor will review it soon.</p>
          <button
            onClick={() => setSuccess(false)}
            style={{ padding: "10px 24px", borderRadius: "10px", background: "#6366f1", color: "#fff", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
            Submit Another
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout backPath="/intern/tasks" backLabel="Back to Tasks" maxWidth="640px">
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6366f1", marginBottom: "4px" }}>Intern Portal</p>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: text, margin: 0 }}>Submit Work</h1>
        <p style={{ fontSize: "13px", color: muted, marginTop: "4px" }}>Upload your work and add a note for your mentor.</p>
      </div>

      <FormCard title="Task Submission" subtitle="Select the task you're submitting for">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Task selector */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 500, color: isDark ? "#9ca3af" : "#6b7280", display: "block", marginBottom: "6px" }}>
              Select Task <span style={{ color: "#f87171" }}>*</span>
            </label>
            {fetching ? (
              <div style={{ height: "44px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ) : tasks.length === 0 ? (
              <div style={{ padding: "12px 14px", borderRadius: "10px", border: `1px solid ${border}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", fontSize: "13px", color: muted }}>
                No pending tasks to submit.
              </div>
            ) : (
              <StyledSelect value={form.taskId} onChange={(e) => setForm({ ...form, taskId: e.target.value })} required>
                <option value="">Choose a task...</option>
                {tasks.map((tk) => (
                  <option key={tk._id} value={tk._id}>{tk.title}</option>
                ))}
              </StyledSelect>
            )}
          </div>

          {/* Note */}
          <StyledTextarea
            label="Submission Note"
            placeholder="Describe what you did, add links, key decisions made..."
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={4}
          />

          {/* File upload */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 500, color: isDark ? "#9ca3af" : "#6b7280", display: "block", marginBottom: "6px" }}>
              Attach File <span style={{ fontWeight: 400, opacity: 0.7 }}>(PDF, DOC, DOCX, ZIP, PNG, JPG — max 10MB)</span>
            </label>
            {file ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.06)" }}>
                <FileIcon size={16} style={{ color: "#818cf8", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                <span style={{ fontSize: "11px", color: muted }}>{(file.size / 1024).toFixed(0)} KB</span>
                <button type="button" onClick={() => setFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: muted, display: "flex", padding: "2px" }}>
                  <XIcon size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                style={{ padding: "28px 20px", borderRadius: "10px", border: `2px dashed ${border}`, background: dropBg, textAlign: "center", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = dropHov}
                onMouseLeave={(e) => e.currentTarget.style.background = dropBg}
              >
                <UploadIcon size={22} style={{ color: "#818cf8", marginBottom: "8px" }} />
                <p style={{ fontSize: "13px", fontWeight: 500, color: text, margin: "0 0 4px" }}>Click to upload or drag & drop</p>
                <p style={{ fontSize: "11px", color: muted, margin: 0 }}>PDF, DOC, DOCX, ZIP, PNG, JPG</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg" onChange={handleFile} style={{ display: "none" }} />
          </div>

          <div style={{ marginTop: "4px" }}>
            <PrimaryButton type="submit" loading={loading} disabled={tasks.length === 0}>
              <SendIcon size={15} /> Submit Task
            </PrimaryButton>
          </div>
        </form>
      </FormCard>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </PageLayout>
  );
};

export default SubmitTask;
