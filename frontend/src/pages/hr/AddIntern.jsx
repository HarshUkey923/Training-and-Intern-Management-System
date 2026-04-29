import { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import PageLayout from "../../components/PageLayout.jsx";
import { FormCard, StyledInput, PrimaryButton } from "../../components/FormComponents.jsx";

const AddIntern = () => {
  const [form, setForm] = useState({ name: "", gender: "", email: "", password: "", college: "", department: "", skills: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/hr/intern", form);
      toast.success("Intern added successfully");
      setForm({ name: "", gender: "", email: "", password: "", college: "", department: "", skills: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding intern");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout backPath="/hr" backLabel="Back to Dashboard">
      <FormCard title="Add Intern" subtitle="Create a new intern profile and credentials">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <StyledInput label="Full Name" name="name" placeholder="Enter Full Name" value={form.name} onChange={handleChange} required />
            <StyledInput label="Gender" name="gender" placeholder="Enter Gender" value={form.gender} onChange={handleChange} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <StyledInput label="Email Address" name="email" type="email" placeholder="email@example.com" value={form.email} onChange={handleChange} required />
            <StyledInput label="Password" name="password" type="password" placeholder="Set a secure password" value={form.password} onChange={handleChange} required />
          </div>


          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <StyledInput label="College" name="college" placeholder="e.g. VNIT Nagpur" value={form.college} onChange={handleChange} required />
            <StyledInput label="Department" name="department" placeholder="e.g. Computer Science" value={form.department} onChange={handleChange} required />
          </div>

          <StyledInput label="Skills (comma separated)" name="skills" placeholder="e.g. React, Node.js, MongoDB" value={form.skills} onChange={handleChange} required />

          <div style={{ marginTop: "4px" }}>
            <PrimaryButton type="submit" loading={loading}>Add Intern</PrimaryButton>
          </div>
        </form>
      </FormCard>
    </PageLayout>
  );
};

export default AddIntern;
