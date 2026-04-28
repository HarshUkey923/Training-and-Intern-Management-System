import { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import PageLayout from "../../components/PageLayout.jsx";
import { FormCard, StyledInput, PrimaryButton } from "../../components/FormComponents.jsx";
import { ShieldIcon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

const AddHR = () => {
  const { isDark } = useTheme();
  const text = isDark ? "#f9fafb" : "#111827";
  const muted = isDark ? "#6b7280" : "#9ca3af";

  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/hr/add-hr", form);
      toast.success("HR account created successfully");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create HR account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout backPath="/hr" backLabel="Back to Dashboard" maxWidth="560px">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldIcon size={16} style={{ color: "#818cf8" }} />
          </div>
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6366f1", margin: 0 }}>
            HR Portal
          </p>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: text, margin: 0 }}>
          Add HR Account
        </h1>
        <p style={{ fontSize: "13px", color: muted, marginTop: "4px" }}>
          Create a new HR manager account. Only existing HR can do this.
        </p>
      </div>

      <FormCard title="New HR Account" subtitle="This account will have full HR access to the system">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <StyledInput
            label="Full Name"
            name="name"
            placeholder="Enter Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <StyledInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <StyledInput
            label="Password"
            name="password"
            type="password"
            placeholder="Set a secure password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <div style={{ marginTop: "4px" }}>
            <PrimaryButton type="submit" loading={loading}>
              <ShieldIcon size={14} /> Create HR Account
            </PrimaryButton>
          </div>
        </form>
      </FormCard>
    </PageLayout>
  );
};

export default AddHR;