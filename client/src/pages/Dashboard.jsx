import { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Trophy,
  Clock as ClockIcon,
  Users as UsersIcon,
  AlertCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../axios/api";

export default function Dashboard() {
  const { user } = useAuth();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.id) return;

        setIsLoading(true);
        const res = await api.get(`/student/my-courses`);

        setEnrolledCourses(res.data.courses || res.data.data || res.data || []);
      } catch (error) {
        console.log(
          "Error fetching dashboard data:",
          error.response?.data || error.message,
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const totalEnrolled = enrolledCourses.length;

  const totalCompleted = 0;
  const inProgress = totalEnrolled - totalCompleted;

  const stats = [
    {
      title: "Enrolled Courses",
      value: totalEnrolled.toString(),
      change: "Lifetime total",
      icon: BookOpen,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Completed",
      value: totalCompleted.toString(),
      change: "Certificates earned",
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "In Progress",
      value: inProgress.toString(),
      change: "Currently learning",
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Certificates",
      value: totalCompleted.toString(),
      change: "Downloadable",
      icon: Trophy,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
          </h1>
          <p className="text-gray-500 mt-2">
            Here's what's happening with your learning today
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
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}
                  >
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-500 mt-4">
                  {stat.change}
                </p>
              </div>
            );
          })}
        </div>
        {/* Current Courses Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
            <a
              href="#"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Browse Catalog
            </a>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">
                No courses yet
              </h3>
              <p className="text-gray-500 mt-1 mb-4">
                You haven't enrolled in any courses yet.
              </p>
              <button className="bg-[#0c3c2e] text-white px-4 py-2 rounded-lg font-semibold">
                Explore Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((enrollment, idx) => {
                
                const course = enrollment.course;
                if (!course) return null;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="h-40 w-full overflow-hidden bg-gray-200">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 line-clamp-1">
                        {course.title}
                      </h3>
                     
                      <div className="mt-5">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-medium text-gray-500">
                            Progress
                          </span>
                          <span className="font-bold text-gray-900">0%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `0%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        
      </div>
    </>
  );
}
