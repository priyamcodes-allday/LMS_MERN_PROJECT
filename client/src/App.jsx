import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import RoleRoute from "./components/routing/RoleRoute";
import TeacherLayout from "./layouts/TeacherLayout"
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyEmail from "./pages/VerifyEmail";
import CreateCourse from "./pages/CreateCourse";
import TeacherSignup from "./pages/TeacherSignup";
import ManageCourse from "./pages/ManageCourse";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/become-instructor" element={<TeacherSignup />} />


        {/* STUDENT ROUTES */}
        <Route element={<RoleRoute allowedRoles={["student", "user"]} />}>
          <Route path="/student" element={<Dashboard />}>
            {/* student/courses */}
          </Route>
        </Route>

        {/* TEACHER ROUTES */}
        <Route element={<RoleRoute allowedRoles={["teacher"]} />}>
         
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route
              index
              element={
                <TeacherDashboard/>
              }
            />
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="course/:id" element={<ManageCourse />} />

          </Route>

        </Route>

        {/* ADMIN ROUTES */}
        <Route element={<RoleRoute allowedRoles={['admin']}/>}>
        <Route path="/admin" element={<AdminLayout/>}>
          <Route index element={<AdminDashboard/>} />
        </Route>
        </Route>



        
      </Routes>
    </>
  );
}

export default App;
