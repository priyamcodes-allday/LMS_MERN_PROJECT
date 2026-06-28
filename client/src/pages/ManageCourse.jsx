import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Image,
  Send,
  Edit3,
  Save,
  X,
} from "lucide-react";
import api from "../axios/api";
import CourseThumbnail from "../components/CourseThumbnail";

export default function ManageCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);

  // Thumbnail upload state
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  // New lesson state
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonData, setLessonData] = useState({ title: "", duration: "" });
  const [videoFile, setVideoFile] = useState(null);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonEditData, setLessonEditData] = useState({
    title: "",
    duration: "",
    order: "",
  });
  const [isSavingLesson, setIsSavingLesson] = useState(false);

  // Submit for approval
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await api.get(`/teacher/courses/${id}`);
      if (res.data?.success) {
        setCourse(res.data.course);
        setCourseForm({
          title: res.data.course.title || "",
          description: res.data.course.description || "",
          price: res.data.course.price ?? "",
          category:
            res.data.course.category?._id || res.data.course.category || "",
        });
      }
    } catch {
      setError("Failed to load course details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isActive = true;

    api
      .get("/v1/categories")
      .then((res) => {
        if (isActive && res.data?.success) {
          setCategories(res.data.data || []);
        }
      })
      .catch(() => {
        if (isActive) {
          setCategories([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    api
      .get(`/teacher/courses/${id}`)
      .then((res) => {
        if (isActive && res.data?.success) {
          setCourse(res.data.course);
          setCourseForm({
            title: res.data.course.title || "",
            description: res.data.course.description || "",
            price: res.data.course.price ?? "",
            category:
              res.data.course.category?._id || res.data.course.category || "",
          });
        }
      })
      .catch(() => {
        if (isActive) {
          setError("Failed to load course details.");
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
  }, [id]);

  const handleCourseFormChange = (e) => {
    setCourseForm({ ...courseForm, [e.target.name]: e.target.value });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setIsSavingCourse(true);
    setError("");

    try {
      const res = await api.put(`/teacher/courses/${id}`, {
        title: courseForm.title,
        description: courseForm.description,
        price: Number(courseForm.price),
        category: courseForm.category,
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || "Course updated.");
        setIsEditingCourse(false);
        fetchCourse();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course.");
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm("Deactivate this course? It will no longer be active.")) return;
    setIsDeletingCourse(true);
    setError("");

    try {
      const res = await api.delete(`/teacher/courses/${id}`);
      if (res.data?.success) {
        setSuccessMsg(res.data.message || "Course deactivated.");
        setTimeout(() => navigate("/teacher"), 800);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate course.");
    } finally {
      setIsDeletingCourse(false);
    }
  };

  const handleThumbnailUpload = async () => {
    if (!thumbnailFile) return;
    setIsUploadingThumb(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("thumbnail", thumbnailFile);
      const res = await api.put(`/teacher/courses/${id}/thumbnail`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        setSuccessMsg("Thumbnail uploaded!");
        setThumbnailFile(null);
        fetchCourse();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Thumbnail upload failed.");
    } finally {
      setIsUploadingThumb(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError("Please select a video file.");
      return;
    }
    setIsAddingLesson(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", lessonData.title);
      formData.append("duration", lessonData.duration || 0);
      formData.append("video", videoFile);

      const res = await api.post(`/teacher/courses/${id}/lessons`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        setSuccessMsg("Lesson added successfully!");
        setLessonData({ title: "", duration: "" });
        setVideoFile(null);
        setShowLessonForm(false);
        fetchCourse();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lesson.");
    } finally {
      setIsAddingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await api.delete(`/teacher/courses/${id}/lessons/${lessonId}`);
      setSuccessMsg("Lesson deleted.");
      fetchCourse();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Failed to delete lesson.");
    }
  };

  const startEditingLesson = (lesson) => {
    setEditingLessonId(lesson._id);
    setLessonEditData({
      title: lesson.title || "",
      duration: lesson.duration ?? "",
      order: lesson.order ?? "",
    });
  };

  const handleUpdateLesson = async (lessonId) => {
    setIsSavingLesson(true);
    setError("");

    try {
      const res = await api.put(`/teacher/courses/${id}/lessons/${lessonId}`, {
        title: lessonEditData.title,
        duration:
          lessonEditData.duration === ""
            ? undefined
            : Number(lessonEditData.duration),
        order:
          lessonEditData.order === "" ? undefined : Number(lessonEditData.order),
      });

      if (res.data?.success) {
        setSuccessMsg("Lesson updated.");
        setEditingLessonId(null);
        fetchCourse();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update lesson.");
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleSubmitForApproval = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await api.put(`/teacher/courses/${id}/submit`);
      if (res.data?.success) {
        setSuccessMsg("Course submitted for admin approval!");
        fetchCourse();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit for approval.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusStyles = {
    draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      label: "Pending Review",
    },
    approved: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      label: "Approved",
    },
    rejected: { bg: "bg-red-50", text: "text-red-600", label: "Rejected" },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c3c2e]"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Course not found.</p>
      </div>
    );
  }

  const status = statusStyles[course.status] || statusStyles.draft;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button and Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/teacher")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}
            >
              {status.label}
            </span>
          </div>
          <p className="text-gray-500 mt-1">{course.description}</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      {/* Course Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Course Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              Update title, category, price, or description.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingCourse(!isEditingCourse)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              {isEditingCourse ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
            <button
              onClick={handleDeleteCourse}
              disabled={isDeletingCourse}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Deactivate
            </button>
          </div>
        </div>

        {isEditingCourse ? (
          <form onSubmit={handleUpdateCourse} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Course Title
              </label>
              <input
                type="text"
                name="title"
                value={courseForm.title}
                onChange={handleCourseFormChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={courseForm.description}
                onChange={handleCourseFormChange}
                required
                rows="4"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={courseForm.category}
                  onChange={handleCourseFormChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={courseForm.price}
                  onChange={handleCourseFormChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingCourse}
              className="inline-flex items-center gap-2 bg-[#0c3c2e] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0c3c2e]/90 transition-colors disabled:opacity-50"
            >
              {isSavingCourse ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Course
            </button>
          </form>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500">Category</p>
              <p className="mt-1 font-bold text-gray-900">
                {course.category?.name || "Uncategorized"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Price</p>
              <p className="mt-1 font-bold text-gray-900">
                ${course.price || 0}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Active</p>
              <p className="mt-1 font-bold text-gray-900">
                {course.isActive === false ? "No" : "Yes"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-gray-400" />
            Course Thumbnail
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-48 h-32 bg-gray-100 rounded-xl overflow-hidden border border-dashed border-gray-300">
              <CourseThumbnail
                src={course.thumbnail}
                alt="Course Thumbnail"
                iconClassName="w-8 h-8"
              />
            </div>
            <div className="flex-1 space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0c3c2e]/10 file:text-[#0c3c2e] hover:file:bg-[#0c3c2e]/20 cursor-pointer"
              />
              <button
                onClick={handleThumbnailUpload}
                disabled={!thumbnailFile || isUploadingThumb}
                className="flex items-center gap-2 bg-[#0c3c2e] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#0c3c2e]/90 transition-colors disabled:opacity-50"
              >
                {isUploadingThumb ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload Thumbnail
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-gray-400" />
            Video Lessons ({course.lessons?.length || 0})
          </h2>
          <button
            onClick={() => setShowLessonForm(!showLessonForm)}
            className="flex items-center gap-2 bg-[#0c3c2e] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#0c3c2e]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lesson
          </button>
        </div>

        {/* Add Lesson Form */}
        {showLessonForm && (
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={lessonData.title}
                  onChange={(e) =>
                    setLessonData({ ...lessonData, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] bg-white"
                  placeholder="e.g. Introduction to React Hooks"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Video File
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    required
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0c3c2e]/10 file:text-[#0c3c2e] hover:file:bg-[#0c3c2e]/20 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={lessonData.duration}
                    onChange={(e) =>
                      setLessonData({ ...lessonData, duration: e.target.value })
                    }
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] bg-white"
                    placeholder="e.g. 15"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isAddingLesson}
                  className="flex items-center gap-2 bg-[#0c3c2e] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#0c3c2e]/90 transition-colors disabled:opacity-50"
                >
                  {isAddingLesson ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload Lesson
                </button>
                <button
                  type="button"
                  onClick={() => setShowLessonForm(false)}
                  className="px-5 py-2 rounded-lg font-semibold text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lessons List */}
        {!course.lessons || course.lessons.length === 0 ? (
          <div className="p-8 text-center">
            <PlayCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No lessons yet</h3>
            <p className="text-gray-500 mt-1">
              Add at least one lesson before submitting for approval.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {[...course.lessons]
              .sort((a, b) => a.order - b.order)
              .map((lesson, idx) => (
                <div
                  key={lesson._id || idx}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  {editingLessonId === lesson._id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-bold text-gray-900 mb-1">
                            Lesson Title
                          </label>
                          <input
                            type="text"
                            value={lessonEditData.title}
                            onChange={(e) =>
                              setLessonEditData({
                                ...lessonEditData,
                                title: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1">
                            Duration
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={lessonEditData.duration}
                            onChange={(e) =>
                              setLessonEditData({
                                ...lessonEditData,
                                duration: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1">
                            Order
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={lessonEditData.order}
                            onChange={(e) =>
                              setLessonEditData({
                                ...lessonEditData,
                                order: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateLesson(lesson._id)}
                          disabled={isSavingLesson}
                          className="inline-flex items-center gap-2 bg-[#0c3c2e] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#0c3c2e]/90 transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingLessonId(null)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-[#0c3c2e]/10 rounded-lg flex items-center justify-center text-[#0c3c2e] font-bold text-sm">
                          {lesson.order || idx + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {lesson.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {lesson.duration
                              ? `${lesson.duration} min`
                              : "No duration set"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditingLesson(lesson)}
                          className="p-2 text-gray-500 hover:text-[#0c3c2e] hover:bg-[#0c3c2e]/10 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson._id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Submit for Approval */}
      {course.status === "draft" || course.status === "rejected" ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900">Ready to go live?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Submit your course for admin review. You need at least one
                lesson.
              </p>
            </div>
            <button
              onClick={handleSubmitForApproval}
              disabled={isSubmitting || !course.lessons?.length}
              className="flex items-center gap-2 bg-[#0c3c2e] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0c3c2e]/90 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit for Approval
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
