import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Heart,
  Loader2,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../axios/api";
import { useAuth } from "../context/auth";
import CourseThumbnail from "../components/CourseThumbnail";

export default function CourseCatalog() {
  const navigate = useNavigate();
  const { user, authLoading, openLogin, refreshUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [buyingCourseId, setBuyingCourseId] = useState("");
  const [busyActionId, setBusyActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await api.get("/v1/courses");

        if (res.data?.success) {
          const approvedCourses = res.data.data || [];
          setCourses(approvedCourses);

          const stats = await Promise.all(
            approvedCourses.map(async (course) => {
              try {
                const statsRes = await api.get(`/v1/reviews/course/${course._id}/stats`);
                return [course._id, statsRes.data?.data || { averageRating: 0, totalReviews: 0 }];
              } catch {
                return [course._id, { averageRating: 0, totalReviews: 0 }];
              }
            }),
          );

          setReviewStats(Object.fromEntries(stats));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load courses.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleBuyCourse = async (courseId) => {
    if (!user) {
      sessionStorage.setItem("postLoginRedirect", "/courses");
      openLogin();
      return;
    }

    try {
      setBuyingCourseId(courseId);
      setError("");
      setSuccess("");

      const res = await api.post(`/student/courses/${courseId}/buy`);
      const latestUser = await refreshUser();

      setSuccess(res.data?.message || "Course enrolled successfully.");

      if (latestUser?.role === "student") {
        navigate("/student");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll in this course.");
    } finally {
      setBuyingCourseId("");
    }
  };

  const requireStudent = () => {
    if (!user) {
      sessionStorage.setItem("postLoginRedirect", "/courses");
      openLogin();
      return false;
    }

    if (user.role !== "student") {
      setError("Enroll in a course first to activate student cart and wishlist features.");
      return false;
    }

    return true;
  };

  const addToCart = async (courseId) => {
    if (!requireStudent()) return;

    try {
      setBusyActionId(`cart-${courseId}`);
      setError("");
      setSuccess("");
      const res = await api.post("/v1/cart", {
        student: user.id,
        course: courseId,
      });
      setSuccess(res.data?.message || "Course added to cart.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add course to cart.");
    } finally {
      setBusyActionId("");
    }
  };

  const addToWishlist = async (courseId) => {
    if (!requireStudent()) return;

    try {
      setBusyActionId(`wishlist-${courseId}`);
      setError("");
      setSuccess("");
      const res = await api.post("/v1/wishlist", {
        student: user.id,
        course: courseId,
      });
      setSuccess(res.data?.message || "Course added to wishlist.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add course to wishlist.");
    } finally {
      setBusyActionId("");
    }
  };

  if (authLoading && !courses.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0c3c2e]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#0c3c2e]">
              Course Catalog
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
              Approved courses ready for enrollment
            </h1>
          </div>
          {user?.role === "student" && (
            <button
              onClick={() => navigate("/student")}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              My Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-4 py-3 font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0c3c2e]" />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h2 className="text-xl font-black text-gray-900">No approved courses yet</h2>
            <p className="text-gray-500 mt-2">
              Courses will appear here after teachers submit them and admins approve them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <article
                key={course._id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col"
              >
                <div className="aspect-video bg-gray-100">
                  <CourseThumbnail src={course.thumbnail} alt={course.title} />
                </div>
                <div className="p-5 flex flex-col gap-4 flex-1">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#0c3c2e]">
                      {course.teacher?.name ? `By ${course.teacher.name}` : "Approved Course"}
                    </p>
                    <h2 className="text-lg font-black text-gray-900 line-clamp-2">
                      {course.title}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-3">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{reviewStats[course._id]?.averageRating || 0}</span>
                      <span className="text-gray-400">
                        ({reviewStats[course._id]?.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                    <span className="text-xl font-black text-[#0c3c2e]">
                      ${course.price || 0}
                    </span>
                    <button
                      onClick={() => handleBuyCourse(course._id)}
                      disabled={buyingCourseId === course._id}
                      className="inline-flex items-center gap-2 bg-[#0c3c2e] text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[#0c3c2e]/90 transition-colors disabled:opacity-60"
                    >
                      {buyingCourseId === course._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                      Enroll
                    </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addToCart(course._id)}
                        disabled={busyActionId === `cart-${course._id}`}
                        className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-60"
                      >
                        {busyActionId === `cart-${course._id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                        Cart
                      </button>
                      <button
                        onClick={() => addToWishlist(course._id)}
                        disabled={busyActionId === `wishlist-${course._id}`}
                        className="inline-flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors disabled:opacity-60"
                      >
                        {busyActionId === `wishlist-${course._id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart className="w-4 h-4" />
                        )}
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
