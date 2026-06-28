import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import api from "../axios/api";
import { useAuth } from "../context/auth";

export default function StudentCart() {
  const { user, refreshUser } = useAuth();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyCourseId, setBusyCourseId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchCart = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const res = await api.get(`/v1/cart/${user.id}`);
      if (res.data?.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load cart.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    if (!user?.id) return undefined;

    api
      .get(`/v1/cart/${user.id}`)
      .then((res) => {
        if (isActive && res.data?.success) {
          setCart(res.data.data);
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(err.response?.data?.message || "Failed to load cart.");
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
  }, [user?.id]);

  const removeFromCart = async (courseId) => {
    try {
      setBusyCourseId(courseId);
      setError("");
      await api.delete("/v1/cart/remove", {
        data: { student: user.id, course: courseId },
      });
      setMessage("Course removed from cart.");
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove course.");
    } finally {
      setBusyCourseId("");
    }
  };

  const enrollCourse = async (courseId) => {
    try {
      setBusyCourseId(courseId);
      setError("");
      const res = await api.post(`/student/courses/${courseId}/buy`);
      await api
        .post("/v1/enrollments", { student: user.id, course: courseId })
        .catch(() => null);
      await api
        .delete("/v1/cart/remove", {
          data: { student: user.id, course: courseId },
        })
        .catch(() => null);
      await refreshUser();
      setMessage(res.data?.message || "Course enrolled successfully.");
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll course.");
    } finally {
      setBusyCourseId("");
    }
  };

  const courses = cart?.courses || [];
  const total = courses.reduce((sum, course) => sum + (course.price || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#0c3c2e]">
            Student Cart
          </p>
          <h1 className="text-3xl font-black text-gray-900 mt-2">Saved for checkout</h1>
        </div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 bg-[#0c3c2e] text-white px-5 py-3 rounded-xl font-black hover:bg-[#0c3c2e]/90 transition-colors"
        >
          Browse Courses <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {error && <div className="rounded-xl bg-red-50 text-red-600 px-4 py-3 font-bold">{error}</div>}
      {message && <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-3 font-bold">{message}</div>}

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-400" />
            Cart Courses
          </h2>
          <p className="text-lg font-black text-[#0c3c2e]">${total}</p>
        </div>

        {isLoading ? (
          <div className="h-52 flex items-center justify-center text-[#0c3c2e]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="p-10 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-xl font-black text-gray-900">Your cart is empty</h3>
            <p className="text-gray-500 mt-2">Add approved courses from the catalog.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {courses.map((course) => (
              <article key={course._id} className="p-5 flex flex-col lg:flex-row gap-5 lg:items-center">
                <div className="w-full lg:w-44 aspect-video bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <BookOpen className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                  <p className="text-xl font-black text-[#0c3c2e] mt-3">${course.price || 0}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => enrollCourse(course._id)}
                    disabled={busyCourseId === course._id}
                    className="inline-flex items-center gap-2 bg-[#0c3c2e] text-white px-4 py-2.5 rounded-xl font-black hover:bg-[#0c3c2e]/90 disabled:opacity-60"
                  >
                    {busyCourseId === course._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    Enroll
                  </button>
                  <button
                    onClick={() => removeFromCart(course._id)}
                    disabled={busyCourseId === course._id}
                    className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-black hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
