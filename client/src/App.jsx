import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";

import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import RoleRoute from "./components/routing/RoleRoute";
import TeacherLayout from "./layouts/TeacherLayout"
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyEmail from "./pages/VerifyEmail";
import CreateCourse from "./pages/CreateCourse";
import TeacherSignup from "./pages/TeacherSignup";
import ManageCourse from "./pages/ManageCourse";
import CourseCatalog from "./pages/CourseCatalog";
import TeacherStudents from "./pages/TeacherStudents";
import StudentCart from "./pages/StudentCart";
import StudentWishlist from "./pages/StudentWishlist";
import StudentCoursePlayer from "./pages/StudentCoursePlayer";
import { LoginModal, SignUpModal } from "./components/AuthModals";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/become-instructor" element={<TeacherSignup />} />


        {/* STUDENT ROUTES */}
        <Route element={<RoleRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="cart" element={<StudentCart />} />
            <Route path="wishlist" element={<StudentWishlist />} />
            <Route path="course/:id" element={<StudentCoursePlayer />} />
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
            <Route path="students" element={<TeacherStudents />} />

          </Route>

        </Route>

        {/* ADMIN ROUTES */}
        <Route element={<RoleRoute allowedRoles={['admin']}/>}>
        <Route path="/admin" element={<AdminLayout/>}>
          <Route index element={<AdminDashboard/>} />
        </Route>
        </Route>



        
      </Routes>
      <LoginModal />
      <SignUpModal />
    </>
  );
}

export default App;
