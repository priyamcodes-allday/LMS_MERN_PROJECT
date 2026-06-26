import {
  Users,
  BookOpen,
  UploadCloud,
  PlayCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../axios/api";
import { useAuth } from "../context/auth";
import { Link, useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [statsData, setStatsData] = useState({
    totalCourses: 0,
    draftCourses: 0,
    pendingCourses: 0,
    approvedCourses: 0,
    rejectedCourses: 0,
    inactiveCourses: 0,
    totalEnrollments: 0
  })
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate()

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        if (!user?.id) return;
        setIsLoading(true);

        const [coursesRes, statsRes] = await Promise.all([
          api.get('/teacher/courses'),
          api.get('/teacher/dashboard')
        ])


        if(coursesRes.data?.success){
          setMyCourses(coursesRes.data.courses || []);

        }

        if(statsRes.data?.success){
          setStatsData(statsRes.data.stats);

        }

       
      } catch (error) {
        console.error(
          "Failed to fetch teacher data:",
          error.response?.data || error.message,
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeacherData();
  }, [user]);

  const stats = [
    {
      title: "Total Students",
      value: statsData.totalEnrollments.toString(),
      change: "Across all courses",
      icon: Users,
      color: "text-[#0c3c2e]",
      bg: "bg-[#0c3c2e]/10",
    },
    {
      title: "Total Courses",
      value: statsData.totalCourses.toString(),
      change: `Approved: ${statsData.approvedCourses} | Pending: ${statsData.pendingCourses}`,
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Drafts / Rejected",
      value: (statsData.draftCourses + statsData.rejectedCourses).toString(),
      change: `Drafts: ${statsData.draftCourses} | Rejected: ${statsData.rejectedCourses}`,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];


  return (
    <>
      <div className="space-y-8">
        {/* Header*/}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Teacher Dashboard
            </h1>
            <p className="text-gray-500 mt-2">
              Manage your courses, students, and content.
            </p>
          </div>
                 <Link 
         to="/teacher/create-course"
         className="flex items-center gap-2 bg-[#0c3c2e] hover:bg-[#0c3c2e]/90 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
       >
         <UploadCloud className="w-5 h-5" />
         Upload New Video
       </Link>

        </div>
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <p className="text-xs font-medium text-gray-500 mt-4">
                  {stat.change}
                </p>
              </div>
            );
          })}
        </div>
        {/* My Courses List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">My Courses</h2>
            <a
              href="#"
              className="text-sm font-semibold text-[#0c3c2e] hover:text-[#0c3c2e]/80"
            >
              View All
            </a>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c3c2e]"></div>
            </div>
          ) : myCourses.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">
                No courses yet
              </h3>
              <p className="text-gray-500 mt-1">
                Your uploaded courses will appear here once they are created.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {myCourses.map((course, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/teacher/course/${course._id}`)}
                  className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
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
                        {course.lessonCount || 0} Lessons •{" "}
                        {course.category?.name || "Uncategorized"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 sm:w-1/3 justify-between">
                    <div className="text-sm text-gray-500">
                      <strong>${course.price || 0}</strong>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      course.status === 'approved' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : course.status === 'pending'
                        ? 'bg-amber-50 text-amber-600'
                        : course.status === 'rejected'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {course.status === 'approved' ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span className="capitalize">{course.status || 'draft'}</span>
                    </div>
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
