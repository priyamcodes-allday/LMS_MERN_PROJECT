import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Trash2, Eye, PlayCircle, Loader2 } from "lucide-react";
import api from "../axios/api";

export default function AdminCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/admin/courses/${id}`);
      if (res.data?.success) {
        setCourse(res.data.course);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load course details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const showSuccess = (message) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(""), 3000);
  };

  const handleAction = async (action) => {
    if (action === "delete" && !confirm("Permanently delete this course?")) return;

    try {
      if (action === "approve") await api.put(`/admin/courses/${id}/approve`);
      if (action === "reject") await api.put(`/admin/courses/${id}/reject`);
      if (action === "toggle") await api.put(`/admin/courses/${id}/toggle-active`);
      if (action === "delete") {
        await api.delete(`/admin/courses/${id}`);
        navigate("/admin"); // Send back to dashboard
        return;
      }
      
      showSuccess(`Course ${action} successful.`);
      fetchCourse(); // Refresh data to show new status
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} course.`);
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-[#0c3c2e]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-8 text-center text-red-600 font-bold bg-red-50 rounded-2xl">
        {error || "Course not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-black text-[#0c3c2e] hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {actionMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-32 h-32 object-cover rounded-xl border border-gray-200 shrink-0" />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold shrink-0">
                No Image
              </div>
            )}
            
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl font-black text-gray-900">{course.title}</h1>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-black uppercase tracking-wider">
                  {course.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${course.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {course.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              <p className="text-gray-500 font-medium">{course.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-gray-700">
                <p>Teacher: <span className="text-[#0c3c2e]">{course.teacher?.name} ({course.teacher?.email})</span></p>
                <p>Category: <span className="text-[#0c3c2e]">{course.category?.name || "Uncategorized"}</span></p>
                <p>Price: <span className="text-[#0c3c2e]">${course.price}</span></p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[140px] shrink-0">
            {course.status !== "approved" && (
              <button onClick={() => handleAction("approve")} className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-colors">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            )}
            {course.status !== "rejected" && (
              <button onClick={() => handleAction("reject")} className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold hover:bg-amber-100 transition-colors">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            )}
            <button onClick={() => handleAction("toggle")} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              <Eye className="w-4 h-4" /> {course.isActive ? "Hide Course" : "Show Course"}
            </button>
            <button onClick={() => handleAction("delete")} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">Course Lessons ({course.lessons?.length || 0})</h2>
          {course.lessons?.length === 0 ? (
            <p className="text-gray-500 font-medium">No lessons uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {course.lessons.map((lesson, idx) => (
                <div key={lesson._id} className="border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0c3c2e]/10 text-[#0c3c2e] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <h3 className="font-bold text-gray-900 truncate">{lesson.title}</h3>
                  </div>
                  {lesson.videoUrl ? (
                    <video src={lesson.videoUrl} controls className="w-full h-32 object-cover rounded-lg bg-black" />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400">
                      <PlayCircle className="w-8 h-8 mb-2" />
                      <span className="text-sm font-bold">No Video</span>
                    </div>
                  )}
                  <p className="text-xs font-bold text-gray-500 mt-3">{lesson.duration ? `${lesson.duration} minutes` : 'Duration unknown'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
