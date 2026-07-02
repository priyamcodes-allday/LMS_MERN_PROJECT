import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
  Eye,
  EyeOff,
  Edit3,
  Save,
  X,
  Tag
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../axios/api";

const roleOptions = ["user", "student", "teacher", "admin"];

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [courseFilter, setCourseFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState("");
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null); // { _id, name, description }
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [assignment, setAssignment] = useState({
    studentId: "",
    courseId: "",
  });

  const students = useMemo(
    () => users.filter((user) => user.role === "student"),
    [users],
  );

  const visibleCourses = useMemo(() => {
    if (courseFilter === "all") return courses;
    return courses.filter((course) => course.status === courseFilter);
  }, [courseFilter, courses]);

  const pendingCourses = useMemo(
    () => courses.filter((course) => course.status === "pending"),
    [courses],
  );

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [statsRes, usersRes, coursesRes, teachersRes, categoriesRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users"),
        api.get("/admin/courses"),
        api.get("/admin/teachers/pending"),
        api.get("/v1/categories"),
      ]);

      if (statsRes.data?.success) setDashboardStats(statsRes.data.stats);
      if (usersRes.data?.success) setUsers(usersRes.data.users || []);
      if (coursesRes.data?.success) setCourses(coursesRes.data.courses || []);
      if (teachersRes.data?.success) setPendingTeachers(teachersRes.data.profiles || []);
      if (categoriesRes.data?.success) setCategories(categoriesRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    Promise.all([
      api.get("/admin/dashboard"),
      api.get("/admin/users"),
      api.get("/admin/courses"),
      api.get("/admin/teachers/pending"),
    ])
      .then(([statsRes, usersRes, coursesRes, teachersRes]) => {
        if (!isActive) return;

        if (statsRes.data?.success) setDashboardStats(statsRes.data.stats);
        if (usersRes.data?.success) setUsers(usersRes.data.users || []);
        if (coursesRes.data?.success) setCourses(coursesRes.data.courses || []);
        if (teachersRes.data?.success) {
          setPendingTeachers(teachersRes.data.profiles || []);
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(err.response?.data?.message || "Failed to load admin data.");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const showSuccess = (message) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(""), 3000);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    try {
      setError("");
      await api.post("/admin/users/create", newUser);
      setNewUser({ name: "", email: "", password: "", role: "student" });
      showSuccess("User created.");
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user.");
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      setError("");
      await api.put(`/admin/users/${userId}/role`, { role });
      showSuccess("Role updated.");
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Delete this user?")) return;

    try {
      setError("");
      await api.delete(`/admin/users/${userId}`);
      showSuccess("User deleted.");
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleTeacherDecision = async (profileId, decision) => {
    try {
      setError("");
      if (decision === "approve") {
        await api.put(`/admin/teachers/${profileId}/approve`);
        showSuccess("Teacher approved.");
      } else {
        const reason =
          prompt("Reason for rejection?") || "Application rejected.";
        await api.put(`/admin/teachers/${profileId}/reject`, { reason });
        showSuccess("Teacher rejected.");
      }
      fetchAdminData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update teacher application.",
      );
    }
  };

  const handleCourseAction = async (courseId, action) => {
    if (action === "delete" && !confirm("Permanently delete this course?"))
      return;

    try {
      setError("");

      if (action === "approve") {
        await api.put(`/admin/courses/${courseId}/approve`);
        showSuccess("Course approved.");
      }

      if (action === "reject") {
        await api.put(`/admin/courses/${courseId}/reject`);
        showSuccess("Course rejected.");
      }

      if (action === "toggle") {
        await api.put(`/admin/courses/${courseId}/toggle-active`);
        showSuccess("Course visibility updated.");
      }

      if (action === "delete") {
        await api.delete(`/admin/courses/${courseId}`);
        showSuccess("Course deleted.");
      }

      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course.");
    }
  };

  const handleAssignStudent = async (event) => {
    event.preventDefault();

    try {
      setError("");
      await api.post("/admin/assign", assignment);
      setAssignment({ studentId: "", courseId: "" });
      showSuccess("Student assigned to course.");
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign student.");
    }
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    try {
      setError("");
      await api.post("/v1/categories", newCategory);
      setNewCategory({ name: "", description: "" });
      showSuccess("Category created.");
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
    }
  };

  const handleUpdateCategory = async (id) => {
    setIsSavingCategory(true);
    try {
      setError("");
      await api.put(`/v1/categories/${id}`, {
        name: editingCategory.name,
        description: editingCategory.description,
      });
      setEditingCategory(null);
      showSuccess("Category updated.");
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update category.");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Deactivate this category?")) return;
    try {
      setError("");
      await api.delete(`/v1/categories/${id}`);
      showSuccess("Category deactivated.");
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category.");
    }
  };

  const stats = [
    {
      title: "Users",
      value: dashboardStats?.totalUsers || 0,
      detail: `Students ${dashboardStats?.totalStudents || 0} | Teachers ${dashboardStats?.totalTeachers || 0}`,
      icon: Users,
    },
    {
      title: "Pending Courses",
      value: pendingCourses.length,
      detail: "Awaiting review",
      icon: AlertCircle,
    },
    {
      title: "Teacher Applications",
      value: pendingTeachers.length,
      detail: "Awaiting approval",
      icon: ShieldCheck,
    },
    {
      title: "Courses",
      value: dashboardStats?.totalCourses || 0,
      detail: `Approved ${dashboardStats?.approvedCourses || 0} | Draft ${dashboardStats?.draftCourses || 0}`,
      icon: BookOpen,
    },
  ];

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center text-[#0c3c2e]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-[#0c3c2e]">
          Admin Console
        </p>
        <h1 className="text-3xl font-black text-gray-900 mt-2">
          Platform Operations
        </h1>
        <p className="text-gray-500 mt-2">
          Manage users, teacher applications, course approvals, and assignments.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 text-red-600 px-4 py-3 font-semibold">
          {error}
        </div>
      )}

      {actionMessage && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 px-4 py-3 font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {actionMessage}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500">
                    {stat.title}
                  </p>
                  <h2 className="text-3xl font-black text-gray-900 mt-2">
                    {stat.value}
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#0c3c2e]/10 text-[#0c3c2e] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 mt-4">
                {stat.detail}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-900">Create User</h2>
            <p className="text-sm text-gray-500 mt-1">
              Admin-created users skip email verification.
            </p>
          </div>
          <form onSubmit={handleCreateUser} className="p-5 space-y-4">
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(event) =>
                setNewUser({ ...newUser, name: event.target.value })
              }
              placeholder="Full name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
            />
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(event) =>
                setNewUser({ ...newUser, email: event.target.value })
              }
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
            />
            <input
              type="password"
              required
              minLength="8"
              value={newUser.password}
              onChange={(event) =>
                setNewUser({ ...newUser, password: event.target.value })
              }
              placeholder="Temporary password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
            />
            <select
              value={newUser.role}
              onChange={(event) =>
                setNewUser({ ...newUser, role: event.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0c3c2e] text-white px-4 py-3 rounded-xl font-black hover:bg-[#0c3c2e]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create User
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-900">
              User Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Change roles or remove accounts.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-black">User</th>
                  <th className="px-5 py-3 font-black">Role</th>
                  <th className="px-5 py-3 font-black">Verified</th>
                  <th className="px-5 py-3 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-5 py-4">
                      <p className="font-black text-gray-900">{user.name}</p>
                      <p className="text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={(event) =>
                          handleRoleChange(user._id, event.target.value)
                        }
                        className="px-3 py-2 rounded-lg border border-gray-200 bg-white font-bold"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black ${
                          user.isEmailVerified
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {user.isEmailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="inline-flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-bold"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              Course Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Approve, reject, hide, or delete courses.
            </p>
          </div>
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="w-full lg:w-48 px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-bold"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="divide-y divide-gray-100">
          {visibleCourses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No courses found.
            </div>
          ) : (
            visibleCourses.map((course) => (
              <div
                key={course._id}
                className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-gray-900">
                        {course.title}
                      </h3>
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-black capitalize">
                        {course.status}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          course.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {course.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      By {course.teacher?.name || "Unknown"} |{" "}
                      {course.lessonCount || 0} lessons | ${course.price || 0}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col xl:flex-row gap-2 mt-4 xl:mt-0">
                  <Link
                    to={`/admin/course/${course._id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0c3c2e] text-white font-bold hover:bg-[#0c3c2e]/90"
                  >
                    View Details
                  </Link>
                  {course.status !== "approved" && (
                    <button
                      onClick={() => handleCourseAction(course._id, "approve")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleCourseAction(course._id, "reject")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 font-bold hover:bg-amber-100"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleCourseAction(course._id, "toggle")}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-colors ${
                      course.isActive
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {course.isActive ? (
                      <>
                        <EyeOff className="w-4 h-4" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" /> Show
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleCourseAction(course._id, "delete")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-700 font-bold hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-900">
              Pending Teacher Applications
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingTeachers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No pending teacher applications.
              </div>
            ) : (
              pendingTeachers.map((profile) => (
                <div
                  key={profile._id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-black text-gray-900">
                      {profile.user?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {profile.user?.email}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {profile.specialization} | {profile.experience} yrs
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleTeacherDecision(profile._id, "approve")
                      }
                      className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleTeacherDecision(profile._id, "reject")
                      }
                      className="px-3 py-2 rounded-lg bg-red-50 text-red-700 font-bold hover:bg-red-100"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-900">
              Assign Student to Course
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Uses the server admin assignment route.
            </p>
          </div>
          <form onSubmit={handleAssignStudent} className="p-5 space-y-4">
            <select
              required
              value={assignment.studentId}
              onChange={(event) =>
                setAssignment({ ...assignment, studentId: event.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white font-bold"
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
            <select
              required
              value={assignment.courseId}
              onChange={(event) =>
                setAssignment({ ...assignment, courseId: event.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white font-bold"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full bg-[#0c3c2e] text-white px-4 py-3 rounded-xl font-black hover:bg-[#0c3c2e]/90 transition-colors"
            >
              Assign Student
            </button>
          </form>
        </div>
      </section>
      {/* Category CRUD Section */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        {/* Create Category */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-900">Create Category</h2>
            <p className="text-sm text-gray-500 mt-1">Add a new course category to the platform.</p>
          </div>
          <form onSubmit={handleCreateCategory} className="p-5 space-y-4">
            <input
              type="text"
              required
              value={newCategory.name}
              onChange={(event) => setNewCategory({ ...newCategory, name: event.target.value })}
              placeholder="Category Name (e.g. Web Development)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
            />
            <textarea
              required
              value={newCategory.description}
              onChange={(event) => setNewCategory({ ...newCategory, description: event.target.value })}
              placeholder="Category Description"
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] resize-none"
            />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0c3c2e] text-white px-4 py-3 rounded-xl font-black hover:bg-[#0c3c2e]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <Tag className="w-5 h-5 text-[#0c3c2e]" />
            <div>
              <h2 className="text-lg font-black text-gray-900">Manage Categories</h2>
              <p className="text-sm text-gray-500 mt-0.5">{categories.length} active categories</p>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No categories yet.</div>
            ) : (
              categories.map((cat) => (
                <div key={cat._id} className="p-4">
                  {editingCategory?._id === cat._id ? (
                    // --- Inline Edit Form ---
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] text-sm"
                      />
                      <textarea
                        rows="2"
                        value={editingCategory.description}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] text-sm resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateCategory(cat._id)}
                          disabled={isSavingCategory}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0c3c2e] text-white font-bold text-sm hover:bg-[#0c3c2e]/90 disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {isSavingCategory ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // --- Display Row ---
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 truncate">{cat.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{cat.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => setEditingCategory({ _id: cat._id, name: cat.name, description: cat.description })}
                          className="p-2 text-gray-500 hover:text-[#0c3c2e] hover:bg-[#0c3c2e]/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
