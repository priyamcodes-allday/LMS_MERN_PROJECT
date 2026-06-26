import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BookOpen, Search, Users } from "lucide-react";
import api from "../axios/api";

export default function TeacherStudents() {
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/teacher/students");
        if (isActive && res.data?.success) {
          setEnrollments(res.data.enrollments || []);
        }
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.message || "Failed to load students.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchStudents();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredEnrollments = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return enrollments;

    return enrollments.filter((item) => {
      const studentName = item.student?.name?.toLowerCase() || "";
      const studentEmail = item.student?.email?.toLowerCase() || "";
      const courseTitle = item.course?.title?.toLowerCase() || "";
      return (
        studentName.includes(term) ||
        studentEmail.includes(term) ||
        courseTitle.includes(term)
      );
    });
  }, [enrollments, query]);

  const uniqueStudentCount = new Set(
    enrollments.map((item) => item.student?._id).filter(Boolean),
  ).size;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-500 mt-2">
            Students enrolled across your courses.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:w-auto">
          <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">Students</p>
            <p className="text-2xl font-bold text-gray-900">
              {uniqueStudentCount}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">Enrollments</p>
            <p className="text-2xl font-bold text-gray-900">
              {enrollments.length}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            Enrolled Students
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students or courses"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]/20 focus:border-[#0c3c2e]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c3c2e]"></div>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-10 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">
              No students found
            </h3>
            <p className="text-gray-500 mt-1">
              Enrollments will appear here after students buy your courses.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Student</th>
                  <th className="px-6 py-4 font-bold">Course</th>
                  <th className="px-6 py-4 font-bold">Payment</th>
                  <th className="px-6 py-4 font-bold">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEnrollments.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">
                        {item.student?.name || "Student"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.student?.email || "No email"}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {item.course?.title || "Course removed"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold capitalize">
                        {item.paymentStatus || "paid"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.enrolledAt
                        ? new Date(item.enrolledAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
