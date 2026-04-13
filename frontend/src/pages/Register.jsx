import { useState } from "react";
import authApi from "../services/authApi.js";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import PageLayout from "../components/PageLayoutPre.jsx";
import { FormCard, StyledInput, StyledSelect, PrimaryButton } from "../components/FormComponents.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const text    = isDark ? "#f9fafb" : "#111827";
  const subText = isDark ? "#9ca3af" : "#6b7280";

  const [form, setForm] = useState({ name: "", email: "", password: "", repassword: "", role: "Intern" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const HandleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.repassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await authApi.post("/register", {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role,
      });
      toast.success("Registration successful. Please login.");
      navigate("/");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #6366f1, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <span style={{ color: "white", fontSize: "16px", fontWeight: 700 }}>T</span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: text, margin: 0, letterSpacing: "-0.01em" }}>
              Create an account
            </h2>
            <p style={{ fontSize: "13px", color: subText, marginTop: "6px" }}>
              Join TIMS to get started
            </p>
          </div>

          <FormCard>
            <form onSubmit={HandleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              <StyledInput
                label="Full Name"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={handleChange}
                required
              />

              <StyledInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="rahul@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <StyledInput
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <StyledInput
                  label="Confirm Password"
                  name="repassword"
                  type="password"
                  placeholder="Repeat password"
                  value={form.repassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password match indicator */}
              {form.repassword && (
                <p style={{ fontSize: "11px", marginTop: "-6px", color: form.password === form.repassword ? "#34d399" : "#f87171" }}>
                  {form.password === form.repassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}

              <StyledSelect
                label="Role"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="Intern">Intern</option>
                <option value="Mentor">Mentor</option>
                <option value="HR">HR</option>
              </StyledSelect>

              <div style={{ marginTop: "4px" }}>
                <PrimaryButton type="submit" loading={loading}>
                  Create Account
                </PrimaryButton>
              </div>

            </form>
          </FormCard>

          <p style={{ textAlign: "center", fontSize: "12px", color: subText, marginTop: "16px" }}>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              style={{ color: "#6366f1", fontWeight: 500, cursor: "pointer" }}
            >
              Login
            </span>
          </p>

        </div>
      </div>
    </PageLayout>
  );
};

export default Register;
