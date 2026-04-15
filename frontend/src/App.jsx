import { BrowserRouter, Routes, Route } from "react-router";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import ProtectedRoute  from "./components/ProtectedRoute";

// HR
import HRDashboard  from "./pages/hr/HRDashboard";
import CreateProgram from "./pages/hr/CreateProgram";
import AssignIntern from "./pages/hr/AssignIntern";
import AddIntern    from "./pages/hr/AddIntern";
import AddMentor    from "./pages/hr/AddMentor";
import Details      from "./pages/hr/Details";

// Mentor
import MentorDashboard from "./pages/mentor/MentorDashboard";
import AssignTask      from "./pages/mentor/AssignTask";
import DisplayTasks    from "./pages/mentor/DisplayTasks";

// Intern
import InternDashboard from "./pages/intern/InternDashboard";
import MyTasks         from "./pages/intern/MyTasks";
import SubmitTask      from "./pages/intern/SubmitTask";
import MySubmissions   from "./pages/intern/MySubmissions";
import MyProgram       from "./pages/intern/MyProgram";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── HR ── */}
        <Route path="/hr" element={<ProtectedRoute allowedRoles={["HR"]}><HRDashboard /></ProtectedRoute>} />
        <Route path="/program"             element={<ProtectedRoute allowedRoles={["HR"]}><CreateProgram /></ProtectedRoute>} />
        <Route path="/details/:id"         element={<ProtectedRoute allowedRoles={["HR"]}><Details /></ProtectedRoute>} />
        <Route path="/assign-program/:id"  element={<ProtectedRoute allowedRoles={["HR"]}><AssignIntern /></ProtectedRoute>} />
        <Route path="/add-intern"          element={<ProtectedRoute allowedRoles={["HR"]}><AddIntern /></ProtectedRoute>} />
        <Route path="/add-mentor"          element={<ProtectedRoute allowedRoles={["HR"]}><AddMentor /></ProtectedRoute>} />

        {/* ── Mentor ── */}
        <Route path="/mentor"      element={<ProtectedRoute allowedRoles={["Mentor"]}><MentorDashboard /></ProtectedRoute>} />
        <Route path="/show-tasks"  element={<ProtectedRoute allowedRoles={["Mentor"]}><DisplayTasks /></ProtectedRoute>} />
        <Route path="/assign-task/:programId/:internId" element={<ProtectedRoute allowedRoles={["Mentor"]}><AssignTask /></ProtectedRoute>} />

        {/* ── Intern ── */}
        <Route path="/intern"              element={<ProtectedRoute allowedRoles={["Intern"]}><InternDashboard /></ProtectedRoute>} />
        <Route path="/intern/tasks"        element={<ProtectedRoute allowedRoles={["Intern"]}><MyTasks /></ProtectedRoute>} />
        <Route path="/intern/submit"       element={<ProtectedRoute allowedRoles={["Intern"]}><SubmitTask /></ProtectedRoute>} />
        <Route path="/intern/submissions"  element={<ProtectedRoute allowedRoles={["Intern"]}><MySubmissions /></ProtectedRoute>} />
        <Route path="/intern/program"      element={<ProtectedRoute allowedRoles={["Intern"]}><MyProgram /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
