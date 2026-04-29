import { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import PageLayout from "../../components/PageLayout.jsx";
import { FormCard, StyledInput, PrimaryButton } from "../../components/FormComponents.jsx";

const AddMentor = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", specialization: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/hr/add-mentor", form);
      toast.success("Mentor added successfully");
      setForm({ name: "", email: "", password: "", specialization: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding mentor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout backPath="/hr" backLabel="Back to Dashboard">
      <FormCard title="Add Mentor" subtitle="Register a new mentor or trainer">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <StyledInput label="Full Name" name="name" placeholder="Enter Full Name" value={form.name} onChange={handleChange} required />
            <StyledInput label="Email Address" name="email" type="email" placeholder="email@exampple.com" value={form.email} onChange={handleChange} required />
          </div>

          <StyledInput label="Password" name="password" type="password" placeholder="Set a secure password" value={form.password} onChange={handleChange} required />

          <StyledInput label="Specialization" name="specialization" placeholder="e.g. Full Stack Development" value={form.specialization} onChange={handleChange} required />

          <div style={{ marginTop: "4px" }}>
            <PrimaryButton type="submit" loading={loading}>Add Mentor</PrimaryButton>
          </div>
        </form>
      </FormCard>
    </PageLayout>
  );
};

export default AddMentor;
