import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  Loader2,
  Users as UsersIcon,
} from "lucide-react";
import { useAuth } from "../context/auth";
import api from "../axios/api";
import CourseThumbnail from "../components/CourseThumbnail";

export default function Dashboard() {
  const { user } = useAuth();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [statsData, setStatsData] = useState({
    totalEnrolled: 0,
    totalSpent: 0,
    totalTeachers: 0,
  });
  const [progressByCourse, setProgressByCourse] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.id) return;

        setIsLoading(true);
        const [statsRes, coursesRes] = await Promise.all([
          api.get("/student/dashboard"),
          api.get("/student/my-courses"),
        ]);

        if (statsRes.data?.success) {
          setStatsData(statsRes.data.stats);
        }

        if (coursesRes.data?.success) {
          const enrollments = coursesRes.data.enrollments || [];
          setEnrolledCourses(enrollments);

          const progressResults = await Promise.all(
            enrollments.map(async (enrollment) => {
              const courseId = enrollment.course?._id;
              if (!courseId) return null;

              try {
                const res = await api.get(
                  `/v1/progress/${user.id}/${courseId}`,
                );
                return [courseId, res.data?.data?.progressPercentage || 0];
              } catch {
                return [courseId, 0];
              }
            }),
          );

          setProgressByCourse(
            Object.fromEntries(progressResults.filter(Boolean)),
          );
        }
      } catch (error) {
        console.log("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const stats = [
    {
      title: "Courses",
      value: statsData.totalEnrolled.toString(),
      change: "Enrolled",
      icon: BookOpen,
      accent: "bg-[#0c3c2e]",
    },
    {
      title: "Investment",
      value: `$${statsData.totalSpent.toString()}`,
      change: "Total spent",
      icon: CheckCircle,
      accent: "bg-emerald-600",
    },
    {
      title: "Instructors",
      value: statsData.totalTeachers.toString(),
      change: "Teachers",
      icon: UsersIcon,
      accent: "bg-indigo-600",
    },
    {
      title: "In Progress",
      value: statsData.totalEnrolled.toString(),
      change: "Active paths",
      icon: Clock,
      accent: "bg-amber-500",
    },
  ];

  const latestEnrollment = enrolledCourses[0];
  const latestCourse = latestEnrollment?.course;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
        <div className="bg-[#0c3c2e] rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-[#dce739]">
              Student Dashboard
            </p>
            <h1 className="text-3xl sm:text-4xl font-black mt-3">
              Welcome back, {user?.name?.split(" ")[0] || "Student"}
            </h1>
            <p className="text-emerald-50 mt-3 max-w-xl">
              Track your courses, continue learning, and discover your next
              skill path.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-[#dce739] text-[#0c3c2e] px-5 py-3 rounded-xl font-black hover:bg-[#dce739]/90 transition-colors"
              >
                Browse Catalog <ArrowRight className="w-4 h-4" />
              </Link>
              {latestCourse && (
                <a
                  href="/"
                  className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 px-5 py-3 rounded-xl font-bold hover:bg-white/15 transition-colors"
                >
                  Continue Learning
                </a>
              )}
            </div>
          </div>
          <div className="absolute -right-10 -bottom-16 w-56 h-56 rounded-full border-[32px] border-white/10"></div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0c3c2e]/10 flex items-center justify-center text-[#0c3c2e]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">
                Current focus
              </p>
              <h2 className="text-lg font-black text-gray-900">
                {latestCourse?.title || "Choose your first course"}
              </h2>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
              <span>Progress</span>
              <span>
                {Math.round(progressByCourse[latestCourse?._id] || 0)}%
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0c3c2e] rounded-full"
                style={{
                  width: `${progressByCourse[latestCourse?._id] || 0}%`,
                }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Continue your lessons and mark them complete to update progress.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl ${stat.accent} flex items-center justify-center text-white`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  {stat.change}
                </p>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mt-4">
                {stat.value}
              </h3>
              <p className="text-sm font-semibold text-gray-500 mt-1">
                {stat.title}
              </p>
            </div>
          );
        })}
      </section>

      <section
        id="my-courses"
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-gray-900">My Courses</h2>
            <p className="text-sm text-gray-500 mt-1">
              Courses you are enrolled in.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-sm font-black text-[#0c3c2e] hover:text-[#0c3c2e]/80"
          >
            Browse Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-[#0c3c2e]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900">No courses yet</h3>
            <p className="text-gray-500 mt-2 mb-5">
              Start with an approved course from the catalog.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-[#0c3c2e] text-white px-5 py-3 rounded-xl font-black hover:bg-[#0c3c2e]/90 transition-colors"
            >
              Explore Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {enrolledCourses.map((enrollment, idx) => {
              const course = enrollment.course;
              if (!course) return null;
              const courseProgress = progressByCourse[course._id] || 0;

              return (
                <article
                  key={course._id || idx}
                  className="p-5 sm:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row gap-5 lg:items-center">
                    <div className="w-full lg:w-44 aspect-video bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <CourseThumbnail
                        src={course.thumbnail}
                        alt={course.title}
                        iconClassName="w-8 h-8"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black text-gray-900 line-clamp-1">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {course.description ||
                              "Course content is ready for you."}
                          </p>
                        </div>
                        <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          Enrolled
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-[1fr_auto] gap-4 items-center">
                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="font-bold text-gray-500">
                              Progress
                            </span>
                            <span className="font-black text-gray-900">
                              {Math.round(courseProgress)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div
                              className="bg-[#0c3c2e] h-2.5 rounded-full"
                              style={{ width: `${courseProgress}%` }}
                            ></div>
                          </div>
                        </div>
                        <Link
                          to={`/student/course/${course._id}`}
                          className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-black text-sm hover:bg-gray-200 transition-colors"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
