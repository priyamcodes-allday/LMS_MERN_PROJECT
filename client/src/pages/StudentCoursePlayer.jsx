import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  PlayCircle,
  Star,
} from "lucide-react";
import api from "../axios/api";
import { useAuth } from "../context/auth";

export default function StudentCoursePlayer() {
  const { id } = useParams();
  const { user } = useAuth();
  const studentId = user?.id;
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
  });
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: "" });
  const [activeLessonId, setActiveLessonId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyLessonId, setBusyLessonId] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const lessons = useMemo(
    () => [...(course?.lessons || [])].sort((a, b) => a.order - b.order),
    [course],
  );

  const completedLessonIds = useMemo(
    () =>
      new Set(
        (progress?.completedLessons || []).map((lesson) => lesson._id),
      ),
    [progress],
  );

  const selectedLesson =
    lessons.find((lesson) => lesson._id === activeLessonId) || lessons[0];

  const progressPercentage =
    progress?.progressPercentage ??
    (lessons.length ? (completedLessonIds.size / lessons.length) * 100 : 0);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await api.get(`/v1/progress/${studentId}/${id}`);
      if (res.data?.success) {
        setProgress(res.data.data);
      }
    } catch {
      setProgress({ progressPercentage: 0, completedLessons: [] });
    }
  }, [id, studentId]);

  const fetchReviews = useCallback(async () => {
    const [reviewsRes, statsRes] = await Promise.all([
      api.get(`/v1/reviews/course/${id}`),
      api.get(`/v1/reviews/course/${id}/stats`),
    ]);

    if (reviewsRes.data?.success) {
      setReviews(reviewsRes.data.data || []);
    }

    if (statsRes.data?.success) {
      setReviewStats(statsRes.data.data || { averageRating: 0, totalReviews: 0 });
    }
  }, [id]);

  useEffect(() => {
    let isActive = true;

    const fetchCourseData = async () => {
      if (!studentId) return;

      try {
        setIsLoading(true);
          setError("");

        const coursesRes = await api.get("/student/my-courses");
        const enrollment = (coursesRes.data?.enrollments || []).find(
          (item) => item.course?._id === id,
        );

        if (!enrollment?.course) {
          setError("You are not enrolled in this course.");
          return;
        }

        await api
          .post("/v1/enrollments", { student: studentId, course: id })
          .catch(() => null);

        if (isActive) {
          setCourse(enrollment.course);
          setActiveLessonId(enrollment.course.lessons?.[0]?._id || "");
        }

        await Promise.all([fetchProgress(), fetchReviews()]);
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.message || "Failed to load course.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchCourseData();

    return () => {
      isActive = false;
    };
  }, [fetchProgress, fetchReviews, id, studentId]);

  const markLessonComplete = async (lessonId) => {
    try {
      setBusyLessonId(lessonId);
      setError("");
      const res = await api.post("/v1/progress/complete-lesson", {
        student: studentId,
        course: id,
        lessonId,
      });
      setMessage(res.data?.message || "Lesson completed.");
      await fetchProgress();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update progress.");
    } finally {
      setBusyLessonId("");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingReview(true);
      setError("");
      const res = await api.post("/v1/reviews", {
        student: studentId,
        course: id,
        rating: Number(reviewForm.rating),
        review: reviewForm.review,
      });
      setMessage(res.data?.message || "Review submitted.");
      setReviewForm({ rating: 5, review: "" });
      await fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-[#0c3c2e]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
        <h1 className="text-2xl font-black text-gray-900">Course unavailable</h1>
        <p className="text-gray-500 mt-2">{error || "Open an enrolled course from your dashboard."}</p>
        <Link
          to="/student"
          className="mt-5 inline-flex items-center gap-2 bg-[#0c3c2e] text-white px-5 py-3 rounded-xl font-black"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <Link to="/student" className="inline-flex items-center gap-2 text-sm font-black text-[#0c3c2e]">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mt-3">{course.title}</h1>
          <p className="text-gray-500 mt-2">{course.description}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 shadow-sm">
          <p className="text-xs font-bold text-gray-500">Progress</p>
          <p className="text-2xl font-black text-[#0c3c2e]">
            {Math.round(progressPercentage)}%
          </p>
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 text-red-600 px-4 py-3 font-bold">{error}</div>}
      {message && <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-3 font-bold">{message}</div>}

      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="aspect-video bg-gray-950 flex items-center justify-center">
            {selectedLesson?.videoUrl ? (
              <video
                src={selectedLesson.videoUrl}
                controls
                className="w-full h-full"
              />
            ) : (
              <div className="text-center text-white/70">
                <PlayCircle className="w-14 h-14 mx-auto mb-3" />
                <p className="font-bold">No video URL available for this lesson.</p>
              </div>
            )}
          </div>
          <div className="p-6">
            <h2 className="text-xl font-black text-gray-900">
              {selectedLesson?.title || "Select a lesson"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedLesson?.duration ? `${selectedLesson.duration} minutes` : "Duration not set"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-900">Lessons</h2>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0c3c2e]"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
            {lessons.map((lesson, idx) => {
              const isComplete = completedLessonIds.has(lesson._id);
              const isSelected = selectedLesson?._id === lesson._id;

              return (
                <div
                  key={lesson._id}
                  className={`p-4 ${isSelected ? "bg-[#0c3c2e]/5" : ""}`}
                >
                  <button
                    onClick={() => setActiveLessonId(lesson._id)}
                    className="w-full text-left flex items-start gap-3"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm ${
                      isComplete
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {isComplete ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900">{lesson.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {lesson.duration ? `${lesson.duration} min` : "No duration"}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => markLessonComplete(lesson._id)}
                    disabled={isComplete || busyLessonId === lesson._id}
                    className="mt-3 w-full inline-flex justify-center items-center gap-2 bg-[#0c3c2e] text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-[#0c3c2e]/90 disabled:opacity-50"
                  >
                    {busyLessonId === lesson._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {isComplete ? "Completed" : "Mark Complete"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
        <form onSubmit={submitReview} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">Leave a Review</h2>
            <p className="text-sm text-gray-500 mt-1">One review is allowed per course.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Rating</label>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{rating} stars</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Review</label>
            <textarea
              value={reviewForm.review}
              onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
              required
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c3c2e] resize-none"
              placeholder="Share your experience with this course"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingReview}
            className="inline-flex items-center gap-2 bg-[#0c3c2e] text-white px-5 py-3 rounded-xl font-black hover:bg-[#0c3c2e]/90 disabled:opacity-60"
          >
            {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
            Submit Review
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900">Reviews</h2>
            <div className="text-sm font-black text-[#0c3c2e] flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" />
              {reviewStats.averageRating || 0} ({reviewStats.totalReviews || reviews.length})
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-semibold">
              No reviews yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <article key={review._id} className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black text-gray-900">
                        {review.student?.name || "Student"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-black text-amber-600">
                      <Star className="w-4 h-4 fill-current" />
                      {review.rating}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">{review.review}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
