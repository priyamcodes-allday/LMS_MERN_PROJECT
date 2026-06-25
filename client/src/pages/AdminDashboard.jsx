import {
  Users,
  DollarSign,
  Video,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../axios/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);

        const [statsRes, coursesRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/courses"),
        ]);

        setDashboardStats(statsRes.data);

        const allCourses =
          coursesRes.data.courses || coursesRes.data.data || [];

        const pending = allCourses.filter(
          (c) => c.status === "pending" || c.isActive === false,
        );
        setPendingCourses(pending);
      } catch (error) {
        console.log("Failed to load admin dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleApprove = async (courseId) => {
    try {
      await api.put(`/admin/courses/${courseId}/approve`);
      setPendingCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (error) {
      console.error("Failed to approve", error);
      alert("Failed to approve course.");
    }
  };

  const handleReject = async (courseId) => {
    try {
      await api.put(`/admin/courses/${courseId}/reject`);

      setPendingCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (error) {
      console.error("Failed to reject", error);
      alert("Failed to reject course");
    }
  };

  const stats = [
    {
      title: "Total Users",
      value: dashboardStats?.totalUsers?.toString() || "—",
      change: "Registered on platform",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Pending Approvals",
      value: pendingCourses.length.toString(),
      change: "Requires attention",
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Platform Revenue",
      value: dashboardStats?.totalRevenue
        ? `$${dashboardStats.totalRevenue}`
        : "—",
      change: "Total earnings",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Total Courses",
      value: dashboardStats?.totalCourses?.toString() || "—",
      change: "Active on platform",
      icon: Video,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500 mt-2">
            Monitor platform activity and manage approvals.
          </p>
        </div>
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </h3>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}
                  >
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p
                  className={`text-xs font-medium mt-4 ${stat.icon === AlertCircle ? "text-red-500" : "text-gray-500"}`}
                >
                  {stat.change}
                </p>
              </div>
            );
          })}
        </div>
        {/* Pending Video Approvals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-900">
                Pending Course Approvals
              </h2>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : pendingCourses.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">
                All caught up!
              </h3>
              <p className="text-gray-500 mt-1">
                There are no courses pending approval right now.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pendingCourses.map((course, idx) => (
                <div
                  key={idx}
                  className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        By {course.teacher?.name || "Unknown Teacher"} •{" "}
                        {course.lessons?.length || 0} Lessons
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(course._id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(course._id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
