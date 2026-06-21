import { BookOpen, CheckCircle, Clock, Trophy } from "lucide-react";
import { Clock as ClockIcon, Users as UsersIcon } from "lucide-react";
import course1 from "../assets/faculty/teacher1.jpg";
import course2 from "../assets/faculty/teacher2.jpg";
import course3 from "../assets/faculty/teacher3.jpg";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  MessageSquare,
  FileText,
  Calendar as CalendarIcon,
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Enrolled Courses",
      value: "8",
      change: "+12% from last month",
      icon: BookOpen,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Completed",
      value: "4",
      change: "+8% from last month",
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "In Progress",
      value: "4",
      change: "On track",
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Certificates",
      value: "12",
      change: "+20% from last month",
      icon: Trophy,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const currentCourses = [
    {
      title: "Advanced Programming",
      instructor: "by Dr. Michael Chen",
      progress: 68,
      lessons: 8,
      students: 234,
      image: course1,
    },
    {
      title: "Calculus & Analytics",
      instructor: "by Prof. Sarah Williams",
      progress: 45,
      lessons: 5,
      students: 189,
      image: course2,
    },
    {
      title: "Business Strategy",
      instructor: "by John Anderson",
      progress: 82,
      lessons: 11,
      students: 156,
      image: course3,
    },
  ];

  const assignments = [
    {
      title: "Final Project Submission",
      course: "Advanced Programming",
      date: "Feb 25, 2026",
      status: "Pending",
      urgent: true,
    },
    {
      title: "Midterm Essay",
      course: "Business Strategy",
      date: "Feb 28, 2026",
      status: "Pending",
      urgent: false,
    },
    {
      title: "Lab Report #3",
      course: "Chemistry Fundamentals",
      date: "Mar 2, 2026",
      status: "Submitted",
      urgent: false,
    },
    {
      title: "Problem Set 5",
      course: "Calculus & Analytics",
      date: "Mar 5, 2026",
      status: "Pending",
      urgent: false,
    },
  ];

  const activities = [
    {
      type: "grade",
      title: "Assignment Graded",
      desc: 'Your "Data Structures Project" received a score of 95/100',
      time: "2 hours ago",
      icon: Award,
      color: "text-amber-500",
      bg: "bg-amber-100",
    },
    {
      type: "completion",
      title: "Course Completed",
      desc: 'You completed "Introduction to React" course',
      time: "5 hours ago",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-100",
    },
    {
      type: "comment",
      title: "New Comment",
      desc: 'Instructor replied to your question in "Advanced CSS"',
      time: "1 day ago",
      icon: MessageSquare,
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
    {
      type: "submission",
      title: "Assignment Submitted",
      desc: 'You submitted "Chemistry Lab Report"',
      time: "2 days ago",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Sarah! 👋
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
                <p className="text-xs font-medium text-emerald-500 mt-4">
                  {stat.change}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Courses Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Current Courses</h2>
          <a
            href="#"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View All
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCourses.map((course, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Course Image */}
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Course Details */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {course.instructor}
                </p>

                {/* Progress Bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-500">Progress</span>
                    <span className="font-bold text-gray-900">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 border-t border-gray-50 flex justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span>Lesson {course.lessons}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UsersIcon className="w-3.5 h-3.5" />
                  <span>{course.students}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom 3 Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Upcoming Assignments */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Upcoming Assignments
            </h2>
            <div className="space-y-4">
              {assignments.map((assignment, idx) => (
                <div
                  key={idx}
                  className="flex flex-col p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">
                      {assignment.title}
                    </h4>
                    {assignment.urgent && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {assignment.course}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center text-gray-500 gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>{assignment.date}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-md font-medium ${
                        assignment.status === "Submitted"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 py-2">
              View all assignments
            </button>
          </div>

          {/* Column 2: Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Recent Activity
            </h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {activities.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${activity.bg}`}
                    >
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.desc}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-400 mt-2 uppercase tracking-wider">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-6 text-sm font-semibold text-indigo-600 hover:text-indigo-700 py-2">
              View all activity
            </button>
          </div>

          {/* Column 3: Learning Progress Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Learning Progress
            </h2>
            <div className="flex-1 flex items-center justify-center border-b border-gray-100 pb-6 mb-6">
              {/* Simple CSS-based mock chart since we don't have Recharts installed */}
              <div className="relative w-full h-48 flex items-end justify-between px-2">
                <div className="absolute left-0 bottom-0 w-full border-t border-gray-200"></div>
                <div className="absolute left-0 bottom-1/4 w-full border-t border-dashed border-gray-200"></div>
                <div className="absolute left-0 bottom-2/4 w-full border-t border-dashed border-gray-200"></div>
                <div className="absolute left-0 bottom-3/4 w-full border-t border-dashed border-gray-200"></div>

                {/* Mock Data Points */}
                <div className="relative w-4 h-[30%] bg-indigo-200 rounded-t-sm">
                  <span className="absolute -bottom-5 text-[10px] text-gray-400 -ml-1">
                    Jan
                  </span>
                </div>
                <div className="relative w-4 h-[45%] bg-indigo-300 rounded-t-sm">
                  <span className="absolute -bottom-5 text-[10px] text-gray-400 -ml-1">
                    Feb
                  </span>
                </div>
                <div className="relative w-4 h-[55%] bg-indigo-400 rounded-t-sm">
                  <span className="absolute -bottom-5 text-[10px] text-gray-400 -ml-1">
                    Mar
                  </span>
                </div>
                <div className="relative w-4 h-[70%] bg-indigo-500 rounded-t-sm">
                  <span className="absolute -bottom-5 text-[10px] text-gray-400 -ml-1">
                    Apr
                  </span>
                </div>
                <div className="relative w-4 h-[85%] bg-indigo-600 rounded-t-sm">
                  <span className="absolute -bottom-5 text-[10px] text-gray-400 -ml-1">
                    May
                  </span>
                </div>
                <div className="relative w-4 h-[95%] bg-[#0c3c2e] rounded-t-sm">
                  <span className="absolute -bottom-5 text-[10px] text-gray-400 -ml-1">
                    Jun
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Overall Progress</span>
              <span className="font-bold text-gray-900 text-xl">75%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
